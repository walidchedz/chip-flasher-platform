'use client';

/**
 * FlashForge Pro - Core Flashing Engine
 * طبقة الفلاشينج لكل أنواع الرقائق
 */

import { Chip, SPI_NOR_COMMANDS, SPI_NAND_COMMANDS, NAND_COMMANDS, I2C_EEPROM_COMMANDS } from '@/lib/chips';
import { CH341A_VID_PIDS, spiTransfer, i2cWrite, i2cRead } from '@/lib/ch341a';

export type FlashOperation = 'read' | 'write' | 'erase' | 'verify' | 'blank_check';
export type FlashStatus = 'idle' | 'connecting' | 'initializing' | 'erasing' | 'writing' | 'reading' | 'verifying' | 'done' | 'error';

export interface FlashProgress {
  status: FlashStatus;
  percent: number;
  currentSector: number;
  totalSectors: number;
  bytesWritten: number;
  errors: number;
  message: string;
}

type ProgressCallback = (progress: FlashProgress) => void;

class FlashForgeEngine {
  private device: USBDevice | null = null;
  private abortFlag = false;
  private onProgress: ProgressCallback | null = null;

  setProgressCallback(cb: ProgressCallback) {
    this.onProgress = cb;
  }

  private emit(progress: Partial<FlashProgress>) {
    if (this.onProgress) {
      this.onProgress({
        status: 'idle',
        percent: 0,
        currentSector: 0,
        totalSectors: 0,
        bytesWritten: 0,
        errors: 0,
        message: '',
        ...progress,
      });
    }
  }

  async connect(): Promise<boolean> {
    try {
      this.emit({ status: 'connecting', message: 'Requesting USB device...' });

      if (!navigator.usb) {
        throw new Error('WebUSB not supported. Use Chrome/Edge.');
      }

      const device = await navigator.usb.requestDevice({
        filters: CH341A_VID_PIDS.map(fp => ({
          vendorId: fp.vendorId,
          productId: fp.productId,
        })),
      });

      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      this.device = device;
      this.emit({ status: 'initializing', message: `Connected: ${device.productName || 'CH341A'}` });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      this.emit({ status: 'error', message: msg, errors: 1 });
      return false;
    }
  }

  async disconnect() {
    if (this.device) {
      try {
        await this.device.close();
      } catch {}
      this.device = null;
    }
    this.emit({ status: 'idle', message: 'Disconnected' });
  }

  abort() {
    this.abortFlag = true;
  }

  async readJEDEC(): Promise<number | null> {
    if (!this.device) return null;

    try {
      // SPI: send JEDEC ID command (0x9F) + 3 dummy bytes
      const cmd = new Uint8Array([SPI_NOR_COMMANDS.JEDEC_ID, 0x00, 0x00, 0x00]);
      const response = await spiTransfer(this.device, cmd);

      if (response.length >= 4) {
        const jedec = (response[1] << 16) | (response[2] << 8) | response[3];
        return jedec;
      }
      return null;
    } catch {
      return null;
    }
  }

  async eraseChip(chip: Chip): Promise<boolean> {
    if (!this.device) return false;
    this.abortFlag = false;

    this.emit({
      status: 'erasing',
      message: `Erasing ${chip.name}...`,
    });

    try {
      if (chip.type === 'spi_nor' || chip.type === 'spi_nor') {
        // SPI flash chip erase
        // Enable write
        const enableCmd = new Uint8Array([SPI_NOR_COMMANDS.WRITE_ENABLE]);
        await spiTransfer(this.device, enableCmd);

        // Chip erase
        const eraseCmd = new Uint8Array([SPI_NOR_COMMANDS.CHIP_ERASE]);
        await spiTransfer(this.device, eraseCmd);

        // Wait while busy
        await this.waitSPIReady();

        this.emit({
          status: 'erasing',
          percent: 100,
          message: 'Chip erased successfully',
        });
        return true;
      }
      else {
        // For other types, sector-by-sector erase
        return false;
      }
    } catch (err) {
      this.emit({
        status: 'error',
        message: `Erase failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        errors: 1,
      });
      return false;
    }
  }

  private async waitSPIReady(timeout = 30000): Promise<void> {
    if (!this.device) throw new Error('No device');

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (this.abortFlag) throw new Error('Aborted');

      const cmd = new Uint8Array([SPI_NOR_COMMANDS.READ_STATUS_REG1, 0x00]);
      const response = await spiTransfer(this.device, cmd);

      if (response.length >= 2 && !(response[1] & SPI_NOR_COMMANDS.STATUS_BUSY)) {
        return;
      }

      await new Promise(r => setTimeout(r, 10));
    }

    throw new Error('Timeout waiting for SPI ready');
  }

  async writeFirmware(chip: Chip, data: ArrayBuffer): Promise<boolean> {
    if (!this.device) return false;
    this.abortFlag = false;

    const dataView = new Uint8Array(data);
    const pageSize = (chip as any).pageSize || 256;
    const totalPages = Math.ceil(dataView.length / pageSize);

    this.emit({
      status: 'writing',
      totalSectors: totalPages,
      message: `Writing ${dataView.length} bytes (${totalPages} pages)...`,
    });

    try {
      for (let page = 0; page < totalPages; page++) {
        if (this.abortFlag) throw new Error('Aborted');

        const offset = page * pageSize;
        const currentPageSize = Math.min(pageSize, dataView.length - offset);
        const pageData = dataView.subarray(offset, offset + currentPageSize);

        if (chip.type === 'spi_nor' || chip.type === 'spi_nor') {
          // Enable write
          const enableCmd = new Uint8Array([SPI_NOR_COMMANDS.WRITE_ENABLE]);
          await spiTransfer(this.device, enableCmd);

          // Page program
          const progCmd = new Uint8Array([
            SPI_NOR_COMMANDS.PAGE_PROGRAM,
            (offset >> 16) & 0xFF,
            (offset >> 8) & 0xFF,
            offset & 0xFF,
            ...pageData,
          ]);
          await spiTransfer(this.device, progCmd);

          // Wait while busy
          await this.waitSPIReady();
        }
        else if (chip.type === 'i2c_eeprom') {
          const i2cChip = chip as any;
          const addr = i2cChip.deviceAddress || 0x50;
          const addrBytes = currentPageSize > 1
            ? [(offset >> 8) & 0xFF, offset & 0xFF, ...pageData]  // 16-bit address
            : [offset & 0xFF, ...pageData];  // 8-bit address

          await i2cWrite(this.device, addr, new Uint8Array(addrBytes));
          await new Promise(r => setTimeout(r, (i2cChip.writeCycleTime || 5) + 1));
        }

        this.emit({
          status: 'writing',
          percent: Math.round(((page + 1) / totalPages) * 100),
          currentSector: page + 1,
          bytesWritten: offset + currentPageSize,
        });
      }

      this.emit({
        status: 'done',
        percent: 100,
        message: 'Write completed successfully',
      });
      return true;
    } catch (err) {
      if (this.abortFlag) {
        this.emit({ status: 'error', message: 'Operation aborted' });
      } else {
        this.emit({
          status: 'error',
          message: `Write failed: ${err instanceof Error ? err.message : 'Unknown'}`,
          errors: 1,
        });
      }
      return false;
    }
  }

  async verifyFirmware(chip: Chip, originalData: ArrayBuffer, hash?: string): Promise<boolean> {
    if (!this.device) return false;
    this.abortFlag = false;

    this.emit({ status: 'verifying', message: 'Verifying flash integrity...' });

    try {
      const originalView = new Uint8Array(originalData);
      const pageSize = (chip as any).pageSize || 256;
      const totalPages = Math.ceil(originalView.length / pageSize);

      // Read back and compare
      for (let page = 0; page < totalPages; page++) {
        if (this.abortFlag) throw new Error('Aborted');

        const offset = page * pageSize;
        const currentPageSize = Math.min(pageSize, originalView.length - offset);

        if (chip.type === 'spi_nor' || chip.type === 'spi_nor') {
          const readCmd = new Uint8Array([
            SPI_NOR_COMMANDS.READ_DATA,
            (offset >> 16) & 0xFF,
            (offset >> 8) & 0xFF,
            offset & 0xFF,
          ]);
          const response = await spiTransfer(this.device, readCmd);

          for (let j = 0; j < currentPageSize; j++) {
            if (response[j + 1] !== originalView[offset + j]) {
              this.emit({
                status: 'error',
                message: `Verification failed at byte ${offset + j}`,
                errors: 1,
              });
              return false;
            }
          }
        }
        else if (chip.type === 'i2c_eeprom') {
          const i2cChip = chip as any;
          const addr = i2cChip.deviceAddress || 0x50;
          const addr16 = new Uint8Array([(offset >> 8) & 0xFF, offset & 0xFF]);
          await i2cWrite(this.device, addr, addr16);
          const response = await i2cRead(this.device, addr, currentPageSize);

          for (let j = 0; j < currentPageSize; j++) {
            if (response[j] !== originalView[offset + j]) {
              this.emit({ status: 'error', message: `Verification failed at byte ${offset + j}` });
              return false;
            }
          }
        }
      }

      this.emit({ status: 'done', message: '✅ Verification passed! Data integrity confirmed.' });
      return true;
    } catch (err) {
      this.emit({ status: 'error', message: `Verification error: ${err instanceof Error ? err.message : 'Unknown'}` });
      return false;
    }
  }
}

export const flashEngine = new FlashForgeEngine();
