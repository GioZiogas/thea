import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    RefreshControl,
} from 'react-native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const ReportsScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);

    //  STATES ΓΙΑ ΦΟΡΤΩΣΗ ΚΑΙ ΔΕΔΟΜΕΝΑ 
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // showtimes: κρατάμε μόνο τα 10 στοιχεία που προβάλλονται στην τρέχουσα σελίδα
    const [showtimes, setShowtimes] = useState([]);
    // hasMore: boolean για το αν υπάρχει επόμενη σελίδα με δεδομένα
    const [hasMore, setHasMore] = useState(false);

    //  PAGINATION STATE 
    const [page, setPage] = useState(1);
    const limit = 10; // Σταθερό όριο στοιχείων ανά σελίδα

    //  EDIT MODAL STATE 
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editSeats, setEditSeats] = useState('');

    // Εκτέλεση λήψης δεδομένων κάθε φορά που αλλάζει η σελίδα
    useEffect(() => {
        fetchShowtimes();
    }, [page]);

    //  ΣΥΝΑΡΤΗΣΗ ΛΗΨΗΣ ΠΡΟΒΟΛΩΝ 
    const fetchShowtimes = async () => {
        try {
            setLoading(true);
            // Κλήση στο API για λήψη όλων των προβολών
            const response = await apiClient.get(`/theatres/showtimes/all`);
            
            let allData = Array.isArray(response.data) ? response.data : [];
            
            // Προαιρετική ταξινόμηση βάσει ID (φθίνουσα σειρά)
            allData.sort((a, b) => b.showtimes_id - a.showtimes_id);

            //  FRONTEND PAGINATION LOGIC 
            // Υπολογισμός δεικτών για την τρέχουσα σελίδα
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            // Τεμαχισμός (slicing) της λίστας για την εμφάνιση μόνο των 10 στοιχείων
            const paginatedItems = allData.slice(startIndex, endIndex);
            
            setShowtimes(paginatedItems);
            
            // Έλεγχος αν υπάρχουν κι άλλα στοιχεία μετά το endIndex για το κουμπί Next
            setHasMore(allData.length > endIndex);
            
        } catch (error) {
            console.error('Fetch Error:', error);
            Alert.alert('Σφάλμα', 'Αποτυχία φόρτωσης προγράμματος.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Χειρισμός ανανέωσης (Pull-to-refresh)
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (page === 1) {
            fetchShowtimes();
        } else {
            setPage(1); // Η αλλαγή σε 1 θα πυροδοτήσει το useEffect
        }
    }, [page]);

    // Βοηθητική συνάρτηση για διαχωρισμό Date και Time για τα Inputs
    const parseDateTimeForEdit = (dateTimeString) => {
        if (!dateTimeString) return { date: '', time: '' };
        const dateObj = new Date(dateTimeString);
        if (isNaN(dateObj.getTime())) return { date: '', time: '' };
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
    };

    // Άνοιγμα του Modal και προ-συμπλήρωση των στοιχείων
    const openEditModal = (item) => {
        setSelectedItem(item);
        const { date, time } = parseDateTimeForEdit(item.date_time);
        setEditDate(date);
        setEditTime(time);
        setEditSeats(String(item.available_seats || '0'));
        setEditModalVisible(true);
    };

    //  ΕΝΗΜΕΡΩΣΗ ΠΡΟΒΟΛΗΣ (PUT) 
    const handleUpdate = async () => {
        if (!selectedItem?.showtimes_id) return;
        try {
            const payload = {
                date_time: `${editDate} ${editTime}:00`,
                available_seats: parseInt(editSeats, 10) || 0,
                theatre_id: selectedItem?.theatre_id,
            };
            await apiClient.put(`/theatres/showtimes/${selectedItem.showtimes_id}`, payload);
            Alert.alert('Επιτυχία', 'Η προβολή ενημερώθηκε.');
            setEditModalVisible(false);
            fetchShowtimes();
        } catch (error) {
            Alert.alert('Αποτυχία', 'Η ενημέρωση απέτυχε.');
        }
    };

    //  ΔΙΑΓΡΑΦΗ ΠΡΟΒΟΛΗΣ (DELETE) 
    const handleDelete = (id) => {
        Alert.alert('Διαγραφή', 'Θέλετε σίγουρα να διαγράψετε αυτή την προβολή;', [
            { text: 'Ακύρωση', style: 'cancel' },
            {
                text: 'Διαγραφή',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiClient.delete(`/theatres/showtimes/${id}`);
                        fetchShowtimes();
                    } catch (error) {
                        Alert.alert('Σφάλμα', 'Η διαγραφή απέτυχε.');
                    }
                },
            },
        ]);
    };

    // Render συνάρτηση για κάθε στοιχείο της λίστας
    const renderShowtimeItem = ({ item }) => {
        const dateObj = new Date(item.date_time);
        const displayDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('el-GR') : '---';
        const displayTime = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }) : '---';

        return (
            <View style={styles.card}>
                <View style={styles.cardInfo}>
                    <Text style={styles.showTitle}>{item.title || 'Χωρίς Τίτλο'}</Text>
                    <Text style={styles.theatreName}>{item.theater_name || 'Άγνωστο Θέατρο'}</Text>
                    <View style={styles.dateTimeRow}>
                        <Text style={styles.details}><Ionicons name="calendar" color="#8B0000" /> {displayDate}</Text>
                        <Text style={[styles.details, { marginLeft: 15 }]}><Ionicons name="time" color="#8B0000" /> {displayTime}</Text>
                    </View>
                    <Text style={styles.details}>Θέσεις: {item.available_seats ?? 0}</Text>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                        <Ionicons name="create" size={24} color="#DAA520" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.showtimes_id)} style={styles.actionBtn}>
                        <Ionicons name="trash" size={24} color="#FF0000" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/*  HEADER / NAVBAR  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.pageTitle}>Διαχείριση Προγράμματος</Text>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#8B0000" />
                ) : (
                    <FlatList
                        data={showtimes}
                        keyExtractor={(item) => item.showtimes_id.toString()}
                        renderItem={renderShowtimeItem}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B0000" />
                        }
                        ListEmptyComponent={<Text style={styles.emptyText}>Δεν βρέθηκαν προβολές στη σελίδα {page}.</Text>}
                    />
                )}
            </View>

            {/*  PAGINATION BAR (Επιλογή Σελίδων)  */}
            <View style={styles.paginationBar}>
                <TouchableOpacity
                    disabled={page === 1}
                    onPress={() => setPage(page - 1)}
                    style={{ opacity: page === 1 ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-back-circle" size={50} color="#8B0000" />
                </TouchableOpacity>

                <View style={styles.pageIndicator}>
                    <Text style={styles.pageNumberText}>Σελίδα {page}</Text>
                    <Text style={styles.itemCountText}>Στοιχεία σελίδας: {showtimes.length}</Text>
                </View>

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
                <Text style={styles.footerText}>© 2026 - Διαχείριση Admin</Text>
            </View>

            {/* --- EDIT MODAL (Φόρμα Επεξεργασίας) --- */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Επεξεργασία Προβολής</Text>
                        <Text style={styles.label}>Ημερομηνία (YYYY-MM-DD)</Text>
                        <TextInput style={styles.input} value={editDate} onChangeText={setEditDate} placeholder="YYYY-MM-DD" placeholderTextColor="#555" />
                        <Text style={styles.label}>Ώρα (HH:MM)</Text>
                        <TextInput style={styles.input} value={editTime} onChangeText={setEditTime} placeholder="HH:MM" placeholderTextColor="#555" />
                        <Text style={styles.label}>Θέσεις</Text>
                        <TextInput style={styles.input} value={editSeats} onChangeText={setEditSeats} keyboardType="numeric" />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                                <Text style={{ color: 'white' }}>Άκυρο</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdate}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Ενημέρωση</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

//  STYLES 
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navBar: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    content: { flex: 1, padding: 15 },
    pageTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    listContent: { paddingBottom: 20 },
    card: { backgroundColor: '#111', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', borderLeftWidth: 5, borderLeftColor: '#8B0000' },
    cardInfo: { flex: 1 },
    showTitle: { color: 'white', fontSize: 17, fontWeight: 'bold', marginBottom: 5 },
    theatreName: { color: '#aaa', fontSize: 14, marginBottom: 5 },
    dateTimeRow: { flexDirection: 'row', marginBottom: 5 },
    details: { color: '#888', fontSize: 13 },
    cardActions: { justifyContent: 'space-around', alignItems: 'center', paddingLeft: 10 },
    actionBtn: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginBottom: 5 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
    paginationBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222' },
    pageIndicator: { alignItems: 'center' },
    pageNumberText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    itemCountText: { color: '#8B0000', fontSize: 10, fontWeight: 'bold' },
    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center', justifyContent: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1a1a1a', width: '85%', borderRadius: 15, padding: 25 },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { color: '#8B0000', fontSize: 12, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    input: { backgroundColor: '#000', color: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
    cancelBtn: { padding: 12, width: '45%', alignItems: 'center', backgroundColor: '#333', borderRadius: 8 },
    confirmBtn: { padding: 12, width: '45%', alignItems: 'center', backgroundColor: '#8B0000', borderRadius: 8 },
});

export default ReportsScreen;