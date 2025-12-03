import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  practice_name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    // Check if email already exists
    const { data: existing, error: checkError } = await db
      .from('therapists')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();

    // If there's an error that's not "not found", return error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error', details: checkError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password and create therapist
    const password_hash = await hashPassword(data.password);
    const { data: therapist, error } = await db
      .from('therapists')
      .insert({
        email: data.email,
        password_hash,
        name: data.name,
        practice_name: data.practice_name,
      })
      .select('id, email, name, practice_name')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create therapist account', details: error.message },
        { status: 500 }
      );
    }

    if (!therapist) {
      return NextResponse.json(
        { error: 'Failed to create therapist account' },
        { status: 500 }
      );
    }

    // Generate token
    const token = generateToken({ id: therapist.id, email: therapist.email });

    return NextResponse.json({
      therapist,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

