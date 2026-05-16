import React, { useState, useContext } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

const PaymentScreen = ({ route }) => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext); // Πρόσβαση στα στοιχεία χρήστη από το Context
    
    //  ΛΗΨΗ ΠΑΡΑΜΕΤΡΩΝ 
    // Παραλαμβάνουμε τα δεδομένα της κράτησης από την προηγούμενη οθόνη (SeatSelection)
    const { 
        showtimeId, 
        seatsCount, 
        selectedSeats, 
        showTitle, 
        theatreName, 
        selectedTime,
        totalAmount 
    } = route.params;

    //  STATES 
    const [paymentMethod, setPaymentMethod] = useState('card'); // Επιλεγμένος τρόπος πληρωμής (default: card)
    const [loading, setLoading] = useState(false); // Κατάσταση φόρτωσης κατά την αποστολή της κράτησης

    //  ΕΠΙΒΕΒΑΙΩΣΗ ΠΛΗΡΩΜΗΣ & ΚΡΑΤΗΣΗΣ 
    const handleConfirmPayment = async () => {
        setLoading(true);
        
        // Προετοιμασία των δεδομένων (payload) για την αποστολή στο Backend
        const payload = {
            showtime_id: parseInt(showtimeId),
            selectedSeats: selectedSeats, // Πίνακας με τα IDs των επιλεγμένων θέσεων
            payment_method: paymentMethod === 'google' ? 'google_pay' : 
                            paymentMethod === 'apple' ? 'apple_pay' : paymentMethod,
            total_price: parseFloat(totalAmount)
        };

        console.log("PAYLOAD SENDING TO BACKEND:", payload);

        try {
            // Αποστολή αιτήματος POST για τη δημιουργία της κράτησης
            const response = await apiClient.post('/reservations', payload);
            
            // Μετά την επιτυχή απόκριση, μετάβαση στην οθόνη επιτυχίας
            navigation.navigate('ReservationSuccess', {
                reservationId: response.data.reservationId,
                showTitle: showTitle,
                totalAmount: totalAmount
            });
        } catch (error) {
            console.error("Full Error Response:", error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || "Κάτι πήγε στραβά με την κράτηση.";
            Alert.alert("Σφάλμα", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    //  REUSABLE COMPONENT ΓΙΑ ΕΠΙΛΟΓΕΣ ΠΛΗΡΩΜΗΣ 
    const PaymentOption = ({ id, label, icon }) => (
        <TouchableOpacity 
            style={[styles.methodItem, paymentMethod === id && styles.activeMethod]} 
            onPress={() => setPaymentMethod(id)}
        >
            <Ionicons 
                name={icon} 
                size={24} 
                color={paymentMethod === id ? "white" : "#8B0000"} 
            />
            <Text style={[styles.methodText, paymentMethod === id && styles.activeMethodText]}>
                {label}
            </Text>
            {paymentMethod === id && (
                <Ionicons name="checkmark-circle" size={22} color="white" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/*  HEADER  */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Πληρωμή</Text>
                <View style={{ width: 40 }} /> {/* Spacer για ευθυγράμμιση τίτλου */}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/*  SUMMARY CARD (Σύνοψη Κράτησης)  */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Ionicons name="receipt-outline" size={20} color="#8B0000" />
                        <Text style={styles.summaryTitle}>Σύνοψη Κράτησης</Text>
                    </View>
                    <View style={styles.divider} />
                    
                    <Text style={styles.showTitle}>{showTitle}</Text>
                    <Text style={styles.infoText}>{theatreName}</Text>
                    <Text style={styles.infoText}>
                        {new Date(selectedTime).toLocaleString('el-GR', {
                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Θέσεις ({seatsCount}):</Text>
                        <Text style={styles.value}>{totalAmount}€</Text>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Σύνολο:</Text>
                        <Text style={styles.totalValue}>{totalAmount}€</Text>
                    </View>
                </View>

                {/*  SECTION: ΤΡΟΠΟΣ ΠΛΗΡΩΜΗΣ  */}
                <Text style={styles.sectionTitle}>Τρόπος Πληρωμής</Text>
                
                <PaymentOption id="card" label="Πιστωτική / Χρεωστική Κάρτα" icon="card-outline" />
                <PaymentOption id="paypal" label="PayPal" icon="logo-paypal" />
                <PaymentOption id="google" label="Google Pay" icon="logo-google" />

                {/*  ΚΟΥΜΠΙ ΟΛΟΚΛΗΡΩΣΗΣ  */}
                <TouchableOpacity 
                    style={[styles.payButton, loading && { opacity: 0.7 }]} 
                    onPress={handleConfirmPayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text style={styles.payButtonText}>Επιβεβαίωση & Ολοκλήρωση</Text>
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

             {/* --- FOOTER --- */}
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
    header: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    backBtn: { width: 40 },
    content: { padding: 20 },
    summaryCard: { backgroundColor: '#111', padding: 20, borderRadius: 15, marginBottom: 30, borderWidth: 1, borderColor: '#222' },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    summaryTitle: { color: '#8B0000', fontSize: 14, fontWeight: 'bold', marginLeft: 8, textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#222', marginVertical: 12 },
    showTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    infoText: { color: '#888', fontSize: 14, marginBottom: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    label: { color: '#aaa', fontSize: 15 },
    value: { color: 'white', fontWeight: '600', fontSize: 15 },
    totalLabel: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    totalValue: { color: '#8B0000', fontSize: 24, fontWeight: 'bold' },
    sectionTitle: { color: 'white', fontSize: 17, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
    methodItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
    activeMethod: { backgroundColor: '#1a0000', borderColor: '#8B0000' },
    methodText: { color: '#ccc', flex: 1, marginLeft: 15, fontSize: 16 },
    activeMethodText: { color: 'white', fontWeight: 'bold' },
    payButton: { backgroundColor: '#8B0000', flexDirection: 'row', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    payButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 }
});

export default PaymentScreen;