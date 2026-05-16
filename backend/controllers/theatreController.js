const db = require('../config/db');

// 1. Λήψη όλων των θεάτρων
exports.getAllTheatres = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM theatres');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Δημιουργία θεάτρου
exports.createTheatre = async (req, res) => {
    const { theater_name, city, address } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO theatres (theater_name, city, address) VALUES (?, ?, ?)',
            [theater_name, city, address]
        );
        res.status(201).json({ theatreId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Ενημέρωση θεάτρου
exports.updateTheatre = async (req, res) => {
    const { id } = req.params;
    const { theater_name, city, address } = req.body;
    try {
        await db.execute(
            'UPDATE theatres SET theater_name = ?, city = ?, address = ? WHERE theatres_id = ?',
            [theater_name, city, address, id]
        );
        res.json({ message: "Updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Διαγραφή θεάτρου
exports.deleteTheatre = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM theatres WHERE theatres_id = ?', [id]);
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Λήψη θεάτρων ανά παράσταση
exports.getTheatresByShow = async (req, res) => {
    const { showId } = req.params;
    try {
        const [rows] = await db.execute(`
            SELECT t.* FROM theatres t
            JOIN show_theatres st ON t.theatres_id = st.theatre_id
            WHERE st.show_id = ?`, [showId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Λήψη προβολών (Showtimes) για μια παράσταση
exports.getShowtimesByShow = async (req, res) => {
    const { id } = req.params; // Εδώ περιμένει το showId
    try {
        const [rows] = await db.execute(`
            SELECT st.*, t.theater_name, t.city FROM showtimes st
            JOIN theatres t ON st.theatre_id = t.theatres_id
            WHERE st.show_id = ?`, [id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Μαζική προσθήκη προβολών
exports.createBulkShowtimes = async (req, res) => {
    const { show_id, theatre_id, schedule, available_seats } = req.body;
    try {
        const values = [];
        Object.keys(schedule).forEach(date => {
            schedule[date].times.forEach(time => {
                values.push([show_id, theatre_id, `${date} ${time}:00`, available_seats]);
            });
        });
        await db.query('INSERT INTO showtimes (show_id, theatre_id, date_time, available_seats) VALUES ?', [values]);
        res.status(201).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Αναλυτικές προβολές (Reports)
// ΔΙΟΡΘΩΣΗ: Αλλαγή showtime_id σε showtimes_id για να παίζει με το Frontend
exports.getAllShowtimesDetailed = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                st.showtimes_id, 
                s.title, 
                t.theater_name, 
                st.date_time, 
                st.available_seats,
                st.theatre_id
            FROM showtimes st
            JOIN shows s ON st.show_id = s.shows_id
            JOIN theatres t ON st.theatre_id = t.theatres_id
            ORDER BY st.date_time DESC`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. Ενημέρωση προβολής
// ΔΙΟΡΘΩΣΗ: Προσθήκη πραγματικού SQL κώδικα
exports.updateShowtime = async (req, res) => {
    const { id } = req.params;
    const { date_time, available_seats, theatre_id } = req.body;
    try {
        await db.execute(
            'UPDATE showtimes SET date_time = ?, available_seats = ?, theatre_id = ? WHERE showtimes_id = ?',
            [date_time, available_seats, theatre_id, id]
        );
        res.json({ message: "Showtime Updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 10. Διαγραφή προβολής
// ΔΙΟΡΘΩΣΗ: Προσθήκη πραγματικού SQL κώδικα
exports.deleteShowtime = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM showtimes WHERE showtimes_id = ?', [id]);
        res.json({ message: "Showtime Deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 11. Λήψη θέσεων για ένα συγκεκριμένο showtime με έλεγχο αν είναι πιασμένες
exports.getShowtimeSeats = async (req, res) => {
    const showtimeId = parseInt(req.params.id);
    
    if (!showtimeId) return res.status(400).json({ error: "Invalid Showtime ID" });

    try {
        const [stRows] = await db.execute('SELECT theatre_id FROM showtimes WHERE showtimes_id = ?', [showtimeId]);
        if (stRows.length === 0) return res.status(404).json({ error: "Showtime not found" });

        const theatreId = stRows[0].theatre_id;

        const query = `
            SELECT 
                s.seat_id, 
                s.seat_number, 
                s.row_label,
                CASE 
                    WHEN rs.seat_id IS NOT NULL THEN 'occupied' 
                    ELSE 'available' 
                END AS status
            FROM seats s
            LEFT JOIN reservation_seats rs ON s.seat_id = rs.seat_id AND rs.showtime_id = ?
            WHERE s.theatre_id = ?
            ORDER BY s.row_label ASC, s.seat_number ASC
        `;

        const [rows] = await db.execute(query, [showtimeId, theatreId]);
        
        // Debugging: Δες στο τερματικό σου αν υπάρχουν occupied
        const occupiedCount = rows.filter(r => r.status === 'occupied').length;
        console.log(`Showtime ${showtimeId}: Total seats ${rows.length}, Occupied: ${occupiedCount}`);

        res.json(rows);
    } catch (error) {
        console.error("API ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};