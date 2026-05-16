import React, { useContext } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    ScrollView, Dimensions 
} from 'react-native';
import { AuthContext } from '../context/AuthContext'; // Context για τα στοιχεία του συνδεδεμένου χρήστη
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

// Λήψη των διαστάσεων της οθόνης για δυναμικό layout
const { width } = Dimensions.get('window');
// Υπολογισμός δυναμικού πλάτους για να χωράνε ακριβώς 2 κάρτες ανά σειρά με σωστά κενά
const CARD_WIDTH = (width - 60) / 2; 

const AdminDashboard = () => {
    const { user } = useContext(AuthContext); // Πρόσβαση στο user object (role, username)
    const navigation = useNavigation();

    // Ορισμός όλων των διαθέσιμων επιλογών (panels) του διαχειριστικού
    const allPanels = [
        { id: '1', title: 'Διαχείριση Χρηστών', icon: 'people', screen: 'ManageUsers', adminOnly: true },
        { id: '2', title: 'Παραστάσεις', icon: 'add-circle', screen: 'AddShow', adminOnly: true },
        { id: '3', title: 'Ωρες παραστάσεων', icon: 'calendar', screen: 'ManageSchedule', adminOnly: false },
        { id: '4', title: 'Κρατήσεις', icon: 'ticket', screen: 'AllReservations', adminOnly: false },
        { id: '5', title: 'Λίστα παραστάσεων', icon: 'list', screen: 'ReportsScreen', adminOnly: false },
        { id: '6', title: 'Θέατρα/Αίθουσες', icon: 'business', screen: 'ManageTheatres', adminOnly: true },
    ];

    // Φιλτράρισμα των επιλογών βάσει του ρόλου του χρήστη (admin vs employee)
    const filteredPanels = allPanels.filter(panel => {
        // Αν ο χρήστης είναι υπάλληλος, βλέπει μόνο όσα δεν είναι adminOnly
        if (user?.role === 'employee') {
            return !panel.adminOnly;
        }
        return true; // Ο admin τα βλέπει όλα
    });

    return (
        <View style={styles.container}>
            {/* --- HEADER / NAVIGATION BAR --- */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* --- WELCOME INFO: Εμφάνιση στοιχείων χρήστη και ρόλου --- */}
                <View style={styles.headerInfo}>
                    <Ionicons 
                        name={user?.role === 'admin' ? "shield-checkmark" : "person-circle"} 
                        size={50} 
                        color="#8B0000" 
                    />
                    <Text style={styles.welcomeText}>Πίνακας Ελέγχου</Text>
                    <Text style={styles.adminName}>
                        {user?.role === 'admin' ? 'Διαχειριστής' : 'Υπάλληλος'}: {user?.username}
                    </Text>
                </View>

                {/* --- PANELS GRID: Δυναμική παραγωγή των καρτών μενού --- */}
                <View style={styles.gridContainer}>
                    {filteredPanels.map((item) => (
                        <TouchableOpacity 
                            key={item.id}
                            style={styles.panelCard} 
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <Ionicons name={item.icon} size={42} color="#8B0000" />
                            <Text style={styles.panelTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* --- FOOTER: Πληροφορίες έκδοσης και επιπέδου πρόσβασης --- */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ADMINISTRATION CONSOLE</Text>
                <Text style={styles.footerText}>© 2026 - ZIOGAS THEATERS MANAGMENT</Text>
                <Text style={styles.footerText}>Επίπεδο Πρόσβασης: {user?.role?.toUpperCase()}</Text>
            </View>
        </View>
    );
};

// --- STYLES: Διαμόρφωση εμφάνισης ---
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
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    scrollContent: { paddingBottom: 30 },
    headerInfo: { 
        alignItems: 'center', 
        marginVertical: 20, 
        padding: 20,
        backgroundColor: '#1a1a1a',
        marginHorizontal: 20,
        borderRadius: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#8B0000'
    },
    welcomeText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    adminName: { color: '#ccc', fontSize: 14, marginTop: 5, fontWeight: '600' },
    
    // Ρυθμίσεις για το πλέγμα των καρτών (Grid)
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // Στοίχιση των καρτών από αριστερά
        paddingHorizontal: 20,
    },
    panelCard: {
        backgroundColor: '#1a1a1a',
        width: CARD_WIDTH, 
        height: 130,
        marginVertical: 10,
        marginHorizontal: 5, // Κενό ανάμεσα στις κάρτες
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        // Σκιές για iOS και Android
        elevation: 4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3
    },
    panelTitle: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 10
    },
    footer: { 
        backgroundColor: '#8B0000', 
        padding: 15, 
        alignItems: 'center', 
    },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 }
});

export default AdminDashboard;