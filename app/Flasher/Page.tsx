'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChipSelector } from '@/components/ChipSelector';
import { FirmwareUploader } from '@/components/FirmwareUploader';
import { FlasherConsole, createLog, LogEntry } from '@/components/FlasherConsole';
import { Chip, ChipType } from '@/lib/chips';
import { flashEngine, FlashProgress } from './lib/flasher';

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
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState<FlashProgress>({
    status: 'idle', percent: 0, currentSector: 0,
    totalSectors: 0, bytesWritten: 0, errors: 0, message: 'Ready',
  });

  const addLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [...prev, entry]);
  }, []);

  // Connect to CH341A via WebUSB
  const handleConnect = async () => {
    addLog(createLog('info', '🔌 Requesting CH341A programmer...'));
    const success = await flashEngine.connect();
    if (success) {
      setIsConnected(true);
      addLog(createLog('success', '✅ CH341A connected successfully'));

      // Try reading JEDEC ID
      const jedec = await flashEngine.readJEDEC();
      if (jedec) {
        const idHex = `0x${jedec.toString(16).toUpperCase().padStart(6, '0')}`;
        addLog(createLog('success', `📋 JEDEC ID: ${idHex}`));
      }
    } else {
      addLog(createLog('error', '❌ Failed to connect to CH341A'));
    }
  };

  const handleDisconnect = async () => {
    await flashEngine.disconnect();
    setIsConnected(false);
    addLog(createLog('info', '🔌 Disconnected from CH341A'));
  };

  // Progress callback from engine
  useEffect(() => {
    flashEngine.setProgressCallback((p: FlashProgress) => {
      setProgress(p);
      if (p.message) {
        const level = p.status === 'error' ? 'error'
          : p.status === 'done' ? 'success'
          : p.status === 'verifying' ? 'warning'
          : 'info';
        addLog(createLog(level, p.message));
      }
    });
  }, [addLog]);

  // Flash operations
  const handleErase = async () => {
    if (!selectedChip) {
      addLog(createLog('error', '❌ Please select a chip first'));
      return;
    }
    addLog(createLog('warning', `⚠️ Erasing ${selectedChip.name}...`));
    await flashEngine.eraseChip(selectedChip);
  };

  const handleWrite = async () => {
    if (!selectedChip) {
      addLog(createLog('error', '❌ Please select a chip first'));
      return;
    }
    if (!firmware) {
      addLog(createLog('error', '❌ Please upload firmware first'));
      return;
    }
    addLog(createLog('info', `📝 Writing ${firmware.name} (${(firmware.size / 1024).toFixed(1)}KB) to ${selectedChip.name}...`));
    await flashEngine.writeFirmware(selectedChip, firmware.data);
  };

  const handleVerify = async () => {
    if (!selectedChip || !firmware) {
      addLog(createLog('error', '❌ Select chip and firmware first'));
      return;
    }
    addLog(createLog('info', '🔍 Verifying flash contents...'));
    await flashEngine.verifyFirmware(selectedChip, firmware.data);
  };

  const handleAbort = () => {
    flashEngine.abort();
    addLog(createLog('warning', '⏹️ Operation aborted by user'));
  };

  const handleFirmwareDrop = useCallback((data: ArrayBuffer, name: string) => {
    // Calculate SHA-256 hash in browser
    crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFirmware({ name, size: data.byteLength, data, hash: hashHex });
      addLog(createLog('success', `📄 Firmware loaded: ${name} (${(data.byteLength / 1024).toFixed(1)}KB)`));
      addLog(createLog('info', `🔐 SHA-256: ${hashHex.substring(0, 16)}...`));
    });
  }, [addLog]);

  const handleChipSelect = (chip: Chip) => {
    setSelectedChip(chip);
    addLog(createLog('success', `🔘 Selected chip: ${chip.name} (${(chip as any).size || 'N/A'})`));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'writing':
      case 'erasing':
      case 'verifying': return 'bg-amber-500 animate-pulse';
      case 'connecting':
      case 'initializing': return 'bg-blue-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-cyan-500/20">FF</div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">FlashForge Pro</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Multi-Protocol Chip Programmer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-500'}`} />
              <span className="text-gray-400">{isConnected ? 'CH341A Connected' : 'Disconnected'}</span>
            </div>
            {!isConnected ? (
              <button onClick={handleConnect} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition-all font-medium shadow-lg shadow-blue-600/20">
                🔌 Connect Programmer
              </button>
            ) : (
              <button onClick={handleDisconnect} className="px-4 py-1.5 text-sm bg-red-600/80 hover:bg-red-500 rounded-lg transition-all font-medium">
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {progress.status !== 'idle' && progress.status !== 'done' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getStatusColor(progress.status)}`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{progress.status.toUpperCase()}</span>
            <span>{progress.percent}%</span>
            {progress.bytesWritten > 0 && <span>{(progress.bytesWritten / 1024).toFixed(0)}KB / {firmware ? (firmware.size / 1024).toFixed(0) : '?'}KB</span>}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chip + Firmware */}
          <div className="lg:col-span-1 space-y-6">
            {/* Chip Type Tabs */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Chip Type</h2>
              <div className="flex flex-wrap gap-1.5">
                {chipTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setChipType(opt.value); setSelectedChip(null); }}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                      chipType === opt.value
                        ? 'bg-blue-600/80 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chip Selector */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Chip</h2>
              <ChipSelector type={chipType} onSelect={handleChipSelect} />
            </div>

            {/* Firmware Upload */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Firmware</h2>
              <FirmwareUploader onDrop={handleFirmwareDrop} />
            </div>
          </div>

          {/* Right Column - Console + Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flash Controls */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Flash Operations</h2>

              {/* Selected Chip Status */}
              {selectedChip && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-4 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-lg">
                    {chipTypeOptions.find(o => o.value === chipType)?.icon || '💾'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{selectedChip.name}</div>
                    <div className="text-xs text-gray-500">
                      {(selectedChip as any).size || 'N/A'} | {(selectedChip as any).manufacturer || ''}
                    </div>
                  </div>
                  {firmware && (
                    <div className="text-xs text-gray-400 text-right">
                      <div>{firmware.name}</div>
                      <div className="text-emerald-400">{(firmware.size / 1024).toFixed(1)}KB</div>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleErase}
                  disabled={!isConnected || !selectedChip || progress.status === 'erasing'}
                  className="px-5 py-2 text-sm bg-red-600/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all font-medium shadow-lg shadow-red-600/10"
                >
                  🗑️ Erase
                </button>
                <button
                  onClick={handleWrite}
                  disabled={!isConnected || !selectedChip || !firmware || progress.status === 'writing'}
                  className="px-5 py-2 text-sm bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all font-medium shadow-lg shadow-emerald-600/10"
                >
                  🔥 Flash Write
                </button>
                <button
                  onClick={handleVerify}
                  disabled={!isConnected || !selectedChip || !firmware}
                  className="px-5 py-2 text-sm bg-blue-600/80 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all font-medium shadow-lg shadow-blue-600/10"
                >
                  ✅ Verify
                </button>
                <button
                  onClick={handleAbort}
                  disabled={progress.status === 'idle' || progress.status === 'done'}
                  className="px-5 py-2 text-sm bg-yellow-600/80 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all font-medium shadow-lg shadow-yellow-600/10"
                >
                  ⏹️ Abort
                </button>
              </div>
            </div>

            {/* Console */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
              <FlasherConsole logs={logs} onClear={() => setLogs([])} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
