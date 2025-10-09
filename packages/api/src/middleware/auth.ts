import { Request, Response, NextFunction } from 'express';
import { HTTP_HEADERS } from '@lattice/core';
import { env } from '../lib/env';

/**
 * API key authentication middleware
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  // Skip auth in development if no API key is set
  if (env.NODE_ENV === 'development' && !env.LATTICE_API_KEY) {
    next();
    return;
  }

  const apiKey = req.header(HTTP_HEADERS.API_KEY);

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: `Missing ${HTTP_HEADERS.API_KEY} header`,
    });
    return;
  }

  if (apiKey !== env.LATTICE_API_KEY) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
    return;
  }

  next();
};

/**
 * Optional authentication - doesn't reject requests without auth
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const apiKey = req.header(HTTP_HEADERS.API_KEY);

  if (apiKey === env.LATTICE_API_KEY) {
    (req as Request & { authenticated: boolean }).authenticated = true;
  }

  next();
};
