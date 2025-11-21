// Ultra-smart cron job that adapts to scheduled times
const { exec } = require('child_process');
const http = require('http');

console.log('🤖 Starting ultra-smart auto-cron for scheduled posts...');

function getNextCheckTime() {
  // Check every minute by default, but this could be made smarter
  return 60000; // 1 minute
}

function runScheduledPosts() {
  const timestamp = new Date().toISOString();
  console.log(`⏰ [${timestamp}] Running scheduled posts check...`);
  
  exec('npm run publish-scheduled', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      scheduleNextCheck();
      return;
    }
    
    if (stderr) {
      console.error(`⚠️  Stderr: ${stderr}`);
    }
    
    const output = stdout.trim();
    if (output) {
      console.log(`✅ ${output}`);
      
      // Try to parse results to see when next post is scheduled
      try {
        const result = JSON.parse(output);
        if (result.results && result.results.skipped && result.results.skipped.length > 0) {
          const nextPost = result.results.skipped[0];
          const nextTime = new Date(nextPost.scheduledFor);
          const now = new Date();
          const timeUntilNext = nextTime - now;
          
          if (timeUntilNext > 60000 && timeUntilNext < 3600000) { // Between 1 min and 1 hour
            console.log(`🎯 Next post scheduled at ${nextPost.scheduledFor}, scheduling smart check...`);
            setTimeout(runScheduledPosts, Math.min(timeUntilNext, 300000)); // Check at most 5 mins early
            return;
          }
        }
      } catch (e) {
        // JSON parse failed, use default timing
      }
    } else {
      console.log(`✅ No scheduled posts due at this time`);
    }
    
    scheduleNextCheck();
  });
}

function scheduleNextCheck() {
  const nextCheckIn = getNextCheckTime();
  const nextCheckTime = new Date(Date.now() + nextCheckIn);
  console.log(`📅 Next check at ${nextCheckTime.toLocaleTimeString()}`);
  setTimeout(runScheduledPosts, nextCheckIn);
}

// Start the smart cron
runScheduledPosts();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping smart auto-cron...');
  process.exit(0);
});
