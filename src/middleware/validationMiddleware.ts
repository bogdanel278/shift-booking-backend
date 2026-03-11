import { body, param, ValidationChain } from 'express-validator';

/**
 * Validation rules for worker registration
 */
export const validateWorkerRegistration: ValidationChain[] = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),
];

/**
 * Validation rules for business registration
 */
export const validateBusinessRegistration: ValidationChain[] = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
];

/**
 * Validation rules for login
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for right-to-work verification submission
 */
export const validateRTWSubmission: ValidationChain[] = [
  body('verification_method')
    .notEmpty()
    .withMessage('Verification method is required')
    .isIn(['passport', 'visa', 'share_code'])
    .withMessage('Invalid verification method'),
  
  // Passport fields (conditional)
  body('passport_number')
    .if(body('verification_method').equals('passport'))
    .notEmpty()
    .withMessage('Passport number is required for passport verification')
    .isLength({ min: 6, max: 20 })
    .withMessage('Invalid passport number format'),
  
  body('passport_country')
    .if(body('verification_method').equals('passport'))
    .notEmpty()
    .withMessage('Passport country is required')
    .isLength({ min: 2, max: 3 })
    .withMessage('Use ISO country code (e.g., GBR, USA)'),
  
  body('passport_expiry_date')
    .if(body('verification_method').equals('passport'))
    .notEmpty()
    .withMessage('Passport expiry date is required')
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)')
    .custom((value) => {
      const expiry = new Date(value);
      const today = new Date();
      if (expiry < today) {
        throw new Error('Passport has expired');
      }
      return true;
    }),
  
  // Visa fields (conditional)
  body('visa_type')
    .if(body('verification_method').equals('visa'))
    .notEmpty()
    .withMessage('Visa type is required'),
  
  body('visa_expiry_date')
    .if(body('verification_method').equals('visa'))
    .notEmpty()
    .withMessage('Visa expiry date is required')
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)')
    .custom((value) => {
      const expiry = new Date(value);
      const today = new Date();
      if (expiry < today) {
        throw new Error('Visa has expired');
      }
      return true;
    }),
  
  // Share code fields (conditional)
  body('share_code')
    .if(body('verification_method').equals('share_code'))
    .notEmpty()
    .withMessage('Share code is required')
    .isLength({ min: 9, max: 20 })
    .withMessage('Invalid share code format'),
  
  body('date_of_birth')
    .if(body('verification_method').equals('share_code'))
    .notEmpty()
    .withMessage('Date of birth is required for share code verification')
    .isISO8601()
    .withMessage('Invalid date format (use YYYY-MM-DD)'),
];

/**
 * Validation rules for UUID parameters
 */
export const validateUUID = (paramName: string): ValidationChain[] => [
  param(paramName)
    .notEmpty()
    .withMessage(`${paramName} is required`)
    .isUUID()
    .withMessage(`Invalid ${paramName} format`),
];
