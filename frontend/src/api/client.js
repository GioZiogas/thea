// Εισαγωγή της βιβλιοθήκης axios για τη διαχείριση των HTTP αιτημάτων
import axios from 'axios';

// Δημιουργία ενός instance (αντιγράφου) του axios με προκαθορισμένες ρυθμίσεις
const apiClient = axios.create({
    // Η βασική διεύθυνση του API σου (Base URL)
    baseURL: 'http://192.168.3.125:5000/api', 
    // Προκαθορισμένα headers που θα στέλνονται σε κάθε αίτημα
    headers: {
        'Content-Type': 'application/json',
    }
});

// Εξαγωγή του apiClient για χρήση σε άλλα αρχεία της εφαρμογής
export default apiClient;