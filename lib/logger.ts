type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'security';
type LogCategory = 'auth' | 'flash' | 'system' | 'api' | 'security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      ...metadata,
    };
  }

  info(category: LogCategory, message: string, metadata?: Record<string, any>) {
    const entry = this.createEntry('info', category, message, metadata);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
    console.log(`[INFO] [${category}] ${message}`, metadata || '');
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, any>) {
    const entry = this.createEntry('warn', category, message, metadata);
    this.logs.push(entry);
    console.warn(`[WARN] [${category}] ${message}`, metadata || '');
  }

  error(category: LogCategory, message: string, metadata?: Record<string, any>) {
    const entry = this.createEntry('error', category, message, metadata);
    this.logs.push(entry);
    console.error(`[ERROR] [${category}] ${message}`, metadata || '');
  }

  security(message: string, metadata?: Record<string, any>) {
    const entry = this.createEntry('security', 'security', message, metadata);
    this.logs.push(entry);
    console.warn(`[SECURITY] ${message}`, metadata || '');
  }

  getRecent(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  getByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter(l => l.category === category);
  }
}

export const logger = new Logger();
