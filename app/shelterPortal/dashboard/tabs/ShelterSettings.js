'use client';

import { useState, useEffect, useMemo } from 'react';
import { shelterFormQuestions } from '@/app/utils/shelterFormQuestions';
import { validateField } from '@/app/utils/shelterFormValidation';
import PlacesAutocomplete from '@/app/components/PlacesAutocomplete';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Save, Edit2, Home, Clock, Users, Briefcase, Shield, AlertCircle, 
  CheckCircle, Building, Phone, MapPin, FileText, Heart, 
  Accessibility, PawPrint, DollarSign, Calendar, User, UserCheck, 
  Utensils, Stethoscope, Brain, ChevronDown, ChevronUp, X
} from 'lucide-react';
import logger from '@/app/utils/logger';

const ShelterSettings = ({ shelterData, userData, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [resetLocationInput, setResetLocationInput] = useState(false);

  useEffect(() => {
    if (shelterData) {
      
      logger.dev('Location data:', { location: shelterData.location });
      
      const filteredShelterData = Object.fromEntries(
        Object.entries(shelterData).filter(([key]) => 
          !['adminName', 'email', 'password', 'terms', 'infoAccuracy', 'contactConsent', '_id', 'isVerified', 'authProvider'].includes(key)
        )
      );
      
      const initialFormData = {
        ...filteredShelterData,
        location: filteredShelterData.location || { address: '', coordinates: { lat: null, lng: null } }
      };
      setFormData(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [shelterData]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  
  const shouldShowField = (question, formData) => {
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

  const fieldMappings = {
    shelterName: { path: 'shelterName', default: '' },
    organizationName: { path: 'organizationName', default: '' },
    location: { path: 'location', default: { address: '', coordinates: { lat: null, lng: null } } },
    maxCapacity: { path: 'maxCapacity', default: '' },
    accommodationTypes: { path: 'accommodationTypes', default: [] },
    accommodationType: { path: 'accommodationType', default: '' },
    operatingHours: { path: 'operatingHours', default: '' },
    customHours: { path: 'customHours', default: '' },
    maxStayLength: { path: 'maxStayLength', default: '' },
    openOnHolidays: { path: 'openOnHolidays', default: '' },
    holidayHours: { path: 'holidayHours', default: '' },
    accessibilityFeatures: { path: 'accessibilityFeatures', default: [] },
    minAge: { path: 'minAge', default: '' },
    maxAge: { path: 'maxAge', default: '' },
    genderPolicy: { path: 'genderPolicy', default: '' },
    lgbtqFriendly: { path: 'lgbtqFriendly', default: '' },
    hasFamily: { path: 'hasFamily', default: '' },
    maxFamilySize: { path: 'maxFamilySize', default: '' },
    petPolicy: { path: 'petPolicy', default: '' },
    homelessLinkRegistered: { path: 'homelessLinkRegistered', default: '' },
    localAuthorityFunding: { path: 'localAuthorityFunding', default: '' },
    housingJusticeMark: { path: 'housingJusticeMark', default: '' },
    housingBenefitAccepted: { path: 'housingBenefitAccepted', default: '' },
    serviceCharges: { path: 'serviceCharges', default: '' },
    weeklyCharge: { path: 'weeklyCharge', default: '' },
    acceptNRPF: { path: 'acceptNRPF', default: '' },
    nrpfDetails: { path: 'nrpfDetails', default: '' },
    localConnectionRequired: { path: 'localConnectionRequired', default: '' },
    referralRoutes: { path: 'referralRoutes', default: [] },
    referralDetails: { path: 'referralDetails', default: '' },
    allowAllReligions: { path: 'allowAllReligions', default: '' },
    allowedReligions: { path: 'allowedReligions', default: [] },
    foodType: { path: 'foodType', default: '' },
    dietaryOptions: { path: 'dietaryOptions', default: [] },
    hasMedical: { path: 'hasMedical', default: '' },
    medicalDetails: { path: 'medicalDetails', default: '' },
    hasMentalHealth: { path: 'hasMentalHealth', default: '' },
    mentalHealthDetails: { path: 'mentalHealthDetails', default: '' },
    additionalServices: { path: 'additionalServices', default: [] },
    specializedGroups: { path: 'specializedGroups', default: [] }
  };

  const getFieldValue = (fieldId) => {
    const mapping = fieldMappings[fieldId] || { path: fieldId, default: '' };
    if (fieldId === 'location') {
      return formData.location || mapping.default; 
    }
    const [parent, child] = mapping.path.split('.');
    return formData[parent ? parent : fieldId] || mapping.default;
  };

  const setFieldValue = (fieldId, value) => {
    const mapping = fieldMappings[fieldId] || { path: fieldId };
    const [parent, child] = mapping.path.split('.');
    setFormData(prev => ({
      ...prev,
      [parent || fieldId]: value
    }));
    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: null }));
  };

  const handleChange = (id, value) => {
    if (id === 'location') {
      
      let newAddress;
      let newCoordinates;
      
      if (typeof value === 'string') {
        
        newAddress = value;
        newCoordinates = formData.location_coordinates || { lat: null, lng: null };
      } else {
        
        newAddress = value.address;
        newCoordinates = {
          lat: value.coordinates?.lat || null,
          lng: value.coordinates?.lng || null
        };
      }
      
      setFormData(prev => ({
        ...prev,
        location: newAddress,
        location_coordinates: newCoordinates
      }));
    } else {
      setFieldValue(id, value);
    }
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const handleCheckboxChange = (id, option, checked) => {
    const mapping = fieldMappings[id];
    const currentValues = getFieldValue(id);
    const updatedValues = checked ? [...currentValues, option] : currentValues.filter(val => val !== option);
    setFieldValue(id, updatedValues);
  };

  const handleBlur = id => {
    const field = shelterFormQuestions.find(q => q.id === id);
    if (field) {
      const value = getFieldValue(id);
      const validation = validateField(field, value);
      setErrors(prev => ({ ...prev, [id]: validation.isValid ? null : validation.error }));
    }
  };

  const handleSubmit = async () => {
    if (!isEditing) return;

    if (!userData?.id || !userData?.shelterId) {
      setErrors(prev => ({ ...prev, submit: 'Missing user data. Please try logging in again.' }));
      return;
    }

    const validationErrors = {};
    const visibleQuestions = shelterFields.filter(q => shouldShowField(q, formData));
    
    visibleQuestions.forEach(field => {
      const value = getFieldValue(field.id);
      const validation = validateField(field, value);
      if (!validation.isValid) validationErrors[field.id] = validation.error;
    });

    if (Object.keys(validationErrors).length > 0) {
      
      logger.dev('Form validation failed:', { validationErrors });
      setErrors(validationErrors);
      return;
    }

    const dataToSubmit = {
      shelterId: userData.shelterId,
      ...Object.fromEntries(
        Object.entries(formData).filter(([key]) => 
          Object.keys(fieldMappings).includes(key) && 
          !['adminName', 'email', 'password', 'terms', 'infoAccuracy', 'contactConsent', '_id', 'isVerified', 'authProvider'].includes(key)
        )
      ),
      location: typeof formData.location === 'string' ? formData.location : formData.location?.address || '',
      location_coordinates: formData.location_coordinates || { lat: null, lng: null }
    };

    
    logger.dev('Submitting shelter update:', { dataToSubmit });
    setIsLoading(true);
    try {
      const response = await fetch('/api/shelterAdmin/update-shelter', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'X-User-Id': userData.id 
        },
        credentials: 'include',
        body: JSON.stringify(dataToSubmit)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to update shelter settings (${response.status})`);
      }

      logger.dev('Shelter update successful:', { status: response.status });
      setSuccessMessage('Shelter settings updated successfully');
      setOriginalData(formData);
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      logger.error(error, 'Shelter Settings Update');
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'An unexpected error occurred while saving changes. Please check the server logs.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
    setIsEditing(false);
    setResetLocationInput(prev => !prev);
  };

  const renderField = (field, icon) => {
    const baseInputStyle = `w-full px-4 py-2 rounded-lg transition-all duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-500`;
    const value = getFieldValue(field.id);

    return (
      <div key={field.id} className={`mb-4 ${field.id === 'location' && isEditing ? 'location-field-expanded mb-32' : ''}`}>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center`}>
          {icon && <span className="mr-2">{icon}</span>}
          {field.question}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1">
          {field.type === 'text' || field.type === 'tel' || field.type === 'number' ? (
            <input
              type={field.type}
              value={value || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              onBlur={() => handleBlur(field.id)}
              disabled={!isEditing}
              className={baseInputStyle}
              placeholder={field.placeholder}
            />
          ) : field.type === 'address' ? (
            <div className={`${!isEditing ? '' : 'mb-8'}`}>
              <PlacesAutocomplete
                value={formData.location || ''}
                onChange={(newValue) => handleChange('location', newValue)}
                onSelect={(location) => {
                  handleChange('location', {
                    address: location.address,
                    coordinates: {
                      lat: location.latitude,
                      lng: location.longitude
                    }
                  });
                  
                  const field = shelterFormQuestions.find(q => q.id === 'location');
                  if (field) {
                    const value = getFieldValue('location');
                    const validation = validateField(field, value);
                    setErrors(prev => ({ ...prev, location: validation.isValid ? null : validation.error }));
                  }
                }}
                isDisabled={!isEditing}
                error={errors[field.id]}
                reset={resetLocationInput}
              />
            </div>
          ) : field.type === 'select' ? (
            <select
              value={value || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              onBlur={() => handleBlur(field.id)}
              disabled={!isEditing}
              className={baseInputStyle}
            >
              <option value="">Select...</option>
              {field.options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={value || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              onBlur={() => handleBlur(field.id)}
              disabled={!isEditing}
              className={`${baseInputStyle} h-20`}
              placeholder={field.placeholder}
            />
          ) : field.type === 'radio' ? (
            <div className="space-y-1 mt-1">
              {field.options.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={!isEditing}
                    className="mr-2 h-4 w-4 text-blue-500"
                  />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
                </label>
              ))}
            </div>
          ) : field.type === 'checkbox-group' ? (
            <div className="space-y-1 mt-1">
              {field.options.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                    disabled={!isEditing}
                    className="mr-2 h-4 w-4 text-blue-500"
                  />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
        {errors[field.id] && <p className="mt-1 text-sm text-red-500">{errors[field.id]}</p>}
      </div>
    );
  };

  const shelterFields = shelterFormQuestions.filter(q => !['adminName', 'email', 'password', 'terms', 'infoAccuracy', 'contactConsent'].includes(q.id));
  const basicInfoFields = shelterFields.filter(q => ['shelterName', 'organizationName', 'location'].includes(q.id));
  const capacityFields = shelterFields.filter(q => ['maxCapacity', 'accommodationTypes', 'accommodationType'].includes(q.id));
  const operationalFields = shelterFields.filter(q => ['operatingHours', 'customHours', 'maxStayLength', 'openOnHolidays', 'holidayHours'].includes(q.id));
  const accessibilityFields = shelterFields.filter(q => ['accessibilityFeatures'].includes(q.id));
  const demographicFields = shelterFields.filter(q => ['minAge', 'maxAge', 'genderPolicy', 'lgbtqFriendly', 'hasFamily', 'maxFamilySize'].includes(q.id));
  const policyFields = shelterFields.filter(q => ['petPolicy', 'homelessLinkRegistered', 'localAuthorityFunding', 'housingJusticeMark', 'housingBenefitAccepted', 'serviceCharges', 'weeklyCharge', 'acceptNRPF', 'nrpfDetails', 'localConnectionRequired', 'referralRoutes', 'referralDetails', 'allowAllReligions', 'allowedReligions'].includes(q.id));
  const servicesFields = shelterFields.filter(q => ['foodType', 'dietaryOptions', 'hasMedical', 'medicalDetails', 'hasMentalHealth', 'mentalHealthDetails', 'additionalServices', 'specializedGroups'].includes(q.id));

  const sections = [
    { title: 'Basic Information', icon: <Building size={20} />, fields: basicInfoFields },
    { title: 'Capacity Information', icon: <Users size={20} />, fields: capacityFields },
    { title: 'Operational Hours', icon: <Clock size={20} />, fields: operationalFields },
    { title: 'Accessibility Features', icon: <Accessibility size={20} />, fields: accessibilityFields },
    { title: 'Demographic Policies', icon: <User size={20} />, fields: demographicFields },
    { title: 'Shelter Policies', icon: <Shield size={20} />, fields: policyFields },
    { title: 'Available Services', icon: <Briefcase size={20} />, fields: servicesFields },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Shelter Settings</h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your shelter's information and configurations</p>
        </div>
        <div className="flex space-x-4">
          {isEditing && (
            <button onClick={handleCancel} disabled={isLoading} className="px-6 py-2 rounded-lg flex items-center text-white font-medium bg-red-600 hover:bg-red-700 transition-colors duration-200">
              <X size={20} className="mr-2" /> Cancel
            </button>
          )}
          <button onClick={() => isEditing ? handleSubmit() : setIsEditing(true)} disabled={isLoading} className={`px-6 py-2 rounded-lg flex items-center text-white font-medium ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} transition-colors duration-200`}>
            {isEditing ? <><Save size={20} className="mr-2" /> Save Changes</> : <><Edit2 size={20} className="mr-2" /> Edit Settings</>}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-6 p-4 rounded-lg bg-gray-100 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
          <p className="text-gray-700">Saving shelter data...</p>
        </div>
      )}

      {successMessage && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-green-900' : 'bg-green-100'} flex items-center`}>
          <CheckCircle size={20} className={`mr-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          <p className={darkMode ? 'text-green-300' : 'text-green-800'}>{successMessage}</p>
        </div>
      )}

      {errors.submit && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-red-900' : 'bg-red-100'} flex items-center`}>
          <AlertCircle size={20} className={`mr-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <p className={darkMode ? 'text-red-300' : 'text-red-800'}>{errors.submit}</p>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, index) => {
          
          const visibleFields = useMemo(() => 
            section.fields.filter(field => shouldShowField(field, formData)), 
            [section.fields, formData]
          );

          
          if (visibleFields.length === 0) return null;

          return (
            <div 
              key={index} 
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden ${section.title === 'Basic Information' && expandedSections[section.title] && isEditing ? 'basic-info-expanded' : ''}`}
              style={section.title === 'Basic Information' && expandedSections[section.title] && isEditing ? {marginBottom: '100px'} : {}}
            >
              <button onClick={() => toggleSection(section.title)} className={`w-full p-4 flex items-center justify-between text-left ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'} transition-colors duration-200`}>
                <div className="flex items-center">
                  <span className="mr-2">{section.icon}</span>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                {expandedSections[section.title] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections[section.title] && (
                <div className={`p-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${section.title === 'Basic Information' && isEditing ? 'pb-24 mb-8' : ''}`}>
                  <AnimatePresence>
                    {visibleFields.map(field => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {(() => {
                          const icons = {
                            shelterName: <Home size={16} />,
                            organizationName: <Building size={16} />,
                            location: <MapPin size={16} />,
                            maxCapacity: <Users size={16} />,
                            accommodationTypes: <Home size={16} />,
                            accommodationType: <Home size={16} />,
                            operatingHours: <Clock size={16} />,
                            customHours: <FileText size={16} />,
                            maxStayLength: <Calendar size={16} />,
                            openOnHolidays: <Calendar size={16} />,
                            holidayHours: <FileText size={16} />,
                            accessibilityFeatures: <Accessibility size={16} />,
                            minAge: <User size={16} />,
                            maxAge: <User size={16} />,
                            genderPolicy: <UserCheck size={16} />,
                            lgbtqFriendly: <Heart size={16} />,
                            hasFamily: <Users size={16} />,
                            maxFamilySize: <Users size={16} />,
                            petPolicy: <PawPrint size={16} />,
                            homelessLinkRegistered: <Shield size={16} />,
                            localAuthorityFunding: <DollarSign size={16} />,
                            housingJusticeMark: <Shield size={16} />,
                            housingBenefitAccepted: <DollarSign size={16} />,
                            serviceCharges: <DollarSign size={16} />,
                            weeklyCharge: <DollarSign size={16} />,
                            acceptNRPF: <Shield size={16} />,
                            nrpfDetails: <FileText size={16} />,
                            localConnectionRequired: <MapPin size={16} />,
                            referralRoutes: <FileText size={16} />,
                            referralDetails: <FileText size={16} />,
                            allowAllReligions: <Shield size={16} />,
                            allowedReligions: <Shield size={16} />,
                            foodType: <Utensils size={16} />,
                            dietaryOptions: <Utensils size={16} />,
                            hasMedical: <Stethoscope size={16} />,
                            medicalDetails: <FileText size={16} />,
                            hasMentalHealth: <Brain size={16} />,
                            mentalHealthDetails: <FileText size={16} />,
                            additionalServices: <Briefcase size={16} />,
                            specializedGroups: <Users size={16} />
                          };
                          return renderField(field, icons[field.id]);
                        })()}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShelterSettings;