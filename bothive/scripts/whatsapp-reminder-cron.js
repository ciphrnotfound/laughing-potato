// WhatsApp Task Reminder Cron Job
// Runs hourly to send task reminders via WhatsApp

const { exec } = require('child_process');

console.log('📱 Starting WhatsApp Task Reminder cron...');
console.log('⏰ Running every hour. Press Ctrl+C to stop.');

function runWhatsAppReminder() {
  const timestamp = new Date().toISOString();
  const hour = new Date().getHours();
  
  console.log(`\n⏰ [${timestamp}] Running WhatsApp reminder check (Hour: ${hour})...`);
  
  // Check if within active hours (9 AM - 9 PM by default)
  if (hour < 9 || hour > 21) {
    console.log('😴 Outside active hours (9 AM - 9 PM), skipping...');
    return;
  }
  
  // This would trigger the WhatsApp reminder bot
  // In a real implementation, you'd:
  // 1. Fetch all active WhatsApp reminder bots
  // 2. Check each bot's schedule
  // 3. Send reminders to appropriate users
  
  exec('node -e "console.log(\'📱 WhatsApp reminders would be sent now to active users\')"', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`⚠️  Stderr: ${stderr}`);
    }
    
    if (stdout) {
      console.log(`✅ ${stdout.trim()}`);
    }
  });
}

// Run immediately on start
runWhatsAppReminder();

// Then run every hour (3,600,000 ms)
setInterval(runWhatsAppReminder, 3600000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping WhatsApp reminder cron...');
  process.exit(0);
});
