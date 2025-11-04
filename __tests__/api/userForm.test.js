import { jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';


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


jest.mock('mongodb', () => {
  return {
    ObjectId: jest.fn((id) => ({
      toString: () => id || 'mock-id',
      valueOf: () => id || 'mock-id'
    }))
  };
});


jest.mock('@/lib/mongodb', () => {
  const mockCollection = {
    insertOne: jest.fn().mockImplementation(() => ({ insertedId: 'mock-inserted-id' })),
    updateOne: jest.fn().mockImplementation(() => ({ matchedCount: 1 })),
  };
  
  const mockDb = {
    collection: jest.fn().mockImplementation(() => mockCollection),
  };
  
  const mockClient = {
    db: jest.fn().mockImplementation(() => mockDb),
  };
  
  return {
    __esModule: true,
    default: Promise.resolve(mockClient),
  };
});


const routeModule = require('@/app/api/userForm/submit-form/route');
const { POST } = routeModule;

describe('User Form Submission API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should successfully submit valid form data', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        formData: {
          
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          gender: 'Male',
          dob: '1990-01-01',
          language: 'English',
          additionalInfo: 'Test additional information',
          
          
          sleepingRough: 'No',
          homelessDuration: '1-4 weeks',
          groupType: 'Just myself',
          groupSize: '1',
          childrenCount: '0',
          previousAccommodation: 'Private rental',
          reasonForLeaving: 'Eviction',
          shelterType: 'Short-term (few days/weeks)',
          
          
          location: 'London, UK',
          location_coordinates: { lat: 51.5074, lng: 0.1278 },
          localConnection: 'Yes',
          
          
          securityNeeded: 'Yes',
          curfew: 'No',
          communalLiving: 'Yes',
          smoking: 'No',
          pets: 'No',
          petDetails: '',
          
          
          medicalConditions: 'No',
          wheelchair: 'No',
          foodAssistance: 'No',
          benefitsHelp: 'Yes',
          mentalHealth: 'No',
          substanceUse: 'No',
          socialServices: 'No',
          domesticAbuse: 'No',
          
          
          immigrationStatus: 'UK Citizen',
          benefits: 'Universal Credit',
          careLeaver: 'No',
          veteran: 'No',
          
          
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
    expect(jsonData.message).toBe('Form submitted successfully');
    expect(jsonData.formId).toBeDefined();

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();

    
    expect(mockClient.db).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('user-data');
    
    
    expect(mockCollection.insertOne).toHaveBeenCalled();
    expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      gender: 'Male',
      status: 'submitted'
    }));
  });

  test('Should reject invalid or incomplete form data', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({})
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
    expect(jsonData.message).toBe('Form data required');

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();

    expect(mockCollection.insertOne).not.toHaveBeenCalled();
  });

  test('Should handle database errors gracefully', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        formData: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          gender: 'Male',
          dob: '1990-01-01',
          sleepingRough: 'No',
          homelessDuration: '1-4 weeks',
          groupType: 'Just myself',
          location: 'London, UK'
        }
      })
    };

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();
    mockCollection.insertOne.mockImplementationOnce(() => {
      throw new Error('Database connection error');
    });

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(500);
    expect(jsonData.success).toBe(false);
    expect(jsonData.message).toBe('Database connection error');
  });

  test('Should update existing form data when formId is provided', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        formId: 'existing-form-id',
        formData: {
          fullName: 'John Doe Updated',
          email: 'john.updated@example.com',
          phone: '9876543210',
          gender: 'Male',
          dob: '1990-01-01',
          language: 'English',
          sleepingRough: 'No',
          homelessDuration: '1-4 weeks',
          groupType: 'Just myself',
          shelterType: 'Short-term (few days/weeks)',
          location: 'London, UK',
          location_coordinates: { lat: 51.5074, lng: 0.1278 }
        }
      })
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(200);
    expect(jsonData.success).toBe(true);
    expect(jsonData.message).toBe('Form updated successfully');
    expect(jsonData.formId).toBe('existing-form-id');

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();

    
    expect(mockClient.db).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('user-data');
    
    
    expect(mockCollection.updateOne).toHaveBeenCalled();
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      expect.objectContaining({
        $set: expect.objectContaining({
          fullName: 'John Doe Updated',
          email: 'john.updated@example.com',
          status: 'updated'
        })
      })
    );
  });
}); 