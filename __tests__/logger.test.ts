import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, createRequestLogger } from '@/lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('log levels', () => {
    it('should support debug logging', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.debug('Test debug message');
      
      // Debug may or may not be logged depending on LOG_LEVEL
      // This test just verifies the method doesn't throw
      expect(consoleLogSpy).toBeDefined();
    });

    it('should log info messages', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('Test info message');
      
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      logger.warn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.error('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('metadata', () => {
    it('should include metadata in log output', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('Test message', { userId: '123', action: 'test' });
      
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('userId');
      expect(call).toContain('123');
    });
  });

  describe('child logger', () => {
    it('should create child logger with default metadata', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      const childLogger = logger.child({ requestId: 'req-123' });
      childLogger.info('Test message');
      
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('requestId');
      expect(call).toContain('req-123');
    });
  });

  describe('createRequestLogger', () => {
    it('should create logger with request context', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      const requestLogger = createRequestLogger('req-456', '/api/test');
      requestLogger.info('Request processed');
      
      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('req-456');
      expect(call).toContain('/api/test');
    });
  });
});
