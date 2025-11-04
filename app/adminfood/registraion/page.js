"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/BusyTimes.module.css";
import {motion,AnimatePresence} from "framer-motion";
import dynamic from 'next/dynamic';


const MapWithNoSSR = dynamic(
  () => import('./MapComponet'),
  { ssr: false }
);


const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ""));
};


const convertToDMS = (coordinate, isLatitude) => {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  
  const direction = isLatitude 
    ? (coordinate >= 0 ? "N" : "S") 
    : (coordinate >= 0 ? "E" : "W");
  
  return `${degrees}°${minutes}'${seconds}"${direction}`;
};

const timeSlots = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"];

const questions = [
  {
    label: "Food Bank Name",
    type: "text",
    name: "foodBankName",
    required: true
  },
  { label: "Owner Name", type: "text", name: "ownerName", required: true },
  {
    label: "What kind of food do you serve?",
    type: "checkbox-group",
    name: "foodType",
    options: ["Veg", "Non-Veg", "Both"],
    required: true
  },
  {
    label: "What is your address?",
    type: "location",
    name: "location",
    required: true
  },
  {
    label: "Which genders do you allow?",
    type: "checkbox-group",
    name: "allowedGenders",
    options: ["Male", "Female", "LGBTQ+"],
    required: true
  },
  {
    label: "Do you provide takeaway containers?",
    type: "radio",
    name: "provideTakeaway",
    options: ["Yes", "No"],
    required: true
  },
  {
    label: "Do you open on public holidays?",
    type: "radio",
    name: "openOnHolidays",
    options: ["Yes", "No"],
    required: true
  },
  {
    label: "Do you have seating arrangements?",
    type: "seating",
    name: "seatingArrangement",
    required: true
  },
  {
    label: "Do you allow all religions?",
    type: "religion",
    name: "religionPolicy",
    required: true
  },
  {
    label: "What time and day are you busiest?",
    type: "busyTimes",
    name: "busyTimes",
    required: true
  },
  {
    label: "Contact Number",
    type: "tel",
    name: "contactNumber",
    required: true,
    placeholder: "Enter 10-digit number"
  }
];

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } }
};

export default function Registration() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState("WED");
  const [companyData, setCompanyData] = useState(null);
  const [direction, setDirection] = useState(1);
  const checkAuthStatus = async () => {
    try {
      let userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        userEmail = sessionStorage.getItem("userEmail");
      }
      if (!userEmail) {
        const urlParams = new URLSearchParams(window.location.search);
        userEmail = urlParams.get('email');
      }
      if (!userEmail) {
        router.push("/adminfood");
        return false;
      }
      const regResponse = await fetch(`/api/adminfood/getRegistrationData?email=${encodeURIComponent(userEmail)}`);
      const regResult = await regResponse.json();
      
      if (regResult.success && regResult.userData && regResult.userData.registrationComplete) {
        router.push(`/adminfood/dashboards?email=${encodeURIComponent(userEmail)}`);
        return false;
      }
      
      setFormData(prevData => ({
        ...prevData,
        email: userEmail
      }));
      
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/adminfood");
      return false;
    }
  };
  const [formData, setFormData] = useState({
    foodBankName: "",
    ownerName: "",
    email: "",
    foodType: [],
    locationType: "live", 
    location: {
      latitude: null,
      longitude: null,
      formattedAddress: "",
      dmsNotation: ""
    },
    allowedGenders: [],
    provideTakeaway: "",
    openOnHolidays: "",
    seatingArrangement: {
      hasSeating: "",
      seatingCapacity: null
    },
    religionPolicy: {
      allowAllReligions: "",
      allowedReligions: []
    },
    busyTimes: {
      MON: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      TUE: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      WED: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      THU: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      FRI: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      SAT: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      SUN: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 }
    },
    contactNumber: ""
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const handleLocationUpdate = (locationData) => {
    const { lat, lng, address } = locationData;
    
    const latDMS = convertToDMS(lat, true);
    const lngDMS = convertToDMS(lng, false);
    const dmsNotation = `${latDMS} ${lngDMS}`;
    
    setFormData(prevData => ({
      ...prevData,
      location: {
        latitude: lat,
        longitude: lng,
        formattedAddress: address || "",
        dmsNotation: dmsNotation
      }
    }));
    
    setFormErrors(prev => ({
      ...prev,
      location: ""
    }));
  };
 
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            
            const geocoder = new window.google.maps.Geocoder();
            
            
            const response = await new Promise((resolve, reject) => {
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results, status) => {
                  if (status === "OK") {
                    resolve(results);
                  } else {
                    reject(status);
                  }
                }
              );
            });
  
            
            const address = response[0];
            const latDMS = convertToDMS(latitude, true);
            const lngDMS = convertToDMS(longitude, false);
            const dmsNotation = `${latDMS} ${lngDMS}`;
            
            setFormData(prevData => ({
              ...prevData,
              location: {
                latitude,
                longitude,
                formattedAddress: address.formatted_address,
                dmsNotation: dmsNotation
              }
            }));
            
            setFormErrors(prev => ({
              ...prev,
              location: ""
            }));
          } catch (error) {
            console.error("Geocoding error:", error);
            setFormErrors(prev => ({
              ...prev,
              location: "Failed to get address details. Please try again."
            }));
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Failed to get current location. ";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "Please try again or use the map.";
          }
          
          setFormErrors(prev => ({
            ...prev,
            location: errorMessage
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setFormErrors(prev => ({
        ...prev,
        location: "Geolocation is not supported by this browser."
      }));
    }
  };

  
  const validateForm = (question, formData) => {
    const errors = {};
    if (question.type === "religion" && question.required) {
      if (!formData.religionPolicy.allowAllReligions) {
        errors.allowAllReligions = "Please select whether you allow all religions";
      } else if (
        formData.religionPolicy.allowAllReligions === "no" && 
        (!formData.religionPolicy.allowedReligions || 
         formData.religionPolicy.allowedReligions.length === 0)
      ) {
        errors.allowedReligions = "Please select at least one religion";
      }
    }
    if (question.required) {
      switch (question.type) {
        case "text":
        case "email":
          if (!formData[question.name] || formData[question.name].trim() === "") {
            errors[question.name] = `${question.label} is required`;
          }
          break;
          
        case "checkbox-group":
          if (!formData[question.name] || formData[question.name].length === 0) {
            errors[question.name] = `Please select at least one ${question.label.toLowerCase()}`;
          }
          break;
          
        case "location":
          if (!formData.location.latitude || !formData.location.longitude || !formData.location.formattedAddress) {
            errors.location = "Please select a location on the map";
          }
          break;
          
        case "radio":
          if (!formData[question.name]) {
            errors[question.name] = `Please select an option for ${question.label}`;
          }
          break;
          
          case "seating":
            if (!formData.seatingArrangement.hasSeating) {
              errors.hasSeating = "Please select whether you have seating arrangements";
            } else if (
              formData.seatingArrangement.hasSeating === "yes" && 
              !formData.seatingArrangement.seatingCapacity
            ) {
              errors.seatingCapacity = "Please enter seating capacity";
            }
            break;
          
            case "religion":
              if (!formData.religionPolicy.allowAllReligions) {
                errors.allowAllReligions = "Please select whether you allow all religions";
              } else if (
                formData.religionPolicy.allowAllReligions === "no" && 
                (!formData.religionPolicy.allowedReligions || 
                 formData.religionPolicy.allowedReligions.length === 0)
              ) {
                errors.allowedReligions = "Please select allowed religions";
              }
              break;
          
        case "busyTimes":
          break;
          
        case "tel":
          if (!formData[question.name]) {
            errors[question.name] = "Phone number is required";
          } else if (!isValidPhoneNumber(formData[question.name])) {
            errors[question.name] = "Please enter a valid 10-digit phone number";
          }
          break;
      }
    }
    
    return errors;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleNext(); 
    } else if (e.key === "ArrowRight") {
      e.preventDefault(); 
      handleNext(); 
    } else if (e.key === "ArrowLeft") {
      e.preventDefault(); 
      handlePrevious(); 
    }
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value.replace(/[^\d\s+]/g, "");
    if (formattedValue.startsWith("+")) {
      formattedValue = "+" + formattedValue.substring(1).replace(/\+/g, "");
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: formattedValue
    }));
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ""
    }));
  };

  const handleBusyTimeChange = (day, time, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      busyTimes: {
        ...prevFormData.busyTimes,
        [day]: {
          ...prevFormData.busyTimes[day],
          [time]: parseInt(value)
        }
      }
    }));
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
  
    setFormErrors({ ...formErrors, [name]: "" });
    
    
  
    if (type === "checkbox") {
      if (name === "allowedReligions") {
        handleReligionChange(e);
      } else if (name === "allowAllReligions") {
        setFormData(prevData => ({
          ...prevData,
          religionPolicy: {
            ...prevData.religionPolicy,
            allowAllReligions: value,
            allowedReligions: value === "yes" ? [] : prevData.religionPolicy.allowedReligions
          }
        }));
      } else {
        setFormData((prevData) => {
          const fieldName =
            name === "Veg" || name === "Non-Veg" || name === "Both"
              ? "foodType"
              : name;
          const updatedArray = checked
            ? [...prevData[fieldName], value || name]
            : prevData[fieldName].filter((option) => option !== (value || name));
          return { ...prevData, [fieldName]: updatedArray };
        });
      }
    } else if (name === "hasSeating") {
      setFormData((prevData) => ({
        ...prevData,
        seatingArrangement: {
          ...prevData.seatingArrangement,
          hasSeating: value,
          seatingCapacity: value === "no" ? null : prevData.seatingArrangement.seatingCapacity
        }
      }));
    } else if (name === "seatingCapacity") {
      setFormData((prevData) => ({
        ...prevData,
        seatingArrangement: {
          ...prevData.seatingArrangement,
          seatingCapacity: value
        }
      }));
    } else if (name === "allowAllReligions") {
      setFormData((prevData) => ({
        ...prevData,
        religionPolicy: {
          ...prevData.religionPolicy,
          allowAllReligions: value,
          allowedReligions: value === "yes" ? [] : prevData.religionPolicy.allowedReligions
        }
      }));
    } else {
      
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
   
    console.log("Updated formData after change:", formData);
  };

  const handleReligionChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      religionPolicy: {
        ...prevData.religionPolicy,
        allowedReligions: checked
        ? [...new Set([...prevData.religionPolicy.allowedReligions, value])] 
        : prevData.religionPolicy.allowedReligions.filter((r) => r !== value)
      }
    }));
  };
  const handleNext = () => {
    const errors = validateForm(questions[currentPage], formData);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const allErrors = {};
   questions.forEach((question) => {
    const questionErrors = validateForm(question, formData);
    Object.assign(allErrors, questionErrors);
   });
  setFormErrors(allErrors);
  if (!formData.email || formData.email.trim() === "") {
    alert("Email is required. Please log in again.");
    router.push("/login");
    return;
  }
  
  if (Object.keys(allErrors).length === 0) {
    try {
      setIsLoading(true);

      const finalFormData = {
        ...formData,
        email: formData.email 
      };

      const response = await fetch("/api/adminfoodregistration-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(finalFormData)
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userEmail", formData.email);
        sessionStorage.setItem("userEmail", formData.email);
        setSubmissionSuccess(true);
        setTimeout(() => {
          router.push(`/adminfood/dashboards?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  }
};
  
  const renderAddressFields = () => (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Address Number
      </label>
      <input
        type="text"
        name="addressNumber"
        value={formData.addressNumber}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
      {formErrors.addressNumber && (
        <p className="text-red-500 text-xs italic">
          {formErrors.addressNumber}
        </p>
      )}
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Postcode
      </label>
      <input
        type="text"
        name="addressPostcode"
        value={formData.addressPostcode}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
      {formErrors.addressPostcode && (
        <p className="text-red-500 text-xs italic">
          {formErrors.addressPostcode}
        </p>
      )}
      <label className="block text-gray-700 text-sm font-bold mb-2">
        City
      </label>
      <input
        type="text"
        name="addressCity"
        value={formData.addressCity}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
      {formErrors.addressCity && (
        <p className="text-red-500 text-xs italic">
          {formErrors.addressCity}
        </p>
      )}
    </div>
  );

  
  const renderLocationSelector = () => (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Select Your Location
      </label>
      
      <div className="h-[400px] w-full rounded-lg overflow-hidden border-2 border-blue-200 mb-4">
        <MapWithNoSSR 
          onLocationSelect={handleLocationUpdate}
          initialLocation={formData.location.latitude && formData.location.longitude ? 
            {lat: formData.location.latitude, lng: formData.location.longitude} : null}/>
      </div>
      
      {formData.location.latitude && formData.location.longitude && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">Selected Location:</p>
          <p className="text-sm text-blue-700 break-words">{formData.location.dmsNotation}</p>
          {formData.location.formattedAddress && (
            <p className="text-sm text-blue-600 mt-1">{formData.location.formattedAddress}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderBusyTimes = () => {
    const timeSlots = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            color: '#333',
            margin: 0,
            fontSize: '18px',
            fontWeight: '500'
          }}>Popular Times</h3>
          
          <select 
            value={activeDay}
            onChange={(e) => setActiveDay(e.target.value)}
            style={{
              padding: '8px 32px 8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#000',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              appearance: 'menulist'
            }}
          >
            {days.map(day => (
              <option key={day} value={day} style={{fontSize: '16px', color: '#000'}}>
                {day}
              </option>
            ))}
          </select>
        </div>
  
        <div style={{
          position: 'relative',
          height: '200px',
          padding: '20px 0'
        }}>
          
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingRight: '10px',
            color: '#333'
          }}>
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>
  
         
          <div style={{
            marginLeft: '40px',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px'
          }}>
            {timeSlots.map((time) => (
              <div key={time} style={{
                flex: 1,
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  flex: 1,
                  position: 'relative',
                  width: '100%'
                }}>
                  
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${formData.busyTimes[activeDay][time]}%` }}
                    transition={{ duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm"/>
                </div>
                
              
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '20px',
                  marginTop: '4px'
                }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.busyTimes[activeDay][time]}
                    onChange={(e) => handleBusyTimeChange(activeDay, time, e.target.value)}
                    style={{
                      width: '100%',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
                
               
                <span style={{
                  marginTop: '8px',
                  textAlign: 'center',
                  color: '#333',
                  fontSize: '12px'
                }}>{time}</span>
              </div>
            ))}
          </div>
        </div>
  
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          Drag the sliders up and down to set busy times
        </div>
      </div>
    );
  };

  const renderSeatingArrangement = () => (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Do you have seating arrangements?
      </label>
      <div className="space-y-2">
        <label className="flex items-center p-3 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer w-full">
          <input
            type="radio"
            name="hasSeating"
            value="yes"
            checked={formData.seatingArrangement.hasSeating === "yes"}
            onChange={handleChange}
            className="mr-3 h-5 w-5 accent-blue-600"/>
          <span className="text-blue-800 font-medium">Yes</span>
        </label>
        <label className="flex items-center p-3 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer w-full">
          <input
            type="radio"
            name="hasSeating"
            value="no"
            checked={formData.seatingArrangement.hasSeating === "no"}
            onChange={handleChange}
            className="mr-3 h-5 w-5 accent-blue-600"/>
          <span className="text-blue-800 font-medium">No</span>
        </label>
      </div>
      
      {formData.seatingArrangement.hasSeating === "yes" && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Seating Capacity
          </label>
          <input
            type="number"
            name="seatingCapacity"
            value={formData.seatingArrangement.seatingCapacity || ""}
            onChange={handleChange}
            className="shadow-md appearance-none border-2 border-blue-100 focus:border-blue-500 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all duration-300"/>
        </motion.div>
      )}
      {formErrors.seatingCapacity && (
        <p className="text-red-500 text-xs italic">
          {formErrors.seatingCapacity}
        </p>
      )}
    </div>
  );

  const renderReligionPolicy = () => (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Do you allow all religions?
      </label>
      <div className="space-y-2">
        <label className="flex items-center p-3 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer w-full">
          <input
            type="radio"
            name="allowAllReligions"
            value="yes"
            checked={formData.religionPolicy.allowAllReligions === "yes"}
            onChange={handleChange}
            className="mr-3 h-5 w-5 accent-blue-600"/>
          <span className="text-blue-800 font-medium">Yes</span>
        </label>
        <label className="flex items-center p-3 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer w-full">
          <input
            type="radio"
            name="allowAllReligions"
            value="no"
            checked={formData.religionPolicy.allowAllReligions === "no"}
            onChange={handleChange}
            className="mr-3 h-5 w-5 accent-blue-600"/>
          <span className="text-blue-800 font-medium">No</span>
        </label>
      </div>
      
      {formData.religionPolicy.allowAllReligions === "no" && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select allowed religions
          </label>
          <div className="space-y-2">
            {["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Other"].map(
              (religion) => (
                <label key={religion} className="flex items-center p-3 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    name="allowedReligions"
                    value={religion}
                    checked={formData.religionPolicy.allowedReligions.includes(religion)}
                    onChange={handleChange}
                    className="mr-3 h-5 w-5 accent-blue-600"/>
                  <span className="text-blue-800 font-medium">{religion}</span>
                </label>
              )
            )}
          </div>
        </motion.div>
      )}
      {formErrors.allowedReligions && (
        <p className="text-red-500 text-xs italic">
          {formErrors.allowedReligions}
        </p>
      )}
    </div>
  );
  const renderRadioGroup = (question) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {question.label}
        </label>
        <div className="space-y-2">
          {question.options.map((option) => (
            <label 
              key={option} 
              className="flex items-center p-3 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer w-full" >
              <input
                type="radio"
                name={question.name}
                value={option}
                checked={formData[question.name] === option}
                onChange={handleChange}
                className="mr-3 h-5 w-5 accent-blue-600"/>
              <span className="text-blue-800 font-medium">{option}</span>
            </label>
          ))}
        </div>
        {formErrors[question.name] && (
          <p className="text-red-500 text-xs italic">
            {formErrors[question.name]}
          </p>
        )}
      </div>
    );
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "text":
      case "email":
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {question.label}
            </label>
            <input
              type={question.type}
              name={question.name}
              value={formData[question.name]}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              className="shadow-md appearance-none border-2 border-blue-100 focus:border-blue-500 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all duration-300"/>
            {formErrors[question.name] && (
              <p className="text-red-500 text-xs italic">
                {formErrors[question.name]}
              </p>
            )}
          </div>
        );
      case "tel":
        return (
          <div className="mb-4">
            <label className="block text-black text-sm font-bold mb-2">
              {question.label}
            </label>
            <input
              type="tel"
              name={question.name}
              value={formData[question.name]}
              onChange={handlePhoneChange}
              placeholder={question.placeholder}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              maxLength="15"/>
            {formErrors[question.name] && (
              <p className="text-red-500 text-xs italic">
                {formErrors[question.name]}
              </p>
            )}
            <p className="text-gray-600 text-xs mt-1">
              Format: +91 1234567890 or 1234567890
            </p>
          </div>
        );
      case "checkbox-group":
        return (
          <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2">
      {question.label}
    </label>
    <div className="space-y-2">
      {question.options.map((option) => (
        <label 
          key={option} 
          className="flex items-center p-3 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer w-full">
          <input
            type="checkbox"
            name={question.name === "foodType" ? option : question.name}
            value={option}
            checked={formData[question.name].includes(option)}
            onChange={handleChange}
            className="mr-3 h-5 w-5 accent-blue-600"/>
          <span className="text-blue-800 font-medium">{option}</span>
        </label>
      ))}
    </div>
    {formErrors[question.name] && (
      <p className="text-red-500 text-xs italic">
        {formErrors[question.name]}
      </p>
    )}
  </div>
);
      case "radio":
        return renderRadioGroup(question);
      case "address":
        return renderAddressFields();
        case "location":
      return renderLocationSelector();
      case "seating":
        return renderSeatingArrangement();
      case "religion":
        return renderReligionPolicy();
      case "busyTimes":
        return renderBusyTimes();
      default:
        return null;
    }
  };

  useEffect(() => {
    setMounted(true);
    
    const checkCompanyData = async () => {
      try {
        const storedData = localStorage.getItem("companyData");
        if (storedData) {
          setCompanyData(JSON.parse(storedData));
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Submission error:", error);
        alert(error.message || "An error occurred during registration");
      } finally {
        setIsLoading(false);
      }
    };
    checkCompanyData();
  }, []);
  useEffect(() => {
   
    const email = localStorage.getItem("email");
    
    if (email && email.trim() !== "") {
      
      setFormData(prevData => ({ ...prevData, email }));
      console.log("Using email from localStorage:", email);
    } else {
      console.warn("No email found in localStorage");
    
    }
  }, [router]);
  
  
  function getUserEmailFromSession() {
   
    return null; 
  }

 
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 via-blue-400 to-blue-800"
      suppressHydrationWarning={true} >
      {(!mounted || isLoading) ? (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl border border-blue-100" >
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
            Registration Page
          </h1>
          {submissionSuccess && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-500 mb-4 text-center font-medium">
              Registration successful!
            </motion.p>
          )}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                custom={direction}>
                {renderQuestion(questions[currentPage])}
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-between mt-6">
              {currentPage > 0 && (
                <motion.button
                  type="button"
                  onClick={handlePrevious}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants} >
                  Previous
                </motion.button>
              )}
              {currentPage < questions.length - 1 ? (
                <motion.button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md ml-auto"
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}>
                  Next
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md ml-auto"
                  disabled={isLoading}
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}>
                  {isLoading ? "Submitting..." : "Submit"}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}