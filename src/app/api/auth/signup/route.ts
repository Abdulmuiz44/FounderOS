import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            )
        }

        // Hash password
        const password_hash = await hash(password, 12)

        // Create user
        const userId = randomUUID()
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: email.toLowerCase(),
                name: name || email.split('@')[0],
                password_hash,
                emailVerified: new Date().toISOString(), // Auto-verify for now
                created_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating user:', error)
            return NextResponse.json(
                { error: 'Failed to create account' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Account created successfully. You can now sign in.',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            }
        })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
