import React, { useEffect, useState } from 'react';
import { 
    View, Text, FlatList, StyleSheet, TouchableOpacity, 
    ActivityIndicator, Modal, ScrollView, Dimensions 
} from 'react-native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ShowShowtimesScreen = ({ route }) => {
    //  ΛΗΨΗ ΠΑΡΑΜΕΤΡΩΝ 
    // Λαμβάνουμε το ID της παράστασης, τον τίτλο και τη βασική τιμή από την προηγούμενη οθόνη
    const { showId, showTitle, basePrice } = route.params || {};
    const navigation = useNavigation();
    
    const [theatres, setTheatres] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // States για τη διαχείριση του Modal επιλογής ημερομηνίας
    const [calendarModalVisible, setCalendarModalVisible] = useState(false);
    const [selectedTheatre, setSelectedTheatre] = useState(null);
    const [datesForTheatre, setDatesForTheatre] = useState([]);

    useEffect(() => {
        if (showId) fetchShowtimes();
    }, [showId]);

    //  FETCH & GROUPING LOGIC 
    const fetchShowtimes = async () => {
        try {
            setLoading(true);
            // Κλήση στο API για λήψη όλων των προβολών της συγκεκριμένης παράστασης
            const response = await apiClient.get(`/theatres/showtimes/${showId}`);            
            
            // Ομαδοποίηση των δεδομένων ανά Θέατρο (Grouping)
            // Επειδή το API επιστρέφει flat λίστα, τα ομαδοποιούμε ώστε κάθε κάρτα να αντιπροσωπεύει ένα θέατρο
            const grouped = response.data.reduce((acc, item) => {
                const tName = item.theater_name || item.theatre_name || "Άγνωστο Θέατρο";
                if (!acc[tName]) {
                    acc[tName] = {
                        name: tName,
                        id: item.theatre_id || item.theatres_id,
                        city: item.city,
                        dates: [] // Εδώ θα μπούν όλες οι διαθέσιμες ώρες/μέρες για αυτό το θέατρο
                    };
                }
                acc[tName].dates.push(item);
                return acc;
            }, {});

            setTheatres(Object.values(grouped));
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Ενεργοποίηση του Modal όταν ο χρήστης κρατάει πατημένο ένα θέατρο
    const handleLongPressTheatre = (theatre) => {
        setSelectedTheatre(theatre);
        setDatesForTheatre(theatre.dates);
        setCalendarModalVisible(true);
    };

    //  RENDER THEATRE CARD 
    const renderTheatreItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.theatreCard}
            onLongPress={() => handleLongPressTheatre(item)}
            onPress={() => alert("Κρατήστε πατημένο για να δείτε τις ημερομηνίες!")}
        >
            <View style={styles.theatreIconContainer}>
                <Ionicons name="business" size={30} color="#8B0000" />
            </View>
            <View style={styles.theatreInfo}>
                <Text style={styles.theatreNameText}>{item.name}</Text>
                <Text style={styles.theatreLocationText}>
                    <Ionicons name="location" size={12} /> {item.city || 'Γενική Τοποθεσία'}
                </Text>
                <Text style={styles.clickHint}>Long press για πρόγραμμα</Text>
            </View>
            <Ionicons name="calendar-outline" size={24} color="#555" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/*  NAV BAR  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{showTitle}</Text>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Διαθέσιμα Θέατρα</Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#8B0000" style={{marginTop: 50}} />
                ) : (
                    <FlatList
                        data={theatres}
                        keyExtractor={(item) => item.id?.toString()}
                        renderItem={renderTheatreItem}
                        ListEmptyComponent={<Text style={styles.emptyText}>Δεν βρέθηκαν θέατρα.</Text>}
                    />
                )}
            </View>

            {/*  MODAL: ΕΠΙΛΟΓΗ ΗΜΕΡΟΜΗΝΙΑΣ & ΩΡΑΣ  */}
            <Modal
                visible={calendarModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCalendarModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarContainer}>
                        {/* Header Modal */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedTheatre?.name}</Text>
                            <TouchableOpacity onPress={() => setCalendarModalVisible(false)}>
                                <Ionicons name="close-circle" size={30} color="#8B0000" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.modalSubTitle}>Επιλέξτε Ημερομηνία & Ώρα</Text>
                        
                        {/* Λίστα με τα διαθέσιμα Slots */}
                        <ScrollView contentContainerStyle={styles.dateGrid}>
                            {datesForTheatre.map((dt, index) => {
                                const dObj = new Date(dt.date_time);
                                return (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.dateSlot}
                                        onPress={() => {
                                            setCalendarModalVisible(false);
                                            // Μεταφορά στην οθόνη SeatSelection με όλα τα απαραίτητα δεδομένα
                                            navigation.navigate('SeatSelection', { 
                                                showtimeId: dt.showtimes_id,
                                                theatreName: selectedTheatre.name,
                                                selectedTime: dt.date_time,
                                                showTitle: showTitle,
                                                basePrice: basePrice // Περνάμε τη δυναμική τιμή για τον υπολογισμό στο καλάθι
                                            });
                                        }}
                                    >
                                        <Text style={styles.dateDay}>
                                            {dObj.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
                                        </Text>
                                        <Text style={styles.dateTime}>
                                            {dObj.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/*  FOOTER  */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATERS FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};
//styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navBar: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    navTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    content: { flex: 1, padding: 20 },
    sectionTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    
    theatreCard: { 
        backgroundColor: '#111', 
        borderRadius: 15, 
        padding: 15, 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#222'
    },
    theatreIconContainer: { backgroundColor: '#222', padding: 10, borderRadius: 10, marginRight: 15 },
    theatreInfo: { flex: 1 },
    theatreNameText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    theatreLocationText: { color: '#aaa', fontSize: 14, marginTop: 4 },
    clickHint: { color: '#8B0000', fontSize: 10, marginTop: 5, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    calendarContainer: { 
        backgroundColor: '#1a1a1a', 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        padding: 25, 
        height: '70%' 
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    modalSubTitle: { color: '#8B0000', fontSize: 16, marginBottom: 20, fontWeight: '600' },
    dateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    dateSlot: { 
        backgroundColor: '#333', 
        width: (width - 80) / 3, 
        padding: 15, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#444'
    },
    dateDay: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    dateTime: { color: '#DAA520', fontSize: 12, marginTop: 5 },

    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 },
    emptyText: { color: '#555', textAlign: 'center', marginTop: 20 }
});

export default ShowShowtimesScreen;