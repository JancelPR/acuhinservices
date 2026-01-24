import { Resend } from 'resend';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const apiKey = (process.env.RESEND_API_KEY || '').trim();
if (!apiKey) {
  console.warn('⚠️ RESEND_API_KEY is not defined in .env');
}
const resend = new Resend(apiKey);

/**
 * Send an OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - The 6-digit code
 * @param {string} type - 'email' or 'password' to customize the message
 */
export const sendOTPEmail = async (to, otp, type = 'security') => {
  try {
    const subject = type === 'email' ? 'Verify your new email address' : 'Security Verification Code';
    const title = type === 'email' ? 'Email Update' : 'Password Change';
    
    const { data, error } = await resend.emails.send({
      from: 'Acuhin Store <onboarding@resend.dev>', // Note: Resend requires domain verification for custom emails. This is the default testing sender.
      to: [to],
      subject: `[${otp}] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
          <h2 style="color: #4285F4; margin-bottom: 8px;">${title} Verification</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.5;">
            You requested to change your ${type}. Use the verification code below to complete the process. This code will expire in 10 minutes.
          </p>
          <div style="background: #f8faff; padding: 24px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1967D2;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 12px;">
            If you didn't request this, please ignore this email or contact support if you have concerns.
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="text-align: center; color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
            Acuhin's Store • Administrative Security
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Resend API error');
    }

    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
    throw err;
  }
};
