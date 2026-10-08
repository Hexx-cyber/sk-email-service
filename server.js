require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Firebase Admin Modular Imports
const admin = require('firebase-admin');
const { cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const app = express();
app.use(express.json());
app.use(cors());

// Agar environment variable se JSON string mil rahi hai toh usay parse kar lein
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : require('./serviceAccountKey.json');

// Agar admin.apps.length check nahi hua wa toh initialize kar lein
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

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

// Professional Pitch Black & Sleek Gray HTML Email Template with Logo & Solid White Button
function getPasswordResetHTML(resetLink) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Secure Password Reset - SK Messenger</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 480px; background: #121212; border-radius: 16px; border: 1px solid #282828; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.8);" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Sleek Accent Top Bar -->
              <tr><td style="height: 3px; background: linear-gradient(90deg, #ffffff 0%, #757575 100%);"></td></tr>

              <!-- Header with Logo & Brand Name -->
              <tr>
                <td align="center" style="padding: 36px 24px 16px 24px;">
                  <!-- App Logo (Hosted Direct URL) -->
                  <img src="https://i.ibb.co/jPFYgDZD/transparent2.png" alt="SK Logo" width="48" height="48" style="display: block; margin: 0 auto 14px auto; border-radius: 12px; object-fit: contain;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 2px;">SK MESSENGER</h1>
                  <span style="font-size: 10px; color: #9E9E9E; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; display: inline-block; margin-top: 8px;">Protocol Security Division</span>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td align="center" style="padding: 0 32px;">
                  <hr style="border: none; border-top: 1px solid #222222; margin: 10px 0 20px 0;">
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 10px 36px 36px 36px; text-align: center;">
                  <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 14px; font-weight: 700; letter-spacing: 0.5px;">Credential Reset Authorization</h2>
                  <p style="font-size: 13px; line-height: 1.7; color: #9E9E9E; margin-bottom: 32px;">
                    A cryptographic password reset sequence has been initiated for your SK Messenger account. Execute the authentication sequence below to update your security credentials.
                  </p>

                  <!-- Professional Solid White Button with Black Text -->
                  <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 40px; font-size: 14px; font-weight: 800; color: #000000 !important; background-color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);">
                    RESET PASSWORD
                  </a>

                  <p style="font-size: 11px; color: #666666; margin-top: 32px; line-height: 1.6;">
                    If you did not request this authorization sequence, disregard this communication. Your existing cryptographic credentials remain secure.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 18px; text-align: center; background-color: #080808; border-top: 1px solid #1f1f1f; font-size: 10px; color: #666666; letter-spacing: 0.5px;">
                  🔒 End-to-End Encrypted Architecture<br>
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
    const resetLink = await getAuth().generatePasswordResetLink(email);

    const mailOptions = {
      from: `"SK Messenger" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Credential Reset Authorization - SK Messenger',
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
