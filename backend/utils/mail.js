import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '../config/config.env')
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendInactivityEmail = async (email, name, handle) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: `Hey ${name}, you've been inactive on Codeforces!`,
    html: `
      <p>Hi ${name},</p>
      <p>We noticed that you haven’t solved any problems on Codeforces in the last 7 days.</p>
      <p>Stay consistent and keep practicing!</p>
      <p><a href="https://codeforces.com/profile/${handle}" target="_blank">View your Codeforces profile</a></p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
