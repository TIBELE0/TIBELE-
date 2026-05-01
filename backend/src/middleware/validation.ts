import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';
import { isStrongPassword, isValidHealthStudentMatricule } from '../utils/validators';

// Validation middleware that returns errors
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    res.status(400).json({
      message: validationErrors[0]?.msg || 'Validation error',
      errors: validationErrors,
    });
    return;
  }
  next();
};

// Auth validations
export const validateRegister = [
  body('email').isEmail().withMessage('Une adresse e-mail valide est requise').normalizeEmail(),
  body('password')
    .custom((value) => isStrongPassword(value))
    .withMessage('Le mot de passe doit contenir au moins 8 caracteres, 1 majuscule, 1 minuscule et 1 chiffre'),
  body('fullName').isLength({ min: 2 }).withMessage('Le nom complet doit contenir au moins 2 caracteres'),
  body('matricule')
    .custom((value) => isValidHealthStudentMatricule(value))
    .withMessage('Matricule invalide (MED/INF/PHAR + chiffres)'),
  body('school').isLength({ min: 2 }).withMessage('Ecole / Universite obligatoire'),
  body('major').isLength({ min: 2 }).withMessage('Filiere obligatoire'),
  body('category').optional().isIn(['student', 'professional', 'other']).withMessage('Categorie invalide'),
  body('profession').optional().isLength({ min: 2 }).withMessage('Profession ou specialite invalide'),
  body('studyYear').optional().isLength({ min: 1 }).withMessage('Annee d etude invalide'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Une adresse e-mail valide est requise').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .custom((value) => isStrongPassword(value))
    .withMessage('Le mot de passe doit contenir au moins 8 caracteres, 1 majuscule, 1 minuscule et 1 chiffre'),
];

export const validateProfileUpdate = [
  body('fullName').optional().isLength({ min: 2 }).withMessage('Nom complet invalide'),
  body('school').optional().isLength({ min: 2 }).withMessage('Ecole / Universite invalide'),
  body('studyYear').optional().isLength({ min: 1 }).withMessage('Annee d etude invalide'),
  body('major').optional().isLength({ min: 2 }).withMessage('Filiere invalide'),
];

// Pathology validations
export const validatePathologyCreate = [
  body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('shortDescription').isLength({ min: 10 }).withMessage('Short description must be at least 10 characters'),
  body('definition').isLength({ min: 20 }).withMessage('Definition must be at least 20 characters'),
  body('examinations').notEmpty().withMessage('Examinations field is required'),
  body('referentialDiagnosis').notEmpty().withMessage('Referential diagnosis field is required'),
  body('onSiteTreatment').notEmpty().withMessage('On site treatment field is required'),
  body('dischargeOrder').notEmpty().withMessage('Discharge order field is required'),
  body('prevention').notEmpty().withMessage('Prevention field is required'),
  body('isFree').isBoolean(),
];

export const validatePathologyUpdate = [
  body('title').optional().isLength({ min: 3 }),
  body('shortDescription').optional().isLength({ min: 10 }),
  body('definition').optional().isLength({ min: 20 }),
  body('isFree').optional().isBoolean(),
];

// Forum validations
export const validateTopicCreate = [
  body('title').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('content').isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
];

export const validateMessageCreate = [
  body('topicId').isMongoId().withMessage('Invalid topic ID'),
  body('content').isLength({ min: 2 }).withMessage('Content must be at least 2 characters'),
];

// Question validations
export const validateQuestionCreate = [
  body('pathology').isMongoId().withMessage('Invalid pathology ID'),
  body('questionText').isLength({ min: 5 }).withMessage('Question must be at least 5 characters'),
  body('type').isIn(['QCM', 'QCD']).withMessage('Type must be QCM or QCD'),
  body('options').isArray({ min: 2 }).withMessage('Question must have at least 2 options'),
  body('options.*.text').isLength({ min: 1 }).withMessage('Option text is required'),
  body('options.*.isCorrect').isBoolean().withMessage('isCorrect must be a boolean'),
];

export const validateAnswerSubmit = [
  body('questionId').isMongoId().withMessage('Invalid question ID'),
  body('answer').notEmpty().withMessage('Answer is required'),
];

// ID validation
export const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

export const validateSlug = [
  param('slug').isSlug().withMessage('Invalid slug format'),
];
