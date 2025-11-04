export const OPTIONAL_FIELDS = {
  fullName: true,
  email: true,
  phone: true,
  smoking: true,
  petDetails: true,
  supportWorkerDetails: true,
  additionalInfo: true,
  medicalConditions: true,
  dateOfBirth: true,
  gender: true,
  ethnicity: true,
  address: true,
  postcode: true,
  housingStatus: true,
  employmentStatus: true,
  benefits: true,
  foodNeeds: true,
  dietaryRequirements: true,
  allergies: true,
  householdSize: true,
  dependents: true,
  emergencyContact: true,
  referralSource: true,
  consent: true
};

const VALIDATION_RULES = {
  text: value => typeof value === 'string' && value.length >= 2 && /^[A-Za-z\s-]{2,50}$/.test(value),
  email: value => !value || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
  tel: value => {
    if (!value) return true;
    const cleanPhone = value.replace(/\D/g, '');
    return /^(\+44|0)[7-9]\d{9}$/.test(cleanPhone);
  },
  date: value => {
    if (!value) return false;
    const date = new Date(value);
    const today = new Date();
    
    if (isNaN(date)) return false;
    
    const age = today.getFullYear() - date.getFullYear();
    return age >= 16 && age <= 100;
  },
  select: value => value && value.trim().length > 0 && value !== 'Select...',
  number: value => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  },
  checkbox: value => value === true,
  radio: value => value && value.trim().length > 0,
  textarea: value => !value || value.trim().length >= 10,
  'checkbox-group': value => Array.isArray(value) && value.length > 0,
  address: value => typeof value === 'string' && value.trim().length >= 5
};

const ERROR_MESSAGES = {
  text: 'Please enter valid text (letters only, minimum 2 characters)',
  email: 'Please enter a valid email address (e.g., name@example.com)',
  tel: 'Please enter a valid UK phone number (e.g., 07123456789)',
  date: 'Please enter a valid date of birth (age must be between 16 and 120)',
  select: 'Please select an option from the list',
  number: 'Please enter a valid number',
  checkbox: 'This must be checked to continue',
  radio: 'Please select an option',
  textarea: 'Please provide more details (minimum 10 characters)',
  'checkbox-group': 'Please select at least one option',
  address: 'Please enter a valid address (minimum 5 characters)',
  required: 'This field is required'
};

export const validateField = (field, value) => {
  const isRequired = !OPTIONAL_FIELDS[field.id];
  
  if (!value && !isRequired) return { isValid: true };
  if (!value && isRequired) return { isValid: false, error: ERROR_MESSAGES.required };
  
  const validationRule = VALIDATION_RULES[field.type];
  if (!validationRule) return { isValid: true };
  
  const isValid = validationRule(value);
  return {
    isValid,
    error: isValid ? null : ERROR_MESSAGES[field.type]
  };
};

export const validateForm = (formData, questions) => {
  const errors = {};
  
  questions.forEach(question => {
    const validation = validateField(question, formData[question.id]);
    if (!validation.isValid) {
      errors[question.id] = validation.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};