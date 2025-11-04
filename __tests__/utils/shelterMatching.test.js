import { calculateShelterMatch } from '@/app/utils/shelterMatching';

describe('calculateShelterMatch', () => {
  const mockUserData = {
    dob: '1990-01-01',
    gender: 'Male',
    location: 'London, UK',
    location_coordinates: { lat: 51.5074, lng: -0.1278 },
    shelterType: 'Emergency (tonight)',
    groupType: 'Just myself',
    pets: 'No',
    womenOnly: 'No',
    wheelchair: 'Yes',
    lgbtqFriendly: 'Yes',
    medicalConditions: 'Yes',
    mentalHealth: 'Yes',
    substanceUse: 'Yes',
    domesticAbuse: 'Yes',
    foodAssistance: 'Yes',
    benefitsHelp: 'Yes',
    immigrationStatus: 'No Recourse to Public Funds (NRPF)',
    careLeaver: 'Yes',
    veteran: 'Yes',
    benefits: ['Housing Benefit'],
    localConnection: ['Local connection to area']
  };

  const mockShelter = {
    _id: 'test123',
    shelterName: 'Test Shelter',
    location: 'London, UK',
    location_coordinates: { lat: 51.5074, lng: -0.1278 },
    genderPolicy: 'All Genders',
    maxStayLength: 'Up to 7 nights',
    hasFamily: true,
    maxFamilySize: 4,
    acceptsCouples: true,
    minAge: 18,
    maxAge: 65,
    petPolicy: 'No pets allowed',
    accessibilityFeatures: ['Wheelchair Accessible'],
    lgbtqFriendly: 'Yes',
    hasMedical: 'Yes',
    hasMentalHealth: 'Yes',
    specializedGroups: ['People with substance use issues', 'People fleeing domestic abuse', 'Care leavers', 'Veterans'],
    foodType: 'Full board (all meals provided)',
    additionalServices: ['Benefits advice', 'Substance use support'],
    acceptNRPF: 'Yes',
    housingBenefitAccepted: 'Yes - we accept housing benefit',
    localConnectionRequired: 'No - we accept anyone',
    allowAllReligions: 'Yes'
  };

  test('returns null for invalid shelter data', () => {
    expect(calculateShelterMatch(mockUserData, null)).toBeNull();
    expect(calculateShelterMatch(mockUserData, {})).toBeNull();
    expect(calculateShelterMatch(mockUserData, { _id: 'test' })).toBeNull();
  });

  test('matches valid user and shelter data', () => {
    const result = calculateShelterMatch(mockUserData, mockShelter);
    expect(result).toBeValidShelterMatch();
    expect(result.percentageMatch).toHaveValidMatchPercentage();
  });

  describe('Location matching', () => {
    test('matches when coordinates are within range', () => {
      const nearbyUser = {
        ...mockUserData,
        location_coordinates: { lat: 51.5074, lng: -0.1278 }
      };
      const nearbyShelter = {
        ...mockShelter,
        location_coordinates: { lat: 51.5080, lng: -0.1280 }
      };
      const result = calculateShelterMatch(nearbyUser, nearbyShelter);
      expect(result).toBeValidShelterMatch();
    });

    test('fails when coordinates are too far', () => {
      const farUser = {
        ...mockUserData,
        location_coordinates: { lat: 51.5074, lng: -0.1278 }
      };
      const farShelter = {
        ...mockShelter,
        location_coordinates: { lat: 52.5200, lng: 13.4050 } 
      };
      const result = calculateShelterMatch(farUser, farShelter);
      expect(result).toBeNull();
    });

    test('handles invalid coordinates', () => {
      const invalidCoordCases = [
        { lat: null, lng: -0.1278 },
        { lat: 51.5074, lng: null },
        { lat: undefined, lng: -0.1278 },
        { lat: 51.5074, lng: undefined },
        { lat: 'invalid', lng: -0.1278 },
        { lat: 51.5074, lng: 'invalid' }
      ];

      invalidCoordCases.forEach(coords => {
        const result = calculateShelterMatch(
          { 
            ...mockUserData, 
            location_coordinates: coords,
            location: 'London, UK'  
          },
          { 
            ...mockShelter,
            location: 'London, UK'  
          }
        );
        expect(result).toBeValidShelterMatch();
      });
    });

    test('handles missing coordinates with text fallback', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, location_coordinates: null, location: 'Westminster, London, UK' },
        { ...mockShelter, location_coordinates: null, location: 'Camden, London, UK' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('handles partial coordinate data', () => {
      const result = calculateShelterMatch(
        { 
          ...mockUserData, 
          location_coordinates: { lat: 51.5074 },
          location: 'London, UK'  
        },
        { 
          ...mockShelter, 
          location_coordinates: { lng: -0.1278 },
          location: 'London, UK'  
        }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('handles edge case distances', () => {
      
      const result = calculateShelterMatch(
        { 
          ...mockUserData,
          location_coordinates: { lat: 51.5074, lng: -0.1278 },
          location: 'London, UK'  
        },
        {
          ...mockShelter,
          location_coordinates: { lat: 51.9074, lng: -0.1278 }, 
          location: 'London, UK'  
        }
      );
      expect(result).toBeValidShelterMatch();

      
      const farResult = calculateShelterMatch(
        { 
          ...mockUserData,
          location_coordinates: { lat: 51.5074, lng: -0.1278 },
          location: 'London, UK'
        },
        {
          ...mockShelter,
          location_coordinates: { lat: 52.0074, lng: -0.1278 }, 
          location: 'Birmingham, UK'
        }
      );
      expect(farResult).toBeNull();
    });
  });

  describe('City extraction', () => {
    test('extracts London boroughs correctly', () => {
      const boroughCases = [
        'Westminster, London',
        'Camden, Greater London',
        'Hackney, London, UK',
        'Tower Hamlets, E1',
        'Southwark, London',
        'Lambeth, London',
        'Islington, London'
      ];

      boroughCases.forEach(location => {
        const result = calculateShelterMatch(
          { ...mockUserData, location, location_coordinates: null },
          { ...mockShelter, location: 'London, UK', location_coordinates: null }
        );
        expect(result).toBeValidShelterMatch();
      });
    });

    test('handles partial city names', () => {
      const partialCases = [
        ['Manchester City Centre, UK', 'Manchester, UK'],
        ['Central Birmingham, UK', 'Birmingham, UK'],
        ['Leeds City, UK', 'Leeds, UK'],
        ['Greater Glasgow, UK', 'Glasgow, UK']
      ];

      partialCases.forEach(([userLoc, shelterLoc]) => {
        const result = calculateShelterMatch(
          { ...mockUserData, location: userLoc, location_coordinates: null },
          { ...mockShelter, location: shelterLoc, location_coordinates: null }
        );
        expect(result).toBeValidShelterMatch();
      });
    });

    test('handles invalid location strings', () => {
      const invalidCases = [
        ['', ''],
        ['Unknown', 'Different Unknown'],
        ['AB1 2CD', 'XY9 8ZW'],  
        ['123 Street Name', '456 Road Name']
      ];

      invalidCases.forEach(([userLoc, shelterLoc]) => {
        const result = calculateShelterMatch(
          { ...mockUserData, location: userLoc, location_coordinates: null },
          { ...mockShelter, location: shelterLoc, location_coordinates: null }
        );
        expect(result).toBeNull();
      });
    });
  });

  describe('Gender policy matching', () => {
    test('matches men-only shelter with male user', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, gender: 'Male' },
        { ...mockShelter, genderPolicy: 'Men Only' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('matches women-only shelter with female user', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, gender: 'Female' },
        { ...mockShelter, genderPolicy: 'Women Only' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('matches women-only shelter with non-binary user who selected women-only', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, gender: 'Non-binary', womenOnly: 'Yes' },
        { ...mockShelter, genderPolicy: 'Women Only' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('fails when gender policy does not match', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, gender: 'Male' },
        { ...mockShelter, genderPolicy: 'Women Only' }
      );
      expect(result).toBeNull();
    });
  });

  describe('Stay length matching', () => {
    test('matches emergency stay with appropriate shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, shelterType: 'Emergency (tonight)' },
        { ...mockShelter, maxStayLength: 'Up to 7 nights' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('matches short-term stay with appropriate shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, shelterType: 'Short-term (few days/weeks)' },
        { ...mockShelter, maxStayLength: 'Up to 28 days' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('fails when stay length does not match', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, shelterType: 'Long-term (months or more)' },
        { ...mockShelter, maxStayLength: '1 night only' }
      );
      expect(result).toBeNull();
    });
  });

  describe('Group type matching', () => {
    test('matches single person with any shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Just myself' },
        mockShelter
      );
      expect(result).toBeValidShelterMatch();
    });

    test('matches family within size limit', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Myself and my family', groupSize: '3' },
        { ...mockShelter, hasFamily: true, maxFamilySize: 4 }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('fails when family size exceeds limit', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Myself and my family', groupSize: '5' },
        { ...mockShelter, hasFamily: true, maxFamilySize: 4 }
      );
      expect(result).toBeNull();
    });

    test('matches couples with appropriate shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Myself and my partner' },
        { ...mockShelter, acceptsCouples: true }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('handles missing group size for family booking', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Myself and my family', groupSize: undefined },
        mockShelter
      );
      expect(result).toBeValidShelterMatch();
      expect(result.percentageMatch).toBe(100);
    });

    test('handles edge cases for family size', () => {
      const edgeCases = [
        { groupSize: '0', expected: true },
        { groupSize: '-1', expected: true },
        { groupSize: 'abc', expected: true },
        { groupSize: '999', expected: false },
        { groupSize: '', expected: true }
      ];

      edgeCases.forEach(({ groupSize, expected }) => {
        const result = calculateShelterMatch(
          { ...mockUserData, groupType: 'Myself and my family', groupSize },
          { ...mockShelter, hasFamily: true, maxFamilySize: 4 }
        );
        if (expected) {
          expect(result).toBeValidShelterMatch();
        } else {
          expect(result).toBeNull();
        }
      });
    });

    test('handles family booking without hasFamily flag', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Myself and my family', groupSize: '3' },
        { ...mockShelter, hasFamily: false, maxFamilySize: 4 }
      );
      expect(result).toBeNull();
    });
  });

  describe('Age requirements matching', () => {
    test('matches user within age limits', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, dob: '1990-01-01' }, 
        { ...mockShelter, minAge: 18, maxAge: 65 }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('fails when user is too young', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, dob: '2010-01-01' }, 
        { ...mockShelter, minAge: 18, maxAge: 65 }
      );
      expect(result).toBeNull();
    });

    test('fails when user is too old', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, dob: '1950-01-01' }, 
        { ...mockShelter, minAge: 18, maxAge: 65 }
      );
      expect(result).toBeNull();
    });

    test('handles edge cases for age calculation', () => {
      const today = new Date();
      const edgeCases = [
        {
          dob: new Date(today.getFullYear() - mockShelter.minAge, today.getMonth(), today.getDate()).toISOString().split('T')[0],
          expected: true  
        },
        {
          dob: new Date(today.getFullYear() - mockShelter.maxAge, today.getMonth(), today.getDate()).toISOString().split('T')[0],
          expected: true  
        },
        {
          dob: new Date(today.getFullYear() - mockShelter.minAge + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0],
          expected: false  
        },
        {
          dob: new Date(today.getFullYear() - mockShelter.maxAge - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0],
          expected: false  
        }
      ];

      edgeCases.forEach(({ dob, expected }) => {
        const result = calculateShelterMatch(
          { ...mockUserData, dob },
          mockShelter
        );
        if (expected) {
          expect(result).toBeValidShelterMatch();
        } else {
          expect(result).toBeNull();
        }
      });
    });

    test('handles missing age limits in shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, dob: '1990-01-01' },
        { ...mockShelter, minAge: undefined, maxAge: undefined }
      );
      expect(result).toBeValidShelterMatch();
    });
  });

  describe('Pet policy matching', () => {
    test('matches user with no pets to any shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, pets: 'No' },
        mockShelter
      );
      expect(result).toBeValidShelterMatch();
    });

    test('matches user with pets to pet-friendly shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, pets: 'Yes' },
        { ...mockShelter, petPolicy: 'Pets allowed' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('fails when user has pets but shelter does not allow them', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, pets: 'Yes' },
        { ...mockShelter, petPolicy: 'No pets allowed' }
      );
      expect(result).toBeNull();
    });
  });

  describe('Location matching with text-based addresses', () => {
    test('matches when cities match but no coordinates available', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, location: 'Manchester, UK', location_coordinates: null },
        { ...mockShelter, location: 'Manchester, UK', location_coordinates: null }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('fails when cities do not match and no coordinates available', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, location: 'Manchester, UK', location_coordinates: null },
        { ...mockShelter, location: 'London, UK', location_coordinates: null }
      );
      expect(result).toBeNull();
    });

    test('handles missing location data', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, location: null, location_coordinates: null },
        { ...mockShelter, location: null, location_coordinates: null }
      );
      expect(result).toBeNull();
    });
  });

  describe('Stay length matching edge cases', () => {
    test('matches one night stay with one night only shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, shelterType: 'Emergency (tonight)' },
        { ...mockShelter, maxStayLength: '1 night only' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('matches long-term stay with no fixed limit shelter', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, shelterType: 'Long-term (months or more)' },
        { ...mockShelter, maxStayLength: 'No fixed limit' }
      );
      expect(result).toBeValidShelterMatch();
    });

    test('handles missing stay length in shelter data', () => {
      const shelterWithoutStayLength = { ...mockShelter };
      delete shelterWithoutStayLength.maxStayLength;
      const result = calculateShelterMatch(mockUserData, shelterWithoutStayLength);
      expect(result).toBeNull();
    });
  });

  describe('Group type edge cases', () => {
    test('handles invalid group type', () => {
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Invalid Group Type' },
        mockShelter
      );
      expect(result).toBeValidShelterMatch();
    });

    test('handles missing family size limit in shelter', () => {
      const shelterWithoutFamilySize = { ...mockShelter, hasFamily: true };
      delete shelterWithoutFamilySize.maxFamilySize;
      const result = calculateShelterMatch(
        { ...mockUserData, groupType: 'Myself and my family', groupSize: '3' },
        shelterWithoutFamilySize
      );
      expect(result).toBeValidShelterMatch();
    });
  });

  describe('Preference matching', () => {
    test('matches all preferences correctly', () => {
      const result = calculateShelterMatch(mockUserData, mockShelter);
      expect(result).toBeValidShelterMatch();
      expect(result.matchDetails).toContain('Matches wheelchair accessibility needs');
      expect(result.matchDetails).toContain('Matches LGBTQ+ friendly preference');
      expect(result.matchDetails).toContain('Matches medical support needs');
      expect(result.matchDetails).toContain('Matches mental health support needs');
    });

    test('handles unmatched preferences', () => {
      const shelterWithoutFeatures = { ...mockShelter };
      Object.keys(shelterWithoutFeatures).forEach(key => {
        if (key.startsWith('is') || key.startsWith('has') || key.startsWith('accepts')) {
          shelterWithoutFeatures[key] = false;
        }
      });
      const result = calculateShelterMatch(mockUserData, shelterWithoutFeatures);
      expect(result).toBeValidShelterMatch();
      expect(result.percentageMatch).toBeLessThan(100);
    });

    test('calculates correct score with mixed preferences', () => {
      const userWithPrefs = {
        ...mockUserData,
        lgbtqFriendly: 'Yes',
        medicalConditions: 'Yes',
        mentalHealth: 'Yes'
      };
      const shelterWithMixedFeatures = {
        ...mockShelter,
        lgbtqFriendly: 'No',
        hasMedical: 'Yes',
        hasMentalHealth: 'No'
      };
      const result = calculateShelterMatch(userWithPrefs, shelterWithMixedFeatures);
      expect(result).toBeValidShelterMatch();
      expect(result.percentageMatch).toBe(84);
      expect(result.matchDetails).not.toContain('Matches LGBTQ+ friendly preference');
      expect(result.matchDetails).toContain('Matches medical support needs');
      expect(result.matchDetails).not.toContain('Matches mental health support needs');
    });

    test('calculates correct match percentage with all preferences', () => {
      const perfectUserData = {
        ...mockUserData,
        wheelchair: 'Yes',
        lgbtqFriendly: 'Yes',
        medicalConditions: 'Yes',
        mentalHealth: 'Yes',
        substanceUse: 'Yes',
        domesticAbuse: 'Yes',
        foodAssistance: 'Yes',
        benefitsHelp: 'Yes',
        immigrationStatus: 'No Recourse to Public Funds (NRPF)',
        careLeaver: 'Yes',
        veteran: 'Yes',
        benefits: ['Housing Benefit'],
        localConnection: ['Local connection to area']
      };
      const perfectShelter = {
        ...mockShelter,
        accessibilityFeatures: ['Wheelchair Accessible'],
        lgbtqFriendly: 'Yes',
        hasMedical: 'Yes',
        hasMentalHealth: 'Yes',
        specializedGroups: ['People with substance use issues', 'People fleeing domestic abuse', 'Care leavers', 'Veterans'],
        foodType: 'Full board (all meals provided)',
        additionalServices: ['Benefits advice', 'Substance use support'],
        acceptNRPF: 'Yes',
        housingBenefitAccepted: 'Yes - we accept housing benefit',
        localConnectionRequired: 'No - we accept anyone',
        allowAllReligions: 'Yes'
      };
      const result = calculateShelterMatch(perfectUserData, perfectShelter);
      expect(result).toBeValidShelterMatch();
      expect(result.percentageMatch).toBe(100);
      expect(result.matchDetails).toContain('Matches wheelchair accessibility needs');
      expect(result.matchDetails).toContain('Matches LGBTQ+ friendly preference');
      expect(result.matchDetails).toContain('Matches medical support needs');
      expect(result.matchDetails).toContain('Matches mental health support needs');
      expect(result.matchDetails).toContain('Matches substance use support needs');
      expect(result.matchDetails).toContain('Matches domestic abuse support needs');
      expect(result.matchDetails).toContain('Matches food assistance needs');
      expect(result.matchDetails).toContain('Matches benefits assistance needs');
      expect(result.matchDetails).toContain('Matches immigration status requirements');
      expect(result.matchDetails).toContain('Matches care leaver support needs');
      expect(result.matchDetails).toContain('Matches veteran support needs');
      expect(result.matchDetails).toContain('Matches housing benefit acceptance');
      expect(result.matchDetails).toContain('Matches local connection requirements');
      expect(result.matchDetails).toContain('Matches religious requirements');
    });

    test('calculates baseline match with no preferences', () => {
      const baselineUserData = {
        ...mockUserData,
        wheelchair: 'No',
        lgbtqFriendly: 'No',
        medicalConditions: 'No',
        mentalHealth: 'No',
        substanceUse: 'No',
        domesticAbuse: 'No',
        foodAssistance: 'No',
        benefitsHelp: 'No',
        immigrationStatus: 'British Citizen',
        careLeaver: 'No',
        veteran: 'No',
        benefits: [],
        localConnection: ['No local connection']
      };
      const baselineShelter = {
        ...mockShelter,
        accessibilityFeatures: [],
        lgbtqFriendly: 'No',
        hasMedical: 'No',
        hasMentalHealth: 'No',
        specializedGroups: [],
        foodType: 'No food service provided',
        additionalServices: [],
        acceptNRPF: 'No',
        housingBenefitAccepted: 'No',
        localConnectionRequired: 'Yes - local connection required',
        allowAllReligions: 'No'
      };
      const result = calculateShelterMatch(baselineUserData, baselineShelter);
      expect(result).toBeValidShelterMatch();
      expect(result.percentageMatch).toBe(84);
      
      expect(result.matchDetails).toContain('Matches wheelchair accessibility needs');
      expect(result.matchDetails).toContain('Matches LGBTQ+ friendly preference');
      expect(result.matchDetails).toContain('Matches mental health support needs');
      expect(result.matchDetails).toContain('Matches substance use support needs');
      expect(result.matchDetails).toContain('Matches domestic abuse support needs');
      expect(result.matchDetails).toContain('Matches food assistance needs');
      expect(result.matchDetails).toContain('Matches benefits assistance needs');
      expect(result.matchDetails).toContain('Matches immigration status requirements');
      expect(result.matchDetails).toContain('Matches care leaver support needs');
      expect(result.matchDetails).toContain('Matches veteran support needs');
      expect(result.matchDetails).toContain('Matches housing benefit acceptance');
    });

    test('calculates 100% match when all criteria match', () => {
      const perfectMatch = calculateShelterMatch(
        {
          ...mockUserData,
          pets: 'No',
          wheelchair: 'Yes',
          lgbtqFriendly: 'Yes',
          medicalConditions: 'Yes',
          mentalHealth: 'Yes',
          substanceUse: 'Yes',
          domesticAbuse: 'Yes',
          foodAssistance: 'Yes',
          benefitsHelp: 'Yes',
          immigrationStatus: 'British Citizen',
          careLeaver: 'Yes',
          veteran: 'Yes'
        },
        {
          ...mockShelter,
          petPolicy: 'No pets allowed',
          accessibilityFeatures: ['Wheelchair Accessible'],
          lgbtqFriendly: 'Yes',
          hasMedical: 'Yes',
          hasMentalHealth: 'Yes',
          specializedGroups: ['People with substance use issues', 'People fleeing domestic abuse', 'Care leavers', 'Veterans'],
          foodType: 'Full board (all meals provided)',
          additionalServices: ['Benefits advice'],
          acceptNRPF: 'Yes',
          housingBenefitAccepted: 'Yes - we accept housing benefit'
        }
      );
      expect(perfectMatch).toBeValidShelterMatch();
      expect(perfectMatch.percentageMatch).toBe(100);
      expect(perfectMatch.matchDetails).toHaveLength(14); 
    });

    test('handles minimum possible score', () => {
      const minMatch = calculateShelterMatch(
        {
          ...mockUserData,
          pets: 'No',
          wheelchair: 'No',
          lgbtqFriendly: 'No',
          medicalConditions: 'No',
          mentalHealth: 'No',
          substanceUse: 'No',
          domesticAbuse: 'No',
          foodAssistance: 'No',
          benefitsHelp: 'No',
          immigrationStatus: 'British Citizen',
          careLeaver: 'No',
          veteran: 'No'
        },
        {
          ...mockShelter,
          petPolicy: 'No pets allowed',
          accessibilityFeatures: [],
          lgbtqFriendly: 'No',
          hasMedical: 'No',
          hasMentalHealth: 'No',
          specializedGroups: [],
          foodType: 'No food service provided',
          additionalServices: [],
          acceptNRPF: 'No',
          housingBenefitAccepted: 'No'
        }
      );
      expect(minMatch).toBeValidShelterMatch();
      expect(minMatch.percentageMatch).toBe(84);
    });
  });

  describe('Score calculation edge cases', () => {
    test('calculates 100% match when all criteria match', () => {
      const perfectMatch = calculateShelterMatch(
        {
          ...mockUserData,
          pets: 'No',
          wheelchair: 'Yes',
          lgbtqFriendly: 'Yes',
          medicalConditions: 'Yes',
          mentalHealth: 'Yes',
          substanceUse: 'Yes',
          domesticAbuse: 'Yes',
          foodAssistance: 'Yes',
          benefitsHelp: 'Yes',
          immigrationStatus: 'British Citizen',
          careLeaver: 'Yes',
          veteran: 'Yes'
        },
        {
          ...mockShelter,
          petPolicy: 'No pets allowed',
          accessibilityFeatures: ['Wheelchair Accessible'],
          lgbtqFriendly: 'Yes',
          hasMedical: 'Yes',
          hasMentalHealth: 'Yes',
          specializedGroups: ['People with substance use issues', 'People fleeing domestic abuse', 'Care leavers', 'Veterans'],
          foodType: 'Full board (all meals provided)',
          additionalServices: ['Benefits advice'],
          acceptNRPF: 'Yes',
          housingBenefitAccepted: 'Yes - we accept housing benefit'
        }
      );
      expect(perfectMatch).toBeValidShelterMatch();
      expect(perfectMatch.percentageMatch).toBe(100);
      expect(perfectMatch.matchDetails).toHaveLength(14); 
    });

    test('handles minimum possible score', () => {
      const minMatch = calculateShelterMatch(
        {
          ...mockUserData,
          pets: 'No',
          wheelchair: 'No',
          lgbtqFriendly: 'No',
          medicalConditions: 'No',
          mentalHealth: 'No',
          substanceUse: 'No',
          domesticAbuse: 'No',
          foodAssistance: 'No',
          benefitsHelp: 'No',
          immigrationStatus: 'British Citizen',
          careLeaver: 'No',
          veteran: 'No'
        },
        {
          ...mockShelter,
          petPolicy: 'No pets allowed',
          accessibilityFeatures: [],
          lgbtqFriendly: 'No',
          hasMedical: 'No',
          hasMentalHealth: 'No',
          specializedGroups: [],
          foodType: 'No food service provided',
          additionalServices: [],
          acceptNRPF: 'No',
          housingBenefitAccepted: 'No'
        }
      );
      expect(minMatch).toBeValidShelterMatch();
      expect(minMatch.percentageMatch).toBe(84);
    });

    test('calculates correct weighted scores', () => {
      const result = calculateShelterMatch(mockUserData, mockShelter);
      expect(result).toBeValidShelterMatch();
      expect(result.percentageMatch).toBeGreaterThanOrEqual(84);
      expect(result.percentageMatch).toBeLessThanOrEqual(100);
    });
  });
}); 