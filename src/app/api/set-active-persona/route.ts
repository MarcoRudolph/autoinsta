import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

type PersonaData = {
  name?: string;
  active?: boolean;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const { personaId, userId, active } = await req.json();
    const mismatch = validateRequestedUserId(userId, auth.userId);
    if (mismatch) return mismatch;
    if (!personaId || active === undefined) {
      return NextResponse.json({ error: 'Missing personaId or active status' }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();
    
    // Fetch all personas for this user
    const { data: allPersonas, error: fetchError } = await supabase
      .from('personas')
      .select('*')
      .eq('userId', auth.userId);

    if (fetchError) {
      console.error('Error fetching personas:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch personas', details: fetchError.message }, { status: 500 });
    }

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
      
      // Update persona using Supabase
      const { error: updateError } = await supabase
        .from('personas')
        .update({ data: updatedData })
        .eq('id', p.id);

      if (updateError) {
        console.error(`Error updating persona ${p.id}:`, updateError);
      }
    }
    
    // Return the updated persona
    const { data: updated, error: getError } = await supabase
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .eq('userId', auth.userId)
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


