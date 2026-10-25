import { Request, Response } from "express";
import { registerService, loginService, refreshTokenService, logoutService, getProfileService } from "../../services/users/authService.js";
import { LoginRequest, RegisterRequest, RefreshTokenRequest } from "../../types/users/auth.js";
import { asyncHandler, sendResponse } from "../../utils/index.js";

export const registerController = asyncHandler(async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  sendResponse(res, await registerService(req.body));
});

export const loginController = asyncHandler(async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  sendResponse(res, await loginService(req.body));
});

export const refreshTokenController = asyncHandler(async (req: Request<{}, {}, RefreshTokenRequest>, res: Response) => {
  sendResponse(res, await refreshTokenService(req.body));
});

// req.user is always set here because these routes run the verify middleware first
export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, await logoutService(req.user!.id));
});

export const profileController = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, await getProfileService(req.user!.id));
});
