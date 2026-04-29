'use client';

import { useState } from 'react';

interface Stats {
  totalDevices: number;
  totalFlashes: number;
  successfulFlashes: number;
  failedFlashes: number;
  totalDataFlashing: number; // bytes
  recentOperations: Array<{
    id: string;
    chip: string;
    type: string;
    status: 'success' | 'failed';
    size: number;
    timestamp: number;
  }>;
}

export function Dashboard() {
  const [stats] = useState<Stats>({
    totalDevices: 7,
    totalFlashes: 1284,
    successfulFlashes: 1247,
    failedFlashes: 37,
    totalDataFlashing: 52_428_800_000,
    recentOperations: [
      { id: '1', chip: 'W25Q128JV', type: 'SPI NOR', status: 'success', size: 16 * 1024 * 1024, timestamp: Date.now() - 30000 },
      { id: '2', chip: 'AT24C256', type: 'I2C EEPROM', status: 'success', size: 32768, timestamp: Date.now() - 120000 },
      { id: '3', chip: 'MT29F4G08AB', type: 'NAND', status: 'failed', size: 512 * 1024 * 1024, timestamp: Date.now() - 600000 },
    ],
  });

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const successRate = stats.totalFlashes > 0
    ? ((stats.successfulFlashes / stats.totalFlashes) * 100).toFixed(1)
    : '100';

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h1>FlashForge Pro Dashboard</h1>
        <p>Professional chip programming platform — {stats.totalDevices} supported device types</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-value">{stats.totalFlashes.toLocaleString()}</div>
          <div className="stat-label">Total Operations</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.successfulFlashes.toLocaleString()}</div>
          <div className="stat-label">Successful</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-value">{stats.failedFlashes.toLocaleString()}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{successRate}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{formatBytes(stats.totalDataFlashing)}</div>
          <div className="stat-label">Total Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔌</div>
          <div className="stat-value">{stats.totalDevices}</div>
          <div className="stat-label">Supported Chips</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Start</h2>
        <div className="quick-start-grid">
          <a href="/flasher/spi" className="quick-card">
            <div className="quick-icon">💾</div>
            <div className="quick-title">SPI NOR Flash</div>
            <div className="quick-desc">W25Q, MX25L, S25FL, GD25Q series</div>
          </a>
          <a href="/flasher/i2c" className="quick-card">
            <div className="quick-icon">🧠</div>
            <div className="quick-title">I2C EEPROM</div>
            <div className="quick-desc">AT24C, M24C, CAT24C series</div>
          </a>
          <a href="/flasher/emmc" className="quick-card">
            <div className="quick-icon">📱</div>
            <div className="quick-title">eMMC</div>
            <div className="quick-desc">Samsung, Kioxia, SanDisk, Micron</div>
          </a>
          <a href="/flasher/nand" className="quick-card">
            <div className="quick-icon">💿</div>
            <div className="quick-title">NAND Flash</div>
            <div className="quick-desc">Parallel & SPI NAND</div>
          </a>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Operations</h2>
        <div className="recent-ops">
          {stats.recentOperations.map(op => (
            <div key={op.id} className="op-row">
              <span className={`op-status ${op.status}`}>
                {op.status === 'success' ? '✅' : '❌'}
              </span>
              <span className="op-chip">{op.chip}</span>
              <span className="op-type">{op.type}</span>
              <span className="op-size">{formatBytes(op.size)}</span>
              <span className="op-time">
                {new Date(op.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
