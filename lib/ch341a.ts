/**
 * CH341A Programmer - Protocol Implementation
 * Vendor ID: 0x1A86 / 0x4348 (WinChipHead)
 * Product ID: 0x5512 / 0x5584
 *
 * CH341A is the most popular USB-to-SPI/I2C/GPIO adapter for chip programming
 */

export const CH341A_VID_PIDS = [
  { vendorId: 0x1A86, productId: 0x5512 },
  { vendorId: 0x1A86, productId: 0x5584 },
  { vendorId: 0x4348, productId: 0x5512 },
];

// CH341A USB Control Commands
export const CH341_CMD = {
  CH341_SET_OUTPUT: 0xA1,
  CH341_IO_DIR: 0xA2,
  CH341_IO_OUT: 0xA4,
  CH341_IO_IN: 0xA0,
  CH341_GET_VER: 0x5F,
  CH341_RESET: 0x5A,
  CH341_SPI_SETUP: 0xA6,
  CH341_SPI_CS: 0xA7,
  CH341_SPI_WRITE: 0xA8,
  CH341_SPI_READ: 0xA9,
  CH341_I2C_START: 0xA4,
  CH341_I2C_STOP: 0xA5,
  CH341_I2C_WRITE: 0xA6,
  CH341_I2C_READ: 0xA7,
  CH341_I2C_STATUS: 0xA8,
  CH341_PAR_WRITE: 0xB0,
  CH341_PAR_READ: 0xB1,
};

// CH341A GPIO Pin Mapping (for SPI mode)
export const CH341_GPIO = {
  SPI_CS: 0,     // D0 - Chip Select
  SPI_DO: 1,     // D1 - MOSI
  SPI_DI: 2,     // D2 - MISO
  SPI_CLK: 3,    // D3 - Clock
  AUX0: 4,       // D4
  AUX1: 5,       // D5
  AUX2: 6,       // D6
  AUX3: 7,       // D7
  LED: 7,        // D7 - Activity LED
};

export async function requestCH341A(): Promise<USBDevice | null> {
  try {
    const device = await navigator.usb.requestDevice({
      filters: CH341A_VID_PIDS.map(fp => ({
        vendorId: fp.vendorId,
        productId: fp.productId,
      })),
    });
    return device;
  } catch {
    return null;
  }
}

export async function initCH341A(device: USBDevice): Promise<void> {
  await device.open();
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }
  await device.claimInterface(0);

  // Reset CH341A
  await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request: CH341_CMD.CH341_RESET,
    value: 0,
    index: 0,
  });
}

// SPI Streaming write/read over USB control transfers
export async function spiStreamWrite(
  device: USBDevice,
  data: Uint8Array,
  chipSelect = true
): Promise<void> {
  const CHUNK = 255; // CH341 firmware limit per transaction

  for (let offset = 0; offset < data.length; offset += CHUNK) {
    const chunk = data.subarray(offset, Math.min(offset + CHUNK, data.length));
    await device.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: chipSelect ? CH341_CMD.CH341_SPI_WRITE : 0xAB,
      value: chunk.length,
      index: 0,
    }, chunk);
  }
}

export async function spiStreamRead(
  device: USBDevice,
  length: number
): Promise<Uint8Array> {
  const CHUNK = 255;
  const result = new Uint8Array(length);

  for (let offset = 0; offset < length; offset += CHUNK) {
    const chunkLen = Math.min(CHUNK, length - offset);
    const chunk = new Uint8Array(chunkLen);
    // Send dummy bytes to read
    await device.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: CH341_CMD.CH341_SPI_READ,
      value: chunkLen,
      index: 0,
    }, chunk);
    const response = await device.controlTransferIn({
      requestType: 'vendor',
      recipient: 'device',
      request: CH341_CMD.CH341_SPI_READ,
      value: chunkLen,
      index: 0,
    }, chunkLen);
    if (response.data) {
      result.set(new Uint8Array(response.data.buffer), offset);
    }
  }

  return result;
}

// SPI full-duplex transaction
export async function spiTransfer(
  device: USBDevice,
  txData: Uint8Array
): Promise<Uint8Array> {
  const CHUNK = 255;
  const rxData = new Uint8Array(txData.length);

  for (let offset = 0; offset < txData.length; offset += CHUNK) {
    const chunkEnd = Math.min(offset + CHUNK, txData.length);
    const txChunk = txData.subarray(offset, chunkEnd);
    const len = txChunk.length;

    // Write
    await device.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: CH341_CMD.CH341_SPI_WRITE,
      value: len,
      index: 0,
    }, txChunk);

    // Read back
    const result = await device.controlTransferIn({
      requestType: 'vendor',
      recipient: 'device',
      request: CH341_CMD.CH341_SPI_READ,
      value: len,
      index: 0,
    }, len);

    if (result.data) {
      rxData.set(new Uint8Array(result.data.buffer), offset);
    }
  }

  return rxData;
}

// I2C transaction
export async function i2cWrite(
  device: USBDevice,
  deviceAddr: number,
  data: Uint8Array
): Promise<void> {
  // CH341A I2C: Start condition + address + write bit
  await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request: CH341_CMD.CH341_I2C_START,
    value: 0,
    index: 0,
  });

  // Write address byte
  const addrByte = new Uint8Array([(deviceAddr << 1) | 0]); // write
  await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request: CH341_CMD.CH341_I2C_WRITE,
    value: 1,
    index: 0,
  }, addrByte);

  // Write data
  for (let i = 0; i < data.length; i += 32) { // CH341 I2C max 32 bytes
    const chunk = data.subarray(i, Math.min(i + 32, data.length));
    await device.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: CH341_CMD.CH341_I2C_WRITE,
      value: chunk.length,
      index: 0,
    }, chunk);
  }

  // Stop condition
  await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request: CH341_CMD.CH341_I2C_STOP,
    value: 0,
    index: 0,
  });
}

export async function i2cRead(
  device: USBDevice,
  deviceAddr: number,
  length: number
): Promise<Uint8Array> {
  const result = new Uint8Array(length);

  await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request: CH341_CMD.CH341_I2C_START,
    value: 0,
    index: 0,
  });

  // Address with read bit
  const addrByte = new Uint8Array([(deviceAddr << 1) | 1]);
  await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request: CH341_CMD.CH341_I2C_WRITE,
    value: 1,
    index: 0,
  }, addrByte);

  // Read data
  for (let i = 0; i < length; i += 32) {
    const chunkLen = Math.min(32, length - i);
    const result_in = await device.controlTransferIn({
      requestType: 'vendor',
      recipient: 'device',
      request: CH341_CMD.CH341_I2C_READ,
      value: chunkLen,
      index: 0,
    }, chunkLen);
    if (result_in.data) {
      result.set(new Uint8Array(result_in.data.buffer), i);
    }
  }

  await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request: CH341_CMD.CH341_I2C_STOP,
    value: 0,
    index: 0,
  });

  return result;
}
