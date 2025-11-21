// Smart auto-running cron job for development
// This runs more frequently and checks for precise timing
const { exec } = require('child_process');

console.log('🤖 Starting smart auto-cron for scheduled posts...');
console.log('📅 Running every 1 minute for precise timing. Press Ctrl+C to stop.');

function runScheduledPosts() {
  const timestamp = new Date().toISOString();
  console.log(`⏰ [${timestamp}] Running scheduled posts check...`);
  
  exec('npm run publish-scheduled', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`⚠️  Stderr: ${stderr}`);
    }
    
    const output = stdout.trim();
    if (output) {
      console.log(`✅ ${output}`);
    } else {
      console.log(`✅ No scheduled posts due at this time`);
    }
  });
}

// Run immediately on start
runScheduledPosts();

// Then run every 1 minute (60,000 ms) for precise timing
setInterval(runScheduledPosts, 60000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping auto-cron...');
  process.exit(0);
});
