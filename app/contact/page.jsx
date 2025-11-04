'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    reason: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    validatePhone(formData.phone);
  }, [formData.phone]);

  const validatePhone = (phoneNumber) => {
    if (!phoneNumber) {
      setPhoneError('');
      return true;
    }

    // UK phone number pattern - allowing optional starting 0
    const ukPhonePattern = /^(0)?[1-9]\d{9}$/;
    
    if (!ukPhonePattern.test(phoneNumber)) {
      setPhoneError('Invalid format. Should be e.g. 07911123456');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone' && value) {
      const digits = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: digits
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isPhoneValid = validatePhone(formData.phone);
    if (formData.phone && !isPhoneValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: '',
          reason: 'general'
        });
      } else {
        setSubmitError(data.error || "There was an error submitting your message.");
      }
    } catch (error) {
      setSubmitError("There was an error submitting your message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#154360] mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="bg-gradient-to-b from-[#3B82C4] to-[#1A5276] text-white p-8 md:w-1/3">
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Details</h3>
                    <p className="text-blue-100">Phone: </p>
                    <p className="text-blue-100">Email: </p>
                  </div>
                </div>
                <div className="mt-12">
                  <p className="text-blue-100">
                    Thank you for your interest in Safe Haven. We're dedicated to providing support to those experiencing homelessness.
                  </p>
                </div>
              </div>

              <div className="p-8 md:w-2/3">
                <h2 className="text-2xl font-bold text-[#154360] mb-6">Send Us a Message</h2>
                
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
                    <p className="font-medium">Thank you for your message!</p>
                    <p>We've received your inquiry and will get back to you as soon as possible.</p>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="mt-3 text-sm font-medium text-green-700 hover:text-green-500"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                        <p className="font-medium">Error</p>
                        <p>{submitError}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3B82C4] focus:border-[#3B82C4] focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3B82C4] focus:border-[#3B82C4] focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3B82C4] focus:border-[#3B82C4] focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        UK Phone Number
                      </label>
                      <div className="flex gap-2">
                        <div className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 flex items-center">
                          +44
                        </div>
                        <div className="flex-1 relative">
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. 07911123456"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                              phoneError 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#3B82C4] focus:border-[#3B82C4]'
                            }`}
                          />
                        </div>
                      </div>
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Contact
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3B82C4] focus:border-[#3B82C4] focus:outline-none"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#3B82C4] focus:border-[#3B82C4] focus:outline-none"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="privacy"
                        name="privacy"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-[#3B82C4] focus:ring-[#3B82C4] border-gray-300 rounded"
                      />
                      <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                        I consent to being contacted.
                      </label>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting || (formData.phone && phoneError)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}