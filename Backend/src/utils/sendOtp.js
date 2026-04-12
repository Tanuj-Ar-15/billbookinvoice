const nodemailer = require("nodemailer");
const transporter = require("./transporter")
const {Resend} = require("resend") 

const resend = new Resend(process.env.RESEND_API_KEY);
const sendOTP = async (email, otp) => {
  const otpString = String(otp);

  try {
    console.log(`[OTP] Sending OTP: '${otpString}' to ${email}`);

    const now = new Date();
    const expiryTime = new Date(now.getTime() + 15 * 15 * 1000); // 30 min
    console.log(`[OTP] Current time: ${now.toISOString()}`);
    console.log(`[OTP] Expiry time: ${expiryTime.toISOString()}`);

    // ✅ Configure transporter (SMTP)


    // ✅ Email content
    const mailOptions = {
      from: "BillBook <onboarding@resend.dev>",
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
    (async function () {
      const { data, error } = await resend.emails.send(mailOptions);

      if (error) {
        return console.error({ error });
      }
      console.log(`[OTP] Sent successfully to ${email}.OTP: '${otpString}'`);

      console.log({ data });
    })();
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
