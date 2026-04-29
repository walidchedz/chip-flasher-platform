// ===== MCU / Microcontroller Database =====

export interface MCUSpec {
  name: string;
  family: string;
  core: string;
  flashSize: string;
  flashSizeBytes: number;
  ramSize: string;
  freq: string;
  voltage: string;
  package: string;
  manufacturer: string;
  interface: string; // programming interface (SWD, JTAG, ISP, etc.)
  protocol: string; // protocol (UART, I2C, SPI, USB, etc.)
  description: string;
}

export const MCUs: MCUSpec[] = [
  // ===== STM32 Series (STMicroelectronics) =====
  {
    name: 'STM32F030F4',
    family: 'STM32F0',
    core: 'ARM Cortex-M0',
    flashSize: '16KB',
    flashSizeBytes: 16 * 1024,
    ramSize: '4KB',
    freq: '48MHz',
    voltage: '2.4V-3.6V',
    package: 'TSSOP-20',
    manufacturer: 'STMicroelectronics',
    interface: 'SWD',
    protocol: 'USART, I2C, SPI',
    description: 'Entry-level Cortex-M0 MCU',
  },
  {
    name: 'STM32F103C8',
    family: 'STM32F1',
    core: 'ARM Cortex-M3',
    flashSize: '64KB',
    flashSizeBytes: 64 * 1024,
    ramSize: '20KB',
    freq: '72MHz',
    voltage: '2.0V-3.6V',
    package: 'LQFP-48',
    manufacturer: 'STMicroelectronics',
    interface: 'SWD/JTAG',
    protocol: 'USART, I2C, SPI, USB, CAN',
    description: 'Popular "Blue Pill" MCU',
  },
  {
    name: 'STM32F103CBT6',
    family: 'STM32F1',
    core: 'ARM Cortex-M3',
    flashSize: '128KB',
    flashSizeBytes: 128 * 1024,
    ramSize: '20KB',
    freq: '72MHz',
    voltage: '2.0V-3.6V',
    package: 'LQFP-48',
    manufacturer: 'STMicroelectronics',
    interface: 'SWD/JTAG',
    protocol: 'USART, I2C, SPI, USB, CAN',
    description: '128KB Flash version of STM32F103',
  },

  // ===== ESP32 Series (Espressif) =====
  {
    name: 'ESP32-WROOM-32',
    family: 'ESP32',
    core: 'Tensilica Xtensa LX6 (dual)',
    flashSize: '4MB',
    flashSizeBytes: 4 * 1024 * 1024,
    ramSize: '520KB',
    freq: '240MHz',
    voltage: '2.3V-3.6V',
    package: 'LGA-48/ESP32-D0WDQ6',
    manufacturer: 'Espressif',
    interface: 'UART (auto-program)',
    protocol: 'WiFi 802.11 b/g/n, Bluetooth 4.2, UART, I2C, SPI, I2S',
    description: 'Most popular ESP module with built-in WiFi/BT',
  },
  {
    name: 'ESP32-S3-WROOM-1',
    family: 'ESP32-S3',
    core: 'Tensilica Xtensa LX7 (dual)',
    flashSize: '16MB',
    flashSizeBytes: 16 * 1024 * 1024,
    ramSize: '512KB SRAM + 2MB PSRAM',
    freq: '240MHz',
    voltage: '2.3V-3.6V',
    package: 'LGA-56/ESP32-S3R8',
    manufacturer: 'Espressif',
    interface: 'UART/USB(JTAG)',
    protocol: 'WiFi 802.11 b/g/n, BLE 5.0, UART, I2C, SPI, I2S, USB OTG',
    description: 'Next-gen ESP32 with AI accelerator',
  },
  {
    name: 'ESP32-C3',
    family: 'ESP32-C3',
    core: 'RISC-V 32-bit (single)',
    flashSize: '4MB',
    flashSizeBytes: 4 * 1024 * 1024,
    ramSize: '400KB',
    freq: '160MHz',
    voltage: '2.3V-3.6V',
    package: 'QFN-32',
    manufacturer: 'Espressif',
    interface: 'UART/USB (serial)',
    protocol: 'WiFi 802.11 b/g/n, BLE 5.0, UART, I2C, SPI',
    description: 'RISC-V based WiFi/BLE MCU',
  },

  // ===== AVR Series (Microchip/Atmel) =====
  {
    name: 'ATmega328P',
    family: 'AVR',
    core: 'AVR 8-bit',
    flashSize: '32KB',
    flashSizeBytes: 32 * 1024,
    ramSize: '2KB',
    freq: '20MHz',
    voltage: '1.8V-5.5V',
    package: 'DIP-28/TQFP-32',
    manufacturer: 'Microchip (Atmel)',
    interface: 'ISP (SPI)',
    protocol: 'UART, I2C, SPI',
    description: 'Used in Arduino Uno',
  },
  {
    name: 'ATmega2560',
    family: 'AVR',
    core: 'AVR 8-bit',
    flashSize: '256KB',
    flashSizeBytes: 256 * 1024,
    ramSize: '8KB',
    freq: '16MHz',
    voltage: '4.5V-5.5V',
    package: 'TQFP-100',
    manufacturer: 'Microchip (Atmel)',
    interface: 'ISP (SPI)',
    protocol: 'UART x4, I2C, SPI, CAN',
    description: 'Used in Arduino Mega 2560',
  },

  // ===== RP2040 (Raspberry Pi) =====
  {
    name: 'RP2040',
    family: 'RP2',
    core: 'ARM Cortex-M0+ (dual)',
    flashSize: '2MB (external QSPI)',
    flashSizeBytes: 2 * 1024 * 1024,
    ramSize: '264KB',
    freq: '133MHz',
    voltage: '1.8V-3.3V',
    package: 'QFN-56',
    manufacturer: 'Raspberry Pi Foundation',
    interface: 'SWD / USB (UF2 bootloader)',
    protocol: 'UART, I2C, SPI, I2S, PIO, USB 1.1',
    description: 'Used in Raspberry Pi Pico',
  },
  {
    name: 'RP2350',
    family: 'RP2',
    core: 'ARM Cortex-M33 + RISC-V (dual)',
    flashSize: '4MB (external QSPI)',
    flashSizeBytes: 4 * 1024 * 1024,
    ramSize: '520KB',
    freq: '150MHz',
    voltage: '1.8V-3.3V',
    package: 'QFN-56',
    manufacturer: 'Raspberry Pi Foundation',
    interface: 'SWD / USB (UF2 bootloader)',
    protocol: 'UART, I2C, SPI, I2S, PIO, USB 1.1/2.0',
    description: 'Used in Raspberry Pi Pico 2',
  },

  // ===== Teensy / NXP =====
  {
    name: 'MK20DX256VLH7',
    family: 'Kinetis K20',
    core: 'ARM Cortex-M4',
    flashSize: '256KB',
    flashSizeBytes: 256 * 1024,
    ramSize: '64KB',
    freq: '72MHz',
    voltage: '1.71V-3.6V',
    package: 'LQFP-64',
    manufacturer: 'NXP',
    interface: 'SWD/JTAG',
    protocol: 'UART, I2C, SPI, I2S, USB, CAN',
    description: 'Used in Teensy 3.2',
  },

  // ===== Arduino / ATmega series additional =====
  {
    name: 'ATtiny85',
    family: 'AVR',
    core: 'AVR 8-bit',
    flashSize: '8KB',
    flashSizeBytes: 8 * 1024,
    ramSize: '512B',
    freq: '20MHz',
    voltage: '1.8V-5.5V',
    package: 'DIP-8/SOIC-8',
    manufacturer: 'Microchip (Atmel)',
    interface: 'ISP (SPI)',
    protocol: 'UART, I2C (USI)',
    description: 'Tiny AVR for simple projects',
  },
];

export function getMCUByName(name: string): MCUSpec | undefined {
  return MCUs.find(mcu => mcu.name === name);
}
