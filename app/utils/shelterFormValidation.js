export const OPTIONAL_FIELDS = {
  organizationName: true,
  customHours: true,
  medicalDetails: true,
  mentalHealthDetails: true,
  nrpfDetails: true,
  referralDetails: true,
  holidayHours: true,
  maxAge: true
};

const VALIDATION_RULES = {
  text: value => typeof value === 'string' && value.length >= 2 && /^[A-Za-z\s-]{2,50}$/.test(value),
  email: value => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
  password: value => {
    
    const minLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  },
  tel: value => {
    
    const cleanPhone = value.replace(/\D/g, '');
    return /^(\+44|0)[7-9]\d{9}$/.test(cleanPhone);
  },
  address: (value, formData) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      return value.address && value.address.trim().length > 0;
    }
    return false;
  },
  number: value => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },
  select: value => value && value.trim().length > 0 && value !== 'Select...',
  radio: value => value && value.trim().length > 0,
  'checkbox-group': value => Array.isArray(value) && value.length > 0,
  textarea: value => !value || value.trim().length >= 10,
};

const ERROR_MESSAGES = {
  text: 'Please enter valid text (letters only, minimum 2 characters)',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
  tel: 'Please enter a valid UK phone number (e.g., 07123456789)',
  address: 'Please enter a valid address',
  number: 'Please enter a valid number greater than 0',
  select: 'Please select an option',
  radio: 'Please select an option',
  'checkbox-group': 'Please select at least one option',
  textarea: 'Please provide more details (minimum 10 characters)',
  required: 'This field is required'
};

export const validateField = (field, value, formData = {}) => {
  if (!value && !OPTIONAL_FIELDS[field.id]) {
    return { isValid: false, error: ERROR_MESSAGES.required };
  }

  if (!value && OPTIONAL_FIELDS[field.id]) {
    return { isValid: true };
  }

  const validationRule = VALIDATION_RULES[field.type];
  if (!validationRule) return { isValid: true };

  const isValid = validationRule(value, formData);
  return {
    isValid,
    error: isValid ? null : ERROR_MESSAGES[field.type]
  };
};

export const validateForm = (formData, questions) => {
  const errors = {};
  let isValid = true;

  questions.forEach(question => {
    const validation = validateField(question, formData[question.id], formData);
    if (!validation.isValid) {
      errors[question.id] = validation.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};