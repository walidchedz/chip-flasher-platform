import { NextResponse } from 'next/server';
import { hashPassword, generateTokens, generateAPIKey } from '@/lib/auth';
import sql from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    await checkRateLimit();
    
    const { email, password, deviceFingerprint } = await request.json();
    
    // التحقق من صحة الإيميل
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    
    // التحقق من قوة كلمة المرور
    if (!password || password.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }
    
    if (!password.match(/[A-Z]/) || !password.match(/[a-z]/) || !password.match(/[0-9]/) || !password.match(/[!@#$%^&*]/)) {
      return NextResponse.json({ error: 'Password must contain uppercase, lowercase, number, and special character' }, { status: 400 });
    }
    
    // التحقق من عدم وجود المستخدم
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    
    // إنشاء المستخدم
    const passwordHash = await hashPassword(password);
    const apiKey = generateAPIKey();
    
    await sql`
      INSERT INTO users (email, password_hash, api_key)
      VALUES (${email}, ${passwordHash}, ${apiKey})
    `;
    
    const user = await sql`SELECT id, email, api_key FROM users WHERE email = ${email}`;
    const { accessToken, refreshToken } = generateTokens(user[0].id, email);
    
    // إرجاع النتيجة
    return NextResponse.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        apiKey: user[0].api_key,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
      message: 'Registration successful! Save your API key - it will not be shown again.'
    });
    
  } catch (error: any) {
    if (error.message?.includes('Rate limit')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
