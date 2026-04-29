import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function initDatabase() {
  // جدول المستخدمين
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      api_key VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
      mfa_secret VARCHAR(64),
      mfa_enabled BOOLEAN DEFAULT false,
      role VARCHAR(20) DEFAULT 'user',
      credits INT DEFAULT 100,
      created_at TIMESTAMP DEFAULT NOW(),
      last_login TIMESTAMP,
      is_active BOOLEAN DEFAULT true
    );
  `;

  // جدول سجل الفلاشينج
  await sql`
    CREATE TABLE IF NOT EXISTS flash_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      chip_type VARCHAR(20) NOT NULL,
      chip_family VARCHAR(50) NOT NULL,
      chip_model VARCHAR(100) NOT NULL,
      firmware_name VARCHAR(255),
      firmware_size BIGINT,
      firmware_hash VARCHAR(64) NOT NULL,
      operation VARCHAR(20) DEFAULT 'write',
      status VARCHAR(20) DEFAULT 'pending',
      progress INT DEFAULT 0,
      error_message TEXT,
      ip_address INET,
      device_fingerprint VARCHAR(64),
      connection_type VARCHAR(20),
      duration_ms INT,
      started_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    );
  `;

  // جدول الشيبسات المدعومة
  await sql`
    CREATE TABLE IF NOT EXISTS supported_chips (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      family VARCHAR(50) NOT NULL,
      type VARCHAR(20) NOT NULL,
      protocol VARCHAR(20) NOT NULL,
      voltage VARCHAR(20),
      size VARCHAR(20),
      package VARCHAR(50),
      manufacturer VARCHAR(100),
      description TEXT,
      image_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // جدول الملفات المرفوعة
  await sql`
    CREATE TABLE IF NOT EXISTS firmware_files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      size BIGINT NOT NULL,
      hash VARCHAR(64) NOT NULL,
      mime_type VARCHAR(100),
      is_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // إضافة الفهارس
  await sql`CREATE INDEX IF NOT EXISTS idx_flash_logs_user_id ON flash_logs(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_flash_logs_status ON flash_logs(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_flash_logs_created_at ON flash_logs(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key)`;
}

export default sql;
