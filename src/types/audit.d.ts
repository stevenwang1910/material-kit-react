// Audit Log Types
export interface Actor {
  userId?: string;
  ip: string;
  userAgent: string;
}

export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  eventType: AuditEventType;
  actor: Actor;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'error';
  details: Record<string, unknown>;
}

export type AuditEventType = 
  // Authentication events
  | 'AUTH_SIGN_IN'
  | 'AUTH_SIGN_IN_FAILED'
  | 'AUTH_SIGN_OUT'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_SIGN_UP'
  | 'AUTH_SIGN_UP_FAILED'
  | 'AUTH_PASSWORD_RESET'
  | 'AUTH_PASSWORD_RESET_FAILED'
  | 'AUTH_PASSWORD_CHANGE'
  | 'AUTH_PASSWORD_CHANGE_FAILED'
  
  // User management events
  | 'USER_PROFILE_UPDATE'
  | 'USER_PROFILE_DELETE'
  | 'USER_ROLE_CHANGE'
  
  // System access events
  | 'DASHBOARD_ACCESS'
  | 'PROTECTED_ROUTE_ACCESS'
  
  // System events
  | 'ERROR_SECURITY'
  | 'SYSTEM_CONFIG_CHANGE';

export interface AuditLoggerOptions {
  logDirectory?: string;
  retentionDays?: number;
  maxFileSize?: number;
  encryptionKey?: string;
}
