const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
    const { firstname, lastname, username, email, telephone, password } = req.body;
    
    try {
        // 1. Έλεγχος αν υπάρχει ήδη ο χρήστης
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Το email χρησιμοποιείται ήδη" });
        }

        // 2. Έλεγχος αν υπάρχουν άλλοι χρήστες στη βάση
        const [usersCount] = await db.execute('SELECT COUNT(*) as total FROM users');
        const role = usersCount[0].total === 0 ? 'admin' : 'user';

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Αποθήκευση με το role
        const [result] = await db.execute(
            'INSERT INTO users (firstname, lastname, username, email, password, telephone, role) VALUES (?, ?, ?, ?, ?, ?,?)',
            [firstname, lastname, username, email, hashedPassword, telephone, role]
        );

        res.status(201).json({ 
            message: `Ο χρήστης δημιουργήθηκε ως ${role}!`, 
            userId: result.insertId,
            role: role 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Λάθος email ή κωδικός" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Λάθος email ή κωδικός" });
        }

        // Δημιουργία Token
        const token = jwt.sign(
            { id: user.users_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // ΕΠΙΣΤΡΟΦΗ ΔΕΔΟΜΕΝΩΝ
        res.json({
            token, // Μην ξεχάσεις να επιστρέψεις το token!
            user: {
                id: user.users_id,
                username: user.username,
                email: user.email,
                role: user.role,
                // Εδώ κάνουμε τη μετατροπή από πεζά (βάση) σε CamelCase (Frontend)
                firstName: user.firstname, 
                lastName: user.lastname,
                telephone: user.telephone
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Λίστα όλων των χρηστών (Admin Only)
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT users_id, firstname, lastname, email, role FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Αλλαγή ρόλου χρήστη (Admin Only)
exports.updateUserRole = async (req, res) => {
    const { userId, newRole } = req.body;

    // Έλεγχος αν το role είναι επιτρεπτό
    const allowedRoles = ['user', 'employee', 'admin'];
    if (!allowedRoles.includes(newRole)) {
        return res.status(400).json({ message: "Μη έγκυρος ρόλος." });
    }

    try {
        await db.execute('UPDATE users SET role = ? WHERE users_id = ?', [newRole, userId]);
        res.json({ message: `Ο ρόλος του χρήστη ενημερώθηκε σε ${newRole}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Στο τέλος του authController.js ή μετά το login

// 1. Λήψη στοιχείων (getMe)
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id; 

        const [rows] = await db.execute(
            'SELECT users_id, firstname, lastname, username, email, telephone, role FROM users WHERE users_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Ο χρήστης δεν βρέθηκε" });
        }

        const userRow = rows[0]; // Το ονομάζουμε userRow για να μην μπερδεύεται με το global 'user'

        res.json({
            id: userRow.users_id,
            username: userRow.username,
            email: userRow.email,
            firstName: userRow.firstname, // Μετατροπή σε CamelCase
            lastName: userRow.lastname,
            telephone: userRow.telephone,
            role: userRow.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Αλλαγή Κωδικού (changePassword)
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const [users] = await db.execute('SELECT password FROM users WHERE users_id = ?', [req.user.id]);
        const isMatch = await bcrypt.compare(oldPassword, users[0].password);
        if (!isMatch) return res.status(400).json({ message: "Wrong old password" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ? WHERE users_id = ?', [hashed, req.user.id]);
        res.json({ message: "Password updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Διαγραφή (deleteAccount)
exports.deleteAccount = async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE users_id = ?', [req.user.id]);
        res.json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Ενημέρωση Στοιχείων Προφίλ
exports.updateProfile = async (req, res) => {
    const { firstName, lastName, telephone } = req.body;
    const userId = req.user.id;

    // ΠΡΟΣΘΕΣΕ ΑΥΤΟ ΤΟ LOG:
    console.log("BACKEND RECEIVE:", { firstName, lastName, telephone, userId });

    try {
        const [result] = await db.execute(
            'UPDATE users SET firstname = ?, lastname = ?, telephone = ? WHERE users_id = ?',
            [firstName, lastName, telephone, userId]
        );

        console.log("SQL RESULT:", result);

        res.json({ message: "Ενημερώθηκε!" });
    } catch (error) {
        console.error("SQL ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

//update password
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // 1. Βρίσκουμε τον χρήστη
        const [rows] = await db.execute('SELECT password FROM users WHERE users_id = ?', [userId]);
        const user = rows[0];

        // 2. Έλεγχος παλιού κωδικού
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Ο παλιός κωδικός είναι λάθος" });
        }

        // 3. Hash του νέου κωδικού
        const salt = await bcrypt.genSalt(10);
        const hashedPath = await bcrypt.hash(newPassword, salt);

        // 4. Update στη βάση
        await db.execute('UPDATE users SET password = ? WHERE users_id = ?', [hashedPath, userId]);

        res.json({ message: "Ο κωδικός άλλαξε επιτυχώς!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};