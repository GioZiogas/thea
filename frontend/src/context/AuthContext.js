import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store'; // Για ασφαλή αποθήκευση του token στη συσκευή
import apiClient from '../api/client'; // Ο axios client που δημιουργήσαμε

// Δημιουργία του Context για την πρόσβαση στα δεδομένα χρήστη από όλη την εφαρμογή
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Δεδομένα προφίλ χρήστη
    const [token, setToken] = useState(null); // Το JWT token για τα αιτήματα
    const [loading, setLoading] = useState(true); // Κατάσταση φόρτωσης μέχρι να ελεγχθεί το login

    // useEffect που τρέχει μόλις ανοίξει η εφαρμογή για να δει αν ο χρήστης είναι ήδη συνδεδεμένος
    useEffect(() => {
        const checkLogin = async () => {
            // Ανάκτηση αποθηκευμένου token και δεδομένων χρήστη
            const savedToken = await SecureStore.getItemAsync('userToken');
            const savedUser = await SecureStore.getItemAsync('userData');
            
            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                // Αυτόματη προσθήκη του token στα headers του axios για μελλοντικά calls
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
            }
            setLoading(false); // Ο έλεγχος ολοκληρώθηκε
        };
        checkLogin();
    }, []);

    // Συνάρτηση για τη διαδικασία Login
    const login = async (email, password) => {
        try {
            // Κλήση στο API για αυθεντικοποίηση
            const res = await apiClient.post('/auth/login', { email, password });
            const { token, user } = res.data;

            // Αποθήκευση των στοιχείων στη μνήμη της συσκευής
            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userData', JSON.stringify(user));
            
            // Ενημέρωση του axios και του τοπικού state
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setToken(token);
            setUser(user);
            
            return { success: true };
        } catch (err) {
            // Επιστροφή μηνύματος σφάλματος σε περίπτωση αποτυχίας
            return { success: false, msg: err.response?.data?.message || "Σφάλμα σύνδεσης" };
        }
    };

    // Συνάρτηση για την αποσύνδεση (Logout)
    const logout = async () => {
        // Διαγραφή δεδομένων από τη συσκευή
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        
        // Αφαίρεση του token από τα headers και καθαρισμός του state
        delete apiClient.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    return (
        // Παροχή των δεδομένων και συναρτήσεων στα υπόλοιπα components
        <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};