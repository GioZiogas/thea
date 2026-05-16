const db = require('../config/db');
//create reservation
exports.createReservation = async (req, res) => {
    // Πλέον περιμένουμε το selectedSeats (Array από IDs)
    const { showtime_id, selectedSeats, payment_method, total_price } = req.body;
    const user_id = req.user ? req.user.userId : null; 
    const seats_count = selectedSeats ? selectedSeats.length : 0;

    if (!user_id || !showtime_id || seats_count === 0) {
        return res.status(400).json({ error: "Πρέπει να επιλέξετε τουλάχιστον μία θέση." });
    }

    const connection = await db.getConnection(); // Παίρνουμε connection για το transaction

    try {
        await connection.beginTransaction();

        // 1. Δημιουργία της κύριας κράτησης
        const [result] = await connection.execute(
            'INSERT INTO reservations (user_id, showtime_id, seats_count, payment_method, total_price) VALUES (?, ?, ?, ?, ?)',
            [user_id, showtime_id, seats_count, payment_method || 'card', total_price || 0.00]
        );

        const reservationId = result.insertId;

        // 2. Εγγραφή κάθε θέσης ξεχωριστά στον πίνακα reservation_seats
        // Χρησιμοποιούμε Promise.all για ταχύτητα
        const seatQueries = selectedSeats.map(seatId => {
            return connection.execute(
                'INSERT INTO reservation_seats (reservation_id, showtime_id, seat_id) VALUES (?, ?, ?)',
                [reservationId, showtime_id, seatId]
            );
        });
        await Promise.all(seatQueries);

        // 3. Ενημέρωση των διαθέσιμων θέσεων στο showtime (προαιρετικό αν βασίζεσαι μόνο στα IDs)
        await connection.execute(
            'UPDATE showtimes SET available_seats = available_seats - ? WHERE showtimes_id = ?',
            [seats_count, showtime_id]
        );

        await connection.commit(); // Οριστικοποίηση όλων των αλλαγών

        res.status(201).json({ 
            message: "Η κράτηση ολοκληρώθηκε επιτυχώς!", 
            reservationId: reservationId 
        });

    } catch (error) {
        await connection.rollback(); // Αν κάτι πάει στραβά, ακύρωσε τα πάντα
        console.error("SQL Error during transaction:", error);
        res.status(500).json({ error: "Σφάλμα κατά την κράτηση των θέσεων. Δοκιμάστε ξανά." });
    } finally {
        connection.release(); // Επιστροφή του connection στο pool
    }
};


//  GET ALL USER RESERVATIONS 
exports.getUserReservations = async (req, res) => {
    const user_id = req.user.userId;

    try {
        const [rows] = await db.execute(`
            SELECT 
                r.reservations_id, 
                r.seats_count, 
                r.reservation_date, 
                r.total_price, 
                r.status, 
                r.payment_method,
                s.title, 
                st.date_time,
                -- Φέρνει τις θέσεις ως κείμενο (π.χ. "A1, A2")
                (SELECT GROUP_CONCAT(CONCAT(s_info.row_label, s_info.seat_number) SEPARATOR ', ') 
                 FROM reservation_seats rs 
                 JOIN seats s_info ON rs.seat_id = s_info.seat_id 
                 WHERE rs.reservation_id = r.reservations_id) as seat_details
            FROM reservations r
            JOIN showtimes st ON r.showtime_id = st.showtimes_id
            JOIN shows s ON st.show_id = s.shows_id
            WHERE r.user_id = ?
            ORDER BY r.reservation_date DESC
        `, [user_id]);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching user reservations:", error);
        res.status(500).json({ error: error.message });
    }
};

//  REQUEST CANCELATION 
exports.requestCancelReservation = async (req, res) => {
    const { reservationId } = req.params;
    const user_id = req.user.userId;

    try {
        // 1. Έλεγχος αν η κράτηση ανήκει στον χρήστη και αν είναι όντως 'confirmed'
        const [resCheck] = await db.execute(
            'SELECT status FROM reservations WHERE reservations_id = ? AND user_id = ?',
            [reservationId, user_id]
        );

        if (resCheck.length === 0) {
            return res.status(404).json({ message: "Η κράτηση δεν βρέθηκε." });
        }

        if (resCheck[0].status !== 'confirmed') {
            return res.status(400).json({ message: "Μόνο επιβεβαιωμένες κρατήσεις μπορούν να ακυρωθούν." });
        }

        // 2. Ενημέρωση του status
        await db.execute(
            "UPDATE reservations SET status = 'cancel requested' WHERE reservations_id = ?",
            [reservationId]
        );

        res.json({ message: "Το αίτημα ακύρωσης εστάλη επιτυχώς." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//delete
exports.deleteReservation = async (req, res) => {
    const { id } = req.params; // Το ID της κράτησης
    const user_id = req.user.userId;

    try {
        // 1. Βρίσκουμε την κράτηση για να δούμε πόσες θέσεις είχε και σε ποιο showtime
        const [reservation] = await db.execute(
            'SELECT * FROM reservations WHERE reservations_id = ? AND user_id = ?', 
            [id, user_id]
        );

        if (reservation.length === 0) {
            return res.status(404).json({ message: "Η κράτηση δεν βρέθηκε ή δεν έχετε δικαίωμα διαγραφής." });
        }

        const { showtime_id, seats_count } = reservation[0];

        // 2. Διαγραφή της κράτησης
        await db.execute('DELETE FROM reservations WHERE reservations_id = ?', [id]);

        // 3. Επιστροφή των θέσεων στο showtime
        await db.execute(
            'UPDATE showtimes SET available_seats = available_seats + ? WHERE showtimes_id = ?',
            [seats_count, showtime_id]
        );

        res.json({ message: "Η κράτηση ακυρώθηκε και οι θέσεις αποδεσμεύτηκαν." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Προβολή κρατήσεων με υποστήριξη Pagination
exports.getReservations = async (req, res) => {
    const user_id = req.user.userId;
    const role = req.user.role;

    // Λήψη παραμέτρων για σελιδοποίηση
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let query;
        let params = [];

        if (role === 'admin' || role === 'employee') {
            // Για Admin: Φέρνουμε 10 κρατήσεις με LIMIT και OFFSET
            query = `
                SELECT r.*, u.username, u.email, s.title, st.date_time 
                FROM reservations r
                JOIN users u ON r.user_id = u.users_id
                JOIN showtimes st ON r.showtime_id = st.showtimes_id
                JOIN shows s ON st.show_id = s.shows_id
                ORDER BY r.reservation_date DESC
                LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        } else {
            // Για απλό χρήστη
            query = `
                SELECT r.*, s.title, st.date_time 
                FROM reservations r
                JOIN showtimes st ON r.showtime_id = st.showtimes_id
                JOIN shows s ON st.show_id = s.shows_id
                WHERE r.user_id = ?
                ORDER BY r.reservation_date DESC
                LIMIT ? OFFSET ?`;
            params.push(user_id, limit, offset);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//get για να παρθουν οι λεπτομεριες την κράτησης
exports.getReservationDetails = async (req, res) => {
    const { id } = req.params; // Το ID της κράτησης από το URL

    try {
        const [rows] = await db.execute(`
            SELECT 
                r.reservations_id, 
                r.seats_count, 
                r.reservation_date, 
                r.total_price, 
                r.status, 
                r.payment_method,
                s.title, 
                st.date_time,
                -- ΑΥΤΟ ΕΙΝΑΙ ΤΟ ΚΛΕΙΔΙ:
                (SELECT GROUP_CONCAT(CONCAT(s_info.row_label, s_info.seat_number) SEPARATOR ', ') 
                 FROM reservation_seats rs 
                 JOIN seats s_info ON rs.seat_id = s_info.seat_id 
                 WHERE rs.reservation_id = r.reservations_id) as seat_details
            FROM reservations r
            JOIN showtimes st ON r.showtime_id = st.showtimes_id
            JOIN shows s ON st.show_id = s.shows_id
            WHERE r.reservations_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Η κράτηση δεν βρέθηκε" });
        }

        res.json(rows[0]); // Επιστρέφουμε το αντικείμενο
    } catch (error) {
        console.error("Error fetching reservation details:", error);
        res.status(500).json({ error: error.message });
    }
};
// μέθοδος ωστε να αποδεχτει το έτημα ακύρωσης της κράτησης ο admin
exports.approveCancelRequest = async (req, res) => {
    const { id } = req.params;
    console.log("--- Έναρξη Έγκρισης Ακύρωσης για ID:", id);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Έλεγχος κράτησης
        const [rows] = await connection.execute(
            `SELECT showtime_id, seats_count FROM reservations WHERE reservations_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ message: "Η κράτηση δεν βρέθηκε." });
        }

        const { showtime_id, seats_count } = rows[0];

        // 2. Ενημέρωση Status Κράτησης
        await connection.execute(
            `UPDATE reservations SET status = 'confirm cancel' WHERE reservations_id = ?`,
            [id]
        );

        // 3. ΔΙΑΓΡΑΦΗ ΘΕΣΕΩΝ - Εδώ ήταν το λάθος (reservation_seats)
        await connection.execute(
            `DELETE FROM reservation_seats WHERE reservation_id = ?`,
            [id]
        );
        console.log(`--- Διέγραψα τις θέσεις για την κράτηση ${id} από τον πίνακα reservation_seats`);

        // 4. Ενημέρωση showtime (Επιστροφή διαθέσιμων θέσεων)
        await connection.execute(
            `UPDATE showtimes SET available_seats = available_seats + ? WHERE showtimes_id = ?`,
            [seats_count, showtime_id]
        );

        await connection.commit();
        res.status(200).json({ message: "Η ακύρωση εγκρίθηκε και οι θέσεις ελευθερώθηκαν!" });

    } catch (error) {
        await connection.rollback();
        console.error("ΣΦΑΛΜΑ ΣΤΟ BACKEND:", error);
        res.status(500).json({ message: "Σφάλμα κατά την επεξεργασία: " + error.message });
    } finally {
        connection.release();
    }
};