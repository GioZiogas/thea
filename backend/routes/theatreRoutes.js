const express = require('express');
const router = express.Router();
const theatreController = require('../controllers/theatreController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');

//  ΘΕΑΤΡΑ 
router.get('/', theatreController.getAllTheatres);
router.post('/', authMiddleware, adminMiddleware, theatreController.createTheatre);
router.put('/:id', authMiddleware, adminMiddleware, theatreController.updateTheatre);
router.delete('/:id', authMiddleware, adminMiddleware, theatreController.deleteTheatre);

//  ΣΥΝΔΕΣΗ ΘΕΑΤΡΩΝ-ΠΑΡΑΣΤΑΣΕΩΝ 
router.get('/by-show/:showId', theatreController.getTheatresByShow);

//  SHOWTIMES (ΠΡΟΒΟΛΕΣ) 

// 1. Μαζική αποθήκευση
router.post('/bulk-showtimes', authMiddleware, staffMiddleware, theatreController.createBulkShowtimes);

// 2. Αναλυτική λίστα για Reports
router.get('/showtimes/all', authMiddleware, staffMiddleware, theatreController.getAllShowtimesDetailed);

// 3. Λήψη θέσεων για μια ΠΡΟΒΟΛΗ (Μετακίνησέ το ΕΔΩ πάνω από το γενικό /showtimes/:id)
router.get('/showtimes/:id/seats', theatreController.getShowtimeSeats);

// 4. Λήψη προβολών για μια παράσταση
router.get('/showtimes/:id', theatreController.getShowtimesByShow);

// 5. Ενημέρωση/Διαγραφή συγκεκριμένης προβολής
router.put('/showtimes/:id', authMiddleware, staffMiddleware, theatreController.updateShowtime);
router.delete('/showtimes/:id', authMiddleware, staffMiddleware, theatreController.deleteShowtime);



module.exports = router;