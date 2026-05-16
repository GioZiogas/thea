import React, { useContext, useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    ScrollView, ActivityIndicator, Alert, Dimensions, SafeAreaView 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BASE_URL } from '../../App';

const { width } = Dimensions.get('window');

const ReservationDetailsScreen = () => {
    //  CONTEXT & NAVIGATION 
    const { token } = useContext(AuthContext);
    const navigation = useNavigation();
    const route = useRoute();
    
    // Λαμβάνουμε το ID της κράτησης από τα παραμέτρους της πλοήγησης
    const { resId } = route.params;

    //  STATE 
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    //  FETCH DATA FUNCTION 
    const fetchDetails = async () => {
        try {
            setLoading(true);
            // Κλήση στο API για λήψη των αναλυτικών στοιχείων της συγκεκριμένης κράτησης
            // Σημείωση: Το endpoint πρέπει να επιστρέφει το πεδίο seat_details
            const response = await fetch(`${BASE_URL}/api/reservations/details/${resId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setDetails(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Σφάλμα", "Αποτυχία φόρτωσης λεπτομερειών.");
        } finally {
            setLoading(false);
        }
    };

    // Εκτέλεση της fetchDetails όταν φορτώνει η οθόνη ή όταν αλλάζει το resId
    useEffect(() => {
        fetchDetails();
    }, [resId]);

    //  LOADING STATE VIEW 
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#8B0000" />
            </View>
        );
    }

    return (
        // Χρήση SafeAreaView με μαύρο background για σωστή απεικόνιση σε συσκευές με notch
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.pageTitle}>Λεπτομέρειες Κράτησης</Text>

                    {/*  ΚΑΡΤΑ ΛΕΠΤΟΜΕΡΕΙΩΝ  */}
                    <View style={styles.detailsCard}>
                        <Ionicons name="ticket-outline" size={50} color="#8B0000" style={{ alignSelf: 'center' }} />
                        <Text style={styles.resNumber}># {details?.reservations_id}</Text>
                        
                        <View style={styles.divider} />

                        <Text style={styles.label}>ΠΑΡΑΣΤΑΣΗ</Text>
                        <Text style={styles.value}>{details?.title}</Text>

                        <Text style={styles.label}>ΗΜΕΡΟΜΗΝΙΑ & ΩΡΑ</Text>
                        <Text style={styles.value}>
                            {details?.date_time ? new Date(details.date_time).toLocaleString('el-GR', {
                                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : 'N/A'}
                        </Text>

                        {/*  ΕΝΟΤΗΤΑ ΘΕΣΕΩΝ  */}
                        <Text style={styles.label}>ΘΕΣΕΙΣ ({details?.seats_count})</Text>
                        <View style={styles.seatsContainer}>
                            <Ionicons name="apps-outline" size={16} color="#aaa" style={{ marginRight: 5 }} />
                            <Text style={styles.seatValue}>
                                {details?.seat_details ? details.seat_details : 'Δεν βρέθηκαν θέσεις'}
                            </Text>
                        </View>

                        <Text style={styles.label}>ΤΡΟΠΟΣ ΠΛΗΡΩΜΗΣ</Text>
                        <Text style={styles.value}>{details?.payment_method?.toUpperCase()}</Text>

                        <Text style={styles.label}>ΣΥΝΟΛΙΚΟ ΠΟΣΟ</Text>
                        <Text style={styles.price}>{details?.total_price}€</Text>

                        {/*  STATUS BADGE  */}
                        <View style={[styles.statusBadge, { backgroundColor: details?.status === 'confirmed' ? '#006400' : '#444' }]}>
                            <Text style={styles.statusText}>{details?.status?.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/*  ΚΟΥΜΠΙ ΕΠΙΣΤΡΟΦΗΣ  */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bottomBackBtn}>
                        <Ionicons name="arrow-back" size={18} color="white" />
                        <Text style={styles.bottomBackBtnText}>Επιστροφή στις Κρατήσεις</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

//  STYLES 
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000', // Μαύρο background για το SafeAreaView
    },
    container: { 
        flex: 1, 
        backgroundColor: '#000',
    },
    scrollContent: { 
        padding: 15, 
        paddingBottom: 50 
    },
    pageTitle: { 
        color: 'white', 
        fontSize: 24, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginVertical: 20 
    },
    detailsCard: { 
        backgroundColor: '#111', 
        borderRadius: 12, 
        padding: 25, 
        borderLeftWidth: 4, 
        borderLeftColor: '#8B0000', 
        marginBottom: 30,
        // Σκιά για βάθος
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    resNumber: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
    divider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
    label: { color: '#8B0000', fontSize: 12, fontWeight: 'bold', marginTop: 15 },
    value: { color: 'white', fontSize: 18, marginBottom: 5, fontWeight: '500' },
    
    // Στυλ για το container των θέσεων
    seatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 10,
        borderRadius: 6,
        marginTop: 5
    },
    seatValue: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' }, // Χρυσό χρώμα για έμφαση
    
    price: { color: '#00FF00', fontSize: 26, fontWeight: 'bold', marginTop: 5 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 6, marginTop: 25 },
    statusText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    bottomBackBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#8B0000', 
        padding: 18, 
        borderRadius: 10,
        gap: 10,
        marginTop: 10,
        marginBottom: 30
    },
    bottomBackBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ReservationDetailsScreen;