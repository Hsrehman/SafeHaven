
const debugMode = true;

export const calculateShelterMatch = (userFormData, shelter) => {
  if (debugMode) {
    console.log('🔄 Starting shelter match calculation');
    console.log('👤 User data:', JSON.stringify(userFormData, null, 2));
    console.log('🏠 Shelter data:', JSON.stringify(shelter, null, 2));
  }

  if (!shelter || !shelter._id || !shelter.shelterName) {
    if (debugMode) console.log('❌ Invalid shelter data');
    return null;
  }

  const dob = new Date(userFormData.dob);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear() - 
              (today.getMonth() < dob.getMonth() || 
               (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
  if (debugMode) console.log('📅 Calculated age:', age);

  let score = 0;
  let maxScore = 0;
  const matchDetails = [];
  const failedCriteria = [];

  const mandatoryChecks = [
    {
      criterion: 'Location',
      pass: function() {
        if (debugMode) {
          console.log('Location Check Input:', {
            userCoordinates: userFormData.location_coordinates,
            shelterCoordinates: shelter.location_coordinates,
            userLocation: userFormData.location,
            shelterLocation: shelter.location
          });
        }

        if (userFormData.location_coordinates?.lat && userFormData.location_coordinates?.lng && 
            shelter.location_coordinates?.lat && shelter.location_coordinates?.lng) {
          const distance = calculateDistance(userFormData.location_coordinates, shelter.location_coordinates);
          if (debugMode) {
            console.log('Location Check (Coordinates):', {
              userLocation: userFormData.location,
              shelterLocation: shelter.location,
              userCoordinates: userFormData.location_coordinates,
              shelterCoordinates: shelter.location_coordinates,
              distance: `${distance.toFixed(2)} km`
            });
          }

          const MAX_DISTANCE = 50;
          
          if (distance > MAX_DISTANCE) {
            this.reason = `Shelter is too far (${distance.toFixed(2)} km). Maximum distance is ${MAX_DISTANCE} km`;
            return false;
          }
          return true;
        }

        if (userFormData.location && shelter.location) {
          const userCity = extractCity(userFormData.location).toLowerCase();
          const shelterCity = extractCity(shelter.location).toLowerCase();
          
          if (debugMode) {
            console.log('Location Check (Text):', {
              userCity,
              shelterCity,
              userLocation: userFormData.location,
              shelterLocation: shelter.location,
              reason: 'Falling back to text-based matching because coordinates are not available'
            });
          }

          if (userCity && shelterCity && userCity === shelterCity) {
            return true;
          }

          this.reason = `Shelter is in a different city (${shelterCity}) than user (${userCity})`;
          return false;
        }

        this.reason = 'Location information missing';
        return false;
      },
      reason: ''
    },
    {
      criterion: 'Gender Policy',
      pass: function() {
        if (debugMode) {
          console.log('Gender Check:', {
            shelterPolicy: shelter.genderPolicy,
            userGender: userFormData.gender,
            womenOnly: userFormData.womenOnly
          });
        }
        
        if (shelter.genderPolicy === 'Men Only') {
          if (userFormData.gender !== 'Male') {
            this.reason = 'Shelter is men-only and user is not male';
            return false;
          }
          return true;
        }
        
        if (shelter.genderPolicy === 'Women Only') {
          if (userFormData.gender !== 'Female' && 
              !(userFormData.gender === 'Non-binary' && userFormData.womenOnly === 'Yes')) {
            this.reason = 'Shelter is women-only and user does not match criteria';
            return false;
          }
          return true;
        }
        
        if (shelter.genderPolicy === 'All Genders') {
          if (userFormData.womenOnly === 'Yes') {
            this.reason = 'User requested women-only shelter but shelter accepts all genders';
            return false;
          }
          return true;
        }
        
        this.reason = 'Invalid or unsupported gender policy';
        return false;
      },
      reason: '' 
    },
    {
      criterion: 'Stay Length',
      pass: function() {
        if (debugMode) {
          console.log('Stay Length Check:', {
            shelterMaxStay: shelter.maxStayLength,
            userNeed: userFormData.shelterType
          });
        }
        if (!shelter.maxStayLength) {
          this.reason = 'Shelter stay length information missing';
          return false;
        }
        const isMatch = userFormData.shelterType === 'Emergency (tonight)' ? 
               ['1 night only', 'Up to 7 nights', 'Up to 28 days'].includes(shelter.maxStayLength) :
               userFormData.shelterType === 'Short-term (few days/weeks)' ? 
               ['Up to 7 nights', 'Up to 28 days', 'Up to 3 months'].includes(shelter.maxStayLength) :
               ['Up to 6 months', 'Up to 12 months', 'More than 12 months', 'No fixed limit'].includes(shelter.maxStayLength);
        
        if (!isMatch) {
          this.reason = `Stay length mismatch: User needs ${userFormData.shelterType} but shelter offers ${shelter.maxStayLength}`;
        }
        return isMatch;
      },
      reason: ''
    },
    {
      criterion: 'Group Type',
      pass: function() {
        if (debugMode) {
          console.log('Group Type Check:', {
            groupType: userFormData.groupType,
            groupSize: userFormData.groupSize,
            hasFamily: shelter.hasFamily,
            maxFamilySize: shelter.maxFamilySize
          });
        }

        if (userFormData.groupType === 'Just myself') {
          return true;
        }

        if (userFormData.groupType === 'Myself and my family') {
          if (!shelter.hasFamily) {
            this.reason = 'Shelter does not accept families';
            return false;
          }
          if (shelter.maxFamilySize && parseInt(userFormData.groupSize) > parseInt(shelter.maxFamilySize)) {
            this.reason = `Family size (${userFormData.groupSize}) exceeds shelter maximum (${shelter.maxFamilySize})`;
            return false;
          }
          return true;
        }

        if (userFormData.groupType === 'Myself and my partner') {
          if (!shelter.acceptsCouples) {
            this.reason = 'Shelter does not accept couples';
            return false;
          }
          return true;
        }

        return true;
      },
      reason: ''
    },
    {
      criterion: 'Age Requirements',
      pass: function() {
        if (debugMode) {
          console.log('Age Check:', {
            userAge: age,
            minAge: shelter.minAge,
            maxAge: shelter.maxAge
          });
        }

        if (shelter.minAge && age < shelter.minAge) {
          this.reason = `User age (${age}) is below shelter minimum age (${shelter.minAge})`;
          return false;
        }
        if (shelter.maxAge && age > shelter.maxAge) {
          this.reason = `User age (${age}) is above shelter maximum age (${shelter.maxAge})`;
          return false;
        }
        return true;
      },
      reason: ''
    },
    {
      criterion: 'Pet Policy',
      pass: function() {
        if (debugMode) {
          console.log('Pet Check:', {
            userHasPets: userFormData.pets,
            shelterPetPolicy: shelter.petPolicy
          });
        }

        if (userFormData.pets === 'Yes') {
          if (shelter.petPolicy === 'No pets allowed') {
            this.reason = 'Shelter does not allow pets';
            return false;
          }
        }
        return true;
      },
      reason: ''
    }
  ];

  for (const check of mandatoryChecks) {
    if (debugMode) console.log(`🔍 Starting ${check.criterion} check`);
    const passed = check.pass();
    if (debugMode) {
      console.log(`🔍 ${check.criterion} check result:`, {
        passed,
        reason: check.reason,
        userValue: check.criterion === 'Gender Policy' ? userFormData.gender : 'N/A',
        shelterValue: check.criterion === 'Gender Policy' ? shelter.genderPolicy : 'N/A'
      });
    }

    if (!passed) {
      failedCriteria.push(check.reason || `Failed mandatory check: ${check.criterion}`);
      if (debugMode) console.log(`❌ Failed mandatory check: ${check.criterion} - ${check.reason}`);
      return null;
    }
  }
  
  const optionalChecks = [
    {
      criterion: 'Accessibility',
      match: userFormData.wheelchair !== 'Yes' || 
             (shelter.accessibilityFeatures && shelter.accessibilityFeatures.includes('Wheelchair Accessible')),
      weight: 15,
      detail: 'Matches wheelchair accessibility needs'
    },
    {
      criterion: 'LGBTQ+ Friendly',
      match: userFormData.lgbtqFriendly !== 'Yes' || shelter.lgbtqFriendly === 'Yes',
      weight: 10,
      detail: 'Matches LGBTQ+ friendly preference'
    },
    {
      criterion: 'Medical Support',
      match: !userFormData.medicalConditions || shelter.hasMedical === 'Yes',
      weight: 12,
      detail: 'Matches medical support needs'
    },
    {
      criterion: 'Mental Health Support',
      match: userFormData.mentalHealth !== 'Yes' || shelter.hasMentalHealth === 'Yes',
      weight: 12,
      detail: 'Matches mental health support needs'
    },
    {
      criterion: 'Substance Use Support',
      match: userFormData.substanceUse !== 'Yes' || 
             (shelter.specializedGroups && shelter.specializedGroups.includes('People with substance use issues')) || 
             (shelter.additionalServices && shelter.additionalServices.includes('Substance use support')),
      weight: 10,
      detail: 'Matches substance use support needs'
    },
    {
      criterion: 'Domestic Abuse Support',
      match: userFormData.domesticAbuse !== 'Yes' || 
             (shelter.specializedGroups && shelter.specializedGroups.includes('People fleeing domestic abuse')),
      weight: 15,
      detail: 'Matches domestic abuse support needs'
    },
    {
      criterion: 'Food Assistance',
      match: userFormData.foodAssistance !== 'Yes' || shelter.foodType !== 'No food service provided',
      weight: 8,
      detail: 'Matches food assistance needs'
    },
    {
      criterion: 'Benefits Help',
      match: userFormData.benefitsHelp !== 'Yes' || 
             (shelter.additionalServices && shelter.additionalServices.includes('Benefits advice')),
      weight: 8,
      detail: 'Matches benefits assistance needs'
    },
    {
      criterion: 'Immigration Status',
      match: userFormData.immigrationStatus !== 'No Recourse to Public Funds (NRPF)' || 
             shelter.acceptNRPF === 'Yes' || 
             shelter.acceptNRPF === 'In certain circumstances (please specify)',
      weight: 10,
      detail: 'Matches immigration status requirements'
    },
    {
      criterion: 'Care Leaver Support',
      match: userFormData.careLeaver !== 'Yes' || 
             (shelter.specializedGroups && shelter.specializedGroups.includes('Care leavers')),
      weight: 8,
      detail: 'Matches care leaver support needs'
    },
    {
      criterion: 'Veteran Support',
      match: userFormData.veteran !== 'Yes' || 
             (shelter.specializedGroups && shelter.specializedGroups.includes('Veterans')),
      weight: 8,
      detail: 'Matches veteran support needs'
    },
    {
      criterion: 'Housing Benefit',
      match: !userFormData.benefits?.includes('Housing Benefit') || 
             (shelter.housingBenefitAccepted && shelter.housingBenefitAccepted.startsWith('Yes')),
      weight: 10,
      detail: 'Matches housing benefit acceptance'
    },
    {
      criterion: 'Local Connection',
      match: !shelter.localConnectionRequired || 
             shelter.localConnectionRequired === 'No - we accept anyone' ||
             (shelter.localConnectionRequired === 'Preferred but not essential') ||
             userFormData.localConnection?.some(conn => conn !== 'No local connection'),
      weight: 5,
      detail: 'Matches local connection requirements'
    },
    {
      criterion: 'Religious Requirements',
      match: shelter.allowAllReligions === 'Yes' || 
             (shelter.allowedReligions && shelter.allowedReligions.length > 0),
      weight: 5,
      detail: 'Matches religious requirements'
    }
  ];

  optionalChecks.forEach(check => {
    maxScore += check.weight;
    if (check.match) {
      score += check.weight;
      matchDetails.push(check.detail);
    }
  });

  const percentageMatch = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
  if (debugMode) console.log('📈 Percentage match:', percentageMatch);

  const result = {
    shelterId: shelter._id,
    shelterName: shelter.shelterName,
    percentageMatch,
    score,
    maxScore,
    matchDetails,
    failedCriteria,
    shelterInfo: {
      location: shelter.location,
      coordinates: shelter.location_coordinates,
      capacity: shelter.maxCapacity,
      operatingHours: shelter.operatingHours,
      contactInfo: shelter.phone,
      accommodationTypes: shelter.accommodationTypes,
      maxStayLength: shelter.maxStayLength,
      openOnHolidays: shelter.openOnHolidays,
      accessibilityFeatures: shelter.accessibilityFeatures,
      genderPolicy: shelter.genderPolicy,
      lgbtqFriendly: shelter.lgbtqFriendly,
      petPolicy: shelter.petPolicy,
      housingBenefitAccepted: shelter.housingBenefitAccepted,
      serviceCharges: shelter.serviceCharges,
      weeklyCharge: shelter.weeklyCharge,
      referralRoutes: shelter.referralRoutes,
      foodType: shelter.foodType,
      dietaryOptions: shelter.dietaryOptions,
      additionalServices: shelter.additionalServices,
      specializedGroups: shelter.specializedGroups,
      organizationName: shelter.organizationName || 'Not specified',
      localConnectionRequired: shelter.localConnectionRequired,
      allowAllReligions: shelter.allowAllReligions,
      hasMedical: shelter.hasMedical,
      hasMentalHealth: shelter.hasMentalHealth
    }
  };

  if (debugMode) console.log('✨ Final match result:', JSON.stringify(result, null, 2));
  return result;
};


export const calculateDistance = (point1, point2) => {
  if (!point1?.lat || !point1?.lng || !point2?.lat || !point2?.lng) {
    if (debugMode) console.log('Invalid coordinates provided');
    return Infinity;
  }

  const R = 6371; 
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  if (debugMode) console.log('Calculated distance:', distance, 'km');
  return distance;
};


function extractCity(address) {
  if (!address) return '';
  
  const parts = address.split(',').map(part => part.trim());
  
  
  const londonBoroughs = [
    'Westminster', 'Camden', 'Kensington and Chelsea', 'Hackney', 'Tower Hamlets',
    'Southwark', 'Lambeth', 'Islington', 'Haringey', 'Newham', 'Waltham Forest',
    'Lewisham', 'Greenwich', 'Croydon', 'Bromley', 'Hounslow', 'Ealing', 'Brent',
    'Barnet', 'Enfield', 'Harrow', 'Hillingdon', 'Redbridge', 'Havering',
    'Barking and Dagenham', 'Bexley', 'Sutton', 'Merton', 'Wandsworth',
    'Richmond upon Thames', 'Kingston upon Thames'
  ];
  
  
  const majorCities = [
    'London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 
    'Sheffield', 'Bristol', 'Glasgow'
  ];
  
  
  for (const part of parts) {
    if (londonBoroughs.includes(part)) {
      return 'London'; 
    }
  }
  
  
  for (const part of parts) {
    if (majorCities.includes(part)) {
      return part;
    }
  }
  
  
  for (const part of parts) {
    for (const city of majorCities) {
      if (part.includes(city)) {
        return city;
      }
    }
  }
  
  
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(part)) {
      return part;
    }
  }
  
  return parts[parts.length - 1] || '';
}