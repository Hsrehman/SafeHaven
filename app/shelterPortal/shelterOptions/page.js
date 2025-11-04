'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Users, Clock, Check, AlertCircle, ChevronRight, 
   Home, Calendar, Info, Heart, Utensils, PoundSterling, 
  Shield, Award, HandHeart, Accessibility, Edit2, User, DollarSign, 
  Stethoscope, Brain, PawPrint
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ShelterOptionsPage() {
  const [matches, setMatches] = useState([]);
  const [selectedShelters, setSelectedShelters] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [cardBounds, setCardBounds] = useState(null);
  const cardsRef = useRef([]);
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMatches();
  }, [refreshKey]);

  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchMatches = async () => {
    console.log('Starting fetchMatches function');
    try {
      
      const storedData = localStorage.getItem('formData');
      console.log('Retrieved formData from localStorage:', storedData);
  
      if (!storedData) {
        console.error('No form data found in localStorage');
        throw new Error('No form data found');
      }
  
      const { data: userData } = JSON.parse(storedData);
      console.log('Parsed user data:', userData);
  
      const response = await fetch('/api/shelter-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      console.log('API response status:', response.status);
  
      const result = await response.json();
      console.log('API response data:', result);
      
      if (!response.ok) {
        console.error('API error:', result.message);
        throw new Error(result.message || 'Failed to fetch matches');
      }
  
      console.log('Setting matches state with:', result.matches);
      setMatches(result.matches);
    } catch (error) {
      console.error('Error in fetchMatches:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (index) => {
    const cardElement = cardsRef.current[index];
    const bounds = cardElement.getBoundingClientRect();
    setCardBounds(bounds);
    setExpandedCard(matches[index]);
  };

  const handleClose = () => {
    setExpandedCard(null);
  };

  const handleAmendAnswers = () => {
    router.push('/form/edit-answers');
  };

  const handleShelterSelect = (shelterId) => {
    setSelectedShelters(prev => {
      if (prev.includes(shelterId)) {
        return prev.filter(id => id !== shelterId);
      } else {
        return [...prev, shelterId];
      }
    });
  };

  const handleApplyToSelected = async () => {
    if (selectedShelters.length === 0) {
      alert('Please select at least one shelter to apply to');
      return;
    }

    try {
      const storedData = localStorage.getItem('formData');
      const parsedData = JSON.parse(storedData);
      const { data: userData, id: formId } = parsedData;
      
      
      userData.selectedShelters = selectedShelters;
      
      
      localStorage.setItem('formData', JSON.stringify({
        ...parsedData,
        data: userData
      }));

      for (const shelterId of selectedShelters) {
        const response = await fetch('/api/shelter-applications/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shelterId,
            formId,
            userData
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to submit application');
        }
      }

      router.push('/shelterPortal/application-confirmation');
    } catch (error) {
      console.error('Error submitting applications:', error);
      alert('Failed to submit applications. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 max-w-md shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">Error Loading Matches</h2>
          </div>
          <p className="mt-4 text-gray-600">{error}</p>
          <button 
            onClick={handleAmendAnswers}
            className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300"
          >
            Return to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow bg-gradient-to-b from-[#F8FAFC] to-white py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#154360]">Matching Shelters</h1>
          <button
            onClick={handleApplyToSelected}
            disabled={selectedShelters.length === 0}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
              selectedShelters.length > 0
                ? 'bg-gradient-to-r from-[#3B82C4] to-[#1A5276] hover:from-[#2E5984] hover:to-[#154360] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Apply to Selected ({selectedShelters.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showSuccessNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-[#E8F4FF] to-[#F0F7FF] border-l-4 border-[#3B82C4] text-[#154360] px-6 py-4 rounded-xl mb-8 relative shadow-lg"
              role="alert"
            >
              <div className="flex items-center">
                <Check className="h-5 w-5 text-[#3B82C4] mr-3" />
                <div>
                  <strong className="font-bold text-[#1A5276]">Perfect Match Found! </strong>
                  <span className="block sm:inline text-[#2E5984]">We've identified shelters that align with your needs.</span>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:text-[#154360] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82C4]"></div>
            <p className="mt-4 text-[#2E5984]">Finding the best shelter matches for you...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-700">
                {error}. Please try again or <button onClick={handleAmendAnswers} className="underline">amend your answers</button>.
              </p>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-[#2E5984]" />
            </div>
            <h2 className="text-xl font-semibold text-[#154360] mb-2">No Matching Shelters Found</h2>
            <p className="text-[#2E5984] mb-6">We couldn't find any shelters that match your current criteria.</p>
            <button
              onClick={handleAmendAnswers}
              className="bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white px-6 py-3 rounded-xl hover:from-[#2E5984] hover:to-[#154360] transition-all duration-300"
            >
              Modify Your Requirements
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.shelterId}
                ref={el => cardsRef.current[index] = el}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#154360] mb-1">{match.shelterName}</h2>
                    <p className="text-[#2E5984]">{match.shelterInfo.organizationName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedShelters.includes(match.shelterId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleShelterSelect(match.shelterId);
                      }}
                      className="h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 text-gray-600 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{match.shelterInfo.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Capacity: {match.shelterInfo.capacity}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{match.shelterInfo.operatingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#154360] mb-3">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.matchDetails.slice(0, 3).map((detail, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#E8F4FF] to-[#F0F7FF] text-[#1A5276] text-sm rounded-full">
                        <Check className="w-3 h-3 mr-1" />
                        {detail}
                      </span>
                    ))}
                    {match.matchDetails.length > 3 && (
                      <span className="inline-flex items-center px-3 py-1 bg-[#F8FAFC] text-[#2E5984] text-sm rounded-full">
                        +{match.matchDetails.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(index);
                  }}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {expandedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleClose}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#154360] mb-2">{expandedCard.shelterName}</h2>
                  <p className="text-[#2E5984] mb-4">{expandedCard.shelterInfo.organizationName}</p>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#E8F4FF] to-[#F0F7FF] text-[#1A5276] rounded-full">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{expandedCard.percentageMatch}% Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-2 text-blue-500" />
                        Basic Information
                      </h3>
                      <div className="space-y-4 text-gray-600">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 mt-1 text-blue-500" />
                          <div>
                            <p>{expandedCard.shelterInfo.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Users className="w-5 h-5 mt-1 text-blue-500" />
                          <div>
                            <p>Capacity: {expandedCard.shelterInfo.capacity}</p>
                            <p className="text-sm text-gray-500">Current Occupancy: {expandedCard.shelterInfo.currentOccupancy}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 mt-1 text-blue-500" />
                          <div>
                            <p>{expandedCard.shelterInfo.operatingHours}</p>
                            <p className="text-sm text-gray-500">Open on Holidays: {expandedCard.shelterInfo.openOnHolidays}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Home className="w-5 h-5 mr-2 text-blue-500" />
                        Accommodation Details
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {expandedCard.shelterInfo.accommodationTypes.map((type, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                              {type}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          Maximum Stay: {expandedCard.shelterInfo.maxStayLength}
                        </p>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-500" />
                        Policies & Requirements
                      </h3>
                      <div className="space-y-3 text-gray-600">
                        <p className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          <strong className="text-gray-800 mr-2">Gender Policy:</strong> {expandedCard.shelterInfo.genderPolicy}
                        </p>
                        <p className="flex items-center">
                          <Heart className="w-4 h-4 mr-2 text-blue-500" />
                          <strong className="text-gray-800 mr-2">LGBTQ+ Friendly:</strong> {expandedCard.shelterInfo.lgbtqFriendly}
                        </p>
                        <p className="flex items-center">
                          <PawPrint className="w-4 h-4 mr-2 text-blue-500" />
                          <strong className="text-gray-800 mr-2">Pet Policy:</strong> {expandedCard.shelterInfo.petPolicy}
                        </p>
                      </div>
                    </section>

                    <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <PoundSterling className="w-5 h-5 mr-2 text-blue-500" />
                        Financial Information
                      </h3>
                      <div className="space-y-3 text-gray-600">
                        <p className="flex items-center">
                          <Check className="w-4 h-4 mr-2 text-blue-500" />
                          <strong className="text-gray-800 mr-2">Housing Benefit:</strong> {expandedCard.shelterInfo.housingBenefitAccepted}
                        </p>
                        <p className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                          <strong className="text-gray-800 mr-2">Service Charges:</strong> {expandedCard.shelterInfo.serviceCharges}
                        </p>
                      </div>
                    </section>

                    <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <HandHeart className="w-5 h-5 mr-2 text-blue-500" />
                        Support Services
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {expandedCard.shelterInfo.additionalServices.map((service, index) => (
                            <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <p className="flex items-center">
                            <Stethoscope className="w-4 h-4 mr-2 text-blue-500" />
                            <strong className="text-gray-800 mr-2">Medical:</strong> {expandedCard.shelterInfo.hasMedical}
                          </p>
                          <p className="flex items-center">
                            <Brain className="w-4 h-4 mr-2 text-blue-500" />
                            <strong className="text-gray-800 mr-2">Mental Health:</strong> {expandedCard.shelterInfo.hasMentalHealth}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Utensils className="w-5 h-5 mr-2 text-blue-500" />
                        Food & Dietary Options
                      </h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 flex items-center">
                          <strong className="text-gray-800 mr-2">Food Service:</strong> {expandedCard.shelterInfo.foodType}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {expandedCard.shelterInfo.dietaryOptions.map((option, index) => (
                            <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm rounded-full">
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShelterSelect(expandedCard.shelterId);
                    }}
                    className="bg-gradient-to-r from-[#3B82C4] to-[#1A5276] hover:from-[#2E5984] hover:to-[#154360] text-white px-8 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <span>Apply to This Shelter</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}