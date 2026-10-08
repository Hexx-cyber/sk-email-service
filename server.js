require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Firebase Admin Modular Imports
const admin = require('firebase-admin');
const { cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth'); // <--- 1. Yeh Import add karein

const app = express();
app.use(express.json());
app.use(cors());

// Service Account Key file
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin initialize
admin.initializeApp({
  credential: cert(serviceAccount)
});

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Configuration Error:', error);
  } else {
    console.log('✅ SMTP Server Ready to Send Emails!');
  }
});

// Custom Glassmorphic Dark HTML Email Template
function getPasswordResetHTML(resetLink) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - SK Messenger</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b141a; font-family: 'Segoe UI', Arial, sans-serif; color: #e9edef;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b141a; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 480px; background: #111b21; border-radius: 16px; border: 1px solid #222d34; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Gradient Bar -->
              <tr><td style="height: 4px; background: linear-gradient(90deg, #00A884 0%, #00C6FF 100%);"></td></tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding: 32px 20px 10px 20px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #00A884; letter-spacing: 1px;">⚡ SK MESSENGER</h1>
                  <span style="font-size: 11px; color: #8696a0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; display: inline-block; margin-top: 6px;">Security Notice</span>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 20px 32px 32px 32px; text-align: center;">
                  <h2 style="font-size: 20px; color: #f1f1f1; margin-bottom: 12px; font-weight: 600;">Reset Your Password</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #8696a0; margin-bottom: 28px;">
                    We received a request to reset your password for your SK Messenger account. Click the button below to set a new password and restore access.
                  </p>

                  <!-- Modern Green Button -->
                  <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 700; color: #ffffff !important; background-color: #00A884; text-decoration: none; border-radius: 30px; box-shadow: 0 4px 14px rgba(0, 168, 132, 0.35);">
                    Reset Password
                  </a>

                  <p style="font-size: 12px; color: #667781; margin-top: 28px; line-height: 1.5;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px; text-align: center; background-color: #0e161b; border-top: 1px solid #222d34; font-size: 11px; color: #667781;">
                  🛡️ End-to-End Encrypted Authentication<br>
                  &copy; 2026 SK Messenger Inc. All rights reserved.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// API Endpoint
app.post('/api/send-reset-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    // 2. admin.auth() ki jagah getAuth().generatePasswordResetLink(email) use karein
    const resetLink = await getAuth().generatePasswordResetLink(email);

    const mailOptions = {
      from: '"SK Messenger Support" <skmessenger.official@gmail.com>',
      to: email,
      subject: '🔒 Reset Your SK Messenger Password',
      html: getPasswordResetHTML(resetLink)
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Branded reset email sent successfully!' });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Node.js Email Server running on port ${PORT}`));