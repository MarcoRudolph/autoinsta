export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type PersonaData = {
  name?: string;
  active?: boolean;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const { personaId, userId } = await req.json();
    if (!personaId || !userId) {
      return NextResponse.json({ error: 'Missing personaId or userId' }, { status: 400 });
    }
    
    console.log(`Setting active persona: ${personaId} for user: ${userId}`);
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Fetch all personas for this user
    const { data: allPersonas, error: fetchError } = await supabase
      .from('personas')
      .select('*')
      .eq('userId', userId);

    if (fetchError) {
      console.error('Error fetching personas:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch personas', details: fetchError.message }, { status: 500 });
    }

    console.log(`Found ${allPersonas?.length || 0} personas for user`);
    
    // Set active=false for all, active=true for the selected one
    for (const p of allPersonas || []) {
      const data = p.data as PersonaData;
      const isActive = p.id === personaId;
      
      // Update only the active status at the top level for consistency
      const updatedData = {
        ...data,
        active: isActive
      };
      
      console.log(`Updating persona ${p.id} with active=${isActive}, current data:`, data);
      console.log(`Updated data will be:`, updatedData);
      
      // Update persona using Supabase
      const { error: updateError } = await supabase
        .from('personas')
        .update({ data: updatedData })
        .eq('id', p.id);

      if (updateError) {
        console.error(`Error updating persona ${p.id}:`, updateError);
      } else {
        console.log(`Successfully updated persona ${p.id} with active=${isActive}`);
      }
    }
    
    // Return the updated active persona
    const { data: updated, error: getError } = await supabase
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .eq('userId', userId)
      .limit(1)
      .single();

    if (getError) {
      console.error('Error fetching updated persona:', getError);
      return NextResponse.json({ error: 'Failed to fetch updated persona', details: getError.message }, { status: 500 });
    }

    return NextResponse.json({ persona: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set active persona', details: String(error) }, { status: 500 });
  }
} 
