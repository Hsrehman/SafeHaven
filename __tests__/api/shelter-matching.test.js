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


jest.mock('@/app/utils/shelterMatching', () => ({
  calculateShelterMatch: jest.fn().mockImplementation((userData, shelter) => {
    
    if (userData.gender === 'Male' && shelter.genderPolicy === 'Men Only') {
      return {
        shelterId: shelter._id,
        shelterInfo: {
          _id: shelter._id,
          shelterName: shelter.shelterName,
          location: shelter.location,
          genderPolicy: shelter.genderPolicy,
          maxStayLength: shelter.maxStayLength,
          hasFamily: shelter.hasFamily,
          maxFamilySize: shelter.maxFamilySize,
          acceptsCouples: shelter.acceptsCouples,
          petPolicy: shelter.petPolicy,
          minAge: shelter.minAge,
          maxAge: shelter.maxAge
        },
        percentageMatch: 85,
        matchDetails: [
          { criterion: 'Gender Policy', score: 10, maxScore: 10 },
          { criterion: 'Stay Length', score: 8, maxScore: 10 },
          { criterion: 'Location', score: 10, maxScore: 10 }
        ]
      };
    }

    if (userData.gender === 'Female' && ['Women Only', 'All Genders'].includes(shelter.genderPolicy)) {
      return {
        shelterId: shelter._id,
        shelterInfo: {
          _id: shelter._id,
          shelterName: shelter.shelterName,
          location: shelter.location,
          genderPolicy: shelter.genderPolicy,
          maxStayLength: shelter.maxStayLength,
          hasFamily: shelter.hasFamily,
          maxFamilySize: shelter.maxFamilySize,
          acceptsCouples: shelter.acceptsCouples,
          petPolicy: shelter.petPolicy,
          minAge: shelter.minAge,
          maxAge: shelter.maxAge
        },
        percentageMatch: 90,
        matchDetails: [
          { criterion: 'Gender Policy', score: 10, maxScore: 10 },
          { criterion: 'Stay Length', score: 10, maxScore: 10 },
          { criterion: 'Location', score: 10, maxScore: 10 }
        ]
      };
    }

    
    return null;
  })
}));


jest.mock('@/app/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  dev: jest.fn()
}));


jest.mock('@/lib/mongodb', () => {
  
  const mockShelters = [
    {
      _id: 'shelter-1',
      shelterName: 'Men\'s Shelter',
      location: 'London',
      location_coordinates: { lat: 51.5074, lng: 0.1278 },
      genderPolicy: 'Men Only',
      maxStayLength: 'Up to 28 days',
      petPolicy: 'No pets allowed',
      minAge: 18,
      maxAge: 65,
      hasFamily: false,
      acceptsCouples: false
    },
    {
      _id: 'shelter-2',
      shelterName: 'Women\'s Shelter',
      location: 'London',
      location_coordinates: { lat: 51.5074, lng: 0.1278 },
      genderPolicy: 'Women Only',
      maxStayLength: 'Up to 3 months',
      petPolicy: 'Small pets allowed',
      minAge: 18,
      maxAge: null,
      hasFamily: true,
      maxFamilySize: 3,
      acceptsCouples: false
    },
    {
      _id: 'shelter-3',
      shelterName: 'Family Shelter',
      location: 'London',
      location_coordinates: { lat: 51.5074, lng: 0.1278 },
      genderPolicy: 'All Genders',
      maxStayLength: 'Up to 6 months',
      petPolicy: 'All pets allowed',
      minAge: 18,
      maxAge: null,
      hasFamily: true,
      maxFamilySize: 6,
      acceptsCouples: true
    }
  ];

  const mockCollection = {
    find: jest.fn().mockImplementation(() => ({
      toArray: jest.fn().mockResolvedValue(mockShelters)
    })),
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


global.console.log = jest.fn();


const routeModule = require('@/app/api/shelter-matching/route');
const { POST } = routeModule;

describe('Shelter Matching API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should return matching shelters for valid user data', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        
        fullName: 'John Doe',
        gender: 'Male',
        dob: '1990-01-01',
        
        
        groupType: 'Just myself',
        groupSize: '1',
        childrenCount: '0',
        shelterType: 'Short-term (few days/weeks)',
        
        
        location: 'London, UK',
        location_coordinates: { lat: 51.5074, lng: 0.1278 },
        localConnection: 'Yes',
        
        
        pets: 'No',
        wheelchair: 'No',
        womenOnly: 'No',
        
        
        securityNeeded: 'Yes',
        curfew: 'No',
        communalLiving: 'Yes',
        smoking: 'No'
      })
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(200);
    expect(jsonData.success).toBe(true);
    expect(Array.isArray(jsonData.matches)).toBe(true);
    expect(jsonData.matches.length).toBeGreaterThan(0);
    expect(jsonData.matches[0].shelterInfo.shelterName).toBe('Men\'s Shelter');
    expect(jsonData.matches[0].percentageMatch).toBe(85);

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();

    expect(mockClient.db).toHaveBeenCalledWith('shelterDB');
    expect(mockDb.collection).toHaveBeenCalledWith('shelters');
    expect(mockCollection.find).toHaveBeenCalledTimes(1);
    
    const { calculateShelterMatch } = require('@/app/utils/shelterMatching');
    expect(calculateShelterMatch).toHaveBeenCalledTimes(3); 
  });

  test('Should return no matches when user preferences don\'t match any shelters', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        gender: 'Non-binary',
        dob: '1995-05-05',
        groupType: 'Just myself',
        groupSize: '1',
        childrenCount: '0',
        pets: 'Yes', 
        shelterType: 'Long-term (months)',
        location: 'London, UK',
        location_coordinates: { lat: 51.5074, lng: 0.1278 },
        localConnection: 'No',
        womenOnly: 'No',
        wheelchair: 'Yes',
        securityNeeded: 'Yes'
      })
    };

    
    const { calculateShelterMatch } = require('@/app/utils/shelterMatching');
    calculateShelterMatch.mockImplementation(() => null);

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(200);
    expect(jsonData.success).toBe(true);
    expect(Array.isArray(jsonData.matches)).toBe(true);
    expect(jsonData.matches.length).toBe(0);

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();

    expect(mockClient.db).toHaveBeenCalledWith('shelterDB');
    expect(mockDb.collection).toHaveBeenCalledWith('shelters');
    expect(mockCollection.find).toHaveBeenCalledTimes(1);
  });

  test('Should return 400 error for missing gender data', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        
        dob: '1990-01-01',
        groupType: 'Just myself',
        pets: 'No',
        shelterType: 'Short-term (few days/weeks)',
        location: 'London, UK',
        localConnection: 'Yes'
      })
    };

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
    expect(jsonData.message).toContain('Gender information is required');
  });

  test('Should handle database errors gracefully', async () => {
    
    const req = {
      json: jest.fn().mockResolvedValue({
        gender: 'Female',
        dob: '1990-01-01',
        groupType: 'Just myself',
        groupSize: '1',
        childrenCount: '0',
        pets: 'No',
        shelterType: 'Short-term (few days/weeks)',
        location: 'London, UK',
        location_coordinates: { lat: 51.5074, lng: 0.1278 },
        localConnection: 'Yes',
        womenOnly: 'Yes'
      })
    };

    
    const mongodb = require('@/lib/mongodb');
    const mockClient = await mongodb.default;
    const mockDb = mockClient.db();
    const mockCollection = mockDb.collection();
    mockCollection.find.mockImplementationOnce(() => {
      throw new Error('Database connection error');
    });

    
    const response = await POST(req);
    const jsonData = await response.json();

    
    expect(response.status).toBe(500);
    expect(jsonData.success).toBe(false);
    expect(jsonData.message).toContain('Failed to find matching shelters');
  });
}); 