import { init } from '@paralleldrive/cuid2';

/**
 * Generate a CUID (Collision-resistant Unique Identifier)
 * Used for all entity IDs in Lattice
 */
const createId = init({
  length: 24,
});

export const generateId = (): string => {
  return createId();
};

/**
 * Generate a trace ID for request correlation
 */
export const generateTraceId = (): string => {
  return createId();
};

/**
 * Validate if a string is a valid CUID format
 */
export const isValidId = (id: string): boolean => {
  // CUIDs are lowercase alphanumeric strings
  return /^[a-z0-9]{24}$/.test(id);
};
