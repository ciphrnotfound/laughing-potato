import { NextRequest, NextResponse } from "next/server";
import { workforceQueue } from "@/lib/queues/workforce";

/**
 * Test endpoint to verify orchestrator backend is working with real data
 * This creates a test job and returns the job ID for monitoring
 */
export async function POST(req: NextRequest) {
  try {
    const { testType = "basic" } = await req.json();
    
    let testRequest = "";
    
    switch (testType) {
      case "basic":
        testRequest = "List all approved bots from the database and show their names and descriptions";
        break;
      case "analytics":
        testRequest = "Fetch user analytics data and provide insights on bot usage patterns";
        break;
      case "integration":
        testRequest = "Show all pending integrations that need admin approval";
        break;
      default:
        testRequest = "Test the orchestrator with a simple data fetch request";
    }
    
    // Create test job
    const job = await workforceQueue.add("test-run", { 
      userId: "test-user", 
      request: testRequest 
    });
    
    return NextResponse.json({ 
      success: true, 
      jobId: job.id,
      testType,
      request: testRequest,
      message: "Test job created successfully. Monitor job status at /api/workforce/status",
      redirectUrl: `/dashboard/workforce/${job.id}`
    });
    
  } catch (error) {
    console.error("Test orchestrator error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to create test job"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check orchestrator health
 */
export async function GET() {
  try {
    // Check if queue is accessible
    const jobCount = await workforceQueue.getJobCounts();
    
    return NextResponse.json({
      success: true,
      status: "healthy",
      queueStats: jobCount,
      message: "Orchestrator backend is operational",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Orchestrator health check error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Orchestrator backend is not operational"
      },
      { status: 500 }
    );
  }
}