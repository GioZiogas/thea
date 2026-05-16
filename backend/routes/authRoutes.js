const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

//  Δημόσια Routes 
router.post('/register', authController.register);
router.post('/login', authController.login);

//  User Routes (Απαιτούν Login) 
router.get('/me', authMiddleware, authController.getMe);
router.put('/update-profile', authMiddleware, authController.updateProfile); // Μετακινήθηκε εδώ
router.put('/change-password', authMiddleware, authController.changePassword);
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

//  Admin Routes (Απαιτούν Login ΚΑΙ ρόλο Admin) 
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.put('/users/role', authMiddleware, adminMiddleware, authController.updateUserRole);

module.exports = router;