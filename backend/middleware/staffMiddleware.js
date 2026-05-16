/**
 * Middleware για τον έλεγχο δικαιωμάτων πρόσβασης (Role-Based Access Control).
 * Επιτρέπει τη συνέχεια μόνο αν ο χρήστης έχει ρόλο 'admin' ή 'employee'.
 */
module.exports = (req, res, next) => {
    // Έλεγχος αν υπάρχει ταυτοποιημένος χρήστης στο request (από το προηγούμενο auth middleware)
    // και αν ο ρόλος του ανήκει στις επιτρεπόμενες κατηγορίες προσωπικού.
    if (req.user && (req.user.role === 'admin' || req.user.role === 'employee')) {
        // Αν ο χρήστης είναι admin ή employee, η πρόσβαση επιτρέπεται
        next();
    } else {
        // Αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα, επιστρέφεται σφάλμα 403 (Forbidden)
        res.status(403).json({ 
            message: "Πρόσβαση απαγορευμένη: Απαιτούνται δικαιώματα Προσωπικού ή Admin." 
        });
    }
};