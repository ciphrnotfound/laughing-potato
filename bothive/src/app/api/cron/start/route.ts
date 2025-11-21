import { NextRequest, NextResponse } from 'next/server';

// Global variable to store the cron interval
let cronInterval: NodeJS.Timeout | null = null;

export async function POST(request: NextRequest) {
  try {
    if (cronInterval) {
      return NextResponse.json({ 
        success: true, 
        message: 'Background cron already running' 
      });
    }

    console.log('🤖 Starting background cron service...');
    
    cronInterval = setInterval(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/social/publish-scheduled`, {
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

    return NextResponse.json({ 
      success: true, 
      message: 'Background cron started successfully',
      interval: '60000ms (1 minute)'
    });

  } catch (error) {
    console.error('Failed to start background cron:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log('🛑 Background cron service stopped');
    return NextResponse.json({ 
      success: true, 
      message: 'Background cron stopped' 
    });
  }

  return NextResponse.json({ 
    success: true, 
    message: 'No background cron was running' 
  });
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    running: !!cronInterval,
    message: cronInterval ? 'Background cron is running' : 'Background cron is not running'
  });
}
