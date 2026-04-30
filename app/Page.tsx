'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalChips: 0,
    chipTypes: [
      { type: 'SPI NOR', count: 33, icon: '💾', color: 'from-blue-600 to-cyan-500' },
      { type: 'I2C EEPROM', count: 15, icon: '🧠', color: 'from-purple-600 to-pink-500' },
      { type: 'eMMC', count: 21, icon: '📱', color: 'from-orange-600 to-red-500' },
      { type: 'Parallel NAND', count: 25, icon: '💿', color: 'from-green-600 to-emerald-500' },
      { type: 'SPI NAND', count: 10, icon: '📀', color: 'from-teal-600 to-cyan-500' },
      { type: 'Parallel NOR', count: 20, icon: '🖥️', color: 'from-indigo-600 to-blue-500' },
      { type: 'MCU', count: 15, icon: '⚙️', color: 'from-rose-600 to-orange-500' },
    ]
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-bold shadow-2xl shadow-cyan-500/20">
              FF
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                FlashForge Pro
              </h1>
              <p className="text-[10px] text-gray-500 -mt-0.5 tracking-wider">MULTI-PROTOCOL CHIP PROGRAMMER</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-300 mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          v1.0.0 — Open Source Chip Programmer
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          Program Any Chip
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            From Your Browser
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Professional-grade multi-protocol chip programmer supporting{' '}
          <span className="text-white font-semibold">139+ chips</span> across{' '}
          <span className="text-white font-semibold">7 protocols</span>.
          SPI, I2C, eMMC, NAND, NOR, and MCU flashing — all through WebUSB/WebSerial.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/flasher"
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl font-semibold text-base transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            🚀 Launch Programmer
          </Link>
          <button
            onClick={() => document.getElementById('chips')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-base transition-all"
          >
            Browse Chips
          </button>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { label: 'Chip Models', value: '139+', icon: '🔩' },
            { label: 'Protocols', value: '7', icon: '🔌' },
            { label: 'Zero Cost', value: '100% Free', icon: '💰' },
            { label: 'Browser Based', value: 'No Install', icon: '🌐' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Chip Types Grid */}
      <section id="chips" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-4">Supported Chip Database</h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
          Comprehensive support for industry-standard memory chips and microcontrollers
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.chipTypes.map(chip => (
            <div
              key={chip.type}
              className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-pointer"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${chip.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="text-3xl mb-2">{chip.icon}</div>
                <h3 className="font-semibold text-sm">{chip.type}</h3>
                <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {chip.count}
                </p>
                <p className="text-xs text-gray-500 mt-1">chip models</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '🔌 WebUSB/WebSerial',
              desc: 'Connect CH341A programmer directly from your browser. No drivers, no installations — works on Chrome and Edge.',
            },
            {
              title: '🔐 Military-Grade Security',
              desc: 'JWT authentication, bcrypt hashing, MFA support, rate limiting, SHA-256 firmware verification, and brute force protection.',
            },
            {
              title: '📊 Real-Time Console',
              desc: 'Live flash progress tracking with color-coded logs, auto-scroll, filter by severity, and export to file.',
            },
          ].map(f => (
            <div key={f.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all">
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-gray-600">
        <p>FlashForge Pro — Open Source Multi-Protocol Chip Programmer</p>
        <p className="mt-1">Built for cybersecurity professionals and hardware hackers</p>
      </footer>
    </div>
  );
}
