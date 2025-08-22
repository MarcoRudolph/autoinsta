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
    const { personaId, userId, active } = await req.json();
    if (!personaId || !userId || active === undefined) {
      return NextResponse.json({ error: 'Missing personaId, userId, or active status' }, { status: 400 });
    }
    
    console.log(`Setting active persona: ${personaId} for user: ${userId} with active=${active}`);
    
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
    
    // If we're activating a persona, deactivate all others
    // If we're deactivating a persona, just update that one
    for (const p of allPersonas || []) {
      const data = p.data as PersonaData;
      let shouldBeActive = false;
      
      if (active === true) {
        // Activating: only the selected persona should be active
        shouldBeActive = p.id === personaId;
      } else {
        // Deactivating: only update the selected persona to false
        if (p.id === personaId) {
          shouldBeActive = false;
        } else {
          // Keep other personas as they are
          continue;
        }
      }
      
      // Update only the active status at the top level for consistency
      const updatedData = {
        ...data,
        active: shouldBeActive
      };
      
      console.log(`Updating persona ${p.id} with active=${shouldBeActive}, current data:`, data);
      console.log(`Updated data will be:`, updatedData);
      
      // Update persona using Supabase
      const { error: updateError } = await supabase
        .from('personas')
        .update({ data: updatedData })
        .eq('id', p.id);

      if (updateError) {
        console.error(`Error updating persona ${p.id}:`, updateError);
      } else {
        console.log(`Successfully updated persona ${p.id} with active=${shouldBeActive}`);
      }
    }
    
    // Return the updated persona
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
