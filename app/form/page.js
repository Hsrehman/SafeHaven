"use client";
import Script from 'next/script';
import { formQuestions } from "@/app/utils/formQuestions";
import {
  OPTIONAL_FIELDS,
  validateField,
  validateForm,
} from "@/app/utils/formValidation";
import { sanitizeData } from "@/app/utils/sanitizer";
import PlacesAutocomplete from "@/app/components/PlacesAutocomplete";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ClipboardList, Send } from "lucide-react";
import { useState, useEffect } from "react";
import logger from '@/app/utils/logger';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';

const fadeIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const shouldShowField = (field, formData) => {
  const conditions = {
    
    groupSize: () => formData.groupType && formData.groupType !== "Just myself",
    childrenCount: () => formData.groupType === "Myself and my family",

    
    curfew: () => formData.shelterType !== "Emergency (tonight)",
    communalLiving: () => formData.shelterType === "Short-term (few days/weeks)" || formData.shelterType === "Long-term",

    
    mentalHealthDetails: () => formData.mentalHealth === "Yes",
    substanceUseDetails: () => formData.substanceUse === "Yes",
    medicalDetails: () => formData.medicalConditions === "Yes",
    
    
    petDetails: () => formData.pets === "Yes",
    
    
    womenOnly: () => ["Female", "Non-binary", "Other", "Prefer not to say"].includes(formData.gender),
    lgbtqFriendly: () => formData.gender !== "Prefer not to say",
    
    
    supportWorkerDetails: () => formData.supportWorkers === "Yes",
  };

  return conditions[field.id] ? conditions[field.id]() : true;
};

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
);

const FormField = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  formData,
  handleChange,
  emailAvailable,
}) => {
  const baseStyle =
    "w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82C4] focus:border-[#1A5276] transition-all duration-300 bg-gray-50 text-[#1F3A52]";
  const errorStyle = "border-red-500 bg-red-50";
  const validStyle = "border-gray-200 hover:border-purple-300";
  const emailUnavailableStyle = "border-yellow-400 bg-yellow-50";

  const getFieldStyle = () => {
    if (field.type === 'email' && emailAvailable === false) {
      return `${baseStyle} ${emailUnavailableStyle}`;
    }
    return `${baseStyle} ${error ? errorStyle : validStyle}`;
  };

  switch (field.type) {
    case "text":
    case "email":
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            onBlur={() => onBlur(field.id)}
            className={`${getFieldStyle()} transform transition-all duration-300 hover:scale-[1.01]`}
          />
          {field.type === 'email' && value && (
            <>
              {emailAvailable === false && !error && (
                <p className="text-yellow-600 text-sm mt-1 ml-2">Email already registered</p>
              )}
              {emailAvailable === true && !error && (
                <p className="text-green-600 text-sm mt-1 ml-2">Email available</p>
              )}
            </>
          )}
        </motion.div>
      );
    case "tel":
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <input
            type="tel"
            placeholder="07123456789"
            value={value || ""}
            onChange={(e) => {
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
            className={`${getFieldStyle()} transform transition-all duration-300 hover:scale-[1.01]`}
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength="11"
          />
          <p className="text-gray-500 text-sm ml-2">UK mobile number (e.g., 07123456789)</p>
        </motion.div>
      );
    case "date":
    case "number":
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            onBlur={() => onBlur(field.id)}
            className={`${getFieldStyle()} transform transition-all duration-300 hover:scale-[1.01]`}
          />
        </motion.div>
      );

    case "address":
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <PlacesAutocomplete
            value={value || ""}
            onChange={(newValue) => onChange(field.id, newValue)}
            onSelect={(location) => {
              onChange(field.id, location.address);
              onChange(`${field.id}_coordinates`, {
                lat: location.latitude,
                lng: location.longitude,
              });
            }}
            error={error}
          />
        </motion.div>
      );

    case "select":
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <select
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            onBlur={() => onBlur(field.id)}
            className={`${getFieldStyle()} transform transition-all duration-300 hover:scale-[1.01]`}
          >
            <option value="">Select...</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </motion.div>
      );

    case "radio":
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
                onChange={(e) => onChange(field.id, e.target.value)}
                onBlur={() => onBlur(field.id)}
                className="w-5 h-5 text-[#3B82C4]"
              />
              <span className="ml-3 text-gray-700">{opt}</span>
            </motion.label>
          ))}
        </motion.div>
      );

    case "checkbox":
      return (
        <motion.label
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
        >
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(field.id, e.target.checked)}
            onBlur={() => onBlur(field.id)}
            className="w-5 h-5 text-[#3B82C4]"
          />
          <span className="ml-3 text-gray-700">{field.label}</span>
        </motion.label>
      );

    case "textarea":
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <textarea
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            onBlur={() => onBlur(field.id)}
            className={`${getFieldStyle()} h-32 transform transition-all duration-300 hover:scale-[1.01]`}
          />
        </motion.div>
      );

    case "compound":
      const radioValue = formData?.[field.subQuestions[0].id] || "";
      const numberValue = formData?.[field.subQuestions[1].id] || "";

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
                  checked={radioValue === opt}
                  onChange={(e) =>
                    handleChange(field.subQuestions[0].id, e.target.value)
                  }
                  className="w-5 h-5 text-purple-600"
                />
                <span className="ml-3 text-gray-700">{opt}</span>
              </motion.label>
            ))}
          </div>
          <AnimatePresence>
            {radioValue === "Yes" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="number"
                  min="0"
                  max="20"
                  placeholder={field.subQuestions[1].placeholder}
                  value={numberValue}
                  onChange={(e) =>
                    handleChange(field.subQuestions[1].id, e.target.value)
                  }
                  className={`${getFieldStyle()} transform transition-all duration-300 hover:scale-[1.01]`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );

    case "checkbox-group":
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex flex-col gap-3">
            {field.options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option);
                    } else {
                      const index = newValue.indexOf(option);
                      if (index > -1) {
                        newValue.splice(index, 1);
                      }
                    }
                    onChange(field.id, newValue);
                  }}
                  className="form-checkbox h-5 w-5 text-[#3B82C4] rounded border-gray-300 focus:ring-[#3B82C4]"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </motion.div>
      );

    default:
      return null;
  }
};

export default function FormPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formId, setFormId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'edit') {
      const storedQuestion = localStorage.getItem('editingQuestion');
      const storedFormData = localStorage.getItem('editingFormData');
      const storedFormId = localStorage.getItem('formId');
      
      if (storedQuestion && storedFormData) {
        try {
          const question = JSON.parse(storedQuestion);
          const previousData = JSON.parse(storedFormData);
          
          setIsEditMode(true);
          setEditingQuestion(question);
          setFormData(previousData);
          if (storedFormId) {
            setFormId(storedFormId);
          }
          
          
          const visibleQuestions = formQuestions.filter(q => shouldShowField(q, previousData));
          const questionIndex = visibleQuestions.findIndex(q => q.id === question.id);
          if (questionIndex !== -1) {
            setStep(questionIndex);
          }
        } catch (error) {
          console.error('Error parsing edit data:', error);
          router.push('/form/edit-answers');
        }
      } else {
        
        router.push('/form/edit-answers');
      }
    } else {
      
      setFormData({});
      setFormId(null);
      setStep(0);
    }
  }, [router]);

  const getVisibleQuestions = () =>
    formQuestions.filter((q) => shouldShowField(q, formData));
  const currentQuestion = getVisibleQuestions()[step];

  const checkEmail = async (email) => {
    if (!email) {
      setEmailAvailable(null);
      return;
    }

    
    if (isEditMode) {
      const storedData = localStorage.getItem('formData');
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.data.email === email) {
          setEmailAvailable(true);
          return;
        }
      } catch (error) {
        console.error('Error checking stored email:', error);
      }
    }

    
    const field = formQuestions.find(q => q.id === 'email');
    const validation = validateField(field, email);
    if (!validation.isValid) {
      setEmailAvailable(null);
      return; 
    }

    try {
      const response = await fetch('/api/userForm/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to check email availability');
      }

      const data = await response.json();
      
      setEmailAvailable(data.available);
      if (!data.available) {
        
        setErrors(prev => ({ ...prev, email: null }));
      } else {
        setErrors(prev => ({ ...prev, email: null }));
      }
    } catch (error) {
      logger.error(error, 'Form Page - checkEmail');
      setEmailAvailable(null);
      setErrors(prev => ({ ...prev, email: "Error checking email availability" }));
    }
  };

  const debouncedCheckEmail = debounce(checkEmail, 500);

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
    
    
    if (id === 'email') {
      setEmailAvailable(null); 
      setErrors(prev => ({ ...prev, email: null })); 
      if (value) {
        debouncedCheckEmail(value);
      }
      return;
    }
    
    
    const field = formQuestions.find((q) => q.id === id);
    if (field) {
      const validation = validateField(field, value);
      if (!validation.isValid) {
        setErrors((prev) => ({
          ...prev,
          [id]: validation.error,
        }));
      }
    }
  };

  const handleBlur = (id) => {
    const field = formQuestions.find((q) => q.id === id);
    if (field) {
      const validation = validateField(field, formData[id]);
      if (field.id === 'email') {
        
        if (formData[id] && !validation.isValid) {
          setErrors((prev) => ({
            ...prev,
            [id]: validation.error,
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          [id]: validation.isValid ? null : validation.error,
        }));
      }
    }
  };

  const handleNext = () => {
    const validation = validateField(currentQuestion, formData[currentQuestion.id]);
    
    
    if (currentQuestion.id === 'email') {
      const emailValue = formData[currentQuestion.id];
      
      
      if (!emailValue || emailValue.trim() === '') {
        if (step < getVisibleQuestions().length - 1) {
          setStep(s => s + 1);
        }
        return;
      }
      
      
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, [currentQuestion.id]: validation.error }));
        return;
      }
      
      if (!emailAvailable) {
        return;
      }
    } else {
      
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, [currentQuestion.id]: validation.error }));
        return;
      }
    }

    if (step < getVisibleQuestions().length - 1) {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    
    if (editingQuestion?.id === 'email' && formData.email && !emailAvailable) {
      setErrors(prev => ({
        ...prev,
        email: "Please use a different email address"
      }));
      return;
    }

    
    const completeFormData = formQuestions.reduce((acc, question) => {
      
      
      acc[question.id] = formData[question.id] !== undefined ? formData[question.id] : '';
      return acc;
    }, {});

    if (isEditMode) {
      setIsSubmitting(true);
      try {
        const startTime = performance.now();
        
        const response = await fetch("/api/userForm/submit-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Request-Time": new Date().toISOString(),
          },
          body: JSON.stringify({
            formData: {
              ...completeFormData,
              location_coordinates: formData.location_coordinates || null  
            },
            formId: formId
          }),
        });

        const data = await response.json();
        const requestDuration = performance.now() - startTime;

        logger.performance('Form Update', requestDuration);
        logger.dev('Network Information', {
          endpoint: "/api/userForm/submit-form",
          status: response.status,
          statusText: response.statusText
        });

        if (data.success) {
          const storedData = localStorage.getItem('formData');
          try {
            const existingData = JSON.parse(storedData);
            const updatedData = {
              timestamp: existingData.timestamp,
              data: {
                ...completeFormData,
                location_coordinates: formData.location_coordinates || null  
              },
              id: formId
            };
            localStorage.setItem('formData', JSON.stringify(updatedData));
            router.push('/form/edit-answers');
          } catch (error) {
            console.error('Error updating localStorage:', error);
            router.push('/form/edit-answers');
          }
        } else {
          throw new Error(data.message || "Failed to update form");
        }
      } catch (error) {
        logger.error(error, 'Form Update');
        alert(`Error updating form: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    
    const { isValid, errors: validationErrors } = validateForm(
      formData,
      getVisibleQuestions()
    );

    
    if (!isEditMode && formData.email && !emailAvailable) {
      setErrors(prev => ({
        ...prev,
        email: "Please use a different email address"
      }));
      return;
    }

    logger.dev('Form Submission Process', {
      formData: sanitizeData(formData),
      totalQuestions: getVisibleQuestions().length,
      validationStatus: { isValid, errors: validationErrors }
    });

    if (!isValid) {
      logger.dev('Validation Failed:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = performance.now();
      const response = await fetch("/api/userForm/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Time": new Date().toISOString(),
        },
        body: JSON.stringify({
          formData: completeFormData
        }),
      });

      const data = await response.json();
      const requestDuration = performance.now() - startTime;

      logger.performance('Form Submission', requestDuration);
      logger.dev('Network Information', {
        endpoint: "/api/userForm/submit-form",
        status: response.status,
        statusText: response.statusText
      });

      if (data.success) {
        logger.dev('Form Submission Success', {
          submissionId: data.id,
          timestamp: new Date().toISOString()
        });
        
        const submissionData = {
          timestamp: new Date().toISOString(),
          data: {
            ...completeFormData,
            location_coordinates: formData.location_coordinates || null  
          },
          id: data.id
        };
        localStorage.setItem('formData', JSON.stringify(submissionData));
        localStorage.setItem('formId', data.id);
        
        setFormData({});
        setFormId(null);
        setStep(0);
        setErrors({});
        router.push('/shelterPortal/shelterOptions');
      } else {
        throw new Error(data.message || "Form submission failed");
      }
    } catch (error) {
      logger.error(error, 'Form Submission');
      alert(`Error submitting form: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) return null;

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
              {isEditMode ? 'Edit Your Answer' : 'Find Your Safe Space'}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {isEditMode ? 'Update your response below' : 'We are here to help you find the right shelter for your needs'}
            </p>
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
                  <span className="font-medium">Application Progress</span>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-[#D3E0EA] rounded-full overflow-hidden">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${
                          ((step + 1) / getVisibleQuestions().length) * 100
                        }%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span className="font-medium">
                      Question {step + 1} of {getVisibleQuestions().length}
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        ((step + 1) / getVisibleQuestions().length) * 100
                      )}
                      % completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={fadeIn}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                      {currentQuestion.question}
                      {!OPTIONAL_FIELDS[currentQuestion.id] && (
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
                    />
                    <ErrorMessage error={errors[currentQuestion.id]} />
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between mt-10 pt-6 border-t border-gray-100"
                >
                  <motion.button
                    onClick={() => isEditMode ? router.push('/form/edit-answers') : setStep(s => s - 1)}
                    disabled={!isEditMode && step === 0}
                    whileHover={(!isEditMode && step !== 0) || isEditMode ? { scale: 1.02, x: -5 } : {}}
                    whileTap={(!isEditMode && step !== 0) || isEditMode ? { scale: 0.98 } : {}}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 
                    ${
                      !isEditMode && step === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Back to Questions' : 'Back'}
                  </motion.button>

                  {step === getVisibleQuestions().length - 1 || isEditMode ? (
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center px-8 py-3 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] 
                      text-white rounded-xl font-medium hover:from-[#1F6A91] hover:to-[#0C374A] hover:shadow-lg transition-all duration-200
                      ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
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
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </motion.span>
                      ) : (
                        <>
                          <span>{isEditMode ? 'Save Changes' : 'Submit Application'}</span>
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleNext}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] 
                    text-white rounded-xl font-medium hover:from-[#1F6A91] hover:to-[#0C374A] hover:shadow-lg transition-all duration-200"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
