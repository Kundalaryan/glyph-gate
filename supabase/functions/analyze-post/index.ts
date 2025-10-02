import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId } = await req.json();

    if (!postId) {
      throw new Error('Post ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      throw new Error('Post not found');
    }

    // Get Lovable AI key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Analyze with Gemini
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert analyst reviewing company feedback. Analyze the post and provide:
1. A brief summary of the main points (2-3 sentences)
2. Key themes or concerns mentioned
3. Whether the sentiment aligns with the content
4. Any notable patterns or insights
5. Credibility assessment

Keep your analysis concise, objective, and actionable for company reviews.`
          },
          {
            role: 'user',
            content: `Company: ${post.company_name}
Title: ${post.title}
Content: ${post.content}
Tags: ${post.tags?.join(', ') || 'None'}
Current Sentiment: ${post.sentiment}

Please analyze this post and provide context.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      throw new Error('Failed to analyze post with AI');
    }

    const aiData = await aiResponse.json();
    const aiContext = aiData.choices?.[0]?.message?.content;

    if (!aiContext) {
      throw new Error('No AI analysis generated');
    }

    // Update the post with AI context
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        ai_context: aiContext,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully analyzed post ${postId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        aiContext,
        message: 'Post analyzed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-post function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});