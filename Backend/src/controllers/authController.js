const User = require("../models/Restaurant");
const { cookieGenerate } = require("../utils/cookiesGenerate");
const generateOTP = require("../utils/generateOtp");
const { generateToken } = require("../utils/Jwt");
const sendOTP = require("../utils/sendOtp");
const bcrypt = require("bcrypt")
const crypto = require("crypto");
const sendResetLink = require("../utils/sendLink");
const Restaurant = require("../models/Restaurant");


exports.login = async (req, res) => {

    const { email, password } = req.body
    try {


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            })
        }

        const restaurant = await Restaurant.findOne({ email })


        if (!restaurant) {
            return res.status(400).json({ success: false, message: 'Restaurant not found' });
        }
        if (restaurant.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "This account is inactive. Contact support.",
            });
        }
        const isMatch = await bcrypt.compare(password, restaurant.password);


        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials!' });

        }
        const otp = generateOTP()

        await sendOTP(restaurant.email, otp)

        restaurant.otp = otp
        restaurant.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);


        await restaurant.save();
        return res.status(200).json({
            success: true,
            message: "Otp Sent Successfully!",
            email: restaurant.email
        })
    } catch (error) {
        console.log("Error in auth Api: ", error);

        return res.status(400).json({
            success: false,
            message: "Error in authentication api",
            error
        })

    }
}


exports.register = async (req, res) => {
    try {

        const { name, email, address, phone, password, GSTIN } = req.body;


        if (!email || !password || !name || !address || !phone) {

            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            })
        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be in 6 characters.",
            })
        }


        const restaurant = await User.create({ name, email, password, address, phone, GSTIN })

        return res.status(201).json({
            success: true,
            message: "Restaurant registered successfully!",
            restaurant
        })

    } catch (error) {
        console.log("Error in register Api: ", error);

        return res.status(400).json({
            success: false,
            message: "Error in register api",
            error
        })
    }
}


exports.verifyLogin = async (req, res) => {
    const { email, otp } = req.body


    try {
        const restaurant = await Restaurant.findOne({ email }).select('+otp +otpExpiry');

        if (!restaurant) {
            console.log(`[LOGIN] restaurant not found: ${email}`);
            return res.status(400).json({
                status: false,
                message: 'restaurant not found',
                data: null
            });
        }
        if (!restaurant.otp || !restaurant.otpExpiry) {
            console.log(`[LOGIN] No OTP found for user: ${email}`);
            return res.status(400).json({
                status: false,
                message: 'OTP expired or not found. Please request a new OTP.',
                data: null
            });
        }

        if (restaurant.otpExpiry < new Date()) {
            console.log(`[LOGIN] OTP expired for user: ${email}`);
            return res.status(400).json({
                status: false,
                message: 'OTP expired. Please request a new OTP.',
                data: null
            });
        }

        const storedOTP = String(restaurant.otp);
        console.log(`[LOGIN] Comparing OTPs - Stored: '${storedOTP}', Input: '${otp}'`);
        if (storedOTP !== otp) {
            console.log(`[LOGIN] OTP verification failed. Input OTP doesn't match stored OTP.`);
            return res.status(400).json({
                status: false,
                message: 'Invalid OTP',
                data: null
            });
        }

        if (restaurant.isActive === false) {
            return res.status(403).json({
                status: false,
                message: "This account is inactive. Contact support.",
                data: null,
            });
        }

        const token = generateToken(restaurant._id);
        restaurant.token = token;

        // Clear OTP after successful verification
        restaurant.otp = undefined;
        restaurant.otpExpiry = undefined;
        await restaurant.save();

        cookieGenerate(token, res)

        const restaurantWithoutSensitiveData = await User.findById(restaurant._id).select('-password -token -otp -otpExpiry');


        res.status(200).json({
            status: true,
            message: 'Login successful',
            data: {
                token,
                retaurant: restaurantWithoutSensitiveData
            }
        });


    } catch (error) {
        console.log("error", error);
        return res.status(400).json({
            success: false,
            message: "Error in verify api",
            error
        })
    }

}


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({
                seccess: false,
                message: "Email is Required"
            })
        }

        const restaurant = await Restaurant.findOne({ email })

        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: "Account not found"
            })
        }



        const token = crypto.randomBytes(32).toString("hex");

        await sendResetLink(email, token)
        restaurant.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)
        restaurant.resetToken = token
        await restaurant.save()

        res.status(200).json({
            success: true,
            message: "Link sent successfully to your Email "
        })

    } catch (error) {
        console.log("error", error);
        return res.status(400).json({
            success: false,
            message: "Error in send link api",
            error
        })
    }
}




exports.resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;

        if (!password || !token) {
            return res.status(400).json({
                success: false,
                message: "Password and token are required.",
            });
        }


        const restaurant = await Restaurant.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired password link.",
            });
        }

        restaurant.password = password;
        restaurant.resetToken = null;
        restaurant.resetTokenExpiry = null;
        await restaurant.save();


        return res.status(200).json({
            success: true,
            message: "Your password has been reset successfully. You can now log in with your new password.",
        });
    } catch (error) {
        console.error("[RESET] Error in resetPassword:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while resetting password.",
            error: error.message,
        });
    }
};


exports.logout = async (req, res) => {
    try {


        if (req.restaurant) {
            const restaurant = await Restaurant.findById(req.restaurant._id);
            if (restaurant) {
                restaurant.token = null;
                await restaurant.save();
            }
        }


        res.clearCookie("restaurantToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful!",
        });
    } catch (error) {
        console.error("[LOGOUT] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during logout.",
            error: error.message,
        });
    }
};


exports.readLoggedUser = async (req, res) => {
    try {

        const restaurant = req.restaurant

        if (!restaurant) {

            return res.status(400).json({

                success: false,
                authenticated: false,
                message: "You are not logged in."
            })
        }

        res.status(200).json({
            success: true,
            authenticated: true,
            message: "Read restaurant success",
            restaurant
        })

    } catch (error) {
        console.log("error in read logged user", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during read user.",
            error: error.message,
        });
    }
}