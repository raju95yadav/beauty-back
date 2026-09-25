const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER or EMAIL_PASS environment variables are missing. Please add them to your environment configuration.');
  }

  // SMTP transport settings for Gmail (Port 587 with STARTTLS works across all networks & cloud providers)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587 with STARTTLS
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const otpCode = message.match(/\b\d{6}\b/)?.[0] || '';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #e11d48; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">GLAM BEAUTY</h1>
        <p style="color: #9ca3af; font-size: 11px; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Curated Luxury Boutique</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 1px solid #fecdd3; border-radius: 22px; padding: 32px 20px; text-align: center; margin-bottom: 28px;">
        <p style="color: #4b5563; font-size: 12px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800;">Your One-Time Passcode</p>
        <div style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #e11d48; font-family: 'Courier New', monospace; padding-left: 10px;">${otpCode || message}</div>
        <p style="color: #9ca3af; font-size: 11px; margin: 16px 0 0 0; font-weight: 600;">Valid for 5 minutes • Single-use verification</p>
      </div>

      <p style="color: #6b7280; font-size: 12px; line-height: 1.6; text-align: center; margin: 0 0 20px 0;">
        Enter this verification code into the Glam Beauty portal to complete your secure sign-in.
      </p>

      <div style="border-top: 1px solid #f3f4f6; padding-top: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
          Security Alert: Never share this code with anyone. Glam staff will never ask for your code.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Glam Beauty Boutique" <${emailUser}>`,
    to: email,
    subject: subject || 'Glam Beauty - Login Verification Code',
    text: message,
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
