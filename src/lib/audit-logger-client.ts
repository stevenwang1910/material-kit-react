'use client';

import type { AuditLogEntry } from '@/types/audit';

export async function logAuditEntry(entry: Omit<AuditLogEntry, 'logId' | 'timestamp' | 'actor.ip' | 'actor.userAgent'>) {
  try {
    const response = await fetch('/api/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    
    if (!response.ok) {
      console.error('Failed to log audit entry:', await response.text());
    }
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
}
