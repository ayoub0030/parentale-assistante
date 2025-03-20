import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, childProfile, apiKey } = body;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!task || !childProfile) {
      return NextResponse.json(
        { error: 'Task and child profile information are required' },
        { status: 400 }
      );
    }
    
    // Create prompt for Gemini
    const prompt = `
    You are an expert educational planner and child development specialist. Create a detailed, personalized learning plan for a child based on the following information:

    CHILD INFORMATION:
    Name: ${childProfile.name}
    Age: ${childProfile.age}
    Gender: ${childProfile.gender}
    Interests: ${childProfile.interests.join(', ')}
    Personality: ${childProfile.personality}
    Learning Style: ${childProfile.learningStyle}

    TASK INFORMATION:
    Title: ${task.title}
    Description: ${task.description}
    Subject: ${task.subject}
    Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not specified'}
    Priority: ${task.priority}
    Estimated Time: ${task.estimatedTime || 'Not specified'} minutes
    
    Please create a comprehensive learning plan that includes:
    1. Clear learning objectives
    2. Step-by-step activities tailored to the child's learning style and interests
    3. Required materials or resources
    4. Suggested time allocation for each activity
    5. Tips for parents on how to support the child
    6. Ways to make the learning engaging and fun based on the child's interests
    7. Methods to assess progress and understanding

    Format your response in markdown with clear sections and bullet points where appropriate.
    `;
    
    // Create request body for Gemini API
    const geminiRequestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    };
    
    console.log('Sending request to Gemini API for plan generation');
    
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
        { error: 'Failed to generate plan', details: errorData },
        { status: response.status }
      );
    }

    // Parse the Gemini response
    const geminiData = await response.json();
    console.log('Received response from Gemini API for plan generation');
    
    // Extract the generated plan text
    const generatedPlan = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return NextResponse.json({ plan: generatedPlan });
  } catch (error) {
    console.error('Error in Gemini plan generation API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
