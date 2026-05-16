import React, { useEffect, useState, useContext } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    ActivityIndicator, Dimensions 
} from 'react-native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SeatSelectionScreen = ({ route }) => {
    const navigation = useNavigation();
    
    //  ΛΗΨΗ ΠΑΡΑΜΕΤΡΩΝ 
    // Λαμβάνουμε τα δεδομένα από την προηγούμενη οθόνη (Showtime selection)
    const { 
        showtimeId, 
        theatreName, 
        selectedTime, 
        showTitle, 
        basePrice 
    } = route.params;
    
    const { user } = useContext(AuthContext);
    const userRole = user?.role?.toLowerCase() || null;
    const isStaff = userRole === 'admin' || userRole === 'employee';

    //  STATES 
    const [seats, setSeats] = useState([]); // Όλες οι θέσεις από το API
    const [selectedSeats, setSelectedSeats] = useState([]); // Τα IDs των θέσεων που επέλεξε ο χρήστης
    const [loading, setLoading] = useState(true);

    //  ΥΠΟΛΟΓΙΣΜΟΣ ΤΙΜΗΣ 
    // Μετατρέπουμε το basePrice σε αριθμό και υπολογίζουμε το σύνολο
    const ticketPrice = Number(basePrice) || 0;
    const totalPrice = (selectedSeats.length * ticketPrice).toFixed(2);

    // Φόρτωση θέσεων κατά την εκκίνηση
    useEffect(() => {
        fetchSeats();
    }, []);

    //  API CALL ΓΙΑ ΘΕΣΕΙΣ 
    const fetchSeats = async () => {
        try {
            setLoading(true);
            // Κλήση στο endpoint για τη λήψη των θέσεων του συγκεκριμένου showtime
            const response = await apiClient.get(`/theatres/showtimes/${showtimeId}/seats`);
            console.log("Seats received:", response.data.length); 
            setSeats(response.data);
        } catch (error) {
            console.error("Error fetching seats:", error);
        } finally {
            setLoading(false);
        }
    };

    //  LOGIC ΕΠΙΛΟΓΗΣ ΘΕΣΗΣ 
    const toggleSeatSelection = (seat) => {
        // Αν η θέση είναι ήδη κατειλημμένη (occupied), δεν κάνουμε τίποτα
        if (seat.status === 'occupied') return;

        // Αν είναι ήδη επιλεγμένη, την αφαιρούμε, αλλιώς την προσθέτουμε στο array
        if (selectedSeats.includes(seat.seat_id)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seat.seat_id));
        } else {
            setSelectedSeats([...selectedSeats, seat.seat_id]);
        }
    };

    //  RENDER ΜΕΜΟΝΩΜΕΝΗΣ ΘΕΣΗΣ 
    const renderSeat = (seat, index) => {
        const isSelected = selectedSeats.includes(seat.seat_id);
        
        // Καθορισμός χρώματος βάσει κατάστασης
        let seatColor = '#222'; // Ελεύθερη
        if (seat.status === 'occupied') seatColor = '#8B0000'; // Πιασμένη (Σκούρο Κόκκινο)
        if (isSelected) seatColor = '#FFD700'; // Επιλεγμένη (Χρυσό)

        return (
            <TouchableOpacity 
                key={seat.seat_id} 
                style={[styles.seat, { backgroundColor: seatColor }]}
                onPress={() => toggleSeatSelection(seat)}
                disabled={seat.status === 'occupied'}
            >
                {/* Χρήση index + 1 για την οπτική αρίθμηση των θέσεων */}
                <Text style={styles.seatText}>{index + 1}</Text>
            </TouchableOpacity>
        );
    };

    //  LOADING VIEW 
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B0000" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            {/*  HEADER / NAVIGATION BAR  */}
            <View style={styles.navBar}>
                <View style={styles.navLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.navLogo}>Επιλογή Θέσης</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.content}>
                    {/* Πληροφορίες Παράστασης */}
                    <Text style={styles.showTitle}>{showTitle}</Text>
                    <Text style={styles.detailsText}>
                        {theatreName} | {new Date(selectedTime).toLocaleString('el-GR')}
                    </Text>

                    {/* Οπτική αναπαράσταση Σκηνής/Οθόνης */}
                    <View style={styles.screenWrapper}>
                        <View style={styles.screenLine} />
                        <Text style={styles.screenLabel}>ΣΚΗΝΗ</Text>
                    </View>

                    {/* Πλέγμα Θέσεων */}
                    <View style={styles.seatsGrid}>
                        {seats.map((seat, index) => (
                            <React.Fragment key={`${seat.seat_id}-${seat.status}`}>
                                {renderSeat(seat, index)}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* Legend (Επεξήγηση χρωμάτων) */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.box, {backgroundColor: '#222'}]}/>
                            <Text style={styles.lText}>Ελεύθερη</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.box, {backgroundColor: '#8B0000'}]}/>
                            <Text style={styles.lText}>Πιασμένη</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.box, {backgroundColor: '#FFD700'}]}/>
                            <Text style={styles.lText}>Επιλογή</Text>
                        </View>
                    </View>

                    {/* Summary & Κουμπί Πληρωμής - Εμφανίζεται μόνο αν υπάρχει επιλογή */}
                    {selectedSeats.length > 0 && (
                        <View style={styles.summaryContainer}>
                            <View style={styles.priceTag}>
                                <Text style={styles.summaryText}>
                                    Θέσεις: {selectedSeats.length}  |  Σύνολο: {totalPrice}€
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.confirmButton}
                                onPress={() => navigation.navigate('Payment', {
                                    showtimeId: showtimeId,
                                    selectedSeats: selectedSeats,
                                    seatsCount: selectedSeats.length,
                                    totalAmount: totalPrice, 
                                    showTitle: showTitle,
                                    theatreName: theatreName,
                                    selectedTime: selectedTime
                                })}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Συνέχεια στην Πληρωμή ({totalPrice}€)
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="white" style={{marginLeft: 10}} />
                            </TouchableOpacity>
                        </View>
                    )}
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
    mainContainer: { flex: 1, backgroundColor: '#000' },
    loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    navBar: { 
        height: 100, backgroundColor: '#8B0000', flexDirection: 'row', 
        alignItems: 'center', justifyContent: 'space-between', 
        paddingHorizontal: 20, paddingTop: 40 
    },
    navLeft: { flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 15 },
    navLogo: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    
    scrollContainer: { flex: 1 },
    content: { padding: 20, alignItems: 'center' },
    showTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    detailsText: { color: '#aaa', fontSize: 14, marginBottom: 30, textAlign: 'center' },

    screenWrapper: { width: '80%', alignItems: 'center', marginBottom: 40 },
    screenLine: { width: '100%', height: 4, backgroundColor: '#333', borderRadius: 2 },
    screenLabel: { color: '#555', fontSize: 12, marginTop: 5, letterSpacing: 2 },

    seatsGrid: { 
        flexDirection: 'row', flexWrap: 'wrap', 
        justifyContent: 'center', width: width - 40 
    },
    seat: { 
        width: 35, height: 35, margin: 5, borderRadius: 6, 
        justifyContent: 'center', alignItems: 'center',
        elevation: 3, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.3
    },
    seatText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    legend: { 
        flexDirection: 'row', justifyContent: 'space-around', 
        width: '100%', marginTop: 40, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 
    },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    box: { width: 14, height: 14, marginRight: 6, borderRadius: 3 },
    lText: { color: '#bbb', fontSize: 12 },

    summaryContainer: { marginTop: 30, width: '100%', alignItems: 'center', paddingBottom: 120 },
    priceTag: { backgroundColor: '#111', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 15 },
    summaryText: { color: 'white', fontSize: 16, fontWeight: '600' },
    confirmButton: { 
        backgroundColor: '#8B0000', paddingVertical: 16, paddingHorizontal: 20, 
        borderRadius: 12, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center'
    },
    confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    footer: { 
        backgroundColor: '#8B0000', padding: 12, alignItems: 'center', 
        position: 'absolute', bottom: 0, width: '100%' 
    },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 },
});

export default SeatSelectionScreen;