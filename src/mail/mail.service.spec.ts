import { RequestTimeoutException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MailService } from './mail.service';

describe('MailService', () => {
  it('sends the expected login, verification, and password-reset templates', async () => {
    const mailer = { sendMail: vi.fn(() => Promise.resolve()) };
    const service = new MailService(mailer as never);

    await service.sendLogEmail('user@example.com');
    await service.sendVerifyEmailTemplete('user@example.com', 'https://app.test/verify');
    await service.sendResetPassTemplete('user@example.com', 'https://app.test/reset');

    expect(mailer.sendMail).toHaveBeenCalledTimes(3);
    expect(mailer.sendMail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'verify your account',
        template: 'verify-email',
        context: { link: 'https://app.test/verify' },
      }),
    );
    expect(mailer.sendMail).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        subject: 'reset password',
        template: 'reset-password',
        context: { resetPasswordLink: 'https://app.test/reset' },
      }),
    );
  });

  it('converts mail provider failures to a request timeout', async () => {
    const mailer = { sendMail: vi.fn(() => Promise.reject(new Error('SMTP unavailable'))) };
    const consoleError = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const service = new MailService(mailer as never);

    await expect(service.sendVerifyEmailTemplete('user@example.com', 'link')).rejects.toThrow(
      RequestTimeoutException,
    );
    consoleError.mockRestore();
  });
});
