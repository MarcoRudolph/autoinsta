export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type PersonaData = {
  name?: string;
  active?: boolean;
  personality?: {
    name?: string;
    active?: boolean;
    [key: string]: unknown;
  };
  data?: {
    name?: string;
    active?: boolean;
    personality?: {
      name?: string;
      active?: boolean;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase.from('personas').select('*');
    
    // Filter by userId if provided
    if (userId) {
      query = query.eq('userId', userId);
    }
    
    const { data: result, error } = await query;

    if (error) {
      console.error('Error fetching personas:', error);
      return NextResponse.json({ error: 'Failed to list personas', details: error.message }, { status: 500 });
    }

    console.log('Raw database result:', JSON.stringify(result, null, 2));
    
    // Map to include id, name, and active for dropdown
    const personasList = (result || []).map(row => {
      const data = row.data as PersonaData;
      console.log(`Processing persona ${row.id}:`, JSON.stringify(data, null, 2));
      console.log(`Persona ${row.id} - data type:`, typeof data);
      console.log(`Persona ${row.id} - data keys:`, Object.keys(data || {}));
      
      // Check if data has personality structure or flat structure
      // Handle double-wrapped data structure: data.data.personality.name
      const name = data?.data?.personality?.name || data?.personality?.name || data?.name || `Persona ${row.id}`;
      console.log(`Persona ${row.id} - data?.data?.personality?.name:`, data?.data?.personality?.name);
      console.log(`Persona ${row.id} - data?.personality?.name:`, data?.personality?.name);
      console.log(`Persona ${row.id} - data?.name:`, data?.name);
      console.log(`Persona ${row.id} - data?.personality:`, data?.personality);
      console.log(`Persona ${row.id} - final name:`, name);
      
      // Check for active status - it should be at data.active level
      let active = false;
      if (data?.active !== undefined) {
        active = data.active;
      } else {
        // If active field doesn't exist, default to false
        active = false;
      }
      
      // Check for transparency mode - it should be at data.transparencyMode level
      let transparencyMode = true; // Default to true
      if (data?.transparencyMode !== undefined && data?.transparencyMode !== null) {
        transparencyMode = Boolean(data.transparencyMode);
      }
      
      console.log(`Persona ${row.id} (${name}): active=${active}, transparencyMode=${transparencyMode}, data:`, data);
      
      return {
        id: row.id,
        name: name,
        active: active,
        transparencyMode: transparencyMode,
      };
    });
    console.log('Final personasList:', JSON.stringify(personasList, null, 2));
    return NextResponse.json({ personas: personasList });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list personas', details: String(error) }, { status: 500 });
  }
} 
