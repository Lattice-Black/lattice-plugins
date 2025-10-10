import { Request, Response, NextFunction } from 'express';
import { HTTP_HEADERS } from '@lattice/core';
import { env } from '../lib/env';
import { supabase } from '../lib/supabase';

/**
 * Extended request type with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
  authenticated?: boolean;
}

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
 * Supabase JWT authentication middleware
 * Requires a valid Supabase JWT token in the Authorization header
 */
export const authenticateSupabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      return;
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: data.user.id,
      email: data.user.email,
      ...data.user.user_metadata,
    };

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify authentication token',
    });
  }
};

/**
 * Optional Supabase authentication - doesn't reject requests without auth
 */
export const optionalSupabaseAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const { data } = await supabase.auth.getUser(token);

      if (data.user) {
        (req as AuthenticatedRequest).user = {
          id: data.user.id,
          email: data.user.email,
          ...data.user.user_metadata,
        };
        (req as AuthenticatedRequest).authenticated = true;
      }
    } catch {
      // Silently fail for optional auth
    }
  }

  next();
};

/**
 * Optional authentication - doesn't reject requests without auth
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const apiKey = req.header(HTTP_HEADERS.API_KEY);

  if (apiKey === env.LATTICE_API_KEY) {
    (req as AuthenticatedRequest).authenticated = true;
  }

  next();
};
