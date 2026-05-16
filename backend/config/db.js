const mysql = require('mysql2');
require('dotenv').config();

// --- ΔΗΜΙΟΥΡΓΙΑ CONNECTION POOL ---
// Χρησιμοποιούμε Pool αντί για μεμονωμένη σύνδεση για καλύτερη διαχείριση 
// πολλαπλών ταυτόχρονων αιτημάτων στην εφαρμογή.
const pool = mysql.createPool({
    // Ανάκτηση ρυθμίσεων από το αρχείο .env για ασφάλεια
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    
    // Αν το όριο των συνδέσεων συμπληρωθεί, το αίτημα μπαίνει σε σειρά αναμονής
    waitForConnections: true,
    
    // Μέγιστος αριθμός ταυτόχρονων συνδέσεων που επιτρέπονται
    connectionLimit: 10
});

// Εξαγωγή του pool χρησιμοποιώντας το .promise()
// Αυτό μας επιτρέπει να χρησιμοποιούμε async/await στα ερωτήματα (queries)
// αντί για παραδοσιακά callbacks, κάνοντας τον κώδικα πιο καθαρό.
module.exports = pool.promise();