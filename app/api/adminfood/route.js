const express = require('express');
const router = express.Router();
const { authMiddleware, registrationCompleteMiddleware } = require('../../middleware/authMiddleware');
router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/getRegistrationData', authMiddleware, getRegistrationDataController);
router.post('/updateRegistration', authMiddleware, updateRegistrationController);
router.get('/dashboard', authMiddleware, registrationCompleteMiddleware, dashboardController);

module.exports = router;