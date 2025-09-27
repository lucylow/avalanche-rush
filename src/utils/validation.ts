import * as yup from 'yup';

// Character name validation schema
export const characterNameSchema = yup.object({
  name: yup
    .string()
    .required('Character name is required')
    .min(2, 'Character name must be at least 2 characters')
    .max(20, 'Character name must be less than 20 characters')
    .matches(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Character name can only contain letters, numbers, spaces, hyphens, and underscores'
    )
    .test('no-profanity', 'Character name contains inappropriate content', (value) => {
      // Basic profanity filter - in production, use a more sophisticated service
      const profanityWords = ['badword1', 'badword2']; // Replace with actual profanity list
      return !profanityWords.some(word => value?.toLowerCase().includes(word));
    })
});

// Quest description validation schema
export const questDescriptionSchema = yup.object({
  description: yup
    .string()
    .required('Quest description is required')
    .min(10, 'Quest description must be at least 10 characters')
    .max(500, 'Quest description must be less than 500 characters')
    .test('no-scripts', 'Quest description cannot contain scripts', (value) => {
      // Prevent script injection
      const scriptPattern = /<script|javascript:|on\w+\s*=/i;
      return !scriptPattern.test(value || '');
    })
});

// User input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

// Email validation
export const emailSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
});

// Wallet address validation
export const walletAddressSchema = yup.object({
  address: yup
    .string()
    .required('Wallet address is required')
    .matches(
      /^0x[a-fA-F0-9]{40}$/,
      'Please enter a valid Ethereum wallet address'
    )
});

// Transaction amount validation
export const transactionAmountSchema = yup.object({
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .max(1000000, 'Amount is too large')
    .test('decimal-places', 'Amount can have at most 18 decimal places', (value) => {
      if (!value) return true;
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      return decimalPlaces <= 18;
    })
});

// Game score validation
export const gameScoreSchema = yup.object({
  score: yup
    .number()
    .required('Score is required')
    .integer('Score must be a whole number')
    .min(0, 'Score cannot be negative')
    .max(999999999, 'Score is too large')
});

// Achievement validation
export const achievementSchema = yup.object({
  name: yup
    .string()
    .required('Achievement name is required')
    .min(3, 'Achievement name must be at least 3 characters')
    .max(50, 'Achievement name must be less than 50 characters')
    .matches(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Achievement name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
  description: yup
    .string()
    .required('Achievement description is required')
    .min(10, 'Achievement description must be at least 10 characters')
    .max(200, 'Achievement description must be less than 200 characters')
});

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    if (requests.length === 0) return 0;
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }
}

// XSS protection
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// SQL injection protection (for any database queries)
export const sanitizeForDatabase = (input: string): string => {
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .trim();
};

// File upload validation
export const fileUploadSchema = yup.object({
  file: yup
    .mixed()
    .required('File is required')
    .test('file-size', 'File size must be less than 5MB', (value) => {
      return value && value.size <= 5 * 1024 * 1024;
    })
    .test('file-type', 'Only image files are allowed', (value) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      return value && allowedTypes.includes(value.type);
    })
});

// Validation error formatter
export const formatValidationError = (error: yup.ValidationError): string => {
  return error.errors.join(', ');
};

// Batch validation helper
export const validateBatch = async <T>(
  schema: yup.ObjectSchema<any>,
  data: T[]
): Promise<{ valid: T[]; invalid: { data: T; error: string }[] }> => {
  const valid: T[] = [];
  const invalid: { data: T; error: string }[] = [];

  for (const item of data) {
    try {
      await schema.validate(item, { abortEarly: false });
      valid.push(item);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        invalid.push({
          data: item,
          error: formatValidationError(error)
        });
      }
    }
  }

  return { valid, invalid };
};

export default {
  characterNameSchema,
  questDescriptionSchema,
  emailSchema,
  walletAddressSchema,
  transactionAmountSchema,
  gameScoreSchema,
  achievementSchema,
  fileUploadSchema,
  sanitizeInput,
  escapeHtml,
  sanitizeForDatabase,
  formatValidationError,
  validateBatch,
  RateLimiter
};
