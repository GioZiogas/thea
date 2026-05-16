const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware'); 

// 1. Δημιουργία κράτησης
router.post('/', authMiddleware, reservationController.createReservation);

// 2. Λήψη κρατήσεων του συνδεδεμένου χρήστη (Χρησιμοποίησε ένα από τα δύο, το /my είναι πιο σύντομο)
router.get('/my', authMiddleware, reservationController.getUserReservations);

// 3. Αίτημα ακύρωσης (Request Cancel) - Εδώ βάλαμε το σωστό όνομα middleware
router.patch('/cancel-request/:reservationId', authMiddleware, reservationController.requestCancelReservation);

// 4. Διαγραφή/Ακύρωση (Delete)
router.delete('/:id', authMiddleware, reservationController.deleteReservation);

// 5. Γενικό Get (Admin: όλες / User: δικές του)
router.get('/', authMiddleware, reservationController.getReservations);

router.get('/details/:id', authMiddleware, reservationController.getReservationDetails);

//  ADMIN ROUTES (Χωρίς έλεγχο ρόλου) 

// Έγκριση ακύρωσης
router.patch('/admin/approve-cancel/:id', 
    authMiddleware, 
    reservationController.approveCancelRequest
);

// Διαγραφή κράτησης
router.delete('/:id', 
    authMiddleware, 
    reservationController.deleteReservation
);

module.exports = router;