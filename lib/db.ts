import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// إنشاء الجداول تلقائياً
export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      api_key VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
      mfa_secret VARCHAR(64),
      mfa_enabled BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      last_login TIMESTAMP,
      is_active BOOLEAN DEFAULT true
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS flash_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      chip_type VARCHAR(50) NOT NULL,
      chip_model VARCHAR(100) NOT NULL,
      firmware_hash VARCHAR(64) NOT NULL,
      firmware_size BIGINT,
      status VARCHAR(20) DEFAULT 'pending',
      ip_address INET,
      device_fingerprint VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    );
  `;
}

export default sql;
