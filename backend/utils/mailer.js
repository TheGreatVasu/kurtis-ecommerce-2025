const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Aniyah Store" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}; 