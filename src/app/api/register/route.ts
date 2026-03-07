import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { checkRegistrationRateLimit, getClientIP } from '@/lib/rateLimit';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    // Check rate limit first
    const clientIP = getClientIP(req);
    const rateLimit = checkRegistrationRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      const hoursUntilReset = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60));
      
      return NextResponse.json({ 
        code: 'RATE_LIMIT_EXCEEDED', 
        message: `Registration limit exceeded. You can try again in ${hoursUntilReset} hours.`,
        resetTime: rateLimit.resetTime,
        hoursUntilReset
      }, { status: 429 });
    }

    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to check existing user.' }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ code: 'USER_EXISTS', message: 'User already exists.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate UUID for user
    const userId = uuidv4();

    // Generate verification token (24 hours expiry)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create new user using Supabase with verification fields
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        passwordHash: hashedPassword,
        emailVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpires: verificationTokenExpires.toISOString(),
        verificationSentAt: new Date().toISOString(),
        subscription_status: 'free',
        subscription_plan: 'free',
        is_pro: false
        // createdAt and updatedAt will be set automatically by database defaults
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to create user.' }, { status: 500 });
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    return NextResponse.json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      requiresEmailVerification: true,
      userId: newUser.id
    }, { status: 201 });

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

// Function to send verification email using Resend
async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  try {
    // Import Resend dynamically to avoid issues in edge runtime
    const { Resend } = await import('resend');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'Boost Your Date <noreply@boostyourdate.com>', // Update with your verified domain
      to: [email],
      subject: 'Welcome to Boost Your Date - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f3aacb; margin: 0; font-size: 28px;">🎉 Welcome to Boost Your Date!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for registering! To complete your account setup and start optimizing your dating profile, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #f3aacb 0%, #e879f9 100%); color: #334269; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(243, 170, 203, 0.3);">
                ✅ Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #888; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              ⏰ <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>Best regards,<br><strong>The Boost Your Date Team</strong></p>
            <p style="font-size: 12px; margin-top: 20px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    console.log('Verification email sent successfully:', data);
    return data;
    
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Fallback: log the verification URL for development
    console.log('Verification URL (fallback):', verificationUrl);
    throw error;
  }
}
