
const authMiddleware = (req, res, next) => {
   
    const email = req.query.email || req.body.email;
    
    if (!email) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    next();
  };
  
  const registrationCompleteMiddleware = async (req, res, next) => {
    const email = req.query.email || req.body.email;
    
    if (!email) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    try {
      const userData = await getUserData(email); 
      
      if (!userData || !userData.registrationComplete) {
        return res.status(403).json({ 
          success: false, 
          message: "Registration not completed" 
        });
      }
      
      next();
    } catch (error) {
      console.error("Error in middleware:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  module.exports = {
    authMiddleware,
    registrationCompleteMiddleware
  };