import type { DecodedToken } from '../utils/token.js';

declare global {
  namespace Express {
    interface Request {
      // Set by the verify middleware
      user?: DecodedToken;
    }
  }
}

export {};
