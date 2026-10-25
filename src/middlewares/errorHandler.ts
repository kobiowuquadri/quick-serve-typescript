import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { UniqueConstraintError } from 'sequelize';
import { AppError, messageHandler } from '../utils/index.js';
import { BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, UPLOAD_LIMIT_EXCEEDED } from '../constants/statusCode.js';

// Client errors raised by Express itself, e.g. malformed JSON or an oversized body
const isExposedHttpError = (err: unknown): err is { status: number; message: string } => {
  return typeof err === 'object' && err !== null && 'status' in err && 'expose' in err && err.expose === true;
};

export const notFound = (req: Request, res: Response) => {
  res.status(NOT_FOUND).json(messageHandler(`Route ${req.method} ${req.originalUrl} not found`, false, NOT_FOUND));
};

// Express only treats this as an error handler because it declares all four parameters
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(messageHandler(err.message, false, err.statusCode, err.data));
  }

  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? UPLOAD_LIMIT_EXCEEDED : BAD_REQUEST;
    return res.status(statusCode).json(messageHandler(`Upload error: ${err.message}`, false, statusCode));
  }

  // e.g. two requests registering the same email at the same time
  if (err instanceof UniqueConstraintError) {
    return res.status(CONFLICT).json(messageHandler('Resource already exists', false, CONFLICT));
  }

  if (isExposedHttpError(err)) {
    return res.status(err.status).json(messageHandler(err.message, false, err.status));
  }

  // Log the details, but never send them to the client
  console.error(err);
  res.status(INTERNAL_SERVER_ERROR).json(messageHandler('Something went wrong', false, INTERNAL_SERVER_ERROR));
};
