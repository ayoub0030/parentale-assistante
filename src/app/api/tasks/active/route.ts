import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Get API key from query parameters or use fallback to localStorage
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('apiKey') || '';
  const supabaseUrl = url.searchParams.get('url') || 'https://xyzcompany.supabase.co';
  
  try {
    let activeTask = null;
    
    // Try to get tasks from Supabase if API key is provided
    if (apiKey) {
      const supabase = createClient(supabaseUrl, apiKey);
      
      // Check if the tasks table exists
      const { data: tableExists } = await supabase
        .from('tasks')
        .select('count')
        .limit(1)
        .single();
      
      if (tableExists) {
        // Get the most recent active task that has a plan
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .or('status.eq.pending,status.eq.in-progress')
          .not('plan', 'is', null)
          .order('createdAt', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Supabase query error:', error);
        } else if (tasks && tasks.length > 0) {
          activeTask = tasks[0];
        }
      }
    }
    
    // If no task found in Supabase, try local storage (client-side only)
    if (!activeTask) {
      try {
        // Return empty response - the client will use localStorage as fallback
        return NextResponse.json(null, {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      } catch (localStorageError) {
        console.error('Local storage error:', localStorageError);
      }
    }
    
    // Return the active task
    return NextResponse.json(activeTask, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Error fetching active task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active task' }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
