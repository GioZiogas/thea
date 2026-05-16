const express = require('express');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();
const db = require('./config/db');

//  ΕΙΣΑΓΩΓΗ ROUTES 
const authRoutes = require('./routes/authRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const showRoutes = require('./routes/showRoutes');

const app = express();

//  MIDDLEWARE 
app.use(cors()); // Επιτρέπει αιτήματα από διαφορετικά domains (π.χ. από το κινητό στον server)
app.use(express.json()); // Επιτρέπει στον server να διαβάζει JSON δεδομένα από το body των αιτημάτων

// Στατική διάθεση του φακέλου uploads για την προβολή των εικόνων των παραστάσεων
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  DEBUG LOG MIDDLEWARE 
// Καταγράφει κάθε αίτημα που δέχεται ο server στο τερματικό (βοηθάει στον εντοπισμό σφαλμάτων)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

// Επανάληψη του static (υπάρχει ήδη παραπάνω, διατηρείται ως έχει στον κώδικά σου)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  API ROUTES 
app.use('/api/auth', authRoutes); // Διαχείριση χρηστών & Login
app.use('/api/theatres', theatreRoutes); // Πληροφορίες θεάτρων & προγραμμάτων
app.use('/api/reservations', reservationRoutes); // Διαχείριση κρατήσεων
app.use('/api/shows', showRoutes); // Λίστες και λεπτομέρειες παραστάσεων

//  ENDPOINT ΓΙΑ ΔΥΝΑΜΙΚΗ ΔΗΜΙΟΥΡΓΙΑ ΘΕΣΕΩΝ 
// Επιστρέφει τις θέσεις για μια συγκεκριμένη προβολή βάσει του διαθέσιμου αριθμού στη βάση
app.get('/api/showtimes/:id/seats', async (req, res) => {
    const showtimeId = req.params.id;
    try {
        // Query που ενώνει (JOIN) τα showtimes με τα shows για να πάρει τη βασική τιμή
        const [results] = await db.execute(`
            SELECT st.available_seats, s.base_price 
            FROM showtimes st
            JOIN shows s ON st.show_id = s.shows_id 
            WHERE st.showtimes_id = ?`, 
            [showtimeId]
        );

        if (results.length === 0) return res.status(404).json({ error: "Not found" });

        // Δημιουργία εικονικού Array θέσεων βάσει του αριθμού available_seats
        const seats = Array.from({ length: results[0].available_seats }, (_, i) => ({
            seat_id: i + 1,
            seat_number: i + 1,
            status: 'available',
            price: results[0].base_price
        }));
        
        res.json(seats);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

//  404 HANDLER 
// Εκτελείται αν ο χρήστης χτυπήσει ένα endpoint που δεν υπάρχει
app.use((req, res) => {
    res.status(404).send({ error: `Route ${req.method} ${req.url} not found` });
});

//  SERVER START 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});