import { Request, Response, NextFunction } from 'express';
import { HTTP_HEADERS } from '@caryyon/core';
import { supabase } from '../lib/supabase';
import { createHash } from 'crypto';

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
 * Hash API key for secure comparison
 */
const hashApiKey = (key: string): string => {
  return createHash('sha256').update(key).digest('hex');
};

/**
 * API key authentication middleware
 * Looks up API key in database and attaches user to request
 */
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.header(HTTP_HEADERS.API_KEY);

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: `Missing ${HTTP_HEADERS.API_KEY} header`,
    });
    return;
  }

  try {
    // Hash the provided API key
    const keyHash = hashApiKey(apiKey);

    // Look up API key in database
    const { data: apiKeyRecord, error } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('key_hash', keyHash)
      .single();

    if (error || !apiKeyRecord) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
      return;
    }

    // Update last_used timestamp asynchronously (don't wait for it)
    void supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', apiKeyRecord.id)
      .then((result) => {
        if (result.error) {
          console.error('Failed to update API key last_used:', result.error);
        }
      });

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: apiKeyRecord.user_id,
    };
    (req as AuthenticatedRequest).authenticated = true;

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to authenticate API key',
    });
  }
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
 * DEPRECATED: Use authenticateSupabase or authenticateApiKey instead for multi-tenancy security
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.header(HTTP_HEADERS.API_KEY);

  if (apiKey) {
    try {
      const keyHash = hashApiKey(apiKey);
      const { data: apiKeyRecord } = await supabase
        .from('api_keys')
        .select('user_id')
        .eq('key_hash', keyHash)
        .single();

      if (apiKeyRecord) {
        (req as AuthenticatedRequest).user = {
          id: apiKeyRecord.user_id,
        };
        (req as AuthenticatedRequest).authenticated = true;
      }
    } catch {
      // Silently fail for optional auth
    }
  }

  next();
};
