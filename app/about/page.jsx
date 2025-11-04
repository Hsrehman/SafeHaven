'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Home, Utensils, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';

const About = () => {
  const [openFaqs, setOpenFaqs] = useState({});

  const toggleFaq = (category, index) => {
    setOpenFaqs(prev => ({
      ...prev,
      [`${category}-${index}`]: !prev[`${category}-${index}`]
    }));
  };

  const faqCategories = [
    {
      title: 'Using Safe Haven',
      questions: [
        {
          question: 'Do I need an account to use Safe Haven?',
          answer: 'Yes, an account is required to apply for shelters and access certain features, but browsing is open to everyone.'
        },
        {
          question: 'Is Safe Haven free to use?',
          answer: 'Yes, our platform is completely free for those seeking shelter or food assistance.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we only share necessary details with shelters and food banks when you apply for assistance.'
        }
      ]
    },
    {
      title: 'Shelters & Housing',
      questions: [
        {
          question: 'How do I find a shelter that suits my needs?',
          answer: 'Our system matches you with shelters based on availability, location, and your specific requirements (e.g., women-only or family-friendly shelters).'
        },
        {
          question: 'How long does it take to get a response from a shelter?',
          answer: 'Response times vary, but our messaging system allows shelters to update you directly.'
        },
        {
          question: 'What if I get rejected from a shelter?',
          answer: 'You can apply to multiple shelters at once without filling out new applications each time.'
        },
        {
          question: 'Can I leave a review for a shelter?',
          answer: 'Yes, users can leave feedback to help others make informed decisions.'
        }
      ]
    },
    {
      title: 'Food Bank Assistance',
      questions: [
        {
          question: 'How do I find a food bank near me?',
          answer: 'Use our interactive map to locate nearby food banks based on your real-time location.'
        },
        {
          question: 'How do I know when a food bank is open?',
          answer: 'Each food bank\'s profile shows opening hours and services provided.'
        },
        {
          question: 'What happens if a food bank runs out of food?',
          answer: 'We estimate busyness levels based on past data so you can plan your visit when stock is more likely to be available.'
        },
        {
          question: 'Can I request specific food items?',
          answer: 'Some food banks post polls where users can request specific items, though availability depends on donations.'
        }
      ]
    },
    {
      title: 'Technical Help & Support',
      questions: [
        {
          question: 'I forgot my password—how do I reset it?',
          answer: 'Click "Forgot Password" on the login page and follow the instructions to reset it.'
        },

        {
          question: 'Who can I contact for support?',
          answer: (
            <>
              Visit our <Link href="/contact" className="text-[#3B82C4] hover:underline">Contact Us</Link> page for assistance.
            </>
          )
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900 opacity-10 pattern-grid-lg"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
            <span className="block">About</span>
            <span className="block text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Safe Haven</span>
          </h1>

        </div>
      </div>

      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#154360] mb-8">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-12 max-w-4xl">
            Safe Haven connects homeless individuals with <span className="font-semibold">shelter and food assistance</span> through a simple, user-friendly platform.
          </p>
          
          <h2 className="text-3xl font-bold text-[#154360] mb-8">Why We Exist</h2>
          <p className="text-lg text-gray-700 mb-12 max-w-4xl">
            Homelessness is a growing issue in the UK, and many struggle to find <span className="font-semibold">available shelters or food banks</span>. 
            We aim to remove these barriers by providing an easy way to <span className="font-semibold">apply for shelters, check food bank availability, 
            and get real-time updates</span>.
          </p>
        </div>
      </section>

      <section className="py-16 px-8 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#154360] mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#3B82C4] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Home className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#154360] mb-4 text-center">Shelter Assistance</h3>
              <p className="text-gray-600 text-center">
                Apply to multiple shelters with a single form and receive updates via our messaging system.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#3B82C4] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Utensils className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#154360] mb-4 text-center">Food Bank Finder</h3>
              <p className="text-gray-600 text-center">
                Locate nearby food banks and see estimated busyness to plan your visit.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-[#3B82C4] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#154360] mb-4 text-center">Community Support</h3>
              <p className="text-gray-600 text-center">
                Use our forums to get tips and advice from others in similar situations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#154360] mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                <h3 className="text-2xl font-bold text-[#154360] mb-6">{category.title}</h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div 
                      key={faqIndex} 
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                    >
                      <button
                        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                        onClick={() => toggleFaq(categoryIndex, faqIndex)}
                      >
                        <span className="font-medium text-[#154360]">{faq.question}</span>
                        {openFaqs[`${categoryIndex}-${faqIndex}`] ? (
                          <ChevronUp className="text-[#3B82C4]" size={20} />
                        ) : (
                          <ChevronDown className="text-[#3B82C4]" size={20} />
                        )}
                      </button>
                      {openFaqs[`${categoryIndex}-${faqIndex}`] && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-8 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Need Assistance?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            We're here to help you find shelter and food resources when you need them most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/form" className="bg-white text-[#154360] hover:bg-gray-100 py-3 px-8 rounded-lg font-medium shadow-lg transition-colors">
              Get Help Now
            </Link>
            <Link href="/contact" className="bg-transparent hover:bg-white/10 border-2 border-white py-3 px-8 rounded-lg font-medium transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;