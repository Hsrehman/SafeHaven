const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, min = 1, max = array.length) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomPhone() {
  const prefix = ['074', '075', '077', '078', '079'];
  return `${getRandomItem(prefix)}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRandomName() {
  const firstNames = [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Sarah', 'Emma', 'Olivia', 'Sophia',
    'Muhammad', 'Ahmed', 'Ali', 'Fatima', 'Aisha', 'Zainab', 'Chen', 'Wei', 'Yan', 'Ming',
    'Raj', 'Priya', 'Arun', 'Deepa', 'Pavel', 'Ana', 'Maria', 'Carlos', 'Isabella'
  ];
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
    'Khan', 'Ahmed', 'Ali', 'Hassan', 'Zhang', 'Li', 'Wang', 'Chen', 'Patel', 'Kumar', 'Singh',
    'Ivanov', 'Petrov', 'Santos', 'Silva', 'Muller', 'Weber', 'Fischer', 'Meyer'
  ];
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

function generateRandomDOB(minAge = 18, maxAge = 70) {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  return generateRandomDate(minDate, maxDate).toISOString().split('T')[0];
}

async function createApplications() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('shelterDB');

    
    const shelters = await db.collection('shelters').find({}).toArray();
    console.log(`Found ${shelters.length} shelters`);

    const languages = ['English', 'Spanish', 'Arabic', 'Urdu', 'Polish', 'Romanian', 'Bengali', 'Hindi', 'Mandarin'];
    const applicationTypes = ['Single Adult', 'Family', 'Couple', 'Single Parent Family'];
    const urgencyLevels = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
    const statuses = ['pending', 'approved', 'rejected', 'waitlisted'];
    const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
    const locations = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Sheffield'];
    const sleepingRoughOptions = ['Yes', 'No', 'Occasionally'];
    const homelessDurations = [
      'Less than 1 week',
      '1-4 weeks',
      '1-6 months',
      '6-12 months',
      'More than 1 year',
      'More than 2 years'
    ];
    const groupTypes = ['Individual', 'Couple', 'Family with children', 'Single parent family'];
    const previousAccommodations = [
      'Private rented',
      'Social housing',
      'Family/Friends',
      'Rough sleeping',
      'Temporary accommodation',
      'Prison',
      'Hospital'
    ];
    const reasonsForLeaving = [
      'Eviction',
      'Domestic abuse',
      'Relationship breakdown',
      'Financial difficulties',
      'End of tenancy',
      'Loss of employment',
      'Medical reasons',
      'Prison release',
      'Hospital discharge',
      'Family breakdown',
      'Asked to leave by family/friends'
    ];
    const shelterTypes = [
      'Emergency shelter',
      'Temporary accommodation',
      'Supported housing',
      'Long-term housing'
    ];
    const securityOptions = ['Yes - high security needed', 'Some security preferred', 'No special requirements'];
    const curfewPreferences = ['Yes - strict curfew preferred', 'Flexible curfew acceptable', 'No curfew needed'];
    const communalLivingOptions = ['Happy with communal living', 'Prefer own space', 'Will consider either'];
    const smokingPreferences = ['Smoker', 'Non-smoker', 'Outdoor smoking only'];
    const supportOptions = ['Yes', 'No', 'Maybe - would like to discuss'];
    const immigrationStatuses = [
      'UK Citizen',
      'EU Settled Status',
      'Indefinite Leave to Remain',
      'Refugee Status',
      'Asylum Seeker',
      'Limited Leave to Remain',
      'Other'
    ];
    const benefitTypes = [
      'Universal Credit',
      'Housing Benefit',
      'ESA',
      'PIP',
      'JSA',
      'State Pension',
      'None'
    ];
    const medicalConditions = [
      'None',
      'Physical disability',
      'Mental health condition',
      'Chronic illness',
      'Substance dependency',
      'Multiple conditions'
    ];

    let totalApplications = 0;

    
    for (const shelter of shelters) {
      for (let i = 0; i < 5; i++) {
        const isFamily = Math.random() > 0.7;
        const hasPets = Math.random() > 0.8;
        const hasSupport = Math.random() > 0.7;
        const name = generateRandomName();
        const submittedAt = generateRandomDate(new Date(2023, 0, 1), new Date());
        const status = getRandomItem(statuses);
        const lastUpdated = status === 'pending' ? submittedAt : generateRandomDate(submittedAt, new Date());

        const application = {
          _id: new ObjectId(),
          shelterId: shelter._id,
          name,
          email: `${name.toLowerCase().replace(' ', '.')}${Math.floor(Math.random() * 1000)}@example.com`,
          phone: generateRandomPhone(),
          type: getRandomItem(applicationTypes),
          urgency: getRandomItem(urgencyLevels),
          status,
          submittedAt,
          lastUpdated,
          notes: Math.random() > 0.7 ? 'Urgent consideration needed due to current circumstances.' : '',
          gender: getRandomItem(genders),
          dob: generateRandomDOB(),
          language: getRandomItem(languages),
          location: getRandomItem(locations),
          sleepingRough: getRandomItem(sleepingRoughOptions),
          homelessDuration: getRandomItem(homelessDurations),
          groupType: isFamily ? 'Family with children' : getRandomItem(groupTypes),
          groupSize: isFamily ? Math.floor(Math.random() * 5) + 2 : 1,
          childrenCount: isFamily ? Math.floor(Math.random() * 4) : 0,
          previousAccommodation: getRandomItem(previousAccommodations),
          reasonForLeaving: getRandomItems(reasonsForLeaving, 1, 3),
          shelterType: getRandomItem(shelterTypes),
          securityNeeded: getRandomItem(securityOptions),
          curfew: getRandomItem(curfewPreferences),
          communalLiving: getRandomItem(communalLivingOptions),
          smoking: getRandomItem(smokingPreferences),
          foodAssistance: getRandomItem(supportOptions),
          benefitsHelp: getRandomItem(supportOptions),
          mentalHealth: getRandomItem(supportOptions),
          substanceUse: getRandomItem(supportOptions),
          socialServices: getRandomItem(supportOptions),
          domesticAbuse: getRandomItem(supportOptions),
          medicalConditions: getRandomItem(medicalConditions),
          wheelchair: Math.random() > 0.9 ? 'Yes' : 'No',
          immigrationStatus: getRandomItem(immigrationStatuses),
          benefits: getRandomItems(benefitTypes, 0, 3),
          localConnection: ['Yes', 'No'][Math.floor(Math.random() * 2)],
          careLeaver: Math.random() > 0.9 ? 'Yes' : 'No',
          veteran: Math.random() > 0.95 ? 'Yes' : 'No',
          pets: hasPets ? 'Yes' : 'No',
          petDetails: hasPets ? 'One small dog' : undefined,
          womenOnly: Math.random() > 0.8 ? 'Yes' : 'No',
          lgbtqFriendly: Math.random() > 0.7 ? 'Yes' : 'No',
          supportWorkers: hasSupport ? 'Yes' : 'No',
          supportWorkerDetails: hasSupport ? 'Social worker assigned' : undefined,
          terms: true,
          dataConsent: true,
          contactConsent: true,
          createdAt: submittedAt,
          updatedAt: lastUpdated
        };

        await db.collection('applications').insertOne(application);
        totalApplications++;
        console.log(`Created application ${i + 1} for shelter: ${shelter.shelterName}`);
      }
    }

    console.log(`Successfully created ${totalApplications} applications`);
  } catch (error) {
    console.error('Error creating applications:', error);
  } finally {
    await client.close();
  }
}

createApplications()
  .then(() => console.log('Script execution completed'))
  .catch(error => console.error('Script execution failed:', error)); 