export const shelterFormQuestions = [
  {
    id: 'adminName',
    question: 'What is your full name?',
    type: 'text',
    placeholder: 'Admin/Manager name',
    required: true
  },
  {
    id: 'email',
    question: 'What is your email address?',
    type: 'email',
    placeholder: 'Your email address',
    required: true
  },
  {
    id: 'password',
    question: 'Choose a password',
    type: 'password',
    placeholder: 'Secure password',
    required: true
  },
  {
    id: 'shelterName',
    question: 'What is the name of your shelter/accommodation service?',
    type: 'text',
    placeholder: 'Enter shelter name',
    required: true
  },
  {
    id: 'organizationName',
    question: 'What organization does your shelter belong to?',
    type: 'text',
    placeholder: 'Enter organization name (if applicable)',
    required: false
  },
  {
    id: 'phone',
    question: 'What is your contact phone number?',
    type: 'tel',
    placeholder: 'Shelter contact number',
    required: true
  },
  {
    id: 'location',
    question: 'What is the shelter\'s address?',
    type: 'address',
    placeholder: 'Enter shelter address',
    required: true
  },
  {
    id: 'maxCapacity',
    question: 'What is your maximum capacity?',
    type: 'number',
    placeholder: 'Maximum number of residents',
    required: true
  },
  {
    id: 'accommodationTypes',
    question: 'What types of accommodation do you provide?',
    type: 'checkbox-group',
    options: ['Dormitory/shared rooms', 'Single rooms', 'Self-contained units', 'Family rooms'],
    required: true
  },
  {
    id: 'operatingHours',
    question: 'What are your operating hours?',
    type: 'select',
    options: ['24/7', 'Daytime Only (8AM-8PM)', 'Evening Only (6PM-9AM)', 'Custom Hours'],
    required: true
  },
  {
    id: 'customHours',
    question: 'Please specify your custom hours:',
    type: 'textarea',
    placeholder: 'Describe your operating hours in detail'
  },
  {
    id: 'maxStayLength',
    question: 'What is the maximum length of stay allowed?',
    type: 'select',
    options: [
      '1 night only', 
      'Up to 7 nights', 
      'Up to 28 days', 
      'Up to 3 months', 
      'Up to 6 months', 
      'Up to 12 months', 
      'More than 12 months', 
      'No fixed limit'
    ],
    required: true
  },
  {
    id: 'accommodationType',
    question: 'Is this emergency accommodation or longer-term supported housing?',
    type: 'select',
    options: [
      'Emergency accommodation only', 
      'Longer-term supported housing', 
      'Both emergency and longer-term', 
      'Transitional housing'
    ],
    required: true
  },
  {
    id: 'openOnHolidays',
    question: 'Do you open on public holidays?',
    type: 'radio',
    options: ['Yes', 'No', 'Limited hours (please specify)'],
    required: true
  },
  {
    id: 'holidayHours',
    question: 'Please specify your holiday hours:',
    type: 'textarea',
    placeholder: 'Describe your holiday operating hours'
  },
  {
    id: 'accessibilityFeatures',
    question: 'What accessibility features do you have?',
    type: 'checkbox-group',
    options: [
      'Wheelchair Accessible', 
      'Ground Floor Access', 
      'Elevator', 
      'Accessible Bathrooms', 
      'Visual Aids', 
      'Hearing Aids',
      'None of these'
    ],
    required: true
  },
  {
    id: 'minAge',
    question: 'Minimum age accepted:',
    type: 'number',
    placeholder: 'Minimum age',
    required: true
  },
  {
    id: 'maxAge',
    question: 'Maximum age accepted:',
    type: 'number',
    placeholder: 'Maximum age (leave blank if none)',
    required: false
  },
  {
    id: 'genderPolicy',
    question: 'What is your gender acceptance policy?',
    type: 'select',
    options: ['Men Only', 'Women Only', 'All Genders'],
    required: true
  },
  {
    id: 'lgbtqFriendly',
    question: 'Is your shelter LGBTQ+ friendly?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    id: 'hasFamily',
    question: 'Do you accommodate families with children?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    id: 'maxFamilySize',
    question: 'What is the maximum family size you can accommodate?',
    type: 'number',
    placeholder: 'Maximum family size'
  },
  {
    id: 'petPolicy',
    question: 'What is your pet policy?',
    type: 'select',
    options: ['No Pets Allowed', 'Service Animals Only', 'All Pets Welcome', 'Case by Case Basis'],
    required: true
  },
  {
    id: 'homelessLinkRegistered',
    question: 'Is your shelter registered with Homeless Link?',
    type: 'radio',
    options: ['Yes', 'No', 'Registration in progress'],
    required: true
  },
  {
    id: 'localAuthorityFunding',
    question: 'Do you receive funding from the local authority?',
    type: 'radio',
    options: ['Yes', 'No', 'Partial funding'],
    required: true
  },
  {
    id: 'housingJusticeMark',
    question: 'Do you have a Housing Justice Quality Mark?',
    type: 'radio',
    options: ['Yes', 'No', 'Applied but not yet received'],
    required: true
  },
  {
    id: 'housingBenefitAccepted',
    question: 'Do you accept residents on Housing Benefit/Universal Credit?',
    type: 'radio',
    options: ['Yes - full cost covered', 'Yes - with top-up payment', 'No'],
    required: true
  },
  {
    id: 'serviceCharges',
    question: 'Do you require service charges in addition to Housing Benefit?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  {
    id: 'weeklyCharge',
    question: 'What are your accommodation charges per week?',
    type: 'number',
    placeholder: 'Weekly charge in £',
    required: true
  },
  {
    id: 'acceptNRPF',
    question: 'Do you accept people with No Recourse to Public Funds (NRPF)?',
    type: 'radio',
    options: ['Yes', 'No', 'In certain circumstances (please specify)'],
    required: true
  },
  {
    id: 'nrpfDetails',
    question: 'Please specify circumstances for accepting NRPF clients:',
    type: 'textarea',
    placeholder: 'Describe circumstances'
  },
  {
    id: 'localConnectionRequired',
    question: 'Do you require residents to have a local connection to the area?',
    type: 'radio',
    options: ['Yes - strict requirement', 'Preferred but not essential', 'No - we accept anyone'],
    required: true
  },
  {
    id: 'referralRoutes',
    question: 'How do you accept referrals?',
    type: 'checkbox-group',
    options: [
      'Self-referrals accepted', 
      'Local authority referrals only', 
      'Agency referrals', 
      'Housing Options/Council Homelessness Team referrals only',
      'Other (please specify)'
    ],
    required: true
  },
  {
    id: 'referralDetails',
    question: 'Please provide details about your referral process:',
    type: 'textarea',
    placeholder: 'Additional referral information'
  },
  {
    id: 'allowAllReligions',
    question: 'Do you allow all religions?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    id: 'allowedReligions',
    question: 'Select allowed religions:',
    type: 'checkbox-group',
    options: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jewish', 'Other (please specify)']
  },
  {
    id: 'foodType',
    question: 'What kind of food do you serve?',
    type: 'select',
    options: ['Vegetarian Only', 'Non-Vegetarian Only', 'Both Options Available', 'No food service provided'],
    required: true
  },
  {
    id: 'dietaryOptions',
    question: 'Do you cater to special dietary requirements?',
    type: 'checkbox-group',
    options: ['Halal', 'Kosher', 'Vegan', 'Gluten-free', 'Other allergies/requirements', 'None of these'],
    required: true
  },
  {
    id: 'hasMedical',
    question: 'Do you provide medical support?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    id: 'medicalDetails',
    question: 'Describe available medical services:',
    type: 'textarea',
    placeholder: 'Details of medical services'
  },
  {
    id: 'hasMentalHealth',
    question: 'Do you provide mental health support?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    id: 'mentalHealthDetails',
    question: 'Describe mental health services available:',
    type: 'textarea',
    placeholder: 'Details of mental health services'
  },
  {
    id: 'additionalServices',
    question: 'What additional services do you provide?',
    type: 'checkbox-group',
    options: [
      'Housing advice/resettlement support', 
      'Benefits advice', 
      'Employment support', 
      'Access to GP/healthcare services', 
      'Substance use support', 
      'Mental health support', 
      'Immigration advice (OISC registered)', 
      'Meals', 
      'Clothing', 
      'Laundry facilities', 
      'Internet access', 
      'Storage Facilities',
      'None of these'
    ],
    required: true
  },
  {
    id: 'specializedGroups',
    question: 'Do you specifically support any of these groups?',
    type: 'checkbox-group',
    options: [
      'People fleeing domestic abuse', 
      'Ex-offenders/prison leavers', 
      'Veterans', 
      'Care leavers', 
      'People with substance use issues', 
      'People with mental health needs', 
      'Asylum seekers/refugees', 
      'Young people (16-25)', 
      'None of these - we\'re a general service'
    ],
    required: true
  },
  {
    id: 'terms',
    question: 'Do you agree to the Terms and Conditions?',
    type: 'checkbox',
    required: true,
    label: 'I agree to the terms and conditions'
  },
  {
    id: 'infoAccuracy',
    question: 'I confirm that all information provided is accurate and up-to-date:',
    type: 'checkbox',
    required: true,
    label: 'I confirm the information is accurate'
  },
  {
    id: 'contactConsent',
    question: 'I consent to be contacted by potential service users through the Safe Haven platform:',
    type: 'checkbox',
    required: true,
    label: 'I consent to being contacted by service users'
  }
];