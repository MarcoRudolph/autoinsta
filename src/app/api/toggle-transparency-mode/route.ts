import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

type PersonaPayload = {
  transparencyMode?: boolean;
  data?: {
    transparencyMode?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.response) return auth.response;

    const { personaId, userId, transparencyMode } = await request.json();
    const mismatch = validateRequestedUserId(userId, auth.userId);
    if (mismatch) return mismatch;
    
    if (!personaId || transparencyMode === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAnonServerClient();
    
    // Get the current persona data
    const { data: personaData, error: fetchError } = await supabase
      .from('personas')
      .select('data')
      .eq('id', personaId)
      .eq('userId', auth.userId)
      .single();

    if (fetchError || !personaData) {
      return NextResponse.json(
        { error: 'Persona not found or access denied' },
        { status: 404 }
      );
    }

    // Update the persona data with the new transparency mode value
    const currentData = personaData.data as PersonaPayload;
    const updatedData: PersonaPayload = currentData?.data
      ? {
          ...currentData,
          transparencyMode: transparencyMode,
          data: {
            ...currentData.data,
            transparencyMode: transparencyMode,
          },
        }
      : {
          ...currentData,
          transparencyMode: transparencyMode,
        };
    
    // Update the persona data
    const { error: updateError } = await supabase
      .from('personas')
      .update({ 
        data: updatedData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', personaId)
      .eq('userId', auth.userId);

    if (updateError) {
      console.error('Error updating persona:', updateError);
      return NextResponse.json(
        { error: 'Failed to update persona' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      transparencyMode: transparencyMode 
    });

  } catch (error) {
    console.error('Error in toggle-transparency-mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

