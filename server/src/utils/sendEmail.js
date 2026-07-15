const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  // Skip email if SMTP not configured in dev
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_gmail@gmail.com') {
    console.log(`[Email skip - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FoodieHub <noreply@foodiehub.com>',
    to,
    subject,
    html,
    text,
  });
};

const passwordResetEmail = (name, resetUrl) => ({
  subject: 'Reset Your FoodieHub Password',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF6B35, #FF8C42); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🍔 FoodieHub</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1A1A2E;">Hi ${name},</h2>
        <p style="color: #666; line-height: 1.6;">You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #FF6B35, #FF8C42); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 14px;">This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2024 FoodieHub. All rights reserved.</p>
      </div>
    </div>
  `,
  text: `Reset your FoodieHub password: ${resetUrl}`,
});

const orderConfirmationEmail = (name, order) => ({
  subject: `Order Confirmed #${order._id.toString().slice(-6).toUpperCase()}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF6B35, #FF8C42); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🎉 Order Confirmed!</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1A1A2E;">Hi ${name},</h2>
        <p style="color: #666;">Your order has been placed successfully!</p>
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Total:</strong> ₹${order.grandTotal}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">© 2024 FoodieHub. All rights reserved.</p>
      </div>
    </div>
  `,
  text: `Order #${order._id} confirmed. Total: ₹${order.grandTotal}`,
});

module.exports = { sendEmail, passwordResetEmail, orderConfirmationEmail };
