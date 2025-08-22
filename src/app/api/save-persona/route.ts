export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Save persona API received data:', JSON.stringify(data, null, 2));
    console.log('Data being inserted into database:', JSON.stringify(data, null, 2));
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Ensure the persona data has an active status
    const personaData = {
      ...data,
      active: data.active !== undefined ? data.active : false
    };
    
    // Insert new persona using Supabase
    const { data: result, error } = await supabase
      .from('personas')
      .insert({
        userId: data.userId, // ensure userId is provided
        data: personaData,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting persona:', error);
      return NextResponse.json({ error: 'Failed to save persona', details: error.message }, { status: 500 });
    }
    
    console.log('Database insert result:', JSON.stringify(result, null, 2));
    return NextResponse.json({ success: true, persona: result });
  } catch (error) {
    console.error('Error in save-persona API:', error);
    return NextResponse.json({ error: 'Failed to save persona', details: String(error) }, { status: 500 });
  }
} 
