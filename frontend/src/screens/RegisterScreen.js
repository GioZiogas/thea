import React, { useState } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    Alert, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import apiClient from '../api/client';

const RegisterScreen = ({ navigation }) => {
    //  STATES ΓΙΑ ΤΑ ΠΕΔΙΑ ΤΗΣ ΦΟΡΜΑΣ 
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [password, setPassword] = useState('');

    //  ΛΟΓΙΚΗ ΕΓΓΡΑΦΗΣ 
    const handleRegister = async () => {
        // Βασικός έλεγχος αν τα υποχρεωτικά πεδία είναι συμπληρωμένα
        if (!username || !firstName || !lastName || !email || !password) {
            Alert.alert("Σφάλμα", "Παρακαλώ συμπληρώστε όλα τα πεδία");
            return;
        }

        try {
            // Αποστολή αιτήματος POST στο backend για τη δημιουργία χρήστη
            await apiClient.post('/auth/register', { 
                firstname: firstName, 
                lastname: lastName,   
                username, 
                email,
                telephone,                    
                password
            });
            
            // Ενημέρωση επιτυχίας και ανακατεύθυνση στην οθόνη Login
            Alert.alert("Επιτυχία", "Η εγγραφή ολοκληρώθηκε! Τώρα συνδεθείτε.");
            navigation.navigate('Login');
        } catch (error) {
            // Εμφάνιση μηνύματος σφάλματος από τον server ή default μηνύματος
            Alert.alert("Σφάλμα", error.response?.data?.message || "Αποτυχία εγγραφής");
        }
    };

    return (
        // Εξωτερικό View που διατηρεί το μαύρο φόντο ακόμα και αν το KeyboardAvoidingView "σηκωθεί"
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* KeyboardAvoidingView για να μην καλύπτει το πληκτρολόγιο τα πεδία εισαγωγής */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    bounces={false} // Απενεργοποίηση bounce για να μη φαίνεται κενό στο iOS
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Δημιουργία Λογαριασμού</Text>
                    
                    {/* Πεδίο Username */}
                    <TextInput 
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#aaa"
                        value={username}
                        onChangeText={setUsername}
                    />

                    {/* Πεδίο Όνομα */}
                    <TextInput 
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#aaa"
                        value={firstName}
                        onChangeText={setFirstName}
                    />

                    {/* Πεδίο Επώνυμο */}
                    <TextInput 
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#aaa"
                        value={lastName}
                        onChangeText={setLastName}
                    />

                    {/* Πεδίο Email */}
                    <TextInput 
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    
                    {/* Πεδίο Τηλέφωνο */}
                    <TextInput
                        style={styles.input}
                        placeholder="Τηλέφωνο"
                        placeholderTextColor="#aaa"
                        value={telephone}
                        onChangeText={setTelephone}
                        keyboardType="phone-pad"
                    />            
                    
                    {/* Πεδίο Κωδικός Πρόσβασης */}
                    <TextInput 
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#aaa"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* Κουμπί Εγγραφής */}
                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Εγγραφή</Text>
                    </TouchableOpacity>

                    {/* Σύνδεσμος προς την οθόνη Σύνδεσης */}
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Έχετε ήδη λογαριασμό; Σύνδεση εδώ</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

//  STYLES 
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#000' 
    },
    scrollContainer: { 
        flexGrow: 1, 
        justifyContent: 'center', 
        padding: 20,
        backgroundColor: '#000' // Σίγουρο μαύρο φόντο και εδώ
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#fff', 
        marginBottom: 30, 
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
        backgroundColor: '#8B0000', 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 10 
    },
    buttonText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    linkText: { 
        color: '#FFD700', 
        textAlign: 'center', 
        marginTop: 20, 
        fontSize: 16 
    }
});

export default RegisterScreen;