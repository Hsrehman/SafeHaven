"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// Define internal resource mapping
const internalResources = {
  // Food related resources
  "food": "/resources/foodbanks",
  "food bank": "/resources/foodbanks",
  "food banks": "/resources/foodbanks",
  "foodbank": "/resources/foodbanks",
  "foodbanks": "/resources/foodbanks",
  "meal": "/resources/foodbanks",
  "meals": "/resources/foodbanks",
  "hungry": "/resources/foodbanks",
  "eat": "/resources/foodbanks",
  
  // Shelter related resources
  "shelter": "/resources/shelters",
  "shelters": "/resources/shelters",
  "housing": "/resources/shelters",
  "accommodation": "/resources/shelters",
  "sleep": "/resources/shelters",
  "homeless": "/resources/shelters",
  "homelessness": "/resources/shelters",
  "emergency housing": "/resources/shelters",
  
  // Medical resources
  "medical": "/resources/medical-resources",
  "healthcare": "/resources/medical-resources",
  "health": "/resources/medical-resources",
  "doctor": "/resources/medical-resources",
  "hospital": "/resources/medical-resources",
  "clinic": "/resources/medical-resources",
  
  // Mental health resources
  "mental health": "/resources/mental-health",
  "counseling": "/resources/mental-health",
  "therapy": "/resources/mental-health",
  "depression": "/resources/mental-health",
  "anxiety": "/resources/mental-health",
  "crisis": "/resources/mental-health",
  
  // Benefit resources
  "benefits": "/resources/benefits",
  "welfare": "/resources/benefits",
  "financial aid": "/resources/benefits",
  "money": "/resources/benefits",
  "financial": "/resources/benefits",
  
  // Contact information
  "contact": "/contact",
  "help": "/contact",
  "helpline": "/contact",
  "support": "/contact"
};

// External resources as fallbacks
const externalResources = {
  "food": "https://www.trusselltrust.org/get-help/find-a-foodbank/",
  "shelter": "https://england.shelter.org.uk/housing_advice/homelessness/get_help_from_the_council_when_homeless",
  "medical": "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/",
  "mental health": "https://www.mind.org.uk/information-support/guides-to-support-and-services/crisis-services/getting-help-in-a-crisis/",
  "benefits": "https://www.gov.uk/browse/benefits",
  "domestic violence": "https://www.nationaldahelpline.org.uk/",
  "refugee": "https://www.refugeecouncil.org.uk/get-support/services/",
  "legal aid": "https://www.gov.uk/legal-aid",
  "clothing": "https://trusselltrustorg-my.sharepoint.com/personal/press_trusselltrust_org/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fpress%5Ftrusselltrust%5Forg%2FDocuments%2FMedia%20Library%2FClothing%20banks%2FClothing%20banks%20%2D%20public%20list%2Epdf&parent=%2Fpersonal%2Fpress%5Ftrusselltrust%5Forg%2FDocuments%2FMedia%20Library%2FClothing%20banks&ga=1"
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);

  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          sender: "bot", 
          text: "Hello! I'm the Safe Haven assistant. How can I help you today? You can ask me about shelters, food banks, medical resources, or other support services."
        }
      ]);
    }
  }, [isOpen, messages.length]);

  
  useEffect(() => {
    
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = Date.now().toString();
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  const processResponseWithLinks = (text) => {
    
    if (text.includes("](")) return text;
    
    let processedText = text;
    
    // Check for keywords that match internal resources
    Object.keys(internalResources).forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      if (regex.test(processedText)) {
        processedText = processedText.replace(
          regex, 
          `[${keyword}](${internalResources[keyword]})`
        );
      }
    });
    
    // For any remaining resource-related terms, add external links if available
    Object.keys(externalResources).forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      if (regex.test(processedText) && !processedText.includes(`[${keyword}]`)) {
        processedText = processedText.replace(
          regex, 
          `[${keyword}](${externalResources[keyword]})`
        );
      }
    });
    
    return processedText;
  };

  
  const saveMessageToDatabase = async (messageText, sender) => {
    try {
      await fetch('/api/chatbot/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          sender
        }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const userQuery = input;
    setInput("");
    setIsLoading(true);
    
    
    saveMessageToDatabase(input, "user");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      
      const botMessage = data.message || data.response || "Sorry, I couldn't process your request.";
      
      
      const processedResponse = processResponseWithLinks(botMessage);
      
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: processedResponse }
      ]);

      
      saveMessageToDatabase(botMessage, "bot");
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: "Sorry, I'm having trouble connecting. Please try again later." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 m-4 z-50">
      <style jsx global>{`
        @keyframes typingAnimation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      
      {isOpen ? (
        <div
          style={{
            width: "350px",
            maxHeight: "500px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 12px 28px 0 rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#0066cc",
              color: "#fff",
              padding: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ fontWeight: "600", fontSize: "16px" }}>Safe Haven Chat Assistant</div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              padding: "15px",
              flexGrow: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "380px"
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.sender === "user" ? "#0066cc" : "#f5f5f5",
                  color: msg.sender === "user" ? "#fff" : "#333",
                  padding: "10px 14px",
                  borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  maxWidth: "80%"
                }}
              >
                <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => (
                      <a 
                        {...props} 
                        style={{ 
                          color: msg.sender === "user" ? "#fff" : "#0066cc", 
                          textDecoration: "underline" 
                        }}
                        target={props.href.startsWith('http') ? "_blank" : "_self"}
                        rel={props.href.startsWith('http') ? "noopener noreferrer" : ""}
                      />
                    )
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}
            
            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  padding: "10px 14px",
                  borderRadius: "18px 18px 18px 4px",
                  maxWidth: "80%"
                }}
              >
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <div className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#888", animation: "typingAnimation 1s infinite ease-in-out" }}></div>
                  <div className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#888", animation: "typingAnimation 1s infinite ease-in-out 0.2s" }}></div>
                  <div className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#888", animation: "typingAnimation 1s infinite ease-in-out 0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            style={{
              borderTop: "1px solid #eaeaea",
              padding: "10px",
              display: "flex"
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flexGrow: 1,
                border: "1px solid #ddd",
                borderRadius: "20px",
                padding: "8px 15px",
                marginRight: "8px",
                outline: "none"
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                backgroundColor: "#0066cc",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                opacity: isLoading || !input.trim() ? 0.7 : 1
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}