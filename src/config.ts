import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
  auditLog: {
    enabled: boolean;
    directory: string;
    retentionDays: number;
    maxFileSize: number;
    encryptionKey?: string;
  };
}

export const config: Config = {
  site: { name: 'Devias Kit', description: '', themeColor: '#090a0b', url: getSiteURL() },
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ?? LogLevel.ALL,
  auditLog: {
    enabled: true,
    directory: 'src/logs/audit',
    retentionDays: 365 * 7, // 7 years
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
};
