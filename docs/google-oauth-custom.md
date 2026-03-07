# Google OAuth Custom Implementation

## Übersicht

Anstatt Supabase OAuth zu verwenden, können Sie Google OAuth direkt implementieren und so die Supabase-Pro-Features umgehen.

## 🔧 Google Cloud Console Setup

### 1. OAuth 2.0 Client erstellen

1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client ID**
3. **Application type**: Web application
4. **Name**: "Rudolpho-Chat"
5. **Authorized redirect URIs**:
   ```
   https://yourdomain.com/api/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```

### 2. OAuth Consent Screen konfigurieren

1. **App name**: "Rudolpho-Chat"
2. **User support email**: Ihre E-Mail
3. **App logo**: Ihr Logo hochladen
4. **App domain**: Ihre Domain
5. **Authorized domains**: Ihre Domain
6. **Developer contact**: Ihre E-Mail

## 🚀 Implementation

### 1. Google OAuth Route erstellen

```typescript
// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`;
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'email profile');
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  
  return NextResponse.redirect(authUrl.toString());
}
```

### 2. Google OAuth Callback

```typescript
// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect('/?error=no_code');
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`,
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    const userInfo = await userResponse.json();
    
    // Create or update user in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', userInfo.email)
      .single();
    
    if (!existingUser) {
      // Create new user
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          id: userInfo.id,
          email: userInfo.email,
          emailVerified: true,
          // Add other fields as needed
        })
        .select()
        .single();
    }
    
    // Create session
    const { data: session } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: 'google_oauth_user', // You'll need to handle this differently
    });
    
    return NextResponse.redirect('/dashboard');
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect('/?error=oauth_failed');
  }
}
```

## 🔑 Umgebungsvariablen

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🎨 Custom Login Button

```typescript
// src/components/auth/GoogleLoginButton.tsx
export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };
  
  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
}
```

## ✅ Vorteile

1. **Vollständige Kontrolle** über OAuth-Flow
2. **Keine Supabase-Pro-Kosten**
3. **Custom Branding** möglich
4. **Eigene Error-Handling**
5. **Flexible User-Management**

## ⚠️ Nachteile

1. **Mehr Code** zu schreiben
2. **Sicherheit** selbst implementieren
3. **Session-Management** selbst handhaben
4. **Wartung** erforderlich

## 🎯 Empfehlung

Für **"Rudolpho-Chat"** Branding ist die **Google Cloud Console** Anpassung die einfachste Lösung:

1. **OAuth Consent Screen** anpassen
2. **App-Name** auf "Rudolpho-Chat" setzen
3. **Logo** hochladen
4. **Domain** verifizieren

Das gibt Ihnen das gewünschte Branding ohne zusätzlichen Code!

