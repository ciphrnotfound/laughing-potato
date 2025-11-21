import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called by external cron services like cron-job.org
// It triggers the publish-scheduled endpoint without requiring authentication
export async function GET(request: NextRequest) {
  try {
    // Call the publish-scheduled endpoint internally
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
      throw new Error(`Failed to trigger publish-scheduled: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Social publisher cron triggered successfully',
      result
    });

  } catch (error) {
    console.error('Cron trigger error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
