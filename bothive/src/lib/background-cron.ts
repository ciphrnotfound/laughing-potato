// Background cron service that runs automatically
// This starts when the app starts and runs continuously

let cronInterval: NodeJS.Timeout | null = null;

export function startBackgroundCron() {
    if (cronInterval) {
        console.log('🤖 Background cron already running');
        return;
    }

    console.log('🤖 Starting background cron service for scheduled posts...');

    // Check every 1 minute
    cronInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/social/publish-scheduled', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-cron-trigger': 'true'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                console.error('Background cron check failed:', response.status);
                return;
            }

            const result = await response.json();

            // Only log when there are actual results
            if (result.processed > 0) {
                console.log(`📅 Background cron: ${result.results.published.length} published, ${result.results.failed.length} failed`);
            }
        } catch (error) {
            console.error('Background cron error:', error);
        }
    }, 60000); // Every 1 minute

    console.log('✅ Background cron service started (checks every 1 minute)');
}

export function stopBackgroundCron() {
    if (cronInterval) {
        clearInterval(cronInterval);
        cronInterval = null;
        console.log('🛑 Background cron service stopped');
    }
}

// Auto-start in production environment
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    startBackgroundCron();
}
