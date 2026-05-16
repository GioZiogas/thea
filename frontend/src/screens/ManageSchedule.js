import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    Alert, ActivityIndicator, TextInput, Modal, FlatList 
} from 'react-native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const ManageSchedule = () => {
    const navigation = useNavigation();
    
    //  STATES ΔΙΑΧΕΙΡΙΣΗΣ ΚΑΤΑΣΤΑΣΗΣ 
    const [loading, setLoading] = useState(false);
    const [shows, setShows] = useState([]); // Λίστα παραστάσεων από τη βάση
    const [theatres, setTheatres] = useState([]); // Λίστα θεάτρων για την επιλεγμένη παράσταση
    
    const [selectedShow, setSelectedShow] = useState(null);
    const [selectedTheatre, setSelectedTheatre] = useState(null);
    
    const [markedDates, setMarkedDates] = useState({}); // Οι επιλεγμένες ημερομηνίες στο ημερολόγιο
    const [lastSelectedDate, setLastSelectedDate] = useState(''); // Η τελευταία μέρα που πάτησε ο χρήστης
    
    const [newTime, setNewTime] = useState(''); // State για την εισαγωγή ώρας (HH:MM)
    const [seats, setSeats] = useState('100'); // Αριθμός θέσεων ανά προβολή
    const [showModal, setShowModal] = useState(false); // Modal επιλογής παράστασης
    const [theatreModal, setTheatreModal] = useState(false); // Modal επιλογής θεάτρου

    const today = new Date().toISOString().split('T')[0];

    // Φόρτωση παραστάσεων κατά την εκκίνηση της οθόνης
    useEffect(() => {
        fetchShows();
    }, []);

    // Συνάρτηση μορφοποίησης της ώρας (προσθέτει αυτόματα την άνω-κάτω τελεία)
    const formatTimeInput = (text) => {
        let cleaned = text.replace(/\D/g, ''); 
        if (cleaned.length > 2) {
            cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
        }
        setNewTime(cleaned);
    };

    // Ανάκτηση όλων των παραστάσεων
    const fetchShows = async () => {
        try {
            const response = await apiClient.get('/shows');
            setShows(response.data);
        } catch (error) {
            Alert.alert("Σφάλμα", "Αποτυχία φόρτωσης παραστάσεων");
        }
    };

    // Επιλογή παράστασης και αυτόματη ανάκτηση των συνδεδεμένων θεάτρων
    const handleSelectShow = async (show) => {
        setSelectedShow(show);
        setShowModal(false);
        setSelectedTheatre(null);
        setMarkedDates({});
        setLastSelectedDate('');
        try {
            const response = await apiClient.get(`/theatres/by-show/${show.shows_id}`);
            setTheatres(response.data);
        } catch (error) {
            Alert.alert("Σφάλμα", "Δεν βρέθηκαν συνδεδεμένα θέατρα.");
        }
    };

    // Διαχείριση επιλογής/αποεπιλογής ημέρας στο ημερολόγιο (Toggle)
    const onDayPress = (day) => {
        const dateStr = day.dateString;
        if (dateStr < today) return; // Εμποδίζει την επιλογή περασμένων ημερομηνιών

        setMarkedDates(prev => {
            const next = { ...prev };
            if (next[dateStr]) {
                delete next[dateStr]; // Αν υπάρχει ήδη, την αφαιρεί
                if (lastSelectedDate === dateStr) setLastSelectedDate('');
            } else {
                next[dateStr] = { 
                    selected: true, 
                    selectedColor: '#8B0000',
                    times: [] // Αρχικοποίηση λίστας ωρών για τη συγκεκριμένη μέρα
                };
                setLastSelectedDate(dateStr);
            }
            return next;
        });
    };

    // Προσθήκη ώρας στη συγκεκριμένη επιλεγμένη ημερομηνία
    const addTimeToDate = () => {
        if (!lastSelectedDate) {
            Alert.alert("Προσοχή", "Επιλέξτε πρώτα μια ημέρα στο ημερολόγιο.");
            return;
        }
        if (newTime.length !== 5) {
            Alert.alert("Σφάλμα", "Συμπληρώστε την ώρα σωστά (π.χ. 21:00)");
            return;
        }

        setMarkedDates(prev => {
            const currentTimes = prev[lastSelectedDate]?.times || [];
            if (currentTimes.includes(newTime)) return prev; // Αποφυγή διπλότυπων ωρών
            
            return {
                ...prev,
                [lastSelectedDate]: {
                    ...prev[lastSelectedDate],
                    times: [...currentTimes, newTime]
                }
            };
        });
        setNewTime('');
    };

    // Μαζική εφαρμογή μιας ώρας σε ΟΛΕΣ τις επιλεγμένες ημέρες
    const applyTimeToAll = () => {
        if (!newTime || newTime.length !== 5) {
            Alert.alert("Σφάλμα", "Εισάγετε μια έγκυρη ώρα (HH:MM).");
            return;
        }
        
        setMarkedDates(prev => {
            const newMarked = { ...prev };
            Object.keys(newMarked).forEach(date => {
                if (date >= today && !newMarked[date].times.includes(newTime)) {
                    newMarked[date].times = [...newMarked[date].times, newTime];
                }
            });
            return newMarked;
        });
        setNewTime('');
        Alert.alert("Επιτυχία", "Η ώρα προστέθηκε σε όλες τις επιλεγμένες μέρες!");
    };

    // Τελική αποθήκευση του προγράμματος στη βάση δεδομένων
    const handleSave = async () => {
        const selectedDays = Object.keys(markedDates).filter(d => markedDates[d].times && markedDates[d].times.length > 0);
        
        if (!selectedShow || !selectedTheatre || selectedDays.length === 0) {
            Alert.alert("Προσοχή", "Επιλέξτε παράσταση, θέατρο και τουλάχιστον μία ώρα σε μία ημέρα.");
            return;
        }

        setLoading(true);
        try {
            // Στέλνουμε το schedule object που περιέχει ημερομηνίες και τις αντίστοιχες ώρες τους
            await apiClient.post('/theatres/bulk-showtimes', {
                show_id: selectedShow.shows_id,
                theatre_id: selectedTheatre.theatres_id,
                schedule: markedDates, 
                available_seats: parseInt(seats)
            });

            Alert.alert("Επιτυχία", "Το πρόγραμμα αποθηκεύτηκε επιτυχώς!");
            setMarkedDates({});
            setLastSelectedDate('');
            setSeats('100');
        } catch (error) {
            Alert.alert("Σφάλμα", "Αποτυχία μαζικής αποθήκευσης.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/*  HEADER / NAVIGATION BAR  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.pageTitle}>Διαχείριση Προγράμματος</Text>

                {/*  1. ΕΠΙΛΟΓΗ ΠΑΡΑΣΤΑΣΗΣ & ΘΕΑΤΡΟΥ  */}
                <Text style={styles.label}>1. Επιλογή Παράστασης & Θεάτρου</Text>
                <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowModal(true)}>
                    <Text style={styles.pickerBtnText}>{selectedShow ? selectedShow.title : "Επιλογή Παράστασης..."}</Text>
                    <Ionicons name="film" size={20} color="#8B0000" />
                </TouchableOpacity>

                {selectedShow && (
                    <TouchableOpacity style={[styles.pickerBtn, {marginTop: 10}]} onPress={() => setTheatreModal(true)}>
                        <Text style={styles.pickerBtnText}>{selectedTheatre ? selectedTheatre.theater_name : "Επιλογή Θεάτρου..."}</Text>
                        <Ionicons name="business" size={20} color="#8B0000" />
                    </TouchableOpacity>
                )}

                {/*  2. ΗΜΕΡΟΛΟΓΙΟ  */}
                <Text style={styles.label}>2. Ημερολόγιο (Πατήστε μέρες)</Text>
                <View style={styles.calendarContainer}>
                    <Calendar
                        minDate={today}
                        theme={{
                            calendarBackground: '#111',
                            textSectionTitleColor: '#8B0000',
                            selectedDayBackgroundColor: '#8B0000',
                            dayTextColor: '#fff',
                            todayTextColor: '#8B0000',
                            monthTextColor: '#fff',
                            arrowColor: '#8B0000',
                            textDisabledColor: '#333',
                        }}
                        onDayPress={onDayPress}
                        markedDates={markedDates}
                    />
                </View>

                {/*  3. ΔΙΑΧΕΙΡΙΣΗ ΩΡΩΝ ΓΙΑ ΤΗΝ ΕΠΙΛΕΓΜΕΝΗ ΗΜΕΡΑ  */}
                {lastSelectedDate ? (
                    <View style={styles.timeSection}>
                        <Text style={styles.selectedDateText}>
                            Ώρες για: <Text style={{color: '#8B0000'}}>{lastSelectedDate}</Text>
                        </Text>
                        
                        <View style={styles.timeInputRow}>
                            <TextInput 
                                style={[styles.input, {flex: 1}]}
                                placeholder="HH:MM"
                                placeholderTextColor="#444"
                                keyboardType="numeric"
                                value={newTime}
                                onChangeText={formatTimeInput}
                                maxLength={5}
                            />
                            <TouchableOpacity style={styles.addTimeBtn} onPress={addTimeToDate}>
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.applyAllBtn} onPress={applyTimeToAll}>
                            <Text style={styles.applyAllText}>Εφαρμογή ώρας σε ΟΛΕΣ τις επιλεγμένες μέρες</Text>
                        </TouchableOpacity>

                        {/* Λίστα με τις ώρες που έχουν προστεθεί (Tags) */}
                        <View style={styles.timesTagContainer}>
                            {(markedDates[lastSelectedDate]?.times || []).map((t, index) => (
                                <View key={index} style={styles.timeTag}>
                                    <Text style={{color: 'white'}}>{t}</Text>
                                    <TouchableOpacity onPress={() => {
                                        const filtered = markedDates[lastSelectedDate].times.filter(time => time !== t);
                                        setMarkedDates({...markedDates, [lastSelectedDate]: {...markedDates[lastSelectedDate], times: filtered}});
                                    }}>
                                        <Ionicons name="close-circle" size={16} color="white" style={{marginLeft: 5}} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <Text style={styles.infoText}>Επιλέξτε μια ημερομηνία για να διαχειριστείτε τις ώρες</Text>
                )}

                {/*  4. ΡΥΘΜΙΣΗ ΘΕΣΕΩΝ  */}
                <Text style={styles.label}>Θέσεις ανά προβολή</Text>
                <TextInput 
                    style={styles.input}
                    keyboardType="numeric"
                    value={seats}
                    onChangeText={setSeats}
                />

                {/* ΚΟΥΜΠΙ ΑΠΟΘΗΚΕΥΣΗΣ  */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>ΟΡΙΣΤΙΚΗ ΑΠΟΘΗΚΕΥΣΗ</Text>}
                </TouchableOpacity>
            </ScrollView>

            {/*  MODALS ΓΙΑ ΕΠΙΛΟΓΗ ΔΕΔΟΜΕΝΩΝ  */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <FlatList data={shows} keyExtractor={(item)=>item.shows_id.toString()} renderItem={({item}) => (
                            <TouchableOpacity style={styles.itemRow} onPress={() => handleSelectShow(item)}>
                                <Text style={styles.itemText}>{item.title}</Text>
                            </TouchableOpacity>
                        )}/>
                        <TouchableOpacity onPress={()=>setShowModal(false)} style={styles.closeBtn}><Text style={{color:'white'}}>Άκυρο</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            <Modal visible={theatreModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <FlatList data={theatres} keyExtractor={(item)=>item.theatres_id.toString()} renderItem={({item}) => (
                            <TouchableOpacity style={styles.itemRow} onPress={() => {setSelectedTheatre(item); setTheatreModal(false);}}>
                                <Text style={styles.itemText}>{item.theater_name}</Text>
                            </TouchableOpacity>
                        )}/>
                        <TouchableOpacity onPress={()=>setTheatreModal(false)} style={styles.closeBtn}><Text style={{color:'white'}}>Άκυρο</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- FOOTER --- */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATERS FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};
//style
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navBar: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    navLogo: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    pageTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 150 },
    label: { color: '#8B0000', fontWeight: 'bold', marginTop: 20, marginBottom: 10, fontSize: 16 },
    input: { backgroundColor: '#111', color: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontSize: 18 },
    calendarContainer: { borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    timeSection: { marginTop: 20, padding: 15, backgroundColor: '#111', borderRadius: 10, borderWidth: 1, borderColor: '#333' },
    selectedDateText: { color: 'white', marginBottom: 10, fontWeight: 'bold' },
    timeInputRow: { flexDirection: 'row', gap: 10 },
    addTimeBtn: { backgroundColor: '#8B0000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 10 },
    applyAllBtn: { marginTop: 12, padding: 5 },
    applyAllText: { color: '#8B0000', fontSize: 13, textDecorationLine: 'underline', fontWeight: '500' },
    timesTagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, gap: 8 },
    timeTag: { backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    infoText: { color: '#666', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
    pickerBtn: { backgroundColor: '#111', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#333' },
    pickerBtnText: { color: 'white', fontSize: 16 },
    saveBtn: { backgroundColor: '#8B0000', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 30 },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1a1a1a', width: '85%', borderRadius: 15, padding: 20, maxHeight: '70%' },
    itemRow: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    itemText: { color: 'white', fontSize: 16 },
    closeBtn: { marginTop: 15, padding: 10, backgroundColor: '#8B0000', borderRadius: 8, alignItems: 'center' },
    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center', position: 'absolute', bottom: 0, width: '100%' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 }
});

export default ManageSchedule;