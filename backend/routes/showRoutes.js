const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const showController = require('../controllers/showController');
const authMiddleware = require('../middleware/authMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');

// Ρύθμιση Multer για τις εικόνες
const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => { 
        // Δημιουργία μοναδικού ονόματος: timestamp + κατάληξη αρχείου
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Όριο 5MB
});

//  ADMIN / STAFF ROUTES (Προστατευμένα) 

// Δημιουργία νέας παράστασης με εικόνα
router.post('/', authMiddleware, staffMiddleware, upload.single('image'), showController.createShow);

// Ενημέρωση παράστασης (και προαιρετικά της εικόνας)
router.put('/:id', authMiddleware, staffMiddleware, upload.single('image'), showController.updateShow);

// Διαγραφή παράστασης (Soft delete)
router.delete('/:id', authMiddleware, staffMiddleware, showController.deleteShow);


//  PUBLIC ROUTES (Για το Frontend/App) 

// Λήψη όλων των παραστάσεων (υποστηρίζει ?category=...)
router.get('/', showController.getShows);

// Λήψη συγκεκριμένης παράστασης βάσει ID (περιλαμβάνει την εικόνα)
router.get('/:id', showController.getShowById);

module.exports = router;