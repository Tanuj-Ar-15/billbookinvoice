const nodemailer = require("nodemailer");

const sendResetLink = async (email, resetToken) => {
  try {
    console.log(`[RESET] Sending reset link to ${email}`);

   
    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    const now = new Date();
    const expiryTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    console.log(`[RESET] Link generated at: ${now.toISOString()}`);
    console.log(`[RESET] Link will expire at: ${expiryTime.toISOString()}`);

  
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

 
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Password Reset Request",
      text: `
You have requested to reset your password.

Click the link below to set a new password:
${resetURL}

This link will expire in 1 hour.

If you did not request this, please ignore this email.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new one:</p>
          <a href="${resetURL}" style="display: inline-block; background-color: #007BFF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetURL}</p>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    };

    // ✅ Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[RESET] Email sent to ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[RESET] Error sending password reset email:", error);

    if (process.env.NODE_ENV !== "production") {
      console.log(`
        =========================================
        DEVELOPMENT MODE: Reset email would be sent to ${email}
        RESET LINK: ${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}
        =========================================
      `);
      return true;
    } else {
      throw new Error("Failed to send reset link: " + (error.message || "Unknown error"));
    }
  }
};

module.exports = sendResetLink;
