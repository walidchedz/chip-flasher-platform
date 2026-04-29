// ===== I2C EEPROM - سلسلة AT24C و M24C و CAT24C =====

export interface I2CEEPROMSpec {
  name: string;
  family: string;
  size: string;
  sizeBytes: number;
  voltage: string;
  package: string;
  manufacturer: string;
  maxClock: number; // kHz
  pageSize: number;
  writeCycleTime: number; // ms
  addressBits: number;
  deviceAddress: number; // 7-bit base address
  description: string;
}

export const i2cEEPROMs: I2CEEPROMSpec[] = [
  // ===== Microchip / Atmel AT24C Series =====
  {
    name: 'AT24C01',
    family: 'AT24C',
    size: '128B',
    sizeBytes: 128,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 8,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '128-bit serial EEPROM, 1Kbit',
  },
  {
    name: 'AT24C02',
    family: 'AT24C',
    size: '256B',
    sizeBytes: 256,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 8,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '256-byte serial EEPROM, 2Kbit',
  },
  {
    name: 'AT24C04',
    family: 'AT24C',
    size: '512B',
    sizeBytes: 512,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 16,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '512-byte serial EEPROM, 4Kbit',
  },
  {
    name: 'AT24C08',
    family: 'AT24C',
    size: '1KB',
    sizeBytes: 1024,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 16,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '1KB serial EEPROM, 8Kbit',
  },
  {
    name: 'AT24C16',
    family: 'AT24C',
    size: '2KB',
    sizeBytes: 2048,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 16,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '2KB serial EEPROM, 16Kbit',
  },
  {
    name: 'AT24C32',
    family: 'AT24C',
    size: '4KB',
    sizeBytes: 4096,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 32,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '4KB serial EEPROM, 32Kbit',
  },
  {
    name: 'AT24C64',
    family: 'AT24C',
    size: '8KB',
    sizeBytes: 8192,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 32,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '8KB serial EEPROM, 64Kbit',
  },
  {
    name: 'AT24C128',
    family: 'AT24C',
    size: '16KB',
    sizeBytes: 16384,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 64,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '16KB serial EEPROM, 128Kbit',
  },
  {
    name: 'AT24C256',
    family: 'AT24C',
    size: '32KB',
    sizeBytes: 32768,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 64,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '32KB serial EEPROM, 256Kbit - الأكثر شيوعاً',
  },
  {
    name: 'AT24C512',
    family: 'AT24C',
    size: '64KB',
    sizeBytes: 65536,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 128,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '64KB serial EEPROM, 512Kbit',
  },
  {
    name: 'AT24C1024',
    family: 'AT24C',
    size: '128KB',
    sizeBytes: 131072,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/TSSOP-8',
    manufacturer: 'Microchip/Atmel',
    maxClock: 1000,
    pageSize: 256,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '128KB serial EEPROM, 1Mbit',
  },

  // ===== STMicroelectronics M24C Series =====
  {
    name: 'M24C02',
    family: 'M24C',
    size: '256B',
    sizeBytes: 256,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/DIP-8',
    manufacturer: 'STMicroelectronics',
    maxClock: 400,
    pageSize: 16,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '256-byte serial EEPROM',
  },
  {
    name: 'M24C64',
    family: 'M24C',
    size: '8KB',
    sizeBytes: 8192,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/TSSOP-8',
    manufacturer: 'STMicroelectronics',
    maxClock: 400,
    pageSize: 32,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '8KB serial EEPROM',
  },
  {
    name: 'M24C256',
    family: 'M24C',
    size: '32KB',
    sizeBytes: 32768,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/TSSOP-8',
    manufacturer: 'STMicroelectronics',
    maxClock: 400,
    pageSize: 64,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '32KB serial EEPROM',
  },

  // ===== ON Semiconductor CAT24C Series =====
  {
    name: 'CAT24C02',
    family: 'CAT24C',
    size: '256B',
    sizeBytes: 256,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/TSSOP-8',
    manufacturer: 'ON Semiconductor',
    maxClock: 400,
    pageSize: 16,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '256-byte serial EEPROM',
  },
  {
    name: 'CAT24C256',
    family: 'CAT24C',
    size: '32KB',
    sizeBytes: 32768,
    voltage: '1.8V-5.5V',
    package: 'SOIC-8/TSSOP-8',
    manufacturer: 'ON Semiconductor',
    maxClock: 400,
    pageSize: 64,
    writeCycleTime: 5,
    addressBits: 7,
    deviceAddress: 0x50,
    description: '32KB serial EEPROM',
  },
];

// I2C Commands
export const I2C_EEPROM_COMMANDS = {
  WRITE: 0b00000000,  // A0 low = write
  READ: 0b00000001,   // A0 high = read
  ACK: 0,
  NACK: 1,
};

// I2C timing constants
export const I2C_TIMING = {
  STANDARD: 100,   // 100 kHz
  FAST: 400,       // 400 kHz
  FAST_PLUS: 1000, // 1 MHz
};

export function getI2CEEPROMByName(name: string): I2CEEPROMSpec | undefined {
  return i2cEEPROMs.find(chip => chip.name === name);
}

export function getI2CEEPROMsByFamily(family: string): I2CEEPROMSpec[] {
  return i2cEEPROMs.filter(chip => chip.family === family);
}
