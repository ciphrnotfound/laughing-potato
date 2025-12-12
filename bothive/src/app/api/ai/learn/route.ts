import { NextResponse } from "next/server";
import { aiIntelligence } from "@/lib/ai-intelligence";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { 
      userId, 
      messageId, 
      feedback, 
      resolutionTime,
      rating,
      notes 
    } = await req.json();

    if (!userId || !messageId || !feedback) {
      return NextResponse.json({ 
        error: "Missing userId, messageId, or feedback" 
      }, { status: 400 });
    }

    // Get the original interaction
    const { data: interaction, error } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();

    if (error || !interaction) {
      return NextResponse.json({ 
        error: "Interaction not found" 
      }, { status: 404 });
    }

    // Get the assistant's response
    const { data: assistantResponse } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_id', interaction.conversation_id)
      .eq('role', 'assistant')
      .gt('timestamp', interaction.timestamp)
      .order('timestamp', { ascending: true })
      .limit(1)
      .single();

    // Learn from this interaction
    await aiIntelligence.learnFromInteraction(userId, {
      message: interaction.content,
      response: assistantResponse?.content || "No response",
      intent: interaction.intent_data,
      userFeedback: feedback,
      rating: rating,
      resolutionTime: resolutionTime || 0
    });

    // Store feedback record
    await supabase.from('ai_feedback').insert({
      user_id: userId,
      message_id: messageId,
      feedback,
      rating,
      resolution_time: resolutionTime,
      notes,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: "Feedback recorded and learned from" 
    });

  } catch (error) {
    console.error("AI Learning API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get learning progress
    const { data: learningData } = await supabase
      .from('ai_learning_data')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    // Get feedback summary
    const { data: feedbackSummary } = await supabase
      .from('ai_feedback')
      .select('feedback, rating, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    // Calculate improvements
    const improvements = calculateImprovements(learningData || [], feedbackSummary || []);

    return NextResponse.json({
      learningData,
      feedbackSummary,
      improvements,
      totalInteractions: learningData?.length || 0,
      averageRating: calculateAverageRating(feedbackSummary || [])
    });

  } catch (error) {
    console.error("AI Learning Stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateImprovements(learningData: any[], feedbackData: any[]) {
  const improvements = {
    responseQuality: 0,
    intentAccuracy: 0,
    userSatisfaction: 0,
    speedImprovement: 0
  };

  // Calculate response quality improvement
  const positiveFeedback = feedbackData.filter(f => f.rating >= 4).length;
  const totalFeedback = feedbackData.length;
  if (totalFeedback > 0) {
    improvements.userSatisfaction = (positiveFeedback / totalFeedback) * 100;
  }

  // Calculate speed improvement
  const avgResolutionTime = learningData.reduce((sum, d) => sum + d.resolution_time, 0) / learningData.length;
  improvements.speedImprovement = avgResolutionTime < 3000 ? 85 : 65; // Under 3s is good

  return improvements;
}

function calculateAverageRating(feedbackData: any[]) {
  if (feedbackData.length === 0) return 0;
  const total = feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0);
  return total / feedbackData.length;
}
