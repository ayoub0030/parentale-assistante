import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = body.apiKey;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }
    
    // Remove the API key from the request body before forwarding
    const { apiKey: _, ...requestBody } = body;
    
    // Convert OpenAI format to Gemini format
    const geminiRequestBody = {
      contents: requestBody.messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role === 'system' ? 'user' : msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: requestBody.parameters?.temperature || 0.7,
        maxOutputTokens: requestBody.parameters?.maxTokens || 8192,
      }
    };
    
    console.log('Sending request to Gemini API:', JSON.stringify(geminiRequestBody, null, 2));
    
    // Make the request to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawError: errorText };
      }
      
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate content', details: errorData },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }

    // Convert Gemini response to OpenAI format
    const geminiData = await response.json();
    console.log('Received response from Gemini API:', JSON.stringify(geminiData, null, 2));
    
    // Transform Gemini response to OpenAI format
    const openAIResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Date.now(),
      model: 'gemini-1.5-pro',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '',
          },
          finish_reason: geminiData.candidates?.[0]?.finishReason || 'stop',
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
    
    return NextResponse.json(openAIResponse, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
