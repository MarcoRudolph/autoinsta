import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const runtime = 'nodejs';

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = verifyEmailSchema.parse(body);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Find user with this verification token
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, email, verificationToken, verificationTokenExpires, emailVerified')
      .eq('verificationToken', token)
      .limit(1);

    if (findError || !users || users.length === 0) {
      return NextResponse.json({ 
        code: 'INVALID_TOKEN', 
        message: 'Invalid or expired verification token.' 
      }, { status: 400 });
    }

    const user = users[0];

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        code: 'ALREADY_VERIFIED', 
        message: 'Email is already verified.' 
      }, { status: 400 });
    }

    // Check if token is expired
    if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < new Date()) {
      return NextResponse.json({ 
        code: 'TOKEN_EXPIRED', 
        message: 'Verification token has expired. Please request a new one.' 
      }, { status: 400 });
    }

    // Mark email as verified and clear verification token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user verification status:', updateError);
      return NextResponse.json({ 
        code: 'UPDATE_ERROR', 
        message: 'Failed to verify email. Please try again.' 
      }, { status: 500 });
    }

    // Send welcome email after successful verification
    try {
      await sendWelcomeEmail(user.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    return NextResponse.json({ 
      message: 'Email verified successfully! You can now log in to your account.',
      userId: user.id,
      email: user.email
    }, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ code: 'VALIDATION_ERROR', message: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Unknown error' }, { status: 500 });
  }
}

async function sendWelcomeEmail(email: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Boost Your Date <noreply@boostyourdate.com>',
        to: [email],
        subject: '🎉 Welcome to Boost Your Date - Let\'s Get Started!',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Boost Your Date</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f3aacb; margin: 0; font-size: 28px;">🎉 Welcome to Boost Your Date!</h1>
            <p style="color: #a3bffa; margin: 10px 0 0 0; font-size: 16px;">Your email has been verified successfully!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #334269; margin-top: 0;">Ready to boost your dating success? 🚀</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Now that your account is verified, you can start optimizing your dating profile with our AI-powered tools!</p>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #1976d2; margin-top: 0;">What you can do next:</h3>
              <ul style="color: #333; margin: 0; padding-left: 20px;">
                <li>📝 Create your AI-powered dating persona</li>
                <li>📸 Connect your Instagram account</li>
                <li>💬 Set up automated responses</li>
                <li>🎯 Optimize your profile for better matches</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/dashboard" style="background: linear-gradient(135deg, #f3aacb 0%, #e879f9 100%); color: #334269; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(243, 170, 203, 0.3);">
                🚀 Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #0369a1; margin-top: 0;">💡 Pro Tips for Success:</h3>
            <ul style="color: #333; margin: 0; padding-left: 20px;">
              <li>Be authentic in your AI persona settings</li>
              <li>Use high-quality photos for your profile</li>
              <li>Engage regularly with your matches</li>
              <li>Monitor your AI responses and adjust as needed</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>Need help getting started? Check out our <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/documentation" style="color: #f3aacb;">documentation</a> or contact our support team.</p>
            <p style="margin-top: 20px;">Best regards,<br><strong>The Boost Your Date Team</strong></p>
          </div>
        </body>
        </html>
      `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send welcome email: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Welcome email sent successfully:', data);
    return data;
    
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}




