'use server';

import { auditLogger } from './src/lib/audit-logger';

async function testAuditLogger() {
  console.log('Testing audit logger...');
  
  // Test logging an authentication event
  await auditLogger.log({
    eventType: 'AUTH_SIGN_IN',
    actor: {
      userId: 'USR-001',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    action: 'signIn',
    resource: 'userAuthentication',
    status: 'success',
    details: { credentialsType: 'password', email: 'test@example.com' }
  });
  
  console.log('✓ Authentication event logged');
  
  // Test logging a dashboard access event
  await auditLogger.log({
    eventType: 'DASHBOARD_ACCESS',
    actor: {
      userId: 'USR-001',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    action: 'access',
    resource: 'dashboard',
    status: 'success',
    details: { page: 'overview' }
  });
  
  console.log('✓ Dashboard access event logged');
  
  // Test retrieving logs
  const logs = await auditLogger.getLogs();
  console.log(`✓ Retrieved ${logs.length} audit logs`);
  
  // Display the logs
  console.log('\nAudit logs:');
  logs.forEach((log, index) => {
    console.log(`\nLog ${index + 1}: ${log.eventType} - ${log.status}`);
    console.log(`  Timestamp: ${log.timestamp}`);
    console.log(`  Actor: ${log.actor.userId} (${log.actor.ip})`);
    console.log(`  Action: ${log.action}`);
    console.log(`  Resource: ${log.resource}`);
    console.log(`  Details: ${JSON.stringify(log.details)}`);
  });
  
  console.log('\n✅ All tests completed successfully!');
}

testAuditLogger().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
