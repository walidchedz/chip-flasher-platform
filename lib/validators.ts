import { z } from 'zod';

// أنواع الشيبسات المدعومة
export const chipTypeEnum = z.enum([
  'SPI_NOR', 'SPI_NAND', 'I2C_EEPROM', 'eMMC',
  'NAND', 'PARALLEL_NOR', 'MCU', 'EFUSE'
]);

// عائلات الشيبسات
export const chipFamilyEnum = z.enum([
  'W25Q', 'MX25L', 'S25FL', 'N25Q', 'MT25Q',
  'AT24C', 'AT25', 'CAT24C', 'M24C',
  'THGBM', 'KLM8G', 'eMMC',
  'S34ML', 'MT29F', 'TC58NVG',
  'STM32', 'ESP32', 'AVR',
]);

// بروتوكولات الاتصال
export const protocolEnum = z.enum([
  'SPI', 'QSPI', 'I2C', 'eMMC', 'NAND',
  'Parallel', 'SWD', 'JTAG', 'UART'
]);

// أنظمة الفولتية
export const voltageEnum = z.enum([
  '1.8V', '2.5V', '3.3V', '5V', '1.8V/3.3V', '3.3V/5V'
]);

// حالة الفلاشينج
export const flashStatusEnum = z.enum([
  'pending', 'queued', 'connecting', 'connected',
  'erasing', 'writing', 'verifying', 'complete', 'error'
]);

// أنواع العمليات
export const operationEnum = z.enum([
  'read', 'write', 'erase', 'verify', 'blank_check'
]);

// Schema لتسجيل الدخول
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().length(6).optional(),
  deviceFingerprint: z.string().optional(),
});

// Schema للتسجيل
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema لطلب الفلاشينج
export const flashRequestSchema = z.object({
  chipType: chipTypeEnum,
  chipFamily: chipFamilyEnum,
  chipModel: z.string().min(1, 'Chip model is required'),
  operation: operationEnum.default('write'),
  firmwareData: z.string().min(1, 'Firmware data is required'),
  verifyAfter: z.boolean().default(true),
  preserveEFuse: z.boolean().default(false),
  fastMode: z.boolean().default(false),
});

// أنواع الاتصال
export const connectionTypeEnum = z.enum([
  'webserial', 'webusb', 'webbluetooth', 'webhid'
]);

// أنواع الملفات المدعومة
export const firmwareFileSchema = z.object({
  name: z.string(),
  size: z.number().max(100 * 1024 * 1024, 'File too large (max 100MB)'),
  type: z.enum([
    'application/octet-stream',
    'application/x-binary',
    'application/hex',
    ''
  ]),
  data: z.string(), // base64
});
