import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import sql from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    await checkRateLimit();
    
    // التحقق من المصادقة
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    const { chipType, chipModel, firmwareData } = await request.json();
    
    // التحقق من صحة البيانات
    const validChips = ['SPI_25', '24C', 'eMMC', 'NAND'];
    if (!validChips.includes(chipType)) {
      return NextResponse.json({ error: 'Invalid chip type' }, { status: 400 });
    }
    
    // فك تشفير الـ firmware
    const firmwareBuffer = Buffer.from(firmwareData, 'base64');
    
    if (firmwareBuffer.length > 100 * 1024 * 1024) { // 100MB حد
      return NextResponse.json({ error: 'Firmware too large' }, { status: 413 });
    }
    
    // حساب الـ hash للأمان
    const firmwareHash = crypto
      .createHash('sha256')
      .update(firmwareBuffer)
      .digest('hex');
    
    // تسجيل العملية في قاعدة البيانات
    const result = await sql`
      INSERT INTO flash_logs (user_id, chip_type, chip_model, firmware_hash, firmware_size, status, ip_address)
      VALUES (${payload.userId}, ${chipType}, ${chipModel}, ${firmwareHash}, ${firmwareBuffer.length}, 'queued', ${request.headers.get('x-forwarded-for') || 'unknown'})
      RETURNING id, status, created_at
    `;
    
    // إرسال الـ firmware إلى WebSocket للعميل
    // (سنستخدم BroadcastChannel في المتصفح)
    
    return NextResponse.json({
      flashId: result[0].id,
      status: 'queued',
      firmwareHash,
      message: 'Flash operation queued. Connect your programmer via WebUSB/WebSerial.'
    });
    
  } catch (error: any) {
    if (error.message?.includes('Rate limit')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error('Flash error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // جلب سجل العمليات
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const payload = verifyToken(token);
    
    const logs = await sql`
      SELECT id, chip_type, chip_model, firmware_hash, status, created_at, completed_at
      FROM flash_logs
      WHERE user_id = ${payload.userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    return NextResponse.json({ logs });
    
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
