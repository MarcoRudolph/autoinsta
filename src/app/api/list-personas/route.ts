import { NextResponse } from 'next/server';
import { createSupabaseAnonServerClient } from '@/lib/supabase/serverClient';
import { requireAuthenticatedUser, validateRequestedUserId } from '@/lib/security/requestAuth';

export const runtime = 'nodejs';

type PersonaData = {
  name?: string;
  active?: boolean;
  transparencyMode?: boolean;
  personality?: {
    name?: string;
    active?: boolean;
    [key: string]: unknown;
  };
  data?: {
    name?: string;
    active?: boolean;
    transparencyMode?: boolean;
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
  const requestedUserId = searchParams.get('userId');
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.response) return auth.response;
    const mismatch = validateRequestedUserId(requestedUserId, auth.userId);
    if (mismatch) return mismatch;

    // Initialize Supabase client
    const supabase = createSupabaseAnonServerClient();

    const { data: result, error } = await supabase
      .from('personas')
      .select('*')
      .eq('userId', auth.userId);

    if (error) {
      console.error('Error fetching personas:', error);
      return NextResponse.json({ error: 'Failed to list personas', details: error.message }, { status: 500 });
    }

    // Map to include id, name, and active for dropdown
    const personasList = (result || []).map(row => {
      const data = row.data as PersonaData;
      
      // Check if data has personality structure or flat structure
      // Handle double-wrapped data structure: data.data.personality.name
      const name = data?.data?.personality?.name || data?.personality?.name || data?.name || `Persona ${row.id}`;
      
      // Check for active status in both flat and legacy nested data shapes
      let active = false;
      if (data?.active !== undefined) {
        active = data.active;
      } else if (data?.data?.active !== undefined) {
        active = data.data.active;
      } else {
        // If active field doesn't exist, default to false
        active = false;
      }
      
      // Check for transparency mode in both flat and legacy nested data shapes
      let transparencyMode = true; // Default to true
      if (data?.transparencyMode !== undefined && data?.transparencyMode !== null) {
        transparencyMode = Boolean(data.transparencyMode);
      } else if (data?.data?.transparencyMode !== undefined && data?.data?.transparencyMode !== null) {
        transparencyMode = Boolean(data.data.transparencyMode);
      }
      
      return {
        id: row.id,
        name: name,
        active: active,
        transparencyMode: transparencyMode,
      };
    });
    return NextResponse.json({ personas: personasList });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list personas', details: String(error) }, { status: 500 });
  }
} 


