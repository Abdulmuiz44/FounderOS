
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Check if user exists
        const { data: user } = await supabase.from('users').select('id, name').eq('email', email).single();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // 3. Store token
        // Note: NextAuth uses verification_tokens table, but usually for "magic links" via Email Provider.
        // For manual custom verification flow, we can use the same table or a new one. 
        // Let's use `verification_tokens` table consistent with NextAuth schema.
        // Identifier = email, Token = token

        // Check if token exists, delete it
        await supabase.from('verification_tokens').delete().eq('identifier', email);

        // Debug token insertion
        console.log(`Inserting token for ${email}:`, token);

        const { error: tokenError } = await supabase.from('verification_tokens').insert({
            identifier: email,
            token: token,
            expires: expires.toISOString(),
        });

        if (tokenError) {
            console.error("Token insert error:", tokenError);
            throw tokenError;
        }



        // 4. Send email
        console.log(`Sending email to ${email} via ${process.env.SMTP_HOST}`);
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: Number(process.env.SMTP_PORT) === 465, // Use SSL/TLS if port 465, otherwise STARTTLS
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

            const info = await transporter.sendMail({
                from: `"FounderOS" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Verify your email address',
                html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Verify your email</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Thanks for signing up for FounderOS. Please verify your email address by clicking the link below:</p>
              <a href="${verifyUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Verify Email</a>
              <p>If you didn't sign up, you can ignore this email.</p>
            </div>
          `,
            });
            console.log("Message sent: %s", info.messageId);
        } catch (mailError) {
            console.error("Nodemailer error:", mailError);
            throw mailError; // Allow main catch to handle it
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error sending verification email:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
