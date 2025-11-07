'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/audit-logger';
import type { AuditLogEntry } from '@/types/audit';

export async function POST(request: NextRequest) {
  try {
    const entry = await request.json() as Omit<AuditLogEntry, 'logId' | 'timestamp'>;
    
    // Add IP address to actor
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const entryWithActor = {
      ...entry,
      actor: {
        ...entry.actor,
        ip,
        userAgent,
      },
    };
    
    await auditLogger.log(entryWithActor);
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    return NextResponse.json({ error: 'Failed to log audit entry' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, we would add authentication and authorization here
    // Only allow admins and auditors to access audit logs
    const logs = await auditLogger.getLogs();
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
