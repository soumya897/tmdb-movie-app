const User = require("../models/user.model.js");
const generateToken = require("../utils/generateToken.js");
const { OAuth2Client } = require("google-auth-library");

const { sendEmail } = require("../utils/sendEmail.js");
const crypto = require("crypto");
const { sendToken } = require("../utils/sendToken.js");
const { cookie } = require("express-validator");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  try {
    const exists = await User.findOne({ email, accountVerified: true });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const registerationAttemptsByUser = await User.find({
      email,
      accountVerified: false,
    });

    if (registerationAttemptsByUser.length > 3) {
      return res.status(403).json({
        message:
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
      });
    }

    const user = await User.create({ name, email, password });
    const verificationCode = await user.generateVerificationCodeR();
    await user.save();

    // Send verification email
    await sendVerificationCode(
      verificationCode,
      name,
      email,
      // phone,
      res
    );
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};

async function sendVerificationCode(
  verificationCode,
  name,
  email,
  // phone,
  res
) {
  const message = generateEmailTemplate(verificationCode);
  try {
    await sendEmail({ email, subject: "Your Verification Code", message });
    res.status(200).json({
      success: true,
      message: `Verification email successfully sent to ${name}`,
    });
  } catch (error) {
    console.error("Email send failed:", error);
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send.",
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border: 1px solid #e1e5e9; border-radius: 8px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
    <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">MY Movies</h1>
    <p style="margin: 0; font-size: 16px; opacity: 0.9; font-weight: 300;">Online • Movie Reviews</p>
  </div>
  
  <!-- Main Content -->
  <div style="padding: 40px 30px;">
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50; text-align: center;">Email Verification</h2>
    
    <!-- Message -->
    <p style="margin: 0 0 30px 0; font-size: 16px; color: #5a6c7d; line-height: 1.6; text-align: center;">
      Thank you for joining My Movies! Please use the verification code below to complete your registration.
    </p>
    
    <!-- Verification Code -->
    <div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: white; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
      <div style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 3px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
        ${verificationCode}
      </div>
    </div>
    
    <!-- Expiry Notice -->
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #856404; font-weight: 500;">
        ⏰ This code expires in 10 minutes
      </p>
    </div>
    
    <!-- Security Note -->
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
        <strong>Security Note:</strong> If you didn't request this verification, please ignore this email. Keep this code confidential.
      </p>
    </div>
    
  </div>
  
  <!-- Footer -->
  <div style="background: #2c3e50; padding: 30px; text-align: center; color: white;">
    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #4ecdc4;">OurMoments Kolkata</p>
    <p style="margin: 0 0 4px 0; font-size: 14px; color: #bdc3c7;">Capturing your precious moments</p>
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #bdc3c7;">📍 Kolkata, West Bengal</p>
    <div style="border-top: 1px solid #34495e; padding-top: 20px;">
      <p style="margin: 0; font-size: 12px; color: #7f8c8d;">
        This is an automated message. Please do not reply to this email.<br>
        © 2025 OurMoments Kolkata. All rights reserved.
      </p>
    </div>
  </div>
  
</div>
  `;
}

exports.verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Please provide email and OTP" });
  }
  try {
    const userAllEntries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });
    if (userAllEntries.length === 0) {
      return res
        .status(404)
        .json({ message: "No unverified user found with this email" });
    }
    let user;
    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      user = userAllEntries[0];
    }
    if (user.verificationCode !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const currentTime = Date.now();
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();
    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP Expired.", 400));
    }
    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production
      // secure: process.env.NODE_ENV === "production", // Use this in production
      sameSite: "Strict",
      expires: new Date(Date.now() + 360000000),
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      message: "User registered successfully and account verified.",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching user data", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, accountVerified: true }).select(
      "+password"
    );
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // await sendToken(user, 200, "Account Verified.", res);
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production
      // secure: process.env.NODE_ENV === "production", // Use this in production
      sameSite: "Strict",
      expires: new Date(Date.now() + 360000000),
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      message: "Login successful",
    });
    //   res.cookie("testCookie", "testValue", {
    //   httpOnly: true,
    //   sameSite: "Strict",
    //   secure: false, // force this for localhost
    //   expires: new Date(Date.now() + 3600000)
    // });
    // res.status(200).json({ message: "Cookie test" });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// exports.logout = async (req, res) => {
//   try {
//     return res.status(200).json({
//     message: "Logged out successfully.",
//   });
//   } catch (error) {
//     console.error("Logout Error:", error);
//     return res.status(500).json({ message: "Logout failed", error: error.message });

//   }

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
// res
//   .status(200)
//   .cookie("token", "", {
//     expires: new Date(Date.now()),
//     httpOnly: true,
//   })
//   .json({
//     success: true,
//     message: "Logged out successfully.",
//   });

// };

exports.getUser = async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
};

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  const resetToken = user.generateResetPasswordTokeN();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border: 1px solid #e1e5e9; border-radius: 8px; overflow: hidden;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
    <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">OurMoments</h1>
    <p style="margin: 0; font-size: 16px; opacity: 0.9; font-weight: 300;">Kolkata • Photography Services</p>
  </div>
  
  <!-- Main Content -->
  <div style="padding: 40px 30px;">
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2c3e50; text-align: center;">Reset Your Password</h2>
    
    <!-- Message -->
    <p style="margin: 0 0 20px 0; font-size: 16px; color: #5a6c7d; line-height: 1.6;">
      Hello,
    </p>
    
    <p style="margin: 0 0 30px 0; font-size: 16px; color: #5a6c7d; line-height: 1.6;">
      We received a request to reset your password for your OurMoments Kolkata account. If you made this request, please click the button below to reset your password.
    </p>
    
    <!-- Reset Password Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${resetPasswordUrl}" style="display: inline-block; background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(68, 160, 141, 0.3); transition: all 0.3s ease;">
        Reset My Password
      </a>
    </div>
    
    <!-- Alternative Link -->
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d; font-weight: 500;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 14px; color: #4ecdc4; word-break: break-all; font-family: 'Courier New', monospace; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e1e5e9;">
        ${resetPasswordUrl}
      </p>
    </div>
    
    <!-- Expiry Notice -->
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #856404; font-weight: 500;">
        ⏰ This link expires in 1 hour for your security
      </p>
    </div>
    
    <!-- Security Note -->
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
        <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email. Your account remains secure.
      </p>
      <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
        If you continue to receive these emails, please contact our support team immediately.
      </p>
    </div>
    
    <!-- Tips Section -->
    <div style="background: #e8f5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #2e7d32; font-weight: 600;">
        🔒 Password Security Tips:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #2e7d32; line-height: 1.5;">
        <li>Use a strong, unique password</li>
        <li>Include uppercase, lowercase, numbers, and symbols</li>
        <li>Avoid using personal information</li>
        <li>Consider using a password manager</li>
      </ul>
    </div>
    
  </div>
  
  <!-- Footer -->
  <div style="background: #2c3e50; padding: 30px; text-align: center; color: white;">
    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #4ecdc4;">OurMoments Kolkata</p>
    <p style="margin: 0 0 4px 0; font-size: 14px; color: #bdc3c7;">Capturing your precious moments</p>
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #bdc3c7;">📍 Kolkata, West Bengal</p>
    <div style="border-top: 1px solid #34495e; padding-top: 20px;">
      <p style="margin: 0 0 10px 0; font-size: 12px; color: #7f8c8d;">
        Need help? Contact us at: <a href="mailto:support@ourmoments-kolkata.com" style="color: #4ecdc4; text-decoration: none;">support@ourmoments-kolkata.com</a>
      </p>
      <p style="margin: 0; font-size: 12px; color: #7f8c8d;">
        This is an automated message. Please do not reply to this email.<br>
        © 2025 OurMoments Kolkata. All rights reserved.
      </p>
    </div>
  </div>
  
</div>`;
  try {
    sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} with password reset instructions.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("Email send failed:", error);
    return res.status(500).json({
      success: false,
      message: "Email could not be sent. Please try again later.",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({
      message: "Reset password token is invalid or has expired.",
    });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password & confirm password do not match." });
  }
  try {
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      token: generateToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: email + process.env.JWT_SECRET, // placeholder
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Google Login Error", err);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};
