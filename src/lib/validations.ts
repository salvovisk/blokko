import { z } from 'zod';

// Block content validation helper
function validateBlockContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content);

    // Must be an array
    if (!Array.isArray(parsed)) {
      return false;
    }

    // Limit to 100 blocks max
    if (parsed.length > 100) {
      return false;
    }

    // Validate each block has required structure
    for (const block of parsed) {
      if (typeof block !== 'object' || block === null) {
        return false;
      }
      if (!block.id || typeof block.id !== 'string') {
        return false;
      }
      if (!block.type || typeof block.type !== 'string') {
        return false;
      }
      // Validate type is one of the allowed types
      if (!['HEADER', 'PRICES', 'TEXT', 'TERMS'].includes(block.type)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

// Auth validations
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// Quote validations
export const createQuoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  content: z.string()
    .max(1048576, 'Content too large (max 1MB)')
    .refine(validateBlockContent, 'Invalid block structure'),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']).default('draft'),
});

export const updateQuoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional(),
  content: z.string()
    .max(1048576, 'Content too large')
    .refine(validateBlockContent, 'Invalid block structure')
    .optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
});

// Template validations
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  content: z.string()
    .max(1048576, 'Content too large (max 1MB)')
    .refine(validateBlockContent, 'Invalid block structure'),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  content: z.string()
    .max(1048576, 'Content too large')
    .refine(validateBlockContent, 'Invalid block structure')
    .optional(),
});

// User profile validations
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  // Email changes removed for security - requires verification flow
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
});

// Helper function to validate and return typed data
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errorMessage };
}
