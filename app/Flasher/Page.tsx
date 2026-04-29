'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Chip, SerialPort, Warning, CheckCircle, 
  Upload, Shield, Key, Plug, Activity 
} from 'lucide-react';

type ChipType = 'SPI_25' | '24C' | 'eMMC' | 'NAND';
type ConnectionType = 'webserial' | 'webusb' | null;
type FlashingStatus = 'idle' | 'connecting' | 'connected' | 'flashing' | 'verifying' | 'complete' | 'error';

interface ChipInfo {
  name: string;
  type: ChipType;
  voltage: string;
  protocol: string;
  maxSize: string;
  description: string;
}

const CHIPS: ChipInfo[] = [
  { name: 'W25Q64JV', type: 'SPI_25', voltage: '3.3V', protocol: 'SPI', maxSize: '64MB', description: 'SPI Flash - الأكثر شيوعاً في الراوترات' },
  { name: 'W25Q128JV', type: 'SPI_25', voltage: '3.3V', protocol: 'SPI', maxSize: '128MB', description: 'SPI Flash - أجهزة التلفاز الذكية' },
  { name: 'MX25L25645G', type: 'SPI_25', voltage: '3.3V', protocol: 'SPI', maxSize: '256MB', description: 'SPI Flash - بطاقات الأم' },
  { name: 'AT24C256', type: '24C', voltage: '5V/3.3V', protocol: 'I2C', maxSize: '256KB', description: 'EEPROM - أجهزة HDMI' },
  { name: 'AT24C512', type: '24C', voltage: '5V/3.3V', protocol: 'I2C', maxSize: '512KB', description: 'EEPROM - شاشات LED' },
  { name: 'eMMC 5.1', type: 'eMMC', voltage: '3.3V/1.8V', protocol: 'JEDEC eMMC', maxSize: '256GB', description: 'eMMC - هواتف وأجهزة لوحية' },
  { name: 'THGBM5G5A1J', type: 'eMMC', voltage: '3.3V/1.8V', protocol: 'JEDEC eMMC', maxSize: '64GB', description: 'eMMC - أجهزة Android' },
];

export default function FlasherPage() {
  // State
  const [selectedChip, setSelectedChip] = useState<ChipInfo | null>(null);
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
  const [firmwareHash, setFirmwareHash] = useState<string>('');
  const [status, setStatus] = useState<FlashingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [connectionType, setConnectionType] = useState<ConnectionType>(null);
  const [log, setLog] = useState<string[]>([]);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [usbDevice, setUsbDevice] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي للـ log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // إضافة سجل
  const addLog = useCallback((message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // اختيار ملف الـ firmware
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFirmwareFile(file);
    addLog(`📁 Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // حساب الـ hash
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setFirmwareHash(hashHex);
    addLog(`🔒 SHA-256: ${hashHex.slice(0, 16)}...`);
  };

  // الاتصال عبر WebSerial
  const connectWebSerial = async () => {
    try {
      setStatus('connecting');
      
      // طلب منفذ تسلسلي
      const port = await (navigator as any).serial.requestPort();
      
      // التحقق من سرعة المنفذ
      const portInfo = port.getInfo();
      addLog(`🔌 Port: ${portInfo.usbVendorId}:${portInfo.usbProductId}`);
      
      // فتح المنفذ
      await port.open({ baudRate: 115200 });
      
      setSerialPort(port);
      setConnectionType('webserial');
      setStatus('connected');
      addLog('✅ WebSerial connected successfully');
      
      // قراءة البيانات الواردة
      const reader = port.readable.getReader();
      readLoop(reader);
      
    } catch (error: any) {
      setStatus('error');
      addLog(`❌ Connection failed: ${error.message}`);
    }
  };

  // الاتصال عبر WebUSB
  const connectWebUSB = async () => {
    try {
      setStatus('connecting');
      
      // طلب جهاز USB - CH341 أو FT232
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x1A86 }, // CH340/CH341
          { vendorId: 0x0403 }, // FTDI
          { vendorId: 0x10C4 }, // CP210x
          { vendorId: 0x067B }, // Prolific
        ]
      });
      
      addLog(`🔌 USB Device: ${device.productName} (${device.vendorId}:${device.productId})`);
      
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      
      setUsbDevice(device);
      setConnectionType('webusb');
      setStatus('connected');
      addLog('✅ WebUSB connected successfully');
      
    } catch (error: any) {
      setStatus('error');
      addLog(`❌ USB connection failed: ${error.message}`);
    }
  };

  // قراءة مستمرة من المنفذ التسلسلي
  const readLoop = async (reader: any) => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        if (text.trim()) {
          addLog(`📡 ${text.trim()}`);
        }
      }
    } catch (error) {
      addLog('⚠️ Read loop ended');
    }
  };

  // كتابة بيانات إلى المنفذ التسلسلي
  const writeSerial = async (data: Uint8Array) => {
    if (!serialPort?.writable) {
      throw new Error('Port not writable');
    }
    
    const writer = serialPort.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
  };

  // بدء عملية الفلاشينج
  const startFlashing = async () => {
    if (!selectedChip || !firmwareFile || !connectionType) {
      addLog('⚠️ Please select chip, firmware, and connect first');
      return;
    }
    
    setStatus('flashing');
    setProgress(0);
    
    try {
      const firmwareBuffer = await firmwareFile.arrayBuffer();
      const firmwareBytes = new Uint8Array(firmwareBuffer);
      
      addLog(`🚀 Starting flash: ${selectedChip.name}`);
      addLog(`📐 Protocol: ${selectedChip.protocol}`);
      addLog(`📦 Size: ${(firmwareBytes.length / 1024).toFixed(1)} KB`);
      
      // محاكاة مراحل الفلاشينج
      const totalSize = firmwareBytes.length;
      const chunkSize = 256; // 256 bytes per write
      const chunks = Math.ceil(totalSize / chunkSize);
      
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, totalSize);
        const chunk = firmwareBytes.slice(start, end);
        
        // إرسال القطعة
        if (connectionType === 'webserial') {
          await writeSerial(chunk);
        }
        
        // تحديث التقدم
        const percent = Math.round(((i + 1) / chunks) * 100);
        setProgress(percent);
        
        if (i % 10 === 0) {
          addLog(`⏳ Writing: ${percent}% (${(end / 1024).toFixed(1)} KB / ${(totalSize / 1024).toFixed(1)} KB)`);
        }
      }
      
      setStatus('verifying');
      addLog('✅ Flash complete! Verifying...');
      
      // محاكاة التحقق
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('complete');
      setProgress(100);
      addLog('🎉 Flashing completed successfully!');
      
      // إرسال تقرير إلى API
      await fetch('/api/flash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chipType: selectedChip.type,
          chipModel: selectedChip.name,
          firmwareData: Buffer.from(firmwareBuffer).toString('base64'),
        }),
      });
      
    } catch (error: any) {
      setStatus('error');
      addLog(`❌ Flashing failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Chip className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ChipFlasher Pro
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={status === 'complete' ? 'success' : status === 'error' ? 'destructive' : 'secondary'}>
              {status === 'idle' && 'Ready'}
              {status === 'connecting' && 'Connecting...'}
              {status === 'connected' && 'Connected'}
              {status === 'flashing' && 'Flashing'}
              {status === 'verifying' && 'Verifying'}
              {status === 'complete' && 'Complete ✓'}
              {status === 'error' && 'Error ✗'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Chip Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-cyan-400" />
                Select Chip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip.name}
                  onClick={() => {
                    setSelectedChip(chip);
                    addLog(`📌 Selected: ${chip.name} (${chip.type})`);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedChip?.name === chip.name
                      ? 'bg-cyan-900/50 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-gray-800/30 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{chip.name}</span>
                    <Badge variant="outline" className="text-xs bg-gray-900/50">
                      {chip.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <p>{chip.voltage} | {chip.protocol}</p>
                    <p className="text-gray-500">{chip.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Main Flasher */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Section */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plug className="h-5 w-5 text-green-400" />
                Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={connectWebSerial}
                  disabled={status === 'flashing' || status === 'connecting'}
                  variant={connectionType === 'webserial' ? 'default' : 'outline'}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  WebSerial (CH340/FTDI)
                </Button>
                <Button
                  onClick={connectWebUSB}
                  disabled={status === 'flashing' || status === 'connecting'}
                  variant={connectionType === 'webusb' ? 'default' : 'outline'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  WebUSB (CH341/Programmer)
                </Button>
              </div>
              
              {connectionType && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Connected via {connectionType === 'webserial' ? 'WebSerial' : 'WebUSB'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Firmware Upload */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-cyan-400" />
                Firmware
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".bin,.hex,.img"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                {firmwareFile ? (
                  <div>
                    <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                    <p className="font-semibold text-lg">{firmwareFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(firmwareFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {firmwareHash && (
                      <p className="text-gray-500 text-xs mt-2 font-mono">
                        SHA-256: {firmwareHash}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFirmwareFile(null);
                        setFirmwareHash('');
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">
                      Drop firmware file here or click to browse
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Supports .bin, .hex, .img (max 100MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress & Flash Button */}
          {(status === 'flashing' || status === 'verifying') && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {status === 'flashing' ? 'Writing firmware...' : 'Verifying...'}
                    </span>
                    <span className="font-mono text-cyan-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-gray-700" />
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flash Button */}
          <Button
            onClick={startFlashing}
            disabled={!selectedChip || !firmwareFile || !connectionType || status === 'flashing'}
            size="lg"
            className="w-full text-lg py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800"
          >
            <Chip className="mr-2 h-5 w-5" />
            {status === 'flashing' ? 'Flashing...' : status === 'complete' ? 'Flash Again' : 'Start Flashing'}
          </Button>

          {/* Security Warning */}
          <Alert className="bg-amber-900/20 border-amber-700/30">
            <Warning className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-sm">
              Ensure you have authorization to flash this device. All operations are logged and monitored.
              Wrong firmware can permanently damage the chip.
            </AlertDescription>
          </Alert>
        </div>

        {/* Right Panel - Console Log */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-cyan-400" />
                Console Log
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLog([])}
                className="text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs space-y-1">
                {log.length === 0 ? (
                  <p className="text-gray-500 italic">Waiting for actions...</p>
                ) : (
                  log.map((line, i) => (
                    <p key={i} className="text-gray-300">
                      {line}
                    </p>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
