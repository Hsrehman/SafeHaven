'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuestionSelector from '@/app/components/QuestionSelector';

export default function EditAnswersPage() {
  const [formData, setFormData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    
    const storedData = localStorage.getItem('formData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        
        if (parsedData.timestamp && parsedData.data) {
          setFormData(parsedData.data);
        } else {
          
          router.push('/form');
        }
      } catch (error) {
        console.error('Error parsing form data:', error);
        router.push('/form');
      }
    } else {
      
      router.push('/form');
    }
  }, [router]);

  const handleQuestionSelect = (question) => {
    if (!formData) return;
    
    
    localStorage.setItem('editingQuestion', JSON.stringify(question));
    localStorage.setItem('editingFormData', JSON.stringify(formData));
    
    router.push('/form?mode=edit');
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <QuestionSelector formData={formData} onQuestionSelect={handleQuestionSelect} />;
} 