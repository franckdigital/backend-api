import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as postmark from 'postmark';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplateOptions {
  to: string;
  templateAlias: string;
  templateModel: Record<string, string>;
}

@Injectable()
export class EmailService {
  private client: postmark.ServerClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('email.postmarkApiKey');
    this.client = new postmark.ServerClient(apiKey || '');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>('email.fromEmail') || 'noreply@yourdomain.com';

      const result = await this.client.sendEmail({
        From: fromEmail,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text || '',
        MessageStream: 'outbound',
      });

      return result.ErrorCode === 0;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendMagicLink(email: string, token: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('magicLink.appUrl');
    const magicLink = `${appUrl}/auth/verify-magic-link?token=${token}&email=${encodeURIComponent(email)}`;

    const html = `
      <h1>Login to Your Account</h1>
      <p>Click the button below to log in to your account. This link will expire in 30 minutes.</p>
      <a href="${magicLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Log In</a>
      <p>If you did not request this login link, please ignore this email.</p>
    `;

    const text = `Login to Your Account\n\nClick the link below to log in to your account. This link will expire in 30 minutes.\n\n${magicLink}\n\nIf you did not request this login link, please ignore this email.`;

    return this.sendEmail({
      to: email,
      subject: 'Login to Your Account',
      html,
      text,
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('magicLink.appUrl');
    const resetLink = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const html = `
      <h1>Reset Your Password</h1>
      <p>Click the button below to reset your password. This link will expire in 30 minutes.</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      <p>If you did not request this password reset, please ignore this email.</p>
    `;

    const text = `Reset Your Password\n\nClick the link below to reset your password. This link will expire in 30 minutes.\n\n${resetLink}\n\nIf you did not request this password reset, please ignore this email.`;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
      text,
    });
  }

  async sendEmailVerification(email: string, token: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('magicLink.appUrl');
    const verificationLink = `${appUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const html = `
      <h1>Verify Your Email Address</h1>
      <p>Click the button below to verify your email address. This link will expire in 30 minutes.</p>
      <a href="${verificationLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `;

    const text = `Verify Your Email Address\n\nClick the link below to verify your email address. This link will expire in 30 minutes.\n\n${verificationLink}\n\nIf you did not create an account, please ignore this email.`;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
      text,
    });
  }


  // Email with templates
  async sendEmailWithTemplate(options: EmailTemplateOptions): Promise<boolean> {
    try {
      const fromEmail =
        this.configService.get<string>('email.fromEmail') ||
        'noreply@yourdomain.com';

      const result = await this.client.sendEmailWithTemplate({
        From: fromEmail,
        To: options.to,
        TemplateAlias: options.templateAlias,
        TemplateModel: options.templateModel,
      });

      return result.ErrorCode === 0;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendMagicLinkWithTemplate(email: string, token: string, username: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('magicLink.appUrl');
    const magicLink = `${appUrl}/auth/verify-magic-link?token=${token}&email=${encodeURIComponent(email)}`;

    return this.sendEmailWithTemplate({
      to: email,
      templateAlias: 'magiclink-french',
      templateModel: {
        product_url: 'https://coop-cca.com',
        product_name: 'CCA CCOP',
        name: username,
        action_url: magicLink,
        company_name: 'CCA CCOP',
        support_email: 'support@coop-cca.com',
        twitter_url: 'https://twitter.com/ccaccop',
        linkedin_url: 'https://www.linkedin.com/company/ccaccop',
        current_year: '2025',
        company_address: '123 Rue de la Paix, Paris, France',
      },
    });
  }

  async sendPasswordResetWithTemplate(email: string, token: string, username: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('magicLink.appUrl');
    const resetLink = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    return this.sendEmailWithTemplate({
      to: email,
      templateAlias: 'password-reset-french',
      templateModel: {
        product_url: 'https://coop-cca.com',
        product_name: 'CCA CCOP',
        name: username,
        action_url: resetLink,
        company_name: 'CCA CCOP',
        support_email: 'support@coop-cca.com',
        twitter_url: 'https://twitter.com/ccaccop',
        linkedin_url: 'https://www.linkedin.com/company/ccaccop',
        current_year: '2025',
        company_address: '123 Rue de la Paix, Paris, France',
      },
    });
  }

  async sendEmailVerificationWithTemplate(email: string, token: string, username: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('magicLink.appUrl');
    const verificationLink = `${appUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    return this.sendEmailWithTemplate({
      to: email,
      templateAlias: 'verify-email-french',
      templateModel: {
        product_url: 'https://coop-cca.com',
        product_name: 'CCA CCOP',
        name: username,
        action_url: verificationLink,
        company_name: 'CCA CCOP',
        support_email: 'support@coop-cca.com',
        twitter_url: 'https://twitter.com/ccaccop',
        linkedin_url: 'https://www.linkedin.com/company/ccaccop',
        current_year: '2025',
        company_address: '123 Rue de la Paix, Paris, France',
      },
    });
  }

  async sendMembershipApproval(email: string, identifiant: string): Promise<boolean> {
    const appUrl = this.configService.get<string>('app.url');
    const loginUrl = `${appUrl}/auth/login`;

    const html = `
      <h1>Welcome to CCA Coop!</h1>
      <p>Your membership application has been approved.</p>
      <p>Your Member ID is: ${identifiant}</p>
      <p>You can login at: <a href="${loginUrl}">${loginUrl}</a></p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Your CCA Coop Membership Has Been Approved',
      html,
    });
  }
  /**
   * Send notification to user that their application has been received
   * @param email The email address to send to
   */
  async sendApplicationReceivedNotification(email: string): Promise<void> {
    const subject = 'Your application has been received';
    const text = 'Thank you for your registration. Your application is under review. We will contact you when it has been processed.';
    const html = `
      <h1>Application Received</h1>
      <p>Thank you for your registration. Your application is under review.</p>
      <p>We will contact you when it has been processed with further instructions to set up your account.</p>
      <p>If you have any questions, please contact our support team.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: subject,
      html: html,
      text: text,
    });
  }

  /**
   * Send membership approval email with credentials
   * @param email The email address to send to
   * @param identifiant The member's identifier
   * @param password The generated password
   */
  async sendMembershipApprovalWithCredentials(email: string, identifiant: string, password: string): Promise<void> {
    const subject = 'Your membership has been approved';
    const text = `Congratulations! Your membership application has been approved. Your member ID is: ${identifiant}. You can now log in with your email and the password: ${password}. Please change your password after your first login.`;
    const html = `
      <h1>Membership Approved</h1>
      <p>Congratulations! Your membership application has been approved.</p>
      <p><strong>Your member ID is:</strong> ${identifiant}</p>
      <p>You can now log in to your account with:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>For security reasons, please change your password after your first login.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: subject,
      html: html,
      text: text,
    });
  }

  /**
   * Send membership rejection email
   * @param email The email address to send to
   * @param reason The reason for rejection
   */
  async sendMembershipRejection(email: string, reason: string): Promise<void> {
    const subject = 'Your membership application status';
    const text = `We regret to inform you that your membership application has been declined. Reason: ${reason}. If you believe this is an error or you'd like to discuss this further, please contact our support team.`;
    const html = `
      <h1>Membership Application Status</h1>
      <p>We regret to inform you that your membership application has been declined.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you believe this is an error or you'd like to discuss this further, please contact our support team.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: subject,
      html: html,
      text: text,
    });
  }
} 