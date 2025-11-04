export async function POST(request) {
  try {
    const { message } = await request.json();
    
    // Convert message to lowercase for case-insensitive matching
    const query = message.toLowerCase().trim();
    
    // Define topic keywords for better matching
    const topics = {
      shelter: ["shelter", "sleep", "housing", "accommodation", "bed", "stay", "night", "roof", "homeless"],
      food: ["food", "hungry", "meal", "eat", "breakfast", "lunch", "dinner", "snack", "foodbank"],
      medical: ["medical", "doctor", "health", "sick", "illness", "hospital", "nurse", "medicine", "healthcare"],
      mentalHealth: ["mental", "anxiety", "depression", "stress", "therapy", "counseling", "psychological", "psychiatrist"],
      hygiene: ["shower", "bathroom", "toilet", "wash", "clean", "hygiene", "soap", "toothbrush", "sanitary"],
      benefits: ["benefits", "welfare", "money", "financial", "fund", "payment", "aid", "assistance", "support"],
      clothing: ["cloth", "dress", "shirt", "pants", "shoes", "jacket", "winter", "warm", "wear"],
      contact: ["contact", "call", "phone", "reach", "email", "helpline", "hotline", "number", "speak"]
    };
    
    // Define comprehensive responses
    const responses = {
      greeting: {
        keywords: ["hello", "hi", "hey", "morning", "afternoon", "evening", "greetings"],
        response: "Hello! How can I help you today? I can provide information about shelters, food banks, medical resources, and other support services."
      },
      shelter: {
        response: "If you need a place to stay, you have several options:\n\n" +
                 "- **Emergency shelters**: Immediate overnight accommodation - [Find nearby shelters](/shelters?type=emergency)\n" +
                 "- **Transitional housing**: Temporary housing with support - [View options](/shelters?type=transitional)\n" +
                 "- **Housing assistance**: Programs to help with long-term housing - [Learn more](/housing-resources)\n\n" +
                 "You can also call our shelter hotline at 0300-123-4567 for immediate assistance."
      },
      food: {
        response: "If you're hungry or need food assistance, here are your options:\n\n" +
                 "- **Food banks**: Get groceries and supplies - [Find a food bank](/find-a-meal)\n" +
                 "- **Free meals**: Hot meals served daily - [Meal locations](/meal-locations)\n" +
                 "- **Food vouchers**: Emergency food assistance - [Check eligibility](/food-vouchers)\n\n" +
                 "Our [meal finder tool](/find-a-meal) can help locate the closest food services to you."
      },
      medical: {
        response: "For health concerns, these resources are available:\n\n" +
                 "- **Free clinics**: No-cost healthcare - [Find a clinic](/healthcare#free-clinics)\n" +
                 "- **Emergency care**: For urgent medical needs - [Emergency services](/healthcare#emergency)\n" +
                 "- **Prescription assistance**: Help getting medicine - [Medication help](/healthcare#prescriptions)\n\n" +
                 "For medical emergencies, always call 999."
      },
      mentalHealth: {
        response: "Mental health support is available through various services:\n\n" +
                 "- **Crisis support**: Immediate help - Call 116 123 (Samaritans)\n" +
                 "- **Counseling services**: Free counseling - [Find counseling](/mental-health#counseling)\n" +
                 "- **Support groups**: Connect with others - [Support groups](/mental-health#groups)\n\n" +
                 "Visit our [Mental Health Resources page](/mental-health) for comprehensive information."
      },
      hygiene: {
        response: "For hygiene and sanitation needs:\n\n" +
                 "- **Public showers**: Clean facilities - [Shower locations](/hygiene#showers)\n" +
                 "- **Restrooms**: 24/7 access bathrooms - [Bathroom map](/hygiene#restrooms)\n" +
                 "- **Hygiene kits**: Free toiletries - [Where to get kits](/hygiene#kits)\n\n" +
                 "Our [Hygiene Services page](/hygiene) lists all available facilities."
      },
      benefits: {
        response: "For financial assistance and benefits:\n\n" +
                 "- **Universal Credit**: Apply or manage - [UC information](/benefits#universal-credit)\n" +
                 "- **Housing benefits**: Help with rent - [Check eligibility](/benefits#housing)\n" +
                 "- **Emergency funds**: Crisis assistance - [Emergency support](/benefits#crisis)\n\n" +
                 "Our advisors can help you navigate the benefits system - [Book appointment](/benefits#advice)"
      },
      clothing: {
        response: "If you need clothing:\n\n" +
                 "- **Free clothing banks**: Get essential items - [Clothing locations](/clothing#banks)\n" +
                 "- **Winter gear**: Warm clothes for cold weather - [Winter items](/clothing#winter)\n" +
                 "- **Specialist items**: Work clothes, baby items, etc. - [Special requests](/clothing#specialist)\n\n" +
                 "Visit our [Clothing Resources page](/clothing) to find what you need."
      },
      contact: {
        response: "You can contact Safe Haven through these channels:\n\n" +
                 "- **Helpline**: 0300-123-4567 (24/7)\n" +
                 "- **Email**: help@safehaven.org\n" +
                 "- **In person**: Visit our center at 123 Main Street, Open Mon-Fri 9am-5pm\n" +
                 "- **Online chat**: Available on our [Contact page](/contact)\n\n" +
                 "For emergencies outside office hours, please call our helpline."
      },
      help: {
        keywords: ["help", "support", "assistance", "resources", "services"],
        response: "I can help you find information about:\n\n" +
                 "- Places to stay - [Shelters](/shelters)\n" +
                 "- Food resources - [Food banks](/find-a-meal)\n" +
                 "- Medical care - [Healthcare](/healthcare)\n" +
                 "- Mental health support - [Mental health](/mental-health)\n" +
                 "- Benefits advice - [Benefits](/benefits)\n\n" +
                 "What specific assistance are you looking for today?"
      },
      about: {
        keywords: ["about", "who are you", "what is", "safe haven"],
        response: "Safe Haven is a platform designed to help people experiencing homelessness or housing insecurity find essential resources and support services. Our mission is to connect individuals with shelters, food banks, healthcare, and other services to meet their immediate needs while working toward stable housing solutions."
      }
    };
    
    // Function to calculate how well the query matches a set of keywords
    function matchScore(query, keywords) {
      let score = 0;
      for (const keyword of keywords) {
        if (query.includes(keyword)) {
          score += 1;
          // Give extra weight to exact matches or phrases
          if (query === keyword || query.includes(` ${keyword} `)) {
            score += 2;
          }
        }
      }
      return score;
    }
    
    // Try to match with exact responses first
    for (const [category, data] of Object.entries(responses)) {
      if (data.keywords && matchScore(query, data.keywords) > 0) {
        return new Response(JSON.stringify({ 
          message: data.response,
          category,
          type: "text",
          timestamp: new Date().toISOString()
        }), { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }
    
    // If no match found in direct keywords, analyze by topic
    let bestTopic = null;
    let highestScore = 0;
    
    for (const [topic, keywords] of Object.entries(topics)) {
      const score = matchScore(query, keywords);
      if (score > highestScore) {
        highestScore = score;
        bestTopic = topic;
      }
    }
    
    // If we found a matching topic and score is decent
    if (bestTopic && highestScore > 0) {
      const topicResponses = {
        shelter: responses.shelter.response,
        food: responses.food.response,
        medical: responses.medical.response,
        mentalHealth: responses.mentalHealth.response,
        hygiene: responses.hygiene.response,
        benefits: responses.benefits.response,
        clothing: responses.clothing.response,
        contact: responses.contact.response
      };
      
      return new Response(JSON.stringify({ 
        message: topicResponses[bestTopic],
        topic: bestTopic,
        confidence: highestScore,
        type: "text",
        timestamp: new Date().toISOString()
      }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }
    
    // Default response if no match found
    return new Response(JSON.stringify({ 
      message: "I'm not sure I understand your question. You can ask me about shelters, food resources, healthcare, mental health support, or visit our [Help Center](/help) for more information. Could you try rephrasing your question?",
      type: "text",
      timestamp: new Date().toISOString()
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
    
  } catch (error) {
    console.error("Chatbot API error:", error);
    return new Response(JSON.stringify({
      message: "Sorry, I encountered an error. Please try again later.",
      error: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" } 
    });
  }
}