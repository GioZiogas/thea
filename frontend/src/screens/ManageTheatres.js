import React, { useState, useEffect, useContext } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    FlatList, Alert, ActivityIndicator, Keyboard, Dimensions 
} from 'react-native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; // Χρειάζεται για το footer logic

// Λήψη διαστάσεων οθόνης για responsive σχεδιασμό αν χρειαστεί
const { width } = Dimensions.get('window');

const ManageTheatres = () => {
    //  STATES ΔΙΑΧΕΙΡΙΣΗΣ ΔΕΔΟΜΕΝΩΝ 
    const [theatres, setTheatres] = useState([]); // Λίστα με τα θέατρα από τη βάση
    const [loading, setLoading] = useState(false); // Κατάσταση φόρτωσης (spinner)
    const navigation = useNavigation();
    
    //  STATES ΦΟΡΜΑΣ (Προσθήκη/Επεξεργασία) 
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [editingId, setEditingId] = useState(null); // ID του θεάτρου που επεξεργαζόμαστε (null αν είναι νέα εγγραφή)

    // Συνάρτηση ανάκτησης όλων των θεάτρων από το API
    const fetchTheatres = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/theatres');
            setTheatres(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Σφάλμα", "Αποτυχία φόρτωσης θεάτρων");
        } finally {
            setLoading(false);
        }
    };

    // Φόρτωση των δεδομένων κατά την πρώτη εκκίνηση της οθόνης
    useEffect(() => { fetchTheatres(); }, []);

    // Συνάρτηση αποθήκευσης (Προσθήκη νέου ή Ενημέρωση υπάρχοντος)
    const handleSave = async () => {
        // Έλεγχος αν όλα τα πεδία είναι συμπληρωμένα
        if (!name || !city || !address) {
            Alert.alert("Προσοχή", "Παρακαλώ συμπληρώστε όλα τα πεδία");
            return;
        }

        const theatreData = { 
            theater_name: name, 
            city: city, 
            address: address 
        };

        try {
            if (editingId) {
                // Αν υπάρχει editingId, κάνουμε PUT (ενημέρωση)
                await apiClient.put(`/theatres/${editingId}`, theatreData);
                Alert.alert("Επιτυχία", "Το θέατρο ενημερώθηκε");
            } else {
                // Αν δεν υπάρχει, κάνουμε POST (νέα εγγραφή)
                await apiClient.post('/theatres', theatreData);
                Alert.alert("Επιτυχία", "Το θέατρο προστέθηκε");
            }
            resetForm(); // Καθαρισμός φόρμας
            fetchTheatres(); // Ανανέωση λίστας
            Keyboard.dismiss(); // Κλείσιμο πληκτρολογίου
        } catch (error) {
            Alert.alert("Σφάλμα", "Η αποθήκευση απέτυχε");
        }
    };

    // Συνάρτηση διαγραφής θεάτρου με επιβεβαίωση
    const handleDelete = (id) => {
        Alert.alert("Διαγραφή", "Είστε σίγουροι;", [
            { text: "Ακύρωση", style: "cancel" },
            { text: "Διαγραφή", style: "destructive", onPress: async () => {
                try {
                    await apiClient.delete(`/theatres/${id}`);
                    fetchTheatres();
                } catch (error) {
                    Alert.alert("Σφάλμα", error.response?.data?.message || "Η διαγραφή απέτυχε");
                }
            }}
        ]);
    };

    // Γέμισμα της φόρμας με τα στοιχεία του θεάτρου προς επεξεργασία
    const startEdit = (item) => {
        setEditingId(item.theatres_id);
        setName(item.theater_name);
        setCity(item.city);
        setAddress(item.address);
    };

    // Επαναφορά της φόρμας στην αρχική της κατάσταση
    const resetForm = () => {
        setEditingId(null);
        setName('');
        setCity('');
        setAddress('');
    };

    // Σχεδιασμός του κάθε στοιχείου (card) της λίστας θεάτρων
    const renderTheatreItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.theater_name}</Text>
                <Text style={styles.cardSubText}>
                    <Ionicons name="location-outline" size={12} /> {item.city}, {item.address}
                </Text>
            </View>
            <View style={styles.actionGroup}>
                {/* Κουμπί Επεξεργασίας */}
                <TouchableOpacity onPress={() => startEdit(item)}>
                    <Ionicons name="pencil" size={22} color="#4a90e2" style={{ marginRight: 15 }} />
                </TouchableOpacity>
                {/* Κουμπί Διαγραφής */}
                <TouchableOpacity onPress={() => handleDelete(item.theatres_id)}>
                    <Ionicons name="trash" size={22} color="#8B0000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/*  HEADER (NavBar)  */}
            <View style={styles.navBar}>
                {/* Πατώντας το λογότυπο σε πηγαίνει πίσω στο AdminDashboard */}
                <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                
                {/* Κουμπί για το κεντρικό Drawer Menu */}
                <TouchableOpacity onPress={() => {
                    const drawerNav = navigation.getParent('InternalDrawer');
                    if (drawerNav) {
                        drawerNav.openDrawer();
                    } else {
                        navigation.dispatch(DrawerActions.openDrawer());
                    }
                }}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <Text style={styles.pageTitle}>Διαχείριση Θεάτρων</Text>
            
            {/*  ΦΟΡΜΑ ΕΙΣΑΓΩΓΗΣ / ΕΠΕΞΕΡΓΑΣΙΑΣ  */}
            <View style={styles.formContainer}>
                <TextInput 
                    style={styles.input} placeholder="Όνομα Θεάτρου" placeholderTextColor="#666"
                    value={name} onChangeText={setName} 
                />
                <TextInput 
                    style={styles.input} placeholder="Πόλη" placeholderTextColor="#666"
                    value={city} onChangeText={setCity} 
                />
                <TextInput 
                    style={styles.input} placeholder="Διεύθυνση" placeholderTextColor="#666"
                    value={address} onChangeText={setAddress} 
                />
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>
                        {editingId ? "Ενημέρωση Θεάτρου" : "Προσθήκη Θεάτρου"}
                    </Text>
                </TouchableOpacity>
                
                {/* Εμφάνιση κουμπιού ακύρωσης μόνο κατά την επεξεργασία */}
                {editingId && (
                    <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                        <Text style={styles.cancelButtonText}>Ακύρωση Επεξεργασίας</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/*  ΛΙΣΤΑ ΘΕΑΤΡΩΝ  */}
            {loading ? (
                <ActivityIndicator color="#8B0000" size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={theatres}
                    keyExtractor={(item) => item.theatres_id.toString()}
                    renderItem={renderTheatreItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Δεν υπάρχουν καταχωρημένα θέατρα.</Text>}
                />
            )}

            {/*  FOOTER  */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATERS FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};

// --- STYLES: Μορφοποίηση της οθόνης ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    
    // Header Styles
    navBar: { 
        height: 100, 
        backgroundColor: '#8B0000', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingTop: 40 
    },
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    pageTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
    
    // Form Styles
    formContainer: { 
        backgroundColor: '#1a1a1a', 
        padding: 15, 
        borderRadius: 12, 
        marginHorizontal: 15, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: '#333' 
    },
    input: { backgroundColor: '#333', color: 'white', borderRadius: 8, padding: 12, marginBottom: 10 },
    saveButton: { backgroundColor: '#8B0000', padding: 15, borderRadius: 8, alignItems: 'center' },
    saveButtonText: { color: 'white', fontWeight: 'bold' },
    cancelButton: { marginTop: 10, alignItems: 'center' },
    cancelButtonText: { color: '#aaa', textDecorationLine: 'underline', fontSize: 12 },
    
    // List Styles
    listContent: { paddingHorizontal: 15, paddingBottom: 120 },
    card: { 
        backgroundColor: '#1a1a1a', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 10, 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#222' 
    },
    cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardSubText: { color: '#aaa', fontSize: 13 },
    actionGroup: { flexDirection: 'row', alignItems: 'center' },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
    
    // Footer Styles
    footer: { 
        backgroundColor: '#8B0000', 
        padding: 20, 
        alignItems: 'center', 
        position: 'absolute', 
        bottom: 0, 
        width: '100%' 
    },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 }
});

export default ManageTheatres;