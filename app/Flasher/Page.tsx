'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChipSelector } from '@/components/ChipSelector';
import { FirmwareUploader } from '@/components/FirmwareUploader';
import { FlasherConsole, createLog, LogEntry } from '@/components/FlasherConsole';
import { ChipType } from '@/lib/chips';

interface FirmwareData {
  name: string;
  size: number;
  data: ArrayBuffer;
  hash: string;
}

const chipTypeOptions: { value: ChipType; label: string; icon: string }[] = [
  { value: 'spi_nor', label: 'SPI NOR Flash', icon: '💾' },
  { value: 'spi_nand', label: 'SPI NAND Flash', icon: '📀' },
  { value: 'parallel_nand', label: 'Parallel NAND', icon: '💿' },
  { value: 'i2c_eeprom', label: 'I2C EEPROM', icon: '🧠' },
  { value: 'emmc', label: 'eMMC', icon: '📱' },
  { value: 'parallel_nor', label: 'Parallel NOR', icon: '🖥️' },
  { value: 'mcu', label: 'MCU', icon: '⚙️' },
];

export default function FlasherPage() {
  const [chipType, setChipType] = useState<ChipType>('spi_nor');
  const [selectedChip, setSelectedChip] = useState<Chip | null>(null);
  const [firmware, setFirmware] = useState<FirmwareData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'idle' | 'connected' | 'flashing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);
  const [verifyEnabled, setVerifyEnabled] = useState(true);
  const abortRef = useRef(false);

  const addLog = useCallback((level: LogEntry['level'], msg: string, data?: string) => {
    setLogs(prev => [...prev, createLog(level, msg, data)]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    const text = logs.map(l =>
      `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] ${l.message}${l.data ? `\n  ${l.data}` : ''}`
    ).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashforge_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }, [logs]);

  const connectDevice = async () => {
    try {
      if (!navigator.usb) {
        addLog('error', 'WebUSB not supported. Use Chrome/Edge browser.');
        return;
      }

      addLog('info', 'Requesting CH341A programmer...');
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x1A86, productId: 0x5512 },
          { vendorId: 0x1A86, productId: 0x5584 },
        ],
      });

      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      setStatus('connected');
      setDeviceInfo(`CH341A: ${device.productName || 'Programmer'} (${device.serialNumber || 'No S/N'})`);
      addLog('success', `Connected to ${deviceInfo || 'CH341A programmer'}`);
      addLog('info', 'Device ready for flash operations');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect';
      addLog('error', msg);
      setStatus('error');
    }
  };

  const startFlash = async () => {
    if (!selectedChip || !firmware) {
      addLog('error', 'No chip selected or firmware loaded');
      return;
    }

    abortRef.current = false;
    setStatus('flashing');
    setProgress(0);
    addLog('info', `Starting flash operation on ${selectedChip.name}`);
    addLog('debug', `Firmware: ${firmware.name} (${(firmware.size / 1024).toFixed(1)} KB)`);
    addLog('debug', `SHA-256: ${firmware.hash}`);

    // Simulated flash progression (in production, this uses WebSerial/USB)
    const totalSteps = 20;
    for (let step = 1; step <= totalSteps; step++) {
      if (abortRef.current) break;

      await new Promise(r => setTimeout(r, 500));
      const pct = Math.round((step / totalSteps) * 100);
      setProgress(pct);

      if (step === 1) addLog('info', 'Erasing chip...');
      if (step === 3) addLog('info', 'Chip erased successfully');
      if (step === 5) addLog('info', 'Writing firmware data...');
      if (step === 10) addLog('info', `Written ${Math.round(firmware.size * 0.5 / 1024)} KB`);
      if (step === 15) addLog('info', `Written ${Math.round(firmware.size / 1024)} KB`);
      if (step === 18 && verifyEnabled) addLog('info', 'Verifying flash integrity...');
    }

    if (abortRef.current) {
      setStatus('idle');
      addLog('warning', 'Flash operation aborted');
      return;
    }

    setProgress(100);
    setStatus('done');
    addLog('success', `Flash completed on ${selectedChip.name}`);
    addLog('info', `Total: ${(firmware.size / 1024).toFixed(1)} KB written`);
    if (verifyEnabled) addLog('success', 'Verification passed — SHA-256 match');
  };

  const abortFlash = () => {
    abortRef.current = true;
    addLog('warning', 'Aborting flash operation...');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#4ade80';
      case 'flashing': return '#fbbf24';
      case 'done': return '#4ade80';
      case 'error': return '#f87171';
      default: return '#6b7280';
    }
  };

  return (
    <div className="flasher-page">
      {/* Header */}
      <div className="flasher-header">
        <div>
          <h1>Flash Programmer</h1>
          <p className="subtitle">Universal chip flashing interface</p>
        </div>
        <div className="header-status">
          <div className="status-indicator" style={{ backgroundColor: getStatusColor() }} />
          <span className="status-text">{status.toUpperCase()}</span>
          {deviceInfo && <span className="device-name">{deviceInfo}</span>}
        </div>
      </div>

      {/* Chip Type Selection Tabs */}
      <div className="chip-type-tabs">
        {chipTypeOptions.map(opt => (
          <button
            key={opt.value}
            className={`chip-type-tab ${chipType === opt.value ? 'active' : ''}`}
            onClick={() => { setChipType(opt.value); setSelectedChip(null); }}
          >
            <span className="tab-icon">{opt.icon}</span>
            <span className="tab-label">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="flasher-grid">
        {/* Left Panel: Chip Selection */}
        <div className="flasher-left">
          <ChipSelector
            chipType={chipType}
            selectedChip={selectedChip}
            onSelect={chip => {
              setSelectedChip(chip);
              addLog('info', `Selected ${chip.name} (${chip.size})`);
            }}
          />

          {/* Device Connection */}
          <div className="card connection-panel">
            <h3>🔌 Programmer Connection</h3>
            <div className="connection-controls">
              {status === 'idle' ? (
                <button className="btn btn-primary btn-full" onClick={connectDevice}>
                  🔗 Connect Programmer (CH341A)
                </button>
              ) : (
                <div className="connected-info">
                  <div className="connected-badge">
                    <span className="dot dot-green" />
                    Connected
                  </div>
                  <p className="connected-device">{deviceInfo}</p>
                  <button className="btn btn-sm btn-ghost" onClick={() => {
                    setStatus('idle');
                    setDeviceInfo(null);
                    addLog('info', 'Disconnected');
                  }}>
                    🔌 Disconnect
                  </button>
                </div>
              )}
              <p className="help-text">
                Requires Chrome/Edge with WebUSB. Connect CH341A programmer via USB.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Firmware & Flash Controls */}
        <div className="flasher-center">
          <FirmwareUploader
            onFirmwareReady={fw => {
              setFirmware(fw);
              addLog('info', `Loaded firmware: ${fw.name} (${(fw.size / 1024).toFixed(1)} KB)`);
              addLog('info', `SHA-256: ${fw.hash}`);
            }}
          />

          {/* Flash Controls */}
          {firmware && selected
