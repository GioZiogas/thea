import React, { useEffect, useState, useContext } from 'react';
import { 
    View, Text, Image, ScrollView, StyleSheet, 
    TouchableOpacity, ActivityIndicator 
} from 'react-native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; 

const ShowDetailsScreen = ({ route }) => {
    const navigation = useNavigation();
    
    //  ΛΗΨΗ ΠΑΡΑΜΕΤΡΩΝ 
    // Λαμβάνουμε το showId ή ολόκληρο το αντικείμενο showItem από την προηγούμενη οθόνη
    const { showId, showItem } = route.params || {}; 
    const { user } = useContext(AuthContext);
    const userRole = user?.role?.toLowerCase() || null;

    //  STATE MANAGEMENT 
    // Αν το showItem υπάρχει ήδη, το χρησιμοποιούμε για άμεση εμφάνιση
    const [showData, setShowData] = useState(showItem || null);
    const [loading, setLoading] = useState(!showItem);

    // Η διεύθυνση του διακομιστή για τις εικόνες
    const BASE_URL = 'http://192.168.3.125:5000';

    useEffect(() => {
        // Αν η οθόνη άνοιξε μόνο με ID (π.χ. από deep link), κάνουμε fetch τις λεπτομέρειες
        if (!showData) {
            fetchDetails();
        }
    }, [showId]);

    //  FETCH DATA FUNCTION 
    const fetchDetails = async () => {
        try {
            const targetId = showId || showItem?.shows_id;
            if (!targetId) return;

            const showRes = await apiClient.get(`/shows/${targetId}`);
            
            // Διαχείριση της απάντησης: έλεγχος αν είναι array ή μεμονωμένο object
            const fetchedData = Array.isArray(showRes.data) ? showRes.data[0] : showRes.data;
            
            setShowData(fetchedData);
            setLoading(false);
        } catch (error) {
            console.error("Details Fetch Error:", error);
            setLoading(false);
        }
    };

    // Έλεγχος αν ο χρήστης είναι προσωπικό (Staff/Admin)
    const isStaff = userRole === 'admin' || userRole === 'employee';

    // Προβολή loading όσο περιμένουμε τα δεδομένα
    if (loading && !showData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B0000" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            {/*  CUSTOM NAV BAR  */}
            <View style={styles.navBar}>
                <View style={styles.navLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </View>
                {/* Άνοιγμα του Side Drawer */}
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }}>
                
                {/* --- ΕΝΟΤΗΤΑ ΕΙΚΟΝΑΣ --- */}
                {/* Χρήση key για να αναγκάσουμε το component να ανανεωθεί αν αλλάξει το path */}
                <Image 
                    source={{ 
                        uri: showData?.image_path 
                            ? `${BASE_URL}/uploads/${showData.image_path}` 
                            : 'https://via.placeholder.com/450' 
                    }} 
                    style={styles.mainImage}
                    key={showData?.image_path}
                />
                
                <View style={styles.content}>
                    {/* Τίτλος Παράστασης */}
                    <Text style={styles.title}>{showData?.title || 'Φόρτωση τίτλου...'}</Text>
                    
                    {/* Badges Κατηγορίας & Kids Friendly */}
                    <View style={styles.badgeRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.badgeText}>{showData?.category || 'Γενικό'}</Text>
                        </View>
                        {showData?.is_kid_friendly === 1 && (
                            <View style={styles.kidBadgeContainer}>
                                <Ionicons name="happy-outline" size={14} color="white" />
                                <Text style={styles.kidBadgeText}>Kids Friendly</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.divider} />

                    {/* Περιγραφή / Σύνοψη */}
                    <Text style={styles.sectionTitle}>Σύνοψη</Text>
                    <Text style={styles.description}>
                        {showData?.description || 'Δεν υπάρχει διαθέσιμη περιγραφή.'}
                    </Text>

                    {/* Πληροφορίες Διάρκειας και Τιμής */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={22} color="#8B0000" />
                            <Text style={styles.infoText}>Διάρκεια: {showData?.duration} λεπτά</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="ticket-outline" size={22} color="#8B0000" />
                            <Text style={styles.infoText}>Αρχική Τιμή: {showData?.base_price}€</Text>
                        </View>
                    </View>

                    {/* ΚΟΥΜΠΙ ΚΡΑΤΗΣΗΣ */}
                    {/* Μεταφέρει τον χρήστη στην επιλογή ημερομηνιών, περνώντας το ID, τον Τίτλο και την Τιμή */}
                    <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('ShowShowtimes', { 
                            showId: showData?.shows_id,
                            showTitle: showData?.title, 
                            basePrice: showData?.base_price
                        })}
                    >
                        <Text style={styles.bookButtonText}>Επιλογή Προβολής & Θέσεων</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

           {/*  FOOTER ΕΤΑΙΡΕΙΑΣ  */}
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
    loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    navBar: { 
        height: 100, 
        backgroundColor: '#8B0000', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingTop: 40 
    },
    navLeft: { flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 15 },
    navLogo: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    scrollContainer: { flex: 1 },
    mainImage: { width: '100%', height: 450, backgroundColor: '#1a1a1a' },
    content: { padding: 20 },
    title: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
    badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    categoryBadge: { backgroundColor: '#333', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    badgeText: { color: 'white', fontSize: 13 },
    kidBadgeContainer: { backgroundColor: '#2e7d32', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, gap: 5 },
    kidBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#222', marginVertical: 20 },
    sectionTitle: { color: '#8B0000', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { color: '#bbb', lineHeight: 22, fontSize: 15 },
    infoContainer: { marginTop: 20, gap: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoText: { color: 'white', fontSize: 16 },
    bookButton: { 
        backgroundColor: '#8B0000', 
        padding: 18, 
        borderRadius: 12, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 30,
        gap: 10
    },
    bookButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    footer: { backgroundColor: '#8B0000', padding: 10, alignItems: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 },
});

export default ShowDetailsScreen;