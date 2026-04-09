
/**
 * Generates a secure 6-digit numeric OTP.
 * @returns {string} - A 6-digit OTP as a string.
 */
function generateOTP() {
  // Generate random number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

module.exports = generateOTP;
