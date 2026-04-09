const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const otpString = String(otp);

  try {
    console.log(`[OTP] Sending OTP: '${otpString}' to ${email}`);

    const now = new Date();
    const expiryTime = new Date(now.getTime() + 15 * 15 * 1000); // 30 min
    console.log(`[OTP] Current time: ${now.toISOString()}`);
    console.log(`[OTP] Expiry time: ${expiryTime.toISOString()}`);

    // ✅ Configure transporter (SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,        
      port: process.env.SMTP_PORT || 465, 
      secure: true,                      
      auth: {
        user: process.env.SMTP_USER,     
        pass: process.env.SMTP_PASS,     
      },
    });

    // ✅ Email content
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Your OTP for login",
      text: `Your One-Time Password is: ${otpString}\n\nPlease enter exactly these digits: ${otpString}\n\nIt will expire in 30 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Your Verification Code</h2>
          <p>Please use the following One-Time Password (OTP) to verify your account:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 24px; letter-spacing: 5px; text-align: center; font-weight: bold; margin: 20px 0;">
            ${otpString}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    // ✅ Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[OTP] Sent successfully to ${email}. MessageId: ${info.messageId}, OTP: '${otpString}'`);
    return true;
  } catch (error) {
    console.error("[OTP] Error sending email with Nodemailer:", error);

    // For development environment, log the OTP that would have been sent
    if (process.env.NODE_ENV !== "production") {
      console.log(`
        =========================================
        DEVELOPMENT MODE: Email would be sent to ${email}
        OTP: ${otpString}
        =========================================
      `);
      return true;
    } else {
      throw new Error("Failed to send OTP: " + (error.message || "Unknown error"));
    }
  }
};

module.exports = sendOTP;
