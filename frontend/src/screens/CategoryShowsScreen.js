import React, { useEffect, useState, useContext } from 'react'; 
import { 
    View, Text, FlatList, ActivityIndicator, StyleSheet, 
    Image, TouchableOpacity, Modal, TextInput, ScrollView, Alert, Platform 
} from 'react-native';
import apiClient from '../api/client'; // Προσαρμοσμένο client για τα calls στο API
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Για την επιλογή φωτογραφίας από τη συσκευή
import { AuthContext } from '../context/AuthContext'; 

// Βασικό URL του διακομιστή για τη φόρτωση των εικόνων
const BASE_URL = 'http://192.168.3.125:5000'; 

const CategoryShowsScreen = ({ route }) => {
    const navigation = useNavigation();
    const { categoryName } = route.params; // Λήψη της κατηγορίας από τα navigation params
    
    const { user } = useContext(AuthContext);
    const userRole = user?.role?.toLowerCase() || null; // Έλεγχος ρόλου (admin/employee/user)

    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    //  PAGINATION STATES 
    const [page, setPage] = useState(1);
    const limit = 10; // Αριθμός παραστάσεων ανά σελίδα

    //  EDIT MODAL STATES 
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingShow, setEditingShow] = useState(null);
    const [theatres, setTheatres] = useState([]); 
    const [selectedTheatres, setSelectedTheatres] = useState([]);
    const [newImage, setNewImage] = useState(null);

    // Φόρτωση δεδομένων όταν αλλάζει η κατηγορία ή η σελίδα (Pagination)
    useEffect(() => {
        loadData();
    }, [categoryName, page]);

    const loadData = async () => {
        setLoading(true);
        await fetchFilteredShows();
        await fetchAllTheatres();
        setLoading(false);
    };

    // Ανάκτηση παραστάσεων βάσει κατηγορίας και σελίδας
    const fetchFilteredShows = async () => {
        try {
            const response = await apiClient.get(`/shows?category=${categoryName}&page=${page}&limit=${limit}`);
            setShows(response.data || []);
        } catch (error) {
            console.error("Fetch Shows Error:", error);
            setShows([]);
        }
    };

    // Ανάκτηση όλων των θεάτρων για το modal επεξεργασίας
    const fetchAllTheatres = async () => {
        try {
            const response = await apiClient.get('/theatres');
            setTheatres(response.data);
        } catch (error) {
            console.error("Fetch Theatres Error:", error);
        }
    };

    // Λειτουργία Long Press για άνοιγμα του modal επεξεργασίας (μόνο για προσωπικό)
    const handleLongPress = async (show) => {
        if (userRole !== 'admin' && userRole !== 'employee') return; 

        setEditingShow({ ...show });
        setNewImage(null);
        
        try {
            // Ανάκτηση των θεάτρων στα οποία παίζεται ήδη η συγκεκριμένη παράσταση
            const res = await apiClient.get(`/theatres/by-show/${show.shows_id}`);
            const currentTheatreIds = res.data.map(t => t.theatres_id);
            setSelectedTheatres(currentTheatreIds);
        } catch (e) {
            setSelectedTheatres([]);
        }
        
        setEditModalVisible(true);
    };

    // Επιλογή εικόνας από τη βιβλιοθήκη του κινητού
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.7, 
        });

        if (!result.canceled) {
            setNewImage(result.assets[0].uri);
        }
    };

    // Διαχείριση επιλογής/αποεπιλογής θεάτρων στο modal
    const toggleTheatre = (id) => {
        if (selectedTheatres.includes(id)) {
            setSelectedTheatres(selectedTheatres.filter(tId => tId !== id));
        } else {
            setSelectedTheatres([...selectedTheatres, id]);
        }
    };

    // Αποστολή των αλλαγών στον server (Update)
    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('title', editingShow.title);
            formData.append('description', editingShow.description);
            formData.append('duration', String(editingShow.duration));
            formData.append('base_price', String(editingShow.base_price));
            formData.append('category', editingShow.category || categoryName); 
            formData.append('is_kid_friendly', editingShow.is_kid_friendly ? 'true' : 'false');
            formData.append('theatreIds', JSON.stringify(selectedTheatres));

            // Αν ο χρήστης επέλεξε νέα εικόνα, την προσθέτουμε στο FormData
            if (newImage) {
                const filename = newImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                
                formData.append('image', { 
                    uri: Platform.OS === 'android' ? newImage : newImage.replace('file://', ''), 
                    name: filename, 
                    type 
                });
            }

            await apiClient.put(`/shows/${editingShow.shows_id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert("Επιτυχία", "Η παράσταση ενημερώθηκε!");
            setEditModalVisible(false);
            fetchFilteredShows(); // Ανανέωση της λίστας
        } catch (error) {
            console.error("Update Error:", error.response?.data || error.message);
            Alert.alert("Σφάλμα", "Αποτυχία ενημέρωσης.");
        }
    };

    // Βοηθητική συνάρτηση για τη σωστή διαμόρφωση του URL της εικόνας
    const getFullImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/150';
        if (path.startsWith('http') || path.startsWith('file')) return path;
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.includes('uploads/')) return `${BASE_URL}/${cleanPath}`;
        return `${BASE_URL}/uploads/${cleanPath}`;
    };

    const isStaff = userRole === 'admin' || userRole === 'employee';

    return (
        <View style={styles.container}>
            {/* --- HEADER / NAVBAR --- */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>{categoryName}</Text>
                
                {loading ? (
                    <View style={styles.centerer}>
                        <ActivityIndicator size="large" color="#8B0000" />
                    </View>
                ) : (
                    <FlatList
                        data={shows}
                        keyExtractor={(item) => item.shows_id.toString()}
                        contentContainerStyle={styles.listPadding}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.showCard} 
                                onLongPress={() => handleLongPress(item)}
                                onPress={() => navigation.navigate('ShowDetails', { showItem: item })} 
                                delayLongPress={600}
                                activeOpacity={0.7}
                            >
                                <Image 
                                    source={{ uri: getFullImageUrl(item.image_path) }} 
                                    style={styles.showImage} 
                                />
                                <View style={styles.infoContainer}>
                                    <View>
                                        <Text style={styles.showTitle}>{item.title}</Text>
                                        <Text style={styles.showDesc} numberOfLines={2}>{item.description}</Text>
                                        
                                        <View style={styles.metaRow}>
                                            <Text style={styles.duration}>
                                                <Ionicons name="time-outline" size={12} /> {item.duration} λεπτά
                                            </Text>
                                            <Text style={styles.priceTag}>
                                                <Ionicons name="ticket-outline" size={12} /> {item.base_price}€
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.datesBtn}>
                                        <Text style={styles.datesBtnText}>Προβολή Λεπτομερειών</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>Δεν βρέθηκαν παραστάσεις.</Text>}
                    />
                )}
            </View>

            {/*  PAGINATION BAR  */}
            <View style={styles.paginationBar}>
                <TouchableOpacity 
                    disabled={page === 1} 
                    onPress={() => setPage(page - 1)}
                    style={{ opacity: page === 1 ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-back-circle" size={50} color="#8B0000" />
                </TouchableOpacity>

                <Text style={styles.pageNumberText}>Σελίδα {page}</Text>

                <TouchableOpacity 
                    disabled={shows.length < limit} 
                    onPress={() => setPage(page + 1)}
                    style={{ opacity: shows.length < limit ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-forward-circle" size={50} color="#8B0000" />
                </TouchableOpacity>
            </View>

            {/*  EDIT MODAL: Εμφανίζεται μόνο μετά από Long Press από Admin/Employee  */}
            <Modal visible={editModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Επεξεργασία</Text>
                        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ padding: 20 }}>
                        <Text style={styles.label}>Φωτογραφία</Text>
                        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                            <Image source={{ uri: newImage || getFullImageUrl(editingShow?.image_path) }} style={styles.modalPreviewImage} />
                        </TouchableOpacity>
                        
                        <Text style={styles.label}>Τίτλος</Text>
                        <TextInput style={styles.input} value={editingShow?.title} onChangeText={(t) => setEditingShow({...editingShow, title: t})} />
                        
                        <Text style={styles.label}>Περιγραφή</Text>
                        <TextInput style={[styles.input, { height: 80 }]} multiline value={editingShow?.description} onChangeText={(t) => setEditingShow({...editingShow, description: t})} />
                        
                        <Text style={styles.label}>Τιμή (€)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={editingShow?.base_price?.toString()} onChangeText={(t) => setEditingShow({...editingShow, base_price: t})} />
                        
                        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                            <Text style={styles.saveBtnText}>ΑΠΟΘΗΚΕΥΣΗ</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/*  FOOTER  */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATRES FRANCHISE</Text>
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
    pageTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
    listPadding: { paddingHorizontal: 15, paddingBottom: 100 },
    centerer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'gray', textAlign: 'center', marginTop: 50 },
    showCard: { backgroundColor: '#111', borderRadius: 12, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
    showImage: { width: 110, height: 160 },
    infoContainer: { flex: 1, padding: 12, justifyContent: 'space-between' },
    showTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    showDesc: { color: '#aaa', fontSize: 12, marginTop: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    duration: { color: '#8B0000', fontSize: 12, fontWeight: 'bold' },
    priceTag: { color: '#fff', fontSize: 12, marginLeft: 15, fontWeight: 'bold', backgroundColor: '#8B0000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    datesBtn: { backgroundColor: '#333', paddingVertical: 8, borderRadius: 6, marginTop: 10, alignItems: 'center' },
    datesBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    
    paginationBar: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        paddingVertical: 10, 
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#222'
    },
    pageNumberText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    modalContainer: { flex: 1, backgroundColor: '#000' },
    modalHeader: { backgroundColor: '#8B0000', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    imagePickerBtn: { alignSelf: 'center', width: 120, height: 160, borderRadius: 10, overflow: 'hidden', marginVertical: 10, backgroundColor: '#222' },
    modalPreviewImage: { width: '100%', height: '100%' },
    label: { color: '#8B0000', fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    input: { backgroundColor: '#111', color: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
    saveBtn: { backgroundColor: '#8B0000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
    saveBtnText: { color: 'white', fontWeight: 'bold' },
    
    footer: { backgroundColor: '#8B0000', padding: 12, alignItems: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 },
});

export default CategoryShowsScreen;