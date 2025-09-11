require('dotenv').config();
const nodemailer = require('nodemailer');

async function run() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.SMTP_USER || 'your@example.com';
  const from = process.env.FROM_EMAIL || process.env.MAIL_FROM || user;

  if (!user || !pass) {
    console.error('SMTP_USER or SMTP_PASS not set in .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified');

    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Ripple test email',
      text: 'This is a test email from Ripple test-email.js',
      html: '<p>This is a <strong>test</strong> email from Ripple</p>',
    });

    console.log('Message sent:', info.messageId || info);
  } catch (err) {
    console.error('Failed to send test email:', err);
    process.exit(1);
  }
}

run();
