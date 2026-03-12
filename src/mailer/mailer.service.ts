import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailService {
  constructor(private mailservice: MailerService) {}

  private resolveTemplatePath(templateName: string): string {
    const possiblePaths = [
      path.join(__dirname, '..', 'mailer', 'templates', templateName),
      path.join(process.cwd(), 'src', 'mailer', 'templates', templateName),
      path.join(process.cwd(), 'dist', 'mailer', 'templates', templateName),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    throw new Error(`Template file ${templateName} not found`);
  }

  async VerifyOtpMail(
    email: string,
    otpCode: string,
    
  ): Promise<void> {
    const subject = 'Email Verification for Truckways';

    // Load the HTML template
    const templatePath = this.resolveTemplatePath('otp-mail.html');
    let content = fs.readFileSync(templatePath, 'utf-8');

    
    content = content.replace('${otpCode}', otpCode);

    await this.mailservice.sendMail({
      to: email,
      subject: subject,
      html: content,
    });
  }

  async WelcomeMail(email: string, name: string): Promise<void> {
    const subject = 'Welcome To Truckways';

    // Load the HTML template
    const templatePath = this.resolveTemplatePath('welcome-mail.html');
    let content = fs.readFileSync(templatePath, 'utf-8');

    content = content.replace('${name}', name);

    await this.mailservice.sendMail({
      to: email,
      subject: subject,
      html: content,
    });
  }

  async ForgotPasswordMail(
    email: string,
    otpCode: string,
    
  ): Promise<void> {
    const subject = 'Password Reset for Truckways';

    // Load the HTML template
    const templatePath = this.resolveTemplatePath('reset-password.mail.html');
    let content = fs.readFileSync(templatePath, 'utf-8');

    content = content.replace('${otpCode}', otpCode);

    await this.mailservice.sendMail({
      to: email,
      subject: subject,
      html: content,
    });
  }


  async sendAnnouncementEmail(
    emails: string[],
    title: string,
    body: string,
  ): Promise<{ successful: number; failed: number }> {
    const subject = title;

    // Load the HTML template
    const templatePath = this.resolveTemplatePath('announcement-mail.html');
    let content = fs.readFileSync(templatePath, 'utf-8');

    // Replace placeholders
    content = content.replace('${title}', title);
    content = content.replace('${body}', body);

    let successful = 0;
    let failed = 0;

    // Send emails in batches to avoid overloading the mail server
    const batchSize = 50;
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (email) => {
          try {
            await this.mailservice.sendMail({
              to: email,
              subject: subject,
              html: content,
            });
            successful++;
          } catch (error) {
            console.error(`Failed to send announcement email to ${email}:`, error);
            failed++;
          }
        })
      );
    }

    return { successful, failed };
  }
}
