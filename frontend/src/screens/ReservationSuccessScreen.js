import React, { useContext } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    Dimensions, BackHandler 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, CommonActions, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ReservationSuccessScreen = ({ route }) => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    
    // Λήψη παραμέτρων από την προηγούμενη οθόνη (Reservation/Payment)
    const { reservationId, showTitle, totalAmount } = route.params || {};

    //  ΚΛΕΙΔΩΜΑ BACK BUTTON (ΔΙΟΡΘΩΜΕΝΟ) 
    // Χρησιμοποιούμε το useFocusEffect για να απενεργοποιήσουμε το hardware back button (Android)
    // όσο ο χρήστης βρίσκεται σε αυτή την οθόνη, ώστε να μην επιστρέψει στη φόρμα πληρωμής.
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true; // Επιστρέφοντας true, ακυρώνουμε την ενέργεια του back
            };

            // Δημιουργούμε τη συνδρομή για το hardware button
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            // Συνάρτηση καθαρισμού (cleanup) όταν η οθόνη χάνει το focus
            return () => subscription.remove();
        }, [])
    );

    //  ΛΟΓΙΚΗ ΑΝΑΚΑΤΕΥΘΥΝΣΗΣ ΣΤΙΣ ΚΡΑΤΗΣΕΙΣ 
    const goToMyReservations = () => {
        // Χρησιμοποιούμε reset για να καθαρίσουμε το ιστορικό πλοήγησης 
        // και να στείλουμε τον χρήστη απευθείας στο Tab των κρατήσεων.
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {
                        name: 'Main', 
                        state: {
                            routes: [
                                { name: 'Reservations' } 
                            ],
                        },
                    },
                ],
            })
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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.successContent}>
                    {/* Εικονίδιο Επιτυχίας */}
                    <Ionicons name="checkmark-circle" size={100} color="#FFD700" style={styles.icon} />
                    
                    <Text style={styles.welcomeText}>Η κράτηση ολοκληρώθηκε!</Text>
                    
                    {/* Πλαίσιο με τις πληροφορίες της κράτησης */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>Παράσταση: <Text style={styles.boldText}>{showTitle || 'N/A'}</Text></Text>
                        <Text style={styles.infoText}>Κωδικός: <Text style={styles.boldText}>#{reservationId || '---'}</Text></Text>
                        <Text style={styles.infoText}>Σύνολο: <Text style={styles.boldText}>{totalAmount || '0'}€</Text></Text>
                    </View>

                    {/* Κουμπί για μετάβαση στη λίστα κρατήσεων */}
                    <TouchableOpacity 
                        style={styles.detailsButton}
                        onPress={goToMyReservations}
                    >
                        <Text style={styles.detailsButtonText}>Δείτε τις κρατήσεις σας εδώ</Text>
                        <Ionicons name="list-outline" size={20} color="#FFD700" />
                    </TouchableOpacity>

                    {/* Κουμπί για άμεση επιστροφή στην Αρχική */}
                    <TouchableOpacity 
                        style={styles.backHomeBtn}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.backHomeBtnText}>Επιστροφή στην Αρχική</Text>
                    </TouchableOpacity>
                </View>
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
    scrollContent: { paddingBottom: 40 },
    successContent: { alignItems: 'center', padding: 20, paddingTop: 40 },
    icon: { marginBottom: 20 },
    welcomeText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    infoBox: { 
        backgroundColor: '#111', 
        width: '100%', 
        padding: 20, 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: '#222',
        marginBottom: 30
    },
    infoText: { color: '#aaa', fontSize: 16, marginBottom: 10, textAlign: 'center' },
    boldText: { color: 'white', fontWeight: 'bold' },
    detailsButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: '#FFD700',
        paddingBottom: 5,
        marginBottom: 40
    },
    detailsButtonText: { color: '#FFD700', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
    backHomeBtn: {
        backgroundColor: '#8B0000',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white'
    },
    backHomeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    footer: { 
        backgroundColor: '#8B0000', 
        padding: 20, 
        alignItems: 'center'
    },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 }
});

export default ReservationSuccessScreen;