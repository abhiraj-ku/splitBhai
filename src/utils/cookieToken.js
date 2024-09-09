const cookieToken = async (user, res) => {
  // generate JWT token based on users details
  const cookieTime = process.env.COOKIE_TIME;
  if (isNaN(cookieTime) || cookieTime <= 0) {
    return res.status(500).json({
      message: "Invalid COOKIE_TIME environment variable",
    });
  }

  // Create the toke for cookie
  const token = user.createJwtToken();
  if (!token) {
    return res.status(400).json({
      message: "Token not generated",
    });
  }

  // Secure cookie options
  const options = {
    expires: new Date(Date.now() + cookieTime * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        _id: user._id,
        userame: user.name,
        email: user.email,
      },
    });
};

module.exports = cookieToken;
