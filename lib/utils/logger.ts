export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  environment?: string;
}

class Logger {
  private isProduction: boolean;
  private isDevelopment: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      environment: process.env.NODE_ENV,
    };
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry = this.createLogEntry(level, message, data);
    
    // In development, log to console
    if (this.isDevelopment) {
      console[level](`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
    }
    
    // In production, you can send to external logging service
    if (this.isProduction) {
      // TODO: Integrate with external logging service (Sentry, LogRocket, etc.)
      this.sendToLoggingService(entry);
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // Placeholder for external logging service integration
    // Example: Sentry.captureMessage(entry.message, entry.level);
    console.log('Production log:', entry);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  // Specialized logging for auth flows
  authSuccess(userId: string, action: string, data?: Record<string, unknown>): void {
    this.info(`Auth success: ${action}`, { userId, action, ...data });
  }

  authError(userId: string | null, action: string, error: Error | string): void {
    this.error(`Auth error: ${action}`, { userId, action, error: error instanceof Error ? error.message : error });
  }

  redirectAttempt(from: string, to: string, success: boolean): void {
    this.info(`Redirect attempt: ${from} → ${to}`, { success });
  }
}

export const logger = new Logger(); 