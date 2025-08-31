import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

export async function getMailer() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        return transporter;
      }
      // Production: Expect real SMTP config via env or replace here.
      const transporter = nodemailer.createTransport({ sendmail: true });
      return transporter;
    })();
  }
  return transporterPromise;
}

export async function sendMail(to: string, subject: string, html: string) {
  const transporter = await getMailer();
  const info = await transporter.sendMail({
    from: { name: env.EMAIL_FROM_NAME, address: env.EMAIL_FROM_ADDRESS },
    to,
    subject,
    html,
  });
  if (nodemailer.getTestMessageUrl(info)) {
    // Log Ethereal preview URL
    // eslint-disable-next-line no-console
    console.log('Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}
