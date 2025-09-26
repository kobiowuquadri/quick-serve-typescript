import { Auth, AuthModel } from "../../schemas/users/authSchema.js";
import { generateToken, verifyToken, verifyPassword, hashPassword, messageHandler, generateVerificationCode } from "../../utils/index.js"
import { sendEmail } from "../../modules/notifications/email.js"
import { INTERNAL_SERVER_ERROR, SUCCESS, UNAUTHORIZED, BAD_REQUEST, NOT_FOUND } from "../../constants/statusCode.js"
import { Op } from "sequelize"
import { RegisterRequest, RegisterResponse } from "../../types/users/auth.js"

export const registerBuyerService = async (data: RegisterRequest, callback: (data: RegisterResponse) => void) => {
  const { email, password } = data;

  try {
    // Check if user exists by email or phone
    const existingUser = await AuthModel.findOne({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber }
        ]
      },
      raw: true
    });

    if (existingUser) {
      const message = existingUser.email === email 
        ? "Email already registered" 
        : "Phone number already registered";
      return callback(messageHandler(message, false, BAD_REQUEST, {}));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await Auth.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
      university: university?.trim(),
      userType: userType || 'buyer',
      isActive: true,
    });

    if (!newUser?.id) {
      throw new Error('Failed to create user');
    }

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      generateToken(
        { userId: newUser.id, email: newUser.email, type: 'access' },
        '15m'  // 15 minutes
      ),
      generateToken(
        { userId: newUser.id, email: newUser.email, type: 'refresh' },
        '30d'   // 30 days
      )
    ]);

    // Store refresh token in database
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);
    
    await newUser.update({
      refreshToken,
      refreshTokenExpiresAt
    });

    const { password: _, ...userData } = newUser.get({ plain: true });

    const responseData = {
      user: userData,
      tokens: {
        accessToken,
        refreshToken
      }
    };

    return callback(messageHandler(
      "Account registered successfully",
      true,
      SUCCESS,
      responseData
    ));
  } catch (error: any) {
    return callback(messageHandler(
      "An error occurred while processing your request",
      false,
      INTERNAL_SERVER_ERROR,
      {}
    ));
  }
};

export const loginBuyerService = async (data: LoginRequest, callback: (data: LoginResponse) => void) => {
  const { email, password } = data;
  
  try {
    // Find user by email
    const user = await Auth.findOne({ 
      where: { email },
      raw: true
    });

    // Check if user exists
    if (!user) {
      return callback(messageHandler("Invalid credentials", false, UNAUTHORIZED, {}));
    }

    // Check if account is active
    if (!user.isActive) {
      return callback(messageHandler("Account is deactivated", false, UNAUTHORIZED, {}));
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return callback(messageHandler("Invalid credentials", false, UNAUTHORIZED, {}));
    }

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      generateToken(
        { userId: user.id, email: user.email, type: 'access' },
        '15m'  // 15 minutes
      ),
      generateToken(
        { userId: user.id, email: user.email, type: 'refresh' },
        '30d'   // 30 days
      )
    ]);

    // Store refresh token in database
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);
    
    await Auth.update(
      { refreshToken, refreshTokenExpiresAt },
      { where: { id: user.id } }
    );

    // Prepare user data without password
    const { password: _, ...userData } = user;

    // Prepare response data
    const responseData = {
      user: userData,
      tokens: {
        accessToken,
        refreshToken
      }
    };

    return callback(messageHandler(
      "Login successful",
      true,
      SUCCESS,
      responseData
    ));
  } catch (error) {
    console.error('Login error:', error);
    return callback(messageHandler(
      "An error occurred while processing your request",
      false,
      INTERNAL_SERVER_ERROR,
      {}
    ));
  }
};

export const refreshTokenService = async (
  refreshToken: string,
  callback: (data: any) => void
) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (!decoded.success || !decoded.decoded) {
      return callback(messageHandler("Invalid refresh token", false, UNAUTHORIZED, {}));
    }

    // Find user with matching refresh token
    const user = await Auth.findOne({
      where: { 
        id: decoded.decoded.userId,
        refreshToken,
        refreshTokenExpiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return callback(messageHandler("Invalid or expired refresh token", false, UNAUTHORIZED, {}));
    }

    // Generate new tokens
    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateToken(
        { userId: user.id, email: user.email, type: 'access' },
        '15m'
      ),
      generateToken(
        { userId: user.id, email: user.email, type: 'refresh' },
        '30d'
      )
    ]);

    // Update refresh token in database
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);
    
    await user.update({
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt
    });

    return callback(messageHandler(
      "Token refreshed successfully",
      true,
      SUCCESS,
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    ));
  } catch (error) {
    console.error('Refresh token error:', error);
    return callback(messageHandler(
      "Failed to refresh token",
      false,
      UNAUTHORIZED,
      {}
    ));
  }
};

export const logoutService = async (
  refreshToken: string,
  callback: (data: any) => void
) => {
  try {
    // Clear the refresh token from database
    await Auth.update(
      { 
        refreshToken: null,
        refreshTokenExpiresAt: null 
      },
      { 
        where: {  
          refreshToken
        } 
      }
    );

    return callback(messageHandler(
      "Logged out successfully",
      true,
      SUCCESS,
      {}
    ));
  } catch (error) {
    console.error('Logout error:', error);
    return callback(messageHandler(
      "Failed to logout",
      false,
      INTERNAL_SERVER_ERROR,
      {}
    ));
  }
};

export const forgotPasswordService = async (
  email: string,
  callback: (data: any) => void
) => {
  try {
    // Check if user exists
    const user = await Auth.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return callback(messageHandler("User not found", false, NOT_FOUND, {}));
    }

    // Generate OTP
    const otp = generateVerificationCode(6);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Delete any existing OTPs for this email and purpose
    await Auth.destroy({
      where: {
        email,
        purpose: 'password_reset',
        isUsed: false
      }
    });

    // Save new OTP
    await Auth.create({
      email,
      otp,
      purpose: 'password_reset',
      expiresAt
    });

    // Send OTP email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset OTP - Vyntra',
      template: 'forgot-password-otp',
      context: {
        name: user.fullName,
        email,
        otp,
        expiryMinutes: 10,
        currentYear: new Date().getFullYear()
      }
    });

    if (!emailSent) {
      return callback(messageHandler(
        "Failed to send OTP email",
        false,
        INTERNAL_SERVER_ERROR,
        {}
      ));
    }

    return callback(messageHandler(
      "OTP sent successfully to your email",
      true,
      SUCCESS,
      { email }
    ));
  } catch (error) {
    console.error('Forgot password error:', error);
    return callback(messageHandler(
      "An error occurred while processing your request",
      false,
      INTERNAL_SERVER_ERROR,
      {}
    ));
  }
};

export const resetPasswordService = async (
  data: { email: string; otp: string; newPassword: string },
  callback: (data: any) => void
) => {
  const { email, otp, newPassword } = data;

  try {
    // Find valid OTP
    const otpRecord = await Auth.findOne({
      where: {
        email: email.toLowerCase().trim(),
        otp,
        purpose: 'password_reset',
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!otpRecord) {
      return callback(messageHandler(
        "Invalid or expired OTP",
        false,
        BAD_REQUEST,
        {}
      ));
    }

    // Find user
    const user = await Auth.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return callback(messageHandler("User not found", false, NOT_FOUND, {}));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear refresh tokens
    await user.update({
      password: hashedPassword,
      refreshToken: null,
      refreshTokenExpiresAt: null
    });

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Password Reset Successful - Vyntra',
      template: 'password-reset-success',
      context: {
        name: user.fullName,
        email,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        currentYear: new Date().getFullYear()
      }
    });

    return callback(messageHandler(
      "Password reset successfully",
      true,
      SUCCESS,
      {}
    ));
  } catch (error) {
    console.error('Reset password error:', error);
    return callback(messageHandler(
      "An error occurred while processing your request",
      false,
      INTERNAL_SERVER_ERROR,
      {}
    ));
  }
};