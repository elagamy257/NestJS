import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { LoggerMiddlrware } from './middleware/logger.middleware';

describe('LoggerInterceptor', () => {
  it('removes a top-level password from object responses and preserves scalar responses', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const interceptor = new LoggerInterceptor();

    await expect(
      firstValueFrom(interceptor.intercept({} as never, { handle: () => of({ id: 1, password: 'secret' }) })),
    ).resolves.toEqual({ id: 1 });
    await expect(
      firstValueFrom(interceptor.intercept({} as never, { handle: () => of('ok') })),
    ).resolves.toBe('ok');
    expect(log).toHaveBeenCalledTimes(2);
    log.mockRestore();
  });
});

describe('LoggerMiddlrware', () => {
  it('continues the request chain', () => {
    const next = vi.fn();
    new LoggerMiddlrware().use({} as never, {} as never, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
