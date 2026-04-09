const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

exports.cookieGenerate = (token, res) => {
  try {
    res.cookie("restaurantToken", token, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Failed to set cookie",
      error: error.message || "Unknown error",
    });
  }
};

exports.adminCookieGenerate = (token, res) => {
  try {
    res.cookie("adminToken", token, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Failed to set admin cookie",
      error: error.message || "Unknown error",
    });
  }
};
