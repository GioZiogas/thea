import React, { useContext, useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    FlatList, ActivityIndicator, Alert, Dimensions,
    RefreshControl 
} from 'react-native';
import { AuthContext } from '../context/AuthContext'; // Context για το token του χρήστη
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { BASE_URL } from '../../App'; // Η βασική διεύθυνση του server

const { width } = Dimensions.get('window');

const AllReservationsScreen = () => {
    const { token, user } = useContext(AuthContext);
    const navigation = useNavigation();

    //  STATES ΓΙΑ ΔΕΔΟΜΕΝΑ ΚΑΙ UI 
    const [reservations, setReservations] = useState([]); // Αποθήκευση λίστας κρατήσεων
    const [loading, setLoading] = useState(true); // Κατάσταση αρχικής φόρτωσης
    const [refreshing, setRefreshing] = useState(false); // Κατάσταση pull-to-refresh
    
    //  PAGINATION STATE 
    const [page, setPage] = useState(1); // Τρέχουσα σελίδα
    const limit = 10; // Μέγιστος αριθμός εγγραφών ανά σελίδα

    // Συνάρτηση ανάκτησης όλων των κρατήσεων από το API
    const fetchAllReservations = async () => {
        try {
            if (!refreshing) setLoading(true);
            
            // Κλήση GET με παραμέτρους σελιδοποίησης (page & limit)
            const response = await fetch(`${BASE_URL}/api/reservations?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Αποστολή του JWT token
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();
            
            // Ενημέρωση του state με τα δεδομένα που ήρθαν από τη βάση
            if (Array.isArray(data)) {
                setReservations(data);
            } else {
                setReservations([]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Σφάλμα", "Δεν ήταν δυνατή η σύνδεση με το διακομιστή.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Επανεκτέλεση της αναζήτησης κάθε φορά που αλλάζει η σελίδα (page)
    useEffect(() => {
        fetchAllReservations();
    }, [page]);

    // Λειτουργία ανανέωσης της λίστας (Pull-to-refresh)
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (page === 1) {
            fetchAllReservations();
        } else {
            setPage(1); // Η αλλαγή σελίδας θα πυροδοτήσει το useEffect
        }
    }, [page]);

    // Συνάρτηση για την έγκριση ακύρωσης μιας κράτησης (Admin/Employee feature)
    const handleApproveCancel = (id) => {
        Alert.alert(
            "Έγκριση Ακύρωσης",
            "Επιβεβαίωση ακύρωσης για την κράτηση #" + id,
            [
                { text: "Άκυρο" },
                { 
                    text: "Έγκριση", 
                    onPress: async () => {
                        try {
                            const response = await fetch(`${BASE_URL}/api/reservations/admin/approve-cancel/${id}`, {
                                method: 'PATCH', // Χρήση PATCH για μερική ενημέρωση της εγγραφής
                                headers: { 
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (response.ok) {
                                Alert.alert("Επιτυχία", "Η κράτηση ακυρώθηκε.");
                                fetchAllReservations(); // Φρεσκάρισμα της λίστας
                            } else {
                                const errorData = await response.json();
                                Alert.alert("Σφάλμα", errorData.message || "Αποτυχία ενημέρωσης.");
                            }
                        } catch (e) {
                            Alert.alert("Σφάλμα", "Η επικοινωνία με τον server απέτυχε.");
                        }
                    }
                }
            ]
        );
    };

    // Βοηθητική συνάρτηση για το στυλ και το λεκτικό του Status της κράτησης
    const getStatusStyle = (status) => {
        switch(status?.toLowerCase()) {
            case 'confirmed': return { color: '#00FF00', label: 'ΕΠΙΒΕΒΑΙΩΜΕΝΗ' };
            case 'cancel requested': return { color: '#FFA500', label: 'ΑΙΤΗΜΑ ΑΚΥΡΩΣΗΣ' };
            case 'confirm cancel': return { color: '#FF0000', label: 'ΑΚΥΡΩΜΕΝΗ' };
            default: return { color: 'white', label: status?.toUpperCase() || 'UNKNOWN' };
        }
    };

    // Render συνάρτηση για κάθε στοιχείο της FlatList (Κάρτα Κράτησης)
    const renderItem = ({ item }) => {
        const statusInfo = getStatusStyle(item.status);
        return (
            <View style={styles.resCard}>
                <View style={styles.infoSide}>
                    <Text style={styles.resId}>ID: #{item.reservations_id}</Text>
                    <Text style={styles.resTitle}>{item.title}</Text>
                    <Text style={styles.resUser}>Πελάτης: {item.username}</Text>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                    </Text>
                </View>

                <View style={styles.actionSide}>
                    {/* Κουμπί για προβολή λεπτομερειών */}
                    <TouchableOpacity 
                        style={styles.actionBtn} 
                        onPress={() => navigation.navigate('ReservationDetails', { resId: item.reservations_id })}
                    >
                        <Ionicons name="eye" size={22} color="white" />
                    </TouchableOpacity>

                    {/* Κουμπί έγκρισης ακύρωσης (Εμφανίζεται μόνο αν υπάρχει αίτημα) */}
                    {item.status === 'cancel requested' && (
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#8B0000' }]} 
                            onPress={() => handleApproveCancel(item.reservations_id)}
                        >
                            <Ionicons name="checkmark-done" size={22} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/*  CUSTOM NAVIGATION BAR  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.pageTitle}>Λίστα Κρατήσεων</Text>
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#8B0000" />
                ) : (
                    <FlatList
                        data={reservations}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.reservations_id.toString()}
                        ListEmptyComponent={<Text style={styles.emptyText}>Δεν βρέθηκαν εγγραφές στη σελίδα {page}.</Text>}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#8B0000"
                                colors={["#8B0000"]}
                            />
                        }
                    />
                )}
            </View>

            {/* --- PAGINATION BAR: Έλεγχος Σελίδων --- */}
            <View style={styles.paginationBar}>
                {/* Κουμπί Πίσω */}
                <TouchableOpacity 
                    disabled={page === 1} 
                    onPress={() => setPage(page - 1)}
                    style={{ opacity: page === 1 ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-back-circle" size={50} color="#8B0000" />
                </TouchableOpacity>

                <View style={styles.pageIndicator}>
                    <Text style={styles.pageNumberText}>Σελίδα {page}</Text>
                    <Text style={styles.itemCountText}>Εμφάνιση: {reservations.length} κρατήσεις</Text>
                </View>

                {/* Κουμπί Επόμενο (απενεργοποιείται αν δεν υπάρχουν άλλες εγγραφές) */}
                <TouchableOpacity 
                    disabled={reservations.length < limit} 
                    onPress={() => setPage(page + 1)}
                    style={{ opacity: reservations.length < limit ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-forward-circle" size={50} color="#8B0000" />
                </TouchableOpacity>
            </View>

            {/* --- FOOTER --- */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATERS FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};

//  STYLESHEET 
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navBar: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    content: { flex: 1, padding: 15 },
    pageTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    resCard: { backgroundColor: '#111', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#8B0000' },
    infoSide: { flex: 1 },
    resId: { color: '#8B0000', fontSize: 12, fontWeight: 'bold' },
    resTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    resUser: { color: '#888', fontSize: 13 },
    statusText: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    actionSide: { flexDirection: 'row', gap: 10 },
    actionBtn: { backgroundColor: '#333', padding: 10, borderRadius: 8 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
    
    // Pagination Bar Styles
    paginationBar: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        paddingVertical: 10, 
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#222'
    },
    pageIndicator: { alignItems: 'center' },
    pageNumberText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    itemCountText: { color: '#8B0000', fontSize: 10, fontWeight: 'bold' },

    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center', justifyContent: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 }
});

export default AllReservationsScreen;