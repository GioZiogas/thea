const jwt = require('jsonwebtoken');

/**
 * Middleware για την επαλήθευση του JWT Token.
 * Εξασφαλίζει ότι ο χρήστης είναι συνδεδεμένος πριν αποκτήσει πρόσβαση σε προστατευμένες διαδρομές.
 */
module.exports = (req, res, next) => {
    // Λήψη του Authorization header από το request
    const authHeader = req.headers['authorization'];
    
    // Εξαγωγή του token από τη μορφή "Bearer [TOKEN]"
    const token = authHeader && authHeader.split(' ')[1];

    // Αν δεν υπάρχει token, επιστρέφουμε σφάλμα 401 (Unauthorized)
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Επαλήθευση του token χρησιμοποιώντας το μυστικό κλειδί από το περιβάλλον (.env)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        // Αν το token είναι ληγμένο ή παραποιημένο, επιστρέφουμε 403 (Forbidden)
        if (err) return res.status(403).json({ message: "Invalid token" });
        
        /**
         * Προσθέτουμε τα αποκωδικοποιημένα στοιχεία του χρήστη στο αντικείμενο req.user.
         * Γίνεται πρόνοια ώστε το userId να αντιστοιχιστεί σωστά, ανεξάρτητα από το αν η βάση 
         * ή το login χρησιμοποίησε το πεδίο 'id', 'users_id' ή 'userId'.
         */
        req.user = {
            ...decoded,
            userId: decoded.id || decoded.users_id || decoded.userId
        };

        // DEBUG LOG: Εκτύπωση στο τερματικό του server για επιβεβαίωση της ταυτοποίησης
        console.log("Authenticated User ID:", req.user.userId);
        
        // Συνέχεια στην επόμενη συνάρτηση (controller)
        next();
    });
};