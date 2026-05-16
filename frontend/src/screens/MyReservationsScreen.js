import React, { useContext, useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    FlatList, Alert, ActivityIndicator,
    RefreshControl 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { BASE_URL } from '../../App';

const MyReservationsScreen = () => {
    const { token } = useContext(AuthContext); // Λήψη του token για ταυτοποίηση από το context
    const navigation = useNavigation();
    
    //  STATES ΔΙΑΧΕΙΡΙΣΗΣ ΔΕΔΟΜΕΝΩΝ 
    const [displayedReservations, setDisplayedReservations] = useState([]); // Οι κρατήσεις που εμφανίζονται στην τρέχουσα σελίδα
    const [loading, setLoading] = useState(true); // Κατάσταση αρχικής φόρτωσης
    const [refreshing, setRefreshing] = useState(false); // Κατάσταση ανανέωσης (Pull-to-refresh)

    //  PAGINATION STATE (Σελιδοποίηση) 
    const [page, setPage] = useState(1); // Η τρέχουσα σελίδα
    const [hasMore, setHasMore] = useState(false); // Έλεγχος αν υπάρχει επόμενη σελίδα
    const limit = 10; // Μέγιστος αριθμός στοιχείων ανά σελίδα

    //  ΛΗΨΗ ΔΕΔΟΜΕΝΩΝ ΑΠΟ ΤΟ API 
    const fetchReservations = async () => {
        try {
            if (!refreshing) setLoading(true);

            // Κλήση API για τις προσωπικές κρατήσεις του χρήστη
            const response = await fetch(`${BASE_URL}/api/reservations/my`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            // 1. Sorting (Ταξινόμηση: Νεότερη -> Παλαιότερη ημερομηνία κράτησης)
            const allData = Array.isArray(data) ? data.sort((a, b) => 
                new Date(b.reservation_date) - new Date(a.reservation_date)
            ) : [];

            // 2. FRONTEND PAGINATION LOGIC (Τεμαχισμός της λίστας για τη συγκεκριμένη σελίδα)
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            // Κόβουμε τη συνολική λίστα για να πάρουμε μόνο τα στοιχεία της τρέχουσας σελίδας
            const paginatedItems = allData.slice(startIndex, endIndex);
            
            setDisplayedReservations(paginatedItems);
            
            // Έλεγχος αν η συνολική λίστα έχει περισσότερα στοιχεία πέρα από το endIndex
            setHasMore(allData.length > endIndex);

        } catch (error) {
            console.error(error);
            Alert.alert("Σφάλμα", "Αποτυχία σύνδεσης με τον διακομιστή.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Φόρτωση δεδομένων κάθε φορά που αλλάζει ο αριθμός της σελίδας
    useEffect(() => {
        fetchReservations();
    }, [page]);

    // Λειτουργία ανανέωσης με τράβηγμα προς τα κάτω
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (page === 1) {
            fetchReservations();
        } else {
            setPage(1); // Η αλλαγή σελίδας σε 1 θα πυροδοτήσει αυτόματα το useEffect
        }
    }, [page]);

    //  ΛΟΓΙΚΗ ΑΚΥΡΩΣΗΣ ΚΡΑΤΗΣΗΣ 
    const handleCancelRequest = (reservation) => {
        const resDate = new Date(reservation.date_time);
        const now = new Date();
        const diffInHours = (resDate - now) / (1000 * 60 * 60);

        // Έλεγχος χρονικού περιορισμού: Ακύρωση μόνο έως 1 ώρα πριν την παράσταση
        if (diffInHours < 1) {
            Alert.alert("Αδυναμία Ακύρωσης", "Οι ακυρώσεις επιτρέπονται μόνο έως και 1 ώρα πριν την έναρξη.");
            return;
        }

        // Επιβεβαίωση ακύρωσης από τον χρήστη
        Alert.alert(
            "Αίτημα Ακύρωσης", 
            `Θέλετε να ακυρώσετε την κράτηση για την παράσταση ${reservation.title};`,
            [
                { text: "Όχι" },
                { 
                    text: "Ναι", 
                    onPress: async () => {
                        try {
                            const response = await fetch(`${BASE_URL}/api/reservations/cancel-request/${reservation.reservations_id}`, {
                                method: 'PATCH',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (response.ok) {
                                Alert.alert("Επιτυχία", "Το αίτημα στάλθηκε.");
                                fetchReservations(); // Ανανέωση λίστας μετά την επιτυχή ακύρωση
                            }
                        } catch (error) {
                            Alert.alert("Σφάλμα", "Η επικοινωνία απέτυχε.");
                        }
                    }
                }
            ]
        );
    };

    // Επιστροφή στυλ χρώματος ανάλογα με την κατάσταση της κράτησης
    const getStatusStyle = (status) => {
        switch(status) {
            case 'confirmed': return { color: '#00FF00' }; // Πράσινο
            case 'cancel requested': return { color: '#FFA500' }; // Πορτοκαλί
            case 'confirm cancel': return { color: '#FF0000' }; // Κόκκινο
            default: return { color: 'white' };
        }
    };

    // Σχεδιασμός του κάθε στοιχείου (κάρτας) της λίστας
    const renderReservationItem = ({ item }) => {
        const formattedDate = new Date(item.date_time).toLocaleString('el-GR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return (
            <View style={styles.resCard}>
                <View style={styles.resInfo}>
                    <Text style={styles.resId}>#{item.reservations_id}</Text>
                    <Text style={styles.resTitle}>{item.title}</Text>
                    <Text style={styles.resDate}>{formattedDate}</Text>
                    <Text style={[styles.statusText, getStatusStyle(item.status)]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>

                <View style={styles.resActions}>
                    {/* Κουμπί Λεπτομερειών */}
                    <TouchableOpacity 
                        style={styles.detailsBtn} 
                        onPress={() => navigation.navigate('ReservationDetails', { resId: item.reservations_id })}
                    >
                        <Text style={styles.btnText}>Details</Text>
                    </TouchableOpacity>

                    {/* Εμφάνιση κουμπιού Cancel μόνο αν η κράτηση είναι confirmed */}
                    {item.status === 'confirmed' && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelRequest(item)}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/*  NAVBAR  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.pageTitle}>Οι Κρατήσεις μου</Text>
                
                {/* Spinner κατά τη φόρτωση */}
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#8B0000" />
                ) : (
                    <FlatList
                        data={displayedReservations}
                        renderItem={renderReservationItem}
                        keyExtractor={(item) => item.reservations_id.toString()}
                        ListEmptyComponent={<Text style={{color: 'white', textAlign: 'center', marginTop: 20}}>Δεν βρέθηκαν κρατήσεις στη σελίδα {page}.</Text>}
                        contentContainerStyle={{ paddingBottom: 20 }}
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

            {/*  PAGINATION BAR (Έλεγχος Σελίδων)  */}
            <View style={styles.paginationBar}>
                {/* Κουμπί Προηγούμενης Σελίδας */}
                <TouchableOpacity
                    disabled={page === 1}
                    onPress={() => setPage(page - 1)}
                    style={{ opacity: page === 1 ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-back-circle" size={50} color="#8B0000" />
                </TouchableOpacity>

                {/* Ένδειξη τρέχουσας σελίδας και πλήθους στοιχείων */}
                <View style={styles.pageIndicator}>
                    <Text style={styles.pageNumberText}>Σελίδα {page}</Text>
                    <Text style={styles.itemCountText}>Κρατήσεις σελίδας: {displayedReservations.length}</Text>
                </View>

                {/* Κουμπί Επόμενης Σελίδας */}
                <TouchableOpacity
                    disabled={!hasMore}
                    onPress={() => setPage(page + 1)}
                    style={{ opacity: !hasMore ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-forward-circle" size={50} color="#8B0000" />
                </TouchableOpacity>
            </View>

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
    navBar: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    content: { flex: 1, padding: 15 },
    pageTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    resCard: { backgroundColor: '#111', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#8B0000' },
    resInfo: { flex: 1 },
    resId: { color: '#8B0000', fontWeight: 'bold', fontSize: 12 },
    resTitle: { color: 'white', fontSize: 17, fontWeight: 'bold', marginVertical: 4 },
    resDate: { color: '#aaa', fontSize: 13 },
    statusText: { fontSize: 10, fontWeight: 'bold', marginTop: 5 },
    resActions: { alignItems: 'flex-end', gap: 8 },
    detailsBtn: { backgroundColor: '#444', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, width: 85, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#8B0000', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, width: 85, alignItems: 'center' },
    btnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
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
    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 13, marginBottom: 2 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 }
});

export default MyReservationsScreen;