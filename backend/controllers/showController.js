const db = require('../config/db');



/**
 * Λήψη όλων των παραστάσεων (με φίλτρα)
 */
exports.getShows = async (req, res) => {
    const { category, is_kid_friendly, sort, limit } = req.query;

    try {
        let query = `
            SELECT 
                s.shows_id,
                s.title,
                s.description,
                s.duration,
                s.category,
                s.base_price,
                s.is_kid_friendly,
                s.created_at,
                si.image_path
            FROM shows s
            LEFT JOIN show_images si ON s.shows_id = si.show_id
            WHERE s.is_active = 1
        `;

        const params = [];

        if (category && category !== 'Όλα') {
            query += ' AND s.category = ?';
            params.push(category);
        }

        if (is_kid_friendly !== undefined) {
            query += ' AND s.is_kid_friendly = ?';
            params.push(parseInt(is_kid_friendly, 10) === 1 ? 1 : 0);
        }

        query += ' GROUP BY s.shows_id';

        if (sort === 'newest') {
            query += ' ORDER BY s.created_at DESC';
        } else {
            query += ' ORDER BY s.title ASC';
        }

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit, 10));
        }

        const [rows] = await db.execute(query, params);

        const formattedRows = rows.map(show => {
            let finalPath = show.image_path;

            if (finalPath) {
                finalPath = finalPath.replace('uploads\\', '').replace('uploads/', '');
            } else {
                finalPath = 'default-poster.png';
            }

            return {
                ...show,
                image_path: finalPath
            };
        });

        res.json(formattedRows);
    } catch (error) {
        console.error('Error in getShows:', error);
        res.status(500).json({ error: 'Σφάλμα κατά τη φόρτωση των παραστάσεων' });
    }
};


/**
 * Λήψη μίας παράστασης βάσει ID
 */
exports.getShowById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT s.*, si.image_path 
            FROM shows s
            LEFT JOIN show_images si ON s.shows_id = si.show_id
            WHERE s.shows_id = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(query, [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });

        let show = rows[0];
        if (show.image_path && show.image_path.startsWith('uploads/')) {
            show.image_path = show.image_path.replace('uploads/', '');
        }
        res.json(show);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Δημιουργία Νέας Παράστασης (Πλήρης)
 */
exports.createShow = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { title, description, duration, category, is_kid_friendly, theatre_ids } = req.body;
        
        let rawPrice = req.body.base_price;
        let finalPrice = rawPrice ? parseFloat(rawPrice.toString().replace(',', '.')) : 0.00;

        await connection.beginTransaction();

        // 1. Εισαγωγή στην κύρια ταμπέλα 'shows'
        const [showResult] = await connection.execute(
            `INSERT INTO shows (title, description, duration, category, base_price, is_kid_friendly, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [
                title || "Untitled", 
                description || "", 
                parseInt(duration) || 0, 
                category || "General", 
                finalPrice, 
                (is_kid_friendly == 'true' || is_kid_friendly == 1) ? 1 : 0
            ]
        );

        const newShowId = showResult.insertId;

        // 2. Εισαγωγή Εικόνας (Προσαρμοσμένο στον πίνακα show_images χωρίς is_main)
        if (req.file) {
            const imagePath = `uploads/${req.file.filename}`;
            await connection.execute(
                `INSERT INTO show_images (show_id, image_path) VALUES (?, ?)`,
                [newShowId, imagePath]
            );
        }

        // 3. Σύνδεση με Θέατρα
        if (theatre_ids) {
            let selected = typeof theatre_ids === 'string' ? JSON.parse(theatre_ids) : theatre_ids;
            if (Array.isArray(selected)) {
                for (const tId of selected) {
                    await connection.execute(
                        `INSERT INTO show_theatres (show_id, theatre_id) VALUES (?, ?)`, 
                        [newShowId, tId]
                    );
                }
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, showId: newShowId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Create Show Error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

/**
 * Ενημέρωση Παράστασης
 */
exports.updateShow = async (req, res) => {
    const showId = req.params.id;
    const { title, description, duration, base_price, category, is_kid_friendly } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Update βασικών στοιχείων
        // Χρησιμοποιούμε parseFloat και replace για σιγουριά στην τιμή
        let finalPrice = base_price ? parseFloat(base_price.toString().replace(',', '.')) : 0.00;
        
        await connection.execute(
            `UPDATE shows SET title = ?, description = ?, duration = ?, base_price = ?, category = ?, is_kid_friendly = ? 
             WHERE shows_id = ?`,
            [
                title, 
                description, 
                parseInt(duration) || 0, 
                finalPrice, 
                category, 
                (is_kid_friendly === 'true' || is_kid_friendly == 1) ? 1 : 0, 
                showId
            ]
        );

        // 2. Update Εικόνας (Αυστηρά σύμφωνα με τον πίνακα show_images)
        if (req.file) {
            // Αποθηκεύουμε μόνο το όνομα του αρχείου ή το uploads/filename
            const imagePath = `uploads/${req.file.filename}`;
            
            // Ελέγχουμε αν υπάρχει ήδη εγγραφή για αυτό το show_id
            const [existing] = await connection.execute(
                "SELECT idshowimage FROM show_images WHERE show_id = ?", 
                [showId]
            );
            
            if (existing.length > 0) {
                // Αν υπάρχει, κάνουμε UPDATE
                await connection.execute(
                    "UPDATE show_images SET image_path = ? WHERE show_id = ?", 
                    [imagePath, showId]
                );
            } else {
                // Αν δεν υπάρχει (π.χ. παλιά παράσταση χωρίς φωτό), κάνουμε INSERT
                await connection.execute(
                    "INSERT INTO show_images (show_id, image_path) VALUES (?, ?)", 
                    [showId, imagePath]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: "Η παράσταση ενημερώθηκε επιτυχώς!" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Update Error:", error);
        res.status(500).json({ error: "Αποτυχία ενημέρωσης: " + error.message });
    } finally {
        connection.release();
    }
};

//διαγραφή παράστασης
exports.deleteShow = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("UPDATE shows SET is_active = 0 WHERE shows_id = ?", [id]);
        res.json({ message: "Deleted (Soft delete)" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};