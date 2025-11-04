import { formQuestions } from '@/app/utils/formQuestions';


function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], min = 1, max = array.length): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomName(): string {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Amir', 'Fatima', 'Chen', 'Priya'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Khan', 'Patel', 'Wang', 'Singh'];
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

function generateRandomEmail(name: string): string {
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'example.com'];
  const namePart = name.toLowerCase().replace(/\s/g, '.').replace(/[^a-z0-9.]/g, '');
  const randomNum = Math.floor(Math.random() * 1000);
  return `${namePart}${randomNum}@${getRandomItem(domains)}`;
}

function generateRandomPhone(): string {
  const prefix = ['074', '075', '077', '078', '079'];
  return `${getRandomItem(prefix)}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function generateRandomDate(minAge = 18, maxAge = 80): string {
  const today = new Date();
  const minYear = today.getFullYear() - maxAge;
  const maxYear = today.getFullYear() - minAge;
  
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; 
  
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}


const knownLocations = [
  
  'Oxford Street, London',
  'Piccadilly, London',
  'Regent Street, London',
  'Baker Street, London',
  'Trafalgar Square, London',
  'Kings Road, London',
  'Tottenham Court Road, London',
  'Bond Street, London',
  'Leicester Square, London',
  'Shaftesbury Avenue, London'
];


export function generateTestData() {
  const testData: Record<string, any> = {};
  
  
  const fullName = generateRandomName();
  testData.fullName = fullName;
  
  
  testData.email = generateRandomEmail(fullName);
  
  
  testData.phone = generateRandomPhone();
  
  
  testData.dob = generateRandomDate();
  
  
  testData.gender = getRandomItem(['Male', 'Female', 'Non-binary', 'Other']);
  
  
  testData.language = getRandomItem(['English', 'Welsh', 'Polish', 'Romanian', 'Urdu', 'Arabic']);
  
  
  testData.location = getRandomItem(knownLocations);
  
  
  testData.sleepingRough = getRandomItem(['Yes', 'No']);
  
  
  testData.homelessDuration = getRandomItem([
    'Less than 1 week', '1-4 weeks', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year'
  ]);
  
  
  testData.groupType = getRandomItem(['Just myself', 'Myself and my partner', 'Myself and my family', 'Myself and a friend/relative']);
  
  
  if (testData.groupType !== 'Just myself') {
    testData.groupSize = String(Math.floor(Math.random() * 5) + 1);
    
    if (testData.groupType === 'Myself and my family') {
      testData.childrenCount = String(Math.floor(Math.random() * 3) + 1);
    }
  }
  
  
  testData.previousAccommodation = getRandomItem([
    'Private rental', 'Social housing', 'Family/Friend\'s home', 'Supported housing', 
    'Hospital', 'Prison', 'Other temporary accommodation', 'Never had stable accommodation'
  ]);
  
  
  const reasonOptions = [
    'Eviction', 'Relationship breakdown', 'Domestic abuse', 'Financial difficulties', 
    'End of tenancy', 'Left institution (hospital/prison/care)', 'Property unsuitable', 'Other'
  ];
  testData.reasonForLeaving = getRandomItems(reasonOptions, 1, 3);
  
  
  testData.shelterType = getRandomItem(['Emergency (tonight)', 'Short-term (few days/weeks)', 'Long-term']);
  
  
  testData.securityNeeded = getRandomItem(['Yes', 'No', 'No preference']);
  
  
  if (testData.shelterType !== 'Emergency (tonight)') {
    testData.curfew = getRandomItem(['Yes', 'No', 'No preference']);
  }
  
  
  if (testData.shelterType === 'Short-term (few days/weeks)' || testData.shelterType === 'Long-term') {
    testData.communalLiving = getRandomItem(['Yes', 'No', 'Can manage if necessary']);
  }
  
  
  testData.smoking = getRandomItem(['Yes - important to me', 'No - prefer non-smoking', 'No preference']);
  
  
  testData.foodAssistance = getRandomItem(['Yes', 'No']);
  
  
  testData.benefitsHelp = getRandomItem(['Yes', 'No', 'Already receiving benefits']);
  
  
  testData.mentalHealth = getRandomItem(['Yes', 'No', 'Prefer not to say']);
  
  
  if (testData.mentalHealth === 'Yes') {
    testData.mentalHealthDetails = 'I need regular support for anxiety and depression';
  }
  
  
  testData.substanceUse = getRandomItem(['Yes', 'No', 'Prefer not to say']);
  
  
  if (testData.substanceUse === 'Yes') {
    testData.substanceUseDetails = 'I need support for alcohol dependency';
  }
  
  
  testData.socialServices = getRandomItem(['Yes', 'No', 'Not sure']);
  
  
  testData.domesticAbuse = getRandomItem(['Yes', 'No', 'Prefer not to say']);
  
  
  testData.medicalConditions = getRandomItem(['Yes', 'No']);
  
  
  if (testData.medicalConditions === 'Yes') {
    const conditions = [
      'Asthma requiring regular medication',
      'Type 2 diabetes, need access to medication',
      'High blood pressure, under control with medication',
      'Mobility issues due to prior injury, but no assistive devices needed',
      'No serious conditions, just need regular access to healthcare'
    ];
    testData.medicalDetails = getRandomItem(conditions);
  } else {
    testData.medicalDetails = 'None, I am in good health';
  }
  
  
  testData.wheelchair = getRandomItem(['Yes', 'No']);
  
  
  testData.immigrationStatus = getRandomItem([
    'UK Citizen', 'EU Pre-settled/Settled Status', 'Indefinite Leave to Remain', 
    'Limited Leave to Remain', 'Asylum Seeker', 'Refugee Status', 
    'No Recourse to Public Funds (NRPF)', 'Visitor/Tourist Visa', 'Other/Not sure'
  ]);
  
  
  const benefitOptions = ['Universal Credit', 'Housing Benefit', 'ESA', 'JSA', 'PIP', 'None of these', 'Other'];
  testData.benefits = getRandomItems(benefitOptions, 0, 3);
  
  
  const connectionOptions = ['I\'ve lived here before', 'I work here', 'I have family here', 'No local connection', 'Not sure'];
  testData.localConnection = getRandomItems(connectionOptions, 1, 2);
  
  
  testData.careLeaver = getRandomItem(['Yes', 'No', 'Not sure']);
  
  
  testData.veteran = getRandomItem(['Yes', 'No']);
  
  
  testData.pets = getRandomItem(['Yes', 'No']);
  
  
  if (testData.pets === 'Yes') {
    const petOptions = [
      '3 small dogs',
      '1 cat and 1 parrot',
      '2 cats and 1 dog',
      '1 dog and 1 cat',
      'Small caged animal (hamster)'
    ];
    testData.petDetails = getRandomItem(petOptions);
  }
  
  
  testData.lgbtqFriendly = getRandomItem(['Yes', 'No', 'Prefer LGBTQ+ friendly but not essential']);
  
  
  if (['Female', 'Non-binary', 'Other', 'Prefer not to say'].includes(testData.gender)) {
    testData.womenOnly = getRandomItem(['Yes', 'No', 'Prefer women-only but not essential']);
  }
  
  
  testData.supportWorkers = getRandomItem(['Yes', 'No']);
  
  
  if (testData.supportWorkers === 'Yes') {
    testData.supportWorkerDetails = 'Jane Smith - Housing Support - 07987654321';
  }
  
  
  const additionalInfoOptions = [
    'I prefer quiet accommodation if possible',
    'I have mild allergies to strong cleaning products',
    'I am looking for somewhere close to public transportation',
    'I am actively looking for work and would like somewhere near job opportunities',
    'No additional information needed'
  ];
  testData.additionalInfo = getRandomItem(additionalInfoOptions);
  
  
  testData.terms = true;
  testData.dataConsent = true;
  testData.contactConsent = true;
  
  return testData;
}


export function generateNoMatchesTestData(): Record<string, any> {
  const testData = generateTestData();
  
  
  
  
  testData.gender = 'Non-binary'; 
  testData.language = 'Other';
  
  
  testData.sleepingRough = 'No';
  testData.homelessDuration = '1-4 weeks';
  testData.previousAccommodation = 'Social housing';
  testData.reasonForLeaving = ['Eviction', 'Financial difficulties', 'Left institution (hospital/prison/care)'];
  
  
  testData.groupType = 'Myself and my family';
  testData.groupSize = '5';  
  testData.childrenCount = '3';
  
  
  testData.shelterType = 'Long-term';
  testData.securityNeeded = 'Yes';
  testData.curfew = 'Yes'; 
  testData.communalLiving = 'No';
  testData.smoking = 'Yes - important to me';
  
  
  testData.foodAssistance = 'Yes';
  testData.benefitsHelp = 'Yes';
  testData.mentalHealth = 'Yes';
  testData.mentalHealthDetails = 'Need daily support for severe anxiety, PTSD, and depression';
  testData.substanceUse = 'Yes';
  testData.substanceUseDetails = 'Currently in recovery, need regular access to support services';
  testData.socialServices = 'Yes';
  testData.domesticAbuse = 'Yes';
  
  
  testData.medicalConditions = 'Yes';
  testData.medicalDetails = 'Multiple complex medical conditions requiring regular specialist care';
  testData.wheelchair = 'Yes';
  
  
  testData.immigrationStatus = 'No Recourse to Public Funds (NRPF)';
  testData.benefits = ['Universal Credit', 'PIP']; 
  testData.localConnection = ['No local connection']; 
  testData.careLeaver = 'Yes';
  testData.veteran = 'No';
  
  
  testData.pets = 'Yes';
  testData.petDetails = 'Two large dogs and a cat';
  testData.lgbtqFriendly = 'Yes';
  testData.womenOnly = 'Yes'; 
  testData.supportWorkers = 'Yes';
  testData.supportWorkerDetails = 'Multiple support workers needed - mental health, substance use, and family support';
  testData.additionalInfo = 'Need ground floor accommodation, close to schools and medical facilities, with space for medical equipment and support worker visits';
  
  
  testData.terms = true;
  testData.dataConsent = true;
  testData.contactConsent = true;
  
  return testData;
} 