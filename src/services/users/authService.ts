import Auth from "../../schemas/users/authSchema.js";
import { generateAccessToken, generateRefreshToken, getTokenExpiry, verifyToken, verifyPassword, hashPassword, hashToken, messageHandler } from "../../utils/index.js"
import { SUCCESS, CREATED, UNAUTHORIZED, NOT_FOUND, CONFLICT } from "../../constants/statusCode.js"
import { RegisterRequest, LoginRequest, RefreshTokenRequest, UserResponse, AuthTokens } from "../../types/users/auth.js"

// Never return the model itself: it holds the password and refresh token hashes
const toUserResponse = (user: Auth): UserResponse => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt
});

// Issues a new token pair; storing only the new refresh token's hash invalidates the previous one
const issueTokens = async (user: Auth): Promise<AuthTokens> => {
  const payload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await user.update({ refreshToken: hashToken(refreshToken), refreshTokenExpiresAt: getTokenExpiry(refreshToken) });

  return { accessToken, refreshToken };
};

export const registerService = async ({ email, password }: RegisterRequest) => {
  const existingUser = await Auth.findOne({ where: { email } });
  if (existingUser) {
    return messageHandler("Email already registered", false, CONFLICT);
  }

  const user = await Auth.create({ email, password: await hashPassword(password) });
  const tokens = await issueTokens(user);

  return messageHandler("Registration successful", true, CREATED, { ...tokens, user: toUserResponse(user) });
};

export const loginService = async ({ email, password }: LoginRequest) => {
  const user = await Auth.findOne({ where: { email } });

  // Same message for an unknown email and a wrong password, so emails can't be probed
  if (!user || !(await verifyPassword(password, user.password))) {
    return messageHandler("Invalid credentials", false, UNAUTHORIZED);
  }

  const tokens = await issueTokens(user);

  return messageHandler("Login successful", true, SUCCESS, { ...tokens, user: toUserResponse(user) });
};

export const refreshTokenService = async ({ refreshToken }: RefreshTokenRequest) => {
  const result = verifyToken(refreshToken, 'refresh');
  if (!result.success) {
    return messageHandler("Invalid or expired refresh token", false, UNAUTHORIZED);
  }

  // Only the most recently issued refresh token is accepted
  const user = await Auth.findByPk(result.decoded.id);
  if (!user || user.refreshToken !== hashToken(refreshToken)) {
    return messageHandler("Invalid or expired refresh token", false, UNAUTHORIZED);
  }

  const tokens = await issueTokens(user);

  return messageHandler("Token refreshed successfully", true, SUCCESS, tokens);
};

// Revokes the refresh token; the current access token stays valid until it expires
export const logoutService = async (userId: number) => {
  await Auth.update({ refreshToken: '', refreshTokenExpiresAt: null }, { where: { id: userId } });

  return messageHandler("Logout successful", true, SUCCESS);
};

export const getProfileService = async (userId: number) => {
  const user = await Auth.findByPk(userId);
  if (!user) {
    return messageHandler("User not found", false, NOT_FOUND);
  }

  return messageHandler("Profile retrieved successfully", true, SUCCESS, { user: toUserResponse(user) });
};
