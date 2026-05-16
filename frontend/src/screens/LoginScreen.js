import React, { useState, useContext } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    Alert, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    // Τοπικά states για την αποθήκευση των στοιχείων εισόδου
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Χρήση της συνάρτησης login από το AuthContext για τη διαχείριση του authentication
    const { login } = useContext(AuthContext);

    // Συνάρτηση διαχείρισης του login
    const handleLogin = async () => {
        const result = await login(email, password);
        // Αν το login αποτύχει, εμφανίζουμε το μήνυμα σφάλματος που επιστρέφει το API
        if (!result.success) {
            Alert.alert("Αποτυχία", result.msg);
        }
    };

    return (
        // Κεντρικό View με μαύρο background για να καλύπτει όλη την οθόνη
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* KeyboardAvoidingView για να μην καλύπτεται η φόρμα από το πληκτρολόγιο */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                {/* ScrollView για δυνατότητα κύλισης σε μικρότερες οθόνες */}
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    // bounces={false} εμποδίζει το "πήδημα" του background σε iOS
                    bounces={false} 
                    showsVerticalScrollIndicator={false}
                >
                    {/* Τίτλος της εφαρμογής */}
                    <Text style={styles.title}>Ziogas Theaters</Text>
                    
                    {/* Πεδίο εισαγωγής Email */}
                    <TextInput 
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    
                    {/* Πεδίο εισαγωγής Κωδικού (Password) */}
                    <TextInput 
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#aaa"
                        secureTextEntry // Κρύβει τους χαρακτήρες του κωδικού
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* Κουμπί Εισόδου */}
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Είσοδος</Text>
                    </TouchableOpacity>

                    {/* Σύνδεσμος για μετάβαση στην οθόνη εγγραφής */}
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Νέος χρήστης; Δημιουργία λογαριασμού</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

// --- STYLES: Ορισμός εμφάνισης των στοιχείων ---
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#000' 
    },
    scrollContainer: { 
        flexGrow: 1, 
        justifyContent: 'center', 
        padding: 20,
        backgroundColor: '#000' // Διασφάλιση μαύρου φόντου στο περιεχόμενο
    },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#fff', 
        marginBottom: 40, 
        textAlign: 'center' 
    },
    input: { 
        backgroundColor: '#1a1a1a', 
        color: '#fff', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333'
    },
    button: { 
        backgroundColor: '#8B0000', // Σκούρο κόκκινο χρώμα (μπορντό)
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    buttonText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    linkText: { 
        color: '#FFD700', // Χρυσό χρώμα για τον σύνδεσμο
        textAlign: 'center', 
        marginTop: 20, 
        fontSize: 16 
    }
});

export default LoginScreen;