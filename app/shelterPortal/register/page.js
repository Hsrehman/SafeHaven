'use client'
import Script from 'next/script'
import { shelterFormQuestions } from '@/app/utils/shelterFormQuestions'
import { validateField, validateForm } from '@/app/utils/shelterFormValidation'
import PlacesAutocomplete from '@/app/components/PlacesAutocomplete'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ClipboardList, Send, Mail } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import debounce from 'lodash/debounce'
import { useState, useEffect, useRef } from 'react'
import logger from '@/app/utils/logger'
import { sanitizeData } from '@/app/utils/sanitizer'

const fadeIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

const ErrorMessage = ({ error }) => (
  <AnimatePresence>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-red-500 text-sm mt-1 ml-2"
      >
        {error}
      </motion.p>
    )}
  </AnimatePresence>
)

const FormField = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  formData,
  handleChange,
  emailAvailable,
  passwordStrength,
  errors,
  provider,
}) => {
  const baseStyle =
    'w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82C4] focus:border-[#1A5276] transition-all duration-300 bg-gray-50 text-[#1F3A52]'
  const baseStyleNoFocus = 
    'w-full px-5 py-3 border rounded-xl focus:outline-none transition-all duration-300 bg-gray-50 text-[#1F3A52]'
  const validStyle = 'border-gray-200 hover:border-purple-300'
  const getFieldStyle = () => {
    if (field.id === 'email' && emailAvailable === false)
      return `${baseStyle} border-yellow-400 transform transition-all duration-300 hover:scale-[1.01]`
    return `${field.type === 'password' ? baseStyleNoFocus : baseStyle} ${
      error ? 'border-red-500 bg-red-50' : validStyle
    } transform transition-all duration-300 hover:scale-[1.01]`
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'password':
      const isValidEmail = field.id === 'email' && validateField(field, value).isValid
      const getColorValue = () => {
        if (!passwordStrength || field.id !== 'password') return '#d1d5db'
        if (passwordStrength.color === 'red') return '#ff4444'
        if (passwordStrength.color === 'orange') return '#ff9933'
        if (passwordStrength.color === 'green') return '#33ff33'
        if (passwordStrength.color === 'emerald') return '#00ff99'
        return '#d1d5db'
      }
      const getMeterPositions = () => {
        if (!passwordStrength) return { topWidth: 0, rightHeight: 0, bottomWidth: 0, leftHeight: 0 }
        const percentage = (passwordStrength.score / 6) * 100
        const topWidth = percentage <= 25 ? percentage * 4 : 100
        const rightHeight = percentage <= 25 ? 0 : percentage <= 50 ? (percentage - 25) * 4 : 100
        const bottomWidth = percentage <= 50 ? 0 : percentage <= 75 ? (percentage - 50) * 4 : 100
        const leftHeight = percentage <= 75 ? 0 : (percentage - 75) * 4
        return { topWidth, rightHeight, bottomWidth, leftHeight }
      }
      const meterPositions = getMeterPositions()
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {field.id === 'password' && provider === 'google' ? null : (
            <div className="relative">
              {field.id === 'password' && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div
                    className="absolute inset-0 rounded-xl overflow-hidden"
                    style={{
                      border: `2px solid ${getColorValue()}`,
                      boxShadow: `0 0 20px ${getColorValue()}, inset 0 0 15px ${getColorValue()}, 0 0 30px ${getColorValue()}20`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-gray-50"
                      style={{
                        clipPath: field.id === 'password' ? `polygon(
                          0 0, 
                          ${meterPositions.topWidth}% 0, 
                          ${meterPositions.topWidth}% 100%, 
                          ${meterPositions.rightHeight < 100 ? meterPositions.topWidth : 100}% ${
                            meterPositions.rightHeight
                          }%, 
                          ${meterPositions.bottomWidth < 100 ? 100 - meterPositions.bottomWidth : 0}% 100%, 
                          0 ${meterPositions.leftHeight < 100 ? 100 : 100 - meterPositions.leftHeight}%
                        )` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    ></div>
                  </div>
                </div>
              )}
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={value || ''}
                onChange={e => onChange(field.id, e.target.value)}
                onBlur={() => onBlur(field.id)}
                disabled={field.id === 'email' && provider === 'google'}
                className={`${getFieldStyle()} relative z-10`}
              />
            </div>
          )}
          {field.id === 'email' && emailAvailable === false && (
            <p className="text-yellow-600 text-sm mt-1 ml-2">Email already registered</p>
          )}
          {field.id === 'email' && emailAvailable === true && isValidEmail && (
            <p className="text-green-600 text-sm mt-1 ml-2">Email available</p>
          )}
          {field.id === 'password' && passwordStrength && (
            <ul className="text-sm space-y-1 mt-6">
              {passwordStrength.criteria.map((c, i) => (
                <li key={i} className={c.met ? 'text-green-600' : 'text-gray-600'}>
                  ✓ {c.label}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )
    case 'address':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <PlacesAutocomplete
            value={value || ''}
            onChange={newValue => onChange(field.id, newValue)}
            onSelect={location => {
              onChange(field.id, location.address)
              onChange(`${field.id}_coordinates`, {
                lat: location.latitude,
                lng: location.longitude,
              })
            }}
            error={error}
          />
        </motion.div>
      )
    case 'select':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <select
            value={value || ''}
            onChange={e => onChange(field.id, e.target.value)}
            onBlur={() => onBlur(field.id)}
            className={getFieldStyle()}
          >
            <option value="">Select...</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </motion.div>
      )
    case 'radio':
      return (
        <motion.div className="space-y-3">
          {field.options.map((opt, index) => (
            <motion.label
              key={opt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              <input
                type="radio"
                value={opt}
                checked={value === opt}
                onChange={e => onChange(field.id, e.target.value)}
                onBlur={() => onBlur(field.id)}
                className="w-5 h-5 text-[#3B82C4]"
              />
              <span className="ml-3 text-gray-700">{opt}</span>
            </motion.label>
          ))}
        </motion.div>
      )
    case 'checkbox-group':
      return (
        <motion.div className="space-y-3">
          {field.options.map((opt, index) => (
            <motion.label
              key={opt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              <input
                type="checkbox"
                checked={(value || []).includes(opt)}
                onChange={e => {
                  const currentValues = value || []
                  const newValues = e.target.checked
                    ? [...currentValues, opt]
                    : currentValues.filter(v => v !== opt)
                  onChange(field.id, newValues)
                }}
                className="w-5 h-5 text-[#3B82C4]"
              />
              <span className="ml-3 text-gray-700">{opt}</span>
            </motion.label>
          ))}
        </motion.div>
      )
    case 'textarea':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={e => onChange(field.id, e.target.value)}
            onBlur={() => onBlur(field.id)}
            className={`${getFieldStyle()} h-32`}
          />
        </motion.div>
      )
    case 'compound':
      const mainValue = formData?.[field.subQuestions[0].id] || ''
      const subValue = formData?.[field.subQuestions[1].id] || ''
      return (
        <motion.div className="space-y-4">
          <div className="space-y-3">
            {field.subQuestions[0].options.map((opt, index) => (
              <motion.label
                key={opt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
              >
                <input
                  type="radio"
                  value={opt}
                  checked={mainValue === opt}
                  onChange={e => handleChange(field.subQuestions[0].id, e.target.value)}
                  className="w-5 h-5 text-[#3B82C4]"
                />
                <span className="ml-3 text-gray-700">{opt}</span>
              </motion.label>
            ))}
            {errors[field.subQuestions[0].id] && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1 ml-2"
              >
                {errors[field.subQuestions[0].id]}
              </motion.p>
            )}
          </div>
          <AnimatePresence>
            {mainValue === 'Yes' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {field.subQuestions[1].type === 'number' ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      placeholder={field.subQuestions[1].placeholder}
                      value={subValue}
                      onChange={e => handleChange(field.subQuestions[1].id, e.target.value)}
                      className={getFieldStyle()}
                    />
                    {errors[field.subQuestions[1].id] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 ml-2"
                      >
                        {errors[field.subQuestions[1].id]}
                      </motion.p>
                    )}
                  </>
                ) : (
                  <>
                    <textarea
                      placeholder={field.subQuestions[1].placeholder}
                      value={subValue}
                      onChange={e => handleChange(field.subQuestions[1].id, e.target.value)}
                      className={`${getFieldStyle()} h-32`}
                    />
                    {errors[field.subQuestions[1].id] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 ml-2"
                      >
                        {errors[field.subQuestions[1].id]}
                      </motion.p>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )
    case 'checkbox':
      return (
        <motion.label
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
        >
          <input
            type="checkbox"
            checked={value || false}
            onChange={e => onChange(field.id, e.target.checked)}
            onBlur={() => onBlur(field.id)}
            className="w-5 h-5 text-[#3B82C4]"
          />
          <span className="ml-3 text-gray-700">{field.label}</span>
        </motion.label>
      )
    case 'tel':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <input
            type="tel"
            placeholder="07123456789"
            value={value || ''}
            onChange={e => {
              
              let numericValue = e.target.value.replace(/\D/g, '');
              
              
              if (numericValue) {
                
                if (numericValue.startsWith('07')) {
                  if (numericValue.length >= 3) {
                    const thirdDigit = parseInt(numericValue.charAt(2));
                    if (thirdDigit === 0) {
                      return; 
                    }
                  }
                  
                  if (numericValue.length <= 11) {
                    onChange(field.id, numericValue);
                  }
                } else if (numericValue.length <= 2) {
                  
                  onChange(field.id, numericValue);
                }
              } else {
                
                onChange(field.id, '');
              }
            }}
            onBlur={() => onBlur(field.id)}
            className={getFieldStyle()}
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength="11"
          />
          <p className="text-gray-500 text-sm ml-2">UK mobile number (e.g., 07123456789)</p>
        </motion.div>
      )
    default:
      return null
  }
}

const getPasswordStrength = password => {
  if (!password) return { score: 0, label: '', color: 'gray', criteria: [] }

  let score = 0
  const criteria = [
    { test: /.{8,}/, label: 'Minimum 8 characters' },
    { test: /[A-Z]/, label: 'One uppercase letter' },
    { test: /[a-z]/, label: 'One lowercase letter' },
    { test: /[0-9]/, label: 'One number' },
    { test: /[!@#$%^&*]/, label: 'One special character (!@#$%^&*)' },
  ]
  const met = criteria.map(c => c.test.test(password))
  
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1  
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[!@#$%^&*]/.test(password)) score += 1

  let label, color
  if (score <= 2) {
    label = 'Weak'
    color = 'red'
  } else if (score <= 4) {
    label = 'Medium'
    color = 'orange'
  } else if (score <= 5) {
    label = 'Strong'
    color = 'green'
  } else {
    label = 'Very Strong'
    color = 'emerald'
  }

  return {
    score,
    label,
    color,
    criteria: criteria.map((c, i) => ({ label: c.label, met: met[i] })),
  }
}

const shouldShowField = (question, formData) => {
  
  if (formData.authProvider === 'google') {
    const skipFields = ['adminName', 'email', 'password'];
    if (skipFields.includes(question.id)) {
      return false;
    }
  }

  const conditions = {
    
    customHours: () => formData.operatingHours === "Custom Hours",
    holidayHours: () => formData.openOnHolidays === "Limited hours (please specify)",

    
    medicalDetails: () => formData.hasMedical === "Yes",
    mentalHealthDetails: () => formData.hasMentalHealth === "Yes",

    
    maxFamilySize: () => formData.hasFamily === "Yes",

    
    nrpfDetails: () => formData.acceptNRPF === "In certain circumstances (please specify)",
    allowedReligions: () => formData.allowAllReligions === "No",

    
    referralDetails: () => formData.referralRoutes?.includes("Agency referrals") || 
                         formData.referralRoutes?.includes("Other (please specify)"),
    serviceCharges: () => formData.housingBenefitAccepted?.startsWith("Yes"),
  };

  
  return conditions[question.id] ? conditions[question.id]() : true;
};

const validateFormData = (formData, questions) => {
  const errors = {};
  const visibleQuestions = questions.filter(q => shouldShowField(q, formData));

  for (const question of visibleQuestions) {
    const validation = validateField(question, formData[question.id], formData);
    if (!validation.isValid && question.required) {
      errors[question.id] = validation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const initialized = useRef(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'weak', criteria: [] })

  useEffect(() => {
    if (initialized.current) return;

    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const provider = searchParams.get('provider')
    
    if (email && provider === 'google') {
      setFormData({
        email,
        adminName: name || '',
        isVerified: true,
        authProvider: 'google'
      });
      initialized.current = true;
    }
  }, [searchParams]);

  const getVisibleQuestions = () => shelterFormQuestions.filter(q => shouldShowField(q, formData))
  const currentQuestion = getVisibleQuestions()[step]
  const providerFromQuery = searchParams.get('provider');

  const checkEmail = async email => {
    if (!email) return
    const response = await fetch('/api/shelterAdmin/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    setEmailAvailable(data.available)
  }

  const debouncedCheckEmail = debounce(checkEmail, 500)

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }))
    if (id === 'email') debouncedCheckEmail(value)
    if (id === 'password') setPasswordStrength(getPasswordStrength(value))
    if (id === 'verificationCode') setVerificationCode(value)
  }

  const handleBlur = id => {
    const field = shelterFormQuestions.find(q => q.id === id)
    if (field) {
      const validation = validateField(field, formData[id])
      setErrors(prev => ({ ...prev, [id]: validation.isValid ? null : validation.error }))
    }
  }

  const handleNext = () => {
    const provider = searchParams.get('provider');

    if (provider === 'google') {
      if (currentQuestion.id === 'adminName' || 
          currentQuestion.id === 'email' || 
          currentQuestion.id === 'password') {
        if (step < getVisibleQuestions().length - 1) setStep(s => s + 1);
        return;
      }
    }

    const validation = validateField(currentQuestion, formData[currentQuestion.id], formData);
    if (!validation.isValid) {
      if (currentQuestion.type === 'compound') {
        const mainValue = formData[currentQuestion.subQuestions[0].id]
        const mainValidation = validateField(
          { ...currentQuestion.subQuestions[0], required: currentQuestion.required },
          mainValue
        )
        
        if (!mainValidation.isValid) {
          setErrors(prev => ({
            ...prev,
            [currentQuestion.subQuestions[0].id]: 'Please select an option'
          }))
          return
        }
        
        if (mainValue === 'Yes') {
          const subValue = formData[currentQuestion.subQuestions[1].id]
          const subValidation = validateField(
            { ...currentQuestion.subQuestions[1], required: true },
            subValue
          )
          if (!subValidation.isValid) {
            setErrors(prev => ({
              ...prev,
              [currentQuestion.subQuestions[1].id]: subValidation.error || 'This field is required'
            }))
            return
          }
        }
      } else {
        setErrors(prev => ({ ...prev, [currentQuestion.id]: validation.error }))
      }
      return
    }

    if (currentQuestion.id === 'password' && passwordStrength.score < 3) {
      setErrors(prev => ({ 
        ...prev, 
        password: 'Password is too weak. Please meet all the criteria shown below.' 
      }))
      return
    }

    if (currentQuestion.id === 'email' && !emailAvailable) return
    if (step < getVisibleQuestions().length - 1) setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    const questions = getVisibleQuestions();
    const { isValid, errors: validationErrors } = validateFormData(formData, questions);

    if (formData.authProvider === 'google') {
      
      delete validationErrors?.email;
      delete validationErrors?.password;
      delete validationErrors?.adminName;
    }

    if (Object.keys(validationErrors || {}).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.terms) {
        setStep(questions.length - 1);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const shelterData = {
        ...formData,
        status: 'pending',
        registrationDate: new Date().toISOString(),
        isGoogleUser: formData.authProvider === 'google',
        authProvider: formData.authProvider || 'email'  
      };

      logger.dev('Registration attempt:', sanitizeData(shelterData));
      
      const response = await fetch('/api/shelterAdmin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shelterData),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || 'Registration failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      if (formData.authProvider === 'google') {
        router.push('/shelterPortal/dashboard');
      } else {
        setShowVerification(true);
      }
    } catch (error) {
      logger.error(error, 'Registration Page - handleSubmit');
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Registration failed. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      setErrors({ verificationCode: 'Verification code is required' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/shelterAdmin/verify-email?email=${encodeURIComponent(
          formData.email
        )}&token=${encodeURIComponent(verificationCode)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      const data = await response.json()
      if (response.ok) {
        alert('Email verified successfully! Please log in to receive your OTP.')
        router.push('/shelterPortal/login')
      } else {
        setErrors({ verificationCode: data.message || 'Invalid or expired code' })
      }
    } catch (error) {
      setErrors({ verificationCode: 'Verification failed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendVerification = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/shelterAdmin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('New verification code has been sent to your email');
    } catch (error) {
      setErrors({ verificationCode: error.message || 'Failed to resend verification code' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion && !showVerification) return null

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
        strategy="lazyOnload"
      />
      <main className="flex-grow bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3B82C4] to-[#1A5276]">
              Register Your Shelter
            </h1>
            <p className="mt-4 text-lg text-gray-600">Join our network of safe spaces</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-[#3B82C4]">
                  <ClipboardList className="w-5 h-5" />
                  <span className="font-medium">Registration Progress</span>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-[#D3E0EA] rounded-full overflow-hidden">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] rounded-full"
                      initial={{ width: '0%' }}
                      animate={{
                        width: `${
                          showVerification ? 100 : ((step + 1) / getVisibleQuestions().length) * 100
                        }%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span className="font-medium">
                      {showVerification
                        ? 'Final Step'
                        : `Question ${step + 1} of ${getVisibleQuestions().length}`}
                    </span>
                    <span className="font-medium">
                      {showVerification
                        ? '100'
                        : Math.round(((step + 1) / getVisibleQuestions().length) * 100)}
                      % completed
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {!showVerification ? (
                    <motion.div
                      key={step}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={fadeIn}
                      className="mb-8"
                    >
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                        {currentQuestion.question}{' '}
                        {currentQuestion.required && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-pink-500 ml-1 inline-block"
                          >
                            *
                          </motion.span>
                        )}
                      </h2>
                      <FormField
                        field={currentQuestion}
                        value={formData[currentQuestion.id]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors[currentQuestion.id]}
                        formData={formData}
                        handleChange={handleChange}
                        emailAvailable={emailAvailable}
                        passwordStrength={passwordStrength}
                        errors={errors}
                        provider={providerFromQuery}
                      />
                      <ErrorMessage error={errors[currentQuestion.id]} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="verify"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={fadeIn}
                      className="mb-8"
                    >
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                        Enter Your Verification Code
                      </h2>
                      <div className="space-y-2">
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="Enter the code from your email"
                            value={verificationCode}
                            onChange={e => handleChange('verificationCode', e.target.value)}
                            className="w-full px-5 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82C4] focus:border-[#1A5276] transition-all duration-300 bg-gray-50 text-[#1F3A52]"
                          />
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-[#3B82C4] transition-colors duration-200" />
                        </div>
                        <ErrorMessage error={errors.verificationCode} />
                      </div>
                      <button
                        onClick={handleResendVerification}
                        disabled={isSubmitting}
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50"
                      >
                        Resend verification code
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between mt-10 pt-6 border-t border-gray-100"
                >
                  {!showVerification ? (
                    <>
                      <motion.button
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 0}
                        whileHover={step !== 0 ? { scale: 1.02, x: -5 } : {}}
                        whileTap={step !== 0 ? { scale: 0.98 } : {}}
                        className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                          step === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </motion.button>
                      {step === getVisibleQuestions().length - 1 ? (
                        <motion.button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !formData.terms}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center px-8 py-3 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white rounded-xl font-medium hover:from-[#1F6A91] hover:to-[#0C374A] hover:shadow-lg transition-all duration-200 ${
                            isSubmitting || !formData.terms ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center"
                            >
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Submitting...
                            </motion.span>
                          ) : (
                            <>
                              <span>Submit Registration</span>
                              <Send className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={handleNext}
                          disabled={currentQuestion.id === 'email' && emailAvailable !== true}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center px-8 py-3 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white rounded-xl font-medium hover:from-[#1F6A91] hover:to-[#0C374A] hover:shadow-lg transition-all duration-200 ${
                            currentQuestion.id === 'email' && emailAvailable !== true
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <span>Next</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <motion.button
                      onClick={handleVerify}
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center px-8 py-3 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white rounded-xl font-medium hover:from-[#1F6A91] hover:to-[#0C374A] hover:shadow-lg transition-all duration-200 mx-auto ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Verifying...
                        </motion.span>
                      ) : (
                        <>
                          <span>Verify Email</span>
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
