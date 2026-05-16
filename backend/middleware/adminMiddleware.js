module.exports = (req, res, next) => {
    // Το req.user γεμίζει από το προηγούμενο authMiddleware
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Πρόσβαση απαγορευμένη: Απαιτούνται δικαιώματα Admin." });
    }
};