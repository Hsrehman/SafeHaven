export const formQuestions = [
  
  {
    id: 'fullName',
    question: 'What is your full name?',
    type: 'text',
    placeholder: 'Your full name'
  },
  {
    id: 'email',
    question: 'What is your email address?',
    type: 'email',
    placeholder: 'Your email (if available)'
  },
  {
    id: 'phone',
    question: 'What is your phone number?',
    type: 'tel',
    placeholder: '07XXXXXXXXX'
  },
  {
    id: 'dob',
    question: 'What is your date of birth?',
    type: 'date'
  },
  {
    id: 'gender',
    question: 'What is your gender?',
    type: 'select',
    options: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']
  },
  {
    id: 'language',
    question: 'What is your preferred language?',
    type: 'select',
    options: ['English', 'Welsh', 'Polish', 'Romanian', 'Urdu', 'Arabic', 'Other']
  },
  
  {
    id: 'location',
    question: 'What is your current location?',
    type: 'address', 
    placeholder: 'Enter your current location'
  },
  {
    id: 'sleepingRough',
    question: 'Are you currently sleeping rough (on the streets)?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  {
    id: 'homelessDuration',
    question: 'How long have you been homeless?',
    type: 'select',
    options: ['Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year']
  },
  {
    id: 'groupType',
    question: 'Who are you seeking shelter for?',
    type: 'radio',
    options: ['Just myself', 'Myself and my partner', 'Myself and my family', 'Myself and a friend/relative']
  },
  {
    id: 'groupSize',
    question: 'How many other people are with you?',
    type: 'number',
    placeholder: 'Number of people'
  },
  {
    id: 'childrenCount',
    question: 'How many children are with you?',
    type: 'number',
    placeholder: 'Number of children'
  },
  {
    id: 'previousAccommodation',
    question: 'What was your previous accommodation?',
    type: 'select',
    options: [
      'Private rental', 
      'Social housing', 
      'Family/Friend\'s home', 
      'Supported housing', 
      'Hospital', 
      'Prison', 
      'Other temporary accommodation', 
      'Never had stable accommodation'
    ]
  },
  {
    id: 'reasonForLeaving',
    question: 'Why did you leave your previous accommodation?',
    type: 'checkbox-group',
    options: [
      'Eviction', 
      'Relationship breakdown', 
      'Domestic abuse', 
      'Financial difficulties', 
      'End of tenancy', 
      'Left institution (hospital/prison/care)', 
      'Property unsuitable',
      'Other'
    ]
  },
  
  {
    id: 'shelterType',
    question: 'Are you looking for accommodation for tonight or longer-term?',
    type: 'radio',
    options: ['Emergency (tonight)', 'Short-term (few days/weeks)', 'Long-term']
  },
  {
    id: 'securityNeeded',
    question: 'Do you need a shelter with 24-hour security?',
    type: 'radio',
    options: ['Yes', 'No', 'No preference']
  },
  {
    id: 'curfew',
    question: 'Do you prefer a shelter with a curfew?',
    type: 'radio',
    options: ['Yes', 'No', 'No preference']
  },
  {
    id: 'communalLiving',
    question: 'Are you comfortable with communal living (shared spaces)?',
    type: 'radio',
    options: ['Yes', 'No', 'Can manage if necessary']
  },
  {
    id: 'smoking',
    question: 'Would you prefer a shelter that allows smoking?',
    type: 'radio',
    options: ['Yes - important to me', 'No - prefer non-smoking', 'No preference']
  },
  
  {
    id: 'foodAssistance',
    question: 'Do you need food assistance?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  {
    id: 'benefitsHelp',
    question: 'Do you need help with applying for benefits?',
    type: 'radio',
    options: ['Yes', 'No', 'Already receiving benefits']
  },
  {
    id: 'mentalHealth',
    question: 'Do you have any mental health support needs?',
    type: 'radio',
    options: ['Yes', 'No', 'Prefer not to say']
  },
  {
    id: 'substanceUse',
    question: 'Do you have any substance use support needs?',
    type: 'radio',
    options: ['Yes', 'No', 'Prefer not to say']
  },
  {
    id: 'socialServices',
    question: 'Do you need social services or legal assistance?',
    type: 'radio',
    options: ['Yes', 'No', 'Not sure']
  },
  {
    id: 'domesticAbuse',
    question: 'Are you fleeing domestic abuse or violence?',
    type: 'radio',
    options: ['Yes', 'No', 'Prefer not to say']
  },
  {
    id: 'medicalConditions',
    question: 'Do you have any medical conditions or disabilities?',
    type: 'textarea',
    placeholder: 'Please describe any medical conditions or disabilities'
  },
  {
    id: 'wheelchair',
    question: 'Do you need wheelchair accessibility?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  
  {
    id: 'immigrationStatus',
    question: 'What is your immigration status?',
    type: 'select',
    options: [
      'UK Citizen', 
      'EU Pre-settled/Settled Status', 
      'Indefinite Leave to Remain', 
      'Limited Leave to Remain', 
      'Asylum Seeker', 
      'Refugee Status', 
      'No Recourse to Public Funds (NRPF)', 
      'Visitor/Tourist Visa', 
      'Other/Not sure'
    ]
  },
  {
    id: 'benefits',
    question: 'Are you currently receiving any of these benefits?',
    type: 'checkbox-group',
    options: ['Universal Credit', 'Housing Benefit', 'ESA', 'JSA', 'PIP', 'None of these', 'Other']
  },
  {
    id: 'localConnection',
    question: 'Do you have a local connection to this area?',
    type: 'checkbox-group',
    options: ['I\'ve lived here before', 'I work here', 'I have family here', 'No local connection', 'Not sure']
  },
  {
    id: 'careLeaver',
    question: 'Are you a care leaver (someone who has been in local authority care)?',
    type: 'radio',
    options: ['Yes', 'No', 'Not sure']
  },
  {
    id: 'veteran',
    question: 'Are you a veteran (served in UK armed forces)?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  
  {
    id: 'pets',
    question: 'Do you have any pets with you?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  {
    id: 'petDetails',
    question: 'What type of pet(s) and how many?',
    type: 'textarea',
    placeholder: 'Please describe your pets'
  },
  {
    id: 'womenOnly',
    question: 'Do you require a women-only shelter?',
    type: 'radio',
    options: ['Yes', 'No', 'Prefer women-only but not essential']
  },
  {
    id: 'lgbtqFriendly',
    question: 'Do you need LGBTQ+ friendly accommodation?',
    type: 'radio',
    options: ['Yes', 'No', 'Prefer LGBTQ+ friendly but not essential']
  },
  {
    id: 'supportWorkers',
    question: 'Do you have any support workers or key workers currently?',
    type: 'radio',
    options: ['Yes', 'No']
  },
  {
    id: 'supportWorkerDetails',
    question: 'Please provide their contact details (with your consent):',
    type: 'textarea',
    placeholder: 'Support worker name, organization, and contact details'
  },
  {
    id: 'additionalInfo',
    question: 'Is there anything else we should know to find you appropriate accommodation?',
    type: 'textarea',
    placeholder: 'Share any other details that might help us'
  },
  
  {
    id: 'terms',
    question: 'Do you agree to the Terms and Conditions?',
    type: 'checkbox',
    label: 'I agree to the terms and conditions'
  },
  {
    id: 'dataConsent',
    question: 'Do you consent to us sharing your information with suitable shelters?',
    type: 'checkbox',
    label: 'I consent to my information being shared with shelters'
  },
  {
    id: 'contactConsent',
    question: 'Do you consent to us contacting you about available spaces?',
    type: 'checkbox',
    label: 'I consent to being contacted about available spaces'
  }
];