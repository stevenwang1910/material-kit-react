'use server';

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { config } from '@/config';
import type { AuditLogEntry, AuditLoggerOptions } from '@/types/audit';

class AuditLogger {
  private options: AuditLoggerOptions;
  private isInitialized: boolean = false;

  constructor(options?: Partial<AuditLoggerOptions>) {
    this.options = {
      logDirectory: config.auditLog.directory,
      retentionDays: config.auditLog.retentionDays,
      maxFileSize: config.auditLog.maxFileSize,
      encryptionKey: config.auditLog.encryptionKey,
      ...options,
    };
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create log directory if it doesn't exist
    await fs.mkdir(this.options.logDirectory!, { recursive: true });
    this.isInitialized = true;
  }

  private getCurrentLogFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}.json`;
  }

  private async getCurrentLogFilePath(): Promise<string> {
    await this.initialize();
    return path.join(process.cwd(), this.options.logDirectory!, this.getCurrentLogFileName());
  }

  private async rotateLogFileIfNeeded(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size >= this.options.maxFileSize!) {
        // Rotate the log file (in a real implementation, we would compress and archive it)
        const archivedFilePath = `${filePath}.${Date.now()}.gz`;
        const fileContent = await fs.readFile(filePath);
        const compressedContent = zlib.gzipSync(fileContent);
        await fs.writeFile(archivedFilePath, compressedContent);
        await fs.truncate(filePath, 0);
      }
    } catch (error) {
      // If file doesn't exist, do nothing
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    await this.initialize();
    const logDir = path.join(process.cwd(), this.options.logDirectory!);
    const files = await fs.readdir(logDir);
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.options.retentionDays!);

    for (const file of files) {
      const filePath = path.join(logDir, file);
      const stats = await fs.stat(filePath);
      if (stats.mtime < retentionDate) {
        await fs.unlink(filePath);
      }
    }
  }

  public async log(entry: Omit<AuditLogEntry, 'logId' | 'timestamp'>): Promise<void> {
    if (!config.auditLog.enabled) return;

    await this.initialize();

    const logEntry: AuditLogEntry = {
      ...entry,
      logId: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    const filePath = await this.getCurrentLogFilePath();
    await this.rotateLogFileIfNeeded(filePath);

    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(filePath, logLine, 'utf8');

    // Cleanup old logs in background
    this.cleanupOldLogs().catch((error) => {
      console.error('Failed to cleanup old audit logs:', error);
    });
  }

  public async getLogs(filter?: Partial<AuditLogEntry>): Promise<AuditLogEntry[]> {
    await this.initialize();
    const logs: AuditLogEntry[] = [];
    const logDir = path.join(process.cwd(), this.options.logDirectory!);
    const files = await fs.readdir(logDir);

    // Read all log files
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(logDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line) as AuditLogEntry;
            
            // Apply filter if provided
            if (filter) {
              let match = true;
              for (const [key, value] of Object.entries(filter)) {
                if (key === 'actor') {
                  const actorFilter = value as Partial<AuditLogEntry['actor']>;
                  for (const [actorKey, actorValue] of Object.entries(actorFilter)) {
                    if ((logEntry.actor as any)[actorKey] !== actorValue) {
                      match = false;
                      break;
                    }
                  }
                } else if ((logEntry as any)[key] !== value) {
                  match = false;
                  break;
                }
              }
              if (!match) continue;
            }
            
            logs.push(logEntry);
          } catch (error) {
            console.error('Failed to parse audit log entry:', error);
          }
        }
      }
    }

    // Sort logs by timestamp descending
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// Create a singleton instance
export const auditLogger = new AuditLogger();
