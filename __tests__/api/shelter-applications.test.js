import { jest } from '@jest/globals';


jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
      headers: new Map()
    }))
  }
}));


global.Request = class MockRequest {};


jest.mock('mongodb', () => ({
  ObjectId: jest.fn().mockImplementation((id) => ({
    toString: () => id || 'mock-object-id',
    valueOf: () => id || 'mock-object-id'
  }))
}));


jest.mock('@/app/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  dev: jest.fn()
}));


jest.mock('@/lib/mongodb', () => {
  const mockShelterCollection = {
    findOne: jest.fn().mockImplementation((query) => {
      if (query._id.valueOf() === 'valid-shelter-id') {
        return Promise.resolve({
          _id: query._id,
          shelterName: 'Test Shelter',
          location: 'London',
          location_coordinates: { lat: 51.5074, lng: 0.1278 },
          genderPolicy: 'All Genders',
          maxStayLength: 'Up to 28 days',
          petPolicy: 'No pets allowed',
          minAge: 18,
          maxAge: null,
          hasFamily: true,
          maxFamilySize: 4,
          acceptsCouples: true
        });
      }
      return Promise.resolve(null); 
    }),
  };
  
  const mockApplicationCollection = {
    insertOne: jest.fn().mockImplementation((doc) => Promise.resolve({ 
      insertedId: doc._id || 'mock-inserted-id' 
    })),
  };
  
  const mockDb = {
    collection: jest.fn().mockImplementation((name) => {
      if (name === 'shelters') return mockShelterCollection;
      if (name === 'applications') return mockApplicationCollection;
      return {
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' })
      };
    }),
  };
  
  const mockClient = {
    db: jest.fn().mockImplementation(() => mockDb),
  };
  
  return {
    __esModule: true,
    default: Promise.resolve(mockClient),
  };
});


global.console.log = jest.fn();
global.console.error = jest.fn();


const routeModule = require('@/app/api/shelter-applications/apply/route');
const { POST } = routeModule;

describe('Shelter Application Submission API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should successfully submit a valid application', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        shelterId: 'valid-shelter-id',
        formId: 'user-form-id',
        userData: {
          
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          gender: 'Male',
          dob: '1990-01-01',
          language: 'English',
          additionalInfo: 'Test application',
          
          
          location: 'London, UK',
          location_coordinates: { lat: 51.5074, lng: 0.1278 },
          localConnection: 'Yes',
          
          
          sleepingRough: 'No',
          homelessDuration: '1-4 weeks',
          groupType: 'Just myself',
          groupSize: '1',
          childrenCount: '0',
          previousAccommodation: 'Private rental',
          reasonForLeaving: 'Eviction',
          shelterType: 'Short-term (few days/weeks)',
          
          
          securityNeeded: 'Yes',
          curfew: 'No',
          communalLiving: 'Yes',
          smoking: 'No',
          
          
          foodAssistance: 'No',
          benefitsHelp: 'Yes',
          mentalHealth: 'No',
          substanceUse: 'No',
          socialServices: 'No',
          domesticAbuse: 'No',
          
          
          medicalConditions: 'No',
          wheelchair: 'No',
          
          
          immigrationStatus: 'UK Citizen',
          benefits: 'Universal Credit',
          
          
          careLeaver: 'No',
          veteran: 'No',
          pets: 'No',
          petDetails: '',
          womenOnly: 'No',
          lgbtqFriendly: 'No',
          supportWorkers: 'No',
          supportWorkerDetails: '',
          
          
          terms: 'Yes',
          dataConsent: 'Yes',
          contactConsent: 'Yes'
        }
      })
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(200);
    expect(jsonData.success).toBe(true);
    expect(jsonData.message).toBe('Application submitted successfully');
    expect(jsonData.applicationId).toBeDefined();

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    
    
    const mockShelterCollection = mockDb.collection('shelters');
    expect(mockShelterCollection.findOne).toHaveBeenCalledTimes(1);
    expect(mockShelterCollection.findOne).toHaveBeenCalledWith({ 
      _id: expect.anything() 
    });
    
    
    const mockApplicationCollection = mockDb.collection('applications');
    expect(mockApplicationCollection.insertOne).toHaveBeenCalledTimes(1);
    expect(mockApplicationCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      shelterId: expect.anything(),
      formId: 'user-form-id',
      status: 'pending',
      statusHistory: expect.arrayContaining([
        expect.objectContaining({
          status: 'pending',
          note: 'Initial application submission'
        })
      ]),
      urgency: 'MEDIUM',
      submittedAt: expect.any(Date),
      lastUpdated: expect.any(Date),
      type: 'Single Adult',
      
      
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      gender: 'Male',
      dob: '1990-01-01',
      language: 'English',
      
      
      location: 'London, UK',
      
      
      sleepingRough: 'No',
      homelessDuration: '1-4 weeks',
      groupType: 'Just myself',
      groupSize: 1,
      childrenCount: 0,
      previousAccommodation: 'Private rental',
      reasonForLeaving: 'Eviction',
      shelterType: 'Short-term (few days/weeks)',
      
      
      securityNeeded: 'Yes',
      curfew: 'No',
      communalLiving: 'Yes',
      smoking: 'No',
      
      
      foodAssistance: 'No',
      benefitsHelp: 'Yes',
      mentalHealth: 'No',
      substanceUse: 'No',
      socialServices: 'No',
      domesticAbuse: 'No',
      
      
      medicalConditions: 'No',
      wheelchair: 'No',
      
      
      immigrationStatus: 'UK Citizen',
      benefits: 'Universal Credit',
      localConnection: 'Yes',
      
      
      careLeaver: 'No',
      veteran: 'No',
      pets: 'No',
      petDetails: '',
      womenOnly: 'No',
      lgbtqFriendly: 'No',
      supportWorkers: 'No',
      supportWorkerDetails: '',
      
      
      terms: 'Yes',
      dataConsent: 'Yes',
      contactConsent: 'Yes'
    }));
  });

  test('Should reject application with missing required fields', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        
        userData: {
          fullName: 'John Doe',
          email: 'john@example.com'
        }
      })
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
    expect(jsonData.error).toBe('Missing required fields');

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockApplicationCollection = mockDb.collection('applications');
    expect(mockApplicationCollection.insertOne).not.toHaveBeenCalled();
  });

  test('Should reject application when shelter does not exist', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        shelterId: 'non-existent-shelter-id',
        formId: 'user-form-id',
        userData: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          gender: 'Male',
          dob: '1990-01-01',
          sleepingRough: 'No',
          homelessDuration: '1-4 weeks'
        }
      })
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(404);
    expect(jsonData.success).toBe(false);
    expect(jsonData.error).toBe('Shelter not found');

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    
    const mockShelterCollection = mockDb.collection('shelters');
    expect(mockShelterCollection.findOne).toHaveBeenCalledTimes(1);
    
    const mockApplicationCollection = mockDb.collection('applications');
    expect(mockApplicationCollection.insertOne).not.toHaveBeenCalled();
  });

  test('Should handle database errors gracefully', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        shelterId: 'valid-shelter-id',
        formId: 'user-form-id',
        userData: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          gender: 'Male',
          dob: '1990-01-01',
          sleepingRough: 'No',
          homelessDuration: '1-4 weeks',
          groupType: 'Just myself'
        }
      })
    };

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockApplicationCollection = mockDb.collection('applications');
    mockApplicationCollection.insertOne.mockImplementationOnce(() => {
      throw new Error('Database connection error');
    });

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(500);
    expect(jsonData.success).toBe(false);
    expect(jsonData.error).toBe('Failed to submit application');

    
    const logger = require('@/app/utils/logger');
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  test('Should correctly determine urgency for high-risk cases', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        shelterId: 'valid-shelter-id',
        formId: 'user-form-id',
        userData: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '1234567890',
          gender: 'Female',
          dob: '1990-01-01',
          sleepingRough: 'Yes', 
          domesticAbuse: 'Yes',  
          homelessDuration: 'Less than 1 week',
          childrenCount: '0',
          groupType: 'Just myself',
          location: 'London, UK',
          shelterType: 'Emergency (tonight)',
          
          
          language: 'English',
          localConnection: 'Yes',
          pets: 'No',
          medicalConditions: 'No',
          wheelchair: 'No',
          terms: 'Yes',
          dataConsent: 'Yes'
        }
      })
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(200);
    expect(jsonData.success).toBe(true);

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection('applications');
    
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        urgency: 'URGENT',
        name: 'Jane Doe',
        sleepingRough: 'Yes',
        domesticAbuse: 'Yes'
      })
    );
  });
}); 