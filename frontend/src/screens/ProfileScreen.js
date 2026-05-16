import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';
import React, { useContext, useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    TextInput, ScrollView, Alert, Dimensions 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    //  CONTEXT & NAVIGATION 
    // Λαμβάνουμε το user, τη logout και το setUser για την ενημέρωση του κεντρικού state
    const { user, logout, setUser } = useContext(AuthContext); 
    const navigation = useNavigation();

    //  LOCAL STATE (Φόρμα) 
    // Αρχικοποίηση των πεδίων με τα υπάρχοντα δεδομένα του χρήστη από το Context
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [telephone, setTelephone] = useState(user?.telephone || '');
   
    //  ΛΟΓΙΚΗ ΕΝΗΜΕΡΩΣΗΣ ΠΡΟΦΙΛ 
    const handleUpdate = async () => {
        try {
            // Log για έλεγχο των δεδομένων πριν την αποστολή στο Backend
            console.log("Στέλνω δεδομένα:", { firstName, lastName, telephone }); 
            
            // Κλήση PUT στο API για την ενημέρωση των στοιχείων στη βάση δεδομένων
            const response = await apiClient.put('/auth/update-profile', {
                firstName: firstName,
                lastName: lastName,
                telephone: telephone
            });

            console.log("Απάντηση Server:", response.data);

            //  ΕΝΗΜΕΡΩΣΗ UI & LOCAL STORAGE 
            // Δημιουργούμε το νέο αντικείμενο χρήστη με τις αλλαγές
            const updatedUser = { ...user, firstName, lastName, telephone };
            
            // Ενημερώνουμε το Global State (AuthContext) ώστε οι αλλαγές να φαίνονται παντού στην εφαρμογή
            setUser(updatedUser);
            
            // Αποθηκεύουμε μόνιμα το ενημερωμένο αντικείμενο στο SecureStore
            await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));

            Alert.alert("Επιτυχία", "Τα στοιχεία αποθηκεύτηκαν!");
        } catch (error) {
            console.error("Error details:", error.response?.data || error.message);
            Alert.alert("Σφάλμα", "Η βάση δεν ενημερώθηκε. Δες το console.");
        }
    };

    //  ΛΟΓΙΚΗ ΔΙΑΓΡΑΦΗΣ ΛΟΓΑΡΙΑΣΜΟΥ 
    const handleDeleteAccount = () => {
        Alert.alert(
            "Διαγραφή Λογαριασμού",
            "Είστε σίγουροι; Αυτή η ενέργεια δεν αναιρείται.",
            [
                { text: "Ακύρωση", style: "cancel" },
                { 
                    text: "Διαγραφή", 
                    style: "destructive", 
                    onPress: () => console.log("Delete account logic here") 
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/*  CUSTOM NAVIGATION BAR  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.openDrawer()}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/*  PROFILE HEADER  */}
                <View style={styles.profileHeader}>
                    <Ionicons name="person-circle" size={80} color="#8B0000" />
                    <Text style={styles.welcomeText}>Ο Λογαριασμός μου</Text>
                </View>

                {/*  FORM SECTION  */}
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Όνομα</Text>
                    <TextInput 
                        style={styles.input} 
                        value={firstName} 
                        onChangeText={setFirstName}
                        placeholderTextColor="#aaa"
                    />

                    <Text style={styles.label}>Επώνυμο</Text>
                    <TextInput 
                        style={styles.input} 
                        value={lastName} 
                        onChangeText={setLastName}
                        placeholderTextColor="#aaa"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput 
                        style={styles.input} 
                        value={email} 
                        editable={false} // Το email παραμένει κλειδωμένο για λόγους ασφαλείας/ταυτοποίησης
                        placeholderTextColor="#aaa"
                    />

                    <Text style={styles.label}>Τηλέφωνο</Text>
                    <TextInput 
                        style={styles.input} 
                        value={telephone} 
                        onChangeText={setTelephone}
                        keyboardType="phone-pad"
                        placeholderTextColor="#aaa"
                    />

                    {/*  BUTTONS  */}
                    <TouchableOpacity 
                        style={styles.updateButton} 
                        onPress={handleUpdate}
                    >
                        <Text style={styles.buttonText}>ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.passwordButton} 
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <Text style={styles.passwordButtonText}>ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Text style={styles.buttonText}>ΔΙΑΓΡΑΦΗ ΛΟΓΑΡΙΑΣΜΟΥ</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/*  FOOTER  */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATERS FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};

//  STYLES 
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navBar: { 
        height: 100, 
        backgroundColor: '#8B0000', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingTop: 40 
    },
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 30 },
    profileHeader: { alignItems: 'center', marginVertical: 20 },
    welcomeText: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    
    formContainer: { paddingHorizontal: 20 },
    label: { color: '#8B0000', fontWeight: 'bold', marginBottom: 5, marginLeft: 5 },
    input: { 
        backgroundColor: '#1a1a1a', 
        color: '#fff', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    updateButton: { 
        backgroundColor: '#8B0000', 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 10 
    },
    passwordButton: { 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#8B0000'
    },
    passwordButtonText: { color: '#8B0000', fontWeight: 'bold' },
    deleteButton: { 
        backgroundColor: '#440000', 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 30 
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    footer: { backgroundColor: '#8B0000', padding: 20, alignItems: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 }
});

export default ProfileScreen;