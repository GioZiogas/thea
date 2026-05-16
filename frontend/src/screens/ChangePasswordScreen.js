import React, { useState } from 'react'; 
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform,
    TouchableWithoutFeedback,
    Keyboard 
} from 'react-native';
import apiClient from '../api/client'; // Ο client για τις κλήσεις στο API
import { useNavigation } from '@react-navigation/native';

const ChangePasswordScreen = () => {
    //  STATES ΓΙΑ ΤΑ ΠΕΔΙΑ ΤΗΣ ΦΟΡΜΑΣ 
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    //  ΣΥΝΑΡΤΗΣΗ ΥΠΟΒΟΛΗΣ ΑΛΛΑΓΗΣ ΚΩΔΙΚΟΥ 
    const handleChangePassword = async () => {
        // 1. Έλεγχος αν όλα τα πεδία είναι συμπληρωμένα
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Σφάλμα", "Παρακαλώ συμπληρώστε όλα τα πεδία");
            return;
        }

        // 2. Έλεγχος αν ο νέος κωδικός ταιριάζει με την επιβεβαίωση
        if (newPassword !== confirmPassword) {
            Alert.alert("Σφάλμα", "Οι νέοι κωδικοί δεν ταιριάζουν");
            return;
        }

        try {
            // Κλήση PUT στο endpoint αλλαγής κωδικού
            const response = await apiClient.put('/auth/change-password', {
                oldPassword,
                newPassword
            });

            // Εμφάνιση μηνύματος επιτυχίας και ανακατεύθυνση
            Alert.alert("Επιτυχία", response.data.message, [
                { 
                    text: "OK", 
                    // Redirect: Επιστροφή στο 'Main' stack μετά την επιτυχία
                    onPress: () => navigation.navigate('Main') 
                }
            ]);
        } catch (error) {
            // Διαχείριση σφαλμάτων από τον server ή το δίκτυο
            Alert.alert("Σφάλμα", error.response?.data?.message || "Αποτυχία αλλαγής κωδικού");
        }
    };

    return (
        // Το KeyboardAvoidingView διασφαλίζει ότι το περιεχόμενο δεν καλύπτεται από το πληκτρολόγιο
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            {/* Επιτρέπει το κλείσιμο του πληκτρολογίου πατώντας οπουδήποτε εκτός των inputs */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.container}>
                    
                    <Text style={styles.title}>Αλλαγή Κωδικού</Text>
                    
                    {/* ΠΕΔΙΟ: ΠΑΛΙΟΣ ΚΩΔΙΚΟΣ */}
                    <Text style={styles.label}>Παλιός Κωδικός</Text>
                    <TextInput 
                        style={styles.input} 
                        secureTextEntry // Απόκρυψη χαρακτήρων
                        value={oldPassword} 
                        onChangeText={setOldPassword}
                        placeholder="Εισάγετε παλιό κωδικό"
                        placeholderTextColor="#666"
                    />

                    {/* ΠΕΔΙΟ: ΝΕΟΣ ΚΩΔΙΚΟΣ */}
                    <Text style={styles.label}>Νέος Κωδικός</Text>
                    <TextInput 
                        style={styles.input} 
                        secureTextEntry 
                        value={newPassword} 
                        onChangeText={setNewPassword}
                        placeholder="Εισάγετε νέο κωδικό"
                        placeholderTextColor="#666"
                    />

                    {/* ΠΕΔΙΟ: ΕΠΙΒΕΒΑΙΩΣΗ ΝΕΟΥ ΚΩΔΙΚΟΥ */}
                    <Text style={styles.label}>Επιβεβαίωση Νέου Κωδικού</Text>
                    <TextInput 
                        style={styles.input} 
                        secureTextEntry 
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword}
                        placeholder="Επαναλάβετε τον νέο κωδικό"
                        placeholderTextColor="#666"
                    />

                    {/* ΚΟΥΜΠΙ ΥΠΟΒΟΛΗΣ */}
                    <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                        <Text style={styles.buttonText}>ΕΠΙΒΕΒΑΙΩΣΗ</Text>
                    </TouchableOpacity>

                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

//  STYLESHEET 
const styles = StyleSheet.create({
    container: { 
        flexGrow: 1, 
        backgroundColor: '#000', 
        padding: 20, 
        justifyContent: 'center' 
    },
    title: { 
        color: '#fff', 
        fontSize: 24, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 30 
    },
    label: { 
        color: '#8B0000', // Σκούρο κόκκινο χρώμα
        fontWeight: 'bold', 
        marginBottom: 5 
    },
    input: { 
        backgroundColor: '#1a1a1a', 
        color: '#fff', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20 
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
        fontWeight: 'bold' 
    }
});

export default ChangePasswordScreen;