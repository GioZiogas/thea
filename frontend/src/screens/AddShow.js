import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, 
    ScrollView, Alert, ActivityIndicator, Image, Switch, Modal, FlatList 
} from 'react-native';
import apiClient from '../api/client'; // Ο axios client για τις κλήσεις στο backend
import { Ionicons } from '@expo/vector-icons'; // Εικονίδια για το UI
import { useNavigation, DrawerActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Βιβλιοθήκη για επιλογή φωτογραφιών

const AddShow = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false); // Κατάσταση αναμονής κατά την αποστολή
    const [theatres, setTheatres] = useState([]); // Λίστα με τα διαθέσιμα θέατρα από τη βάση
    
    // Σταθερή λίστα κατηγοριών για το Modal
    const categories = [
        "Τραγωδία", "Κωμωδία", "Δράμα", "Μιούζικαλ", 
        "Όπερα", "Παιδικό Θέατρο", "Θέατρο Σκιών"
    ];

    // States για τα πεδία της φόρμας
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState(''); 
    const [category, setCategory] = useState(''); 
    const [isKidFriendly, setIsKidFriendly] = useState(false);
    const [selectedTheatres, setSelectedTheatres] = useState([]); // Array με IDs επιλεγμένων θεάτρων
    const [image, setImage] = useState(null); // Δεδομένα της επιλεγμένης εικόνας
    const [showCatModal, setShowCatModal] = useState(false); // Έλεγχος εμφάνισης του Modal κατηγοριών

    // Φόρτωση των θεάτρων κατά την εκκίνηση της οθόνης
    useEffect(() => {
        fetchTheatres();
    }, []);

    // Συνάρτηση ανάκτησης θεάτρων από το API
    const fetchTheatres = async () => {
        try {
            const response = await apiClient.get('/theatres');
            setTheatres(response.data);
        } catch (error) {
            Alert.alert("Σφάλμα", "Αποτυχία φόρτωσης θεάτρων");
        }
    };

    // Άνοιγμα της βιβλιοθήκης φωτογραφιών του κινητού
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // Διαχείριση πολλαπλής επιλογής θεάτρων (toggle logic)
    const toggleTheatre = (id) => {
        if (selectedTheatres.includes(id)) {
            setSelectedTheatres(selectedTheatres.filter(item => item !== id));
        } else {
            setSelectedTheatres([...selectedTheatres, id]);
        }
    };

    // Κύρια συνάρτηση υποβολής της φόρμας
    const handleSave = async () => {
        // 1. Καθαρισμός και επικύρωση τιμής (αντικατάσταση κόμματος με τελεία)
        let sanitizedPrice = price.toString().replace(',', '.').trim();
        
        if (!title || !category || !sanitizedPrice || selectedTheatres.length === 0) {
            Alert.alert("Προσοχή", "Συμπληρώστε τίτλο, κατηγορία, τιμή και τουλάχιστον ένα θέατρο.");
            return;
        }

        const numericPrice = parseFloat(sanitizedPrice);
        if (isNaN(numericPrice)) {
            Alert.alert("Σφάλμα", "Η τιμή πρέπει να είναι αριθμός (π.χ. 12.50)");
            return;
        }

        setLoading(true);

        try {
            // Χρήση FormData γιατί στέλνουμε και αρχείο (εικόνα)
            const formData = new FormData();
            
            // Προσθήκη απλών πεδίων κειμένου
            formData.append('title', title.trim());
            formData.append('description', description.trim() || "");
            formData.append('duration', duration ? duration.toString() : "0");
            formData.append('category', category);
            
            // Μορφοποίηση τιμής σε 2 δεκαδικά
            formData.append('base_price', numericPrice.toFixed(2)); 
            
            formData.append('is_kid_friendly', isKidFriendly ? "1" : "0");
            // Μετατροπή του array των θεάτρων σε string για να το δεχτεί το FormData
            formData.append('theatre_ids', JSON.stringify(selectedTheatres));

            // Προσθήκη της εικόνας αν υπάρχει
            if (image) {
                const uriParts = image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1] || 'jpg';
                formData.append('image', {
                    uri: image.uri,
                    name: `show_${Date.now()}.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            // Αποστολή POST αιτήματος με multipart/form-data headers
            const response = await apiClient.post('/shows', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                },
            });

            if (response.data.success) {
                Alert.alert("Επιτυχία", `Η παράσταση προστέθηκε με τιμή ${numericPrice.toFixed(2)}€`);
                
                // Επαναφορά όλων των πεδίων στην αρχική τους κατάσταση
                setTitle('');
                setDescription('');
                setDuration('');
                setPrice('');
                setCategory('');
                setIsKidFriendly(false);
                setSelectedTheatres([]);
                setImage(null);
                
                navigation.navigate('Home');
            }

        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            console.error("Server Error Detail:", error.response?.data);
            Alert.alert("Αποτυχία", `Σφάλμα: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header / Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.pageTitle}>Νέα Παράσταση</Text>

                <View style={styles.formCard}>
                    {/* Είσοδος Τίτλου και Περιγραφής */}
                    <TextInput 
                        style={styles.input} placeholder="Τίτλος Παράστασης" placeholderTextColor="#666"
                        value={title} onChangeText={setTitle} 
                    />
                    
                    <TextInput 
                        style={[styles.input, { height: 80 }]} placeholder="Περιγραφή" placeholderTextColor="#666"
                        multiline value={description} onChangeText={setDescription} 
                    />
                    
                    {/* Τιμή και Διάρκεια σε οριζόντια διάταξη */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextInput 
                            style={[styles.input, { width: '48%' }]} 
                            placeholder="Τιμή (€)" 
                            placeholderTextColor="#666" 
                            keyboardType="decimal-pad"
                            value={price} 
                            onChangeText={setPrice} 
                        />
                        <TextInput 
                            style={[styles.input, { width: '48%' }]} placeholder="Διάρκεια (λ)" 
                            placeholderTextColor="#666" keyboardType="numeric"
                            value={duration} onChangeText={setDuration} 
                        />
                    </View>

                    {/* Επιλογή Κατηγορίας (ανοίγει Modal) */}
                    <TouchableOpacity 
                        style={[styles.input, { justifyContent: 'center' }]} 
                        onPress={() => setShowCatModal(true)}
                    >
                        <Text style={{ color: category ? 'white' : '#666' }}>
                            {category || "Επιλογή Κατηγορίας"}
                        </Text>
                    </TouchableOpacity>

                    {/* Διακόπτης για καταλληλότητα παιδιών */}
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Κατάλληλο για παιδιά;</Text>
                        <Switch 
                            value={isKidFriendly} 
                            onValueChange={setIsKidFriendly}
                            trackColor={{ false: "#333", true: "#8B0000" }}
                            thumbColor={isKidFriendly ? "#fff" : "#f4f3f4"}
                        />
                    </View>

                    {/* Επιλογή Εικόνας */}
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="camera" size={30} color="#aaa" />
                                <Text style={{ color: '#aaa' }}>Επιλογή Φωτογραφίας</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Λίστα Θεάτρων με Checkboxes */}
                    <Text style={styles.sectionTitle}>Επιλογή Θεάτρων:</Text>
                    {theatres.map(theatre => (
                        <TouchableOpacity 
                            key={theatre.theatres_id} 
                            style={styles.checkItem}
                            onPress={() => toggleTheatre(theatre.theatres_id)}
                        >
                            <Ionicons 
                                name={selectedTheatres.includes(theatre.theatres_id) ? "checkbox" : "square-outline"} 
                                size={24} color={selectedTheatres.includes(theatre.theatres_id) ? "#8B0000" : "#aaa"} 
                            />
                            <Text style={styles.checkText}>{theatre.theater_name} ({theatre.city})</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Κουμπί Αποθήκευσης */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Δημιουργία Παράστασης</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal για την επιλογή Κατηγορίας */}
            <Modal visible={showCatModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Επιλογή Κατηγορίας</Text>
                        <FlatList 
                            data={categories}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.catOption} 
                                    onPress={() => { setCategory(item); setShowCatModal(false); }}
                                >
                                    <Text style={styles.catText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCatModal(false)}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Κλείσιμο</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Footer Εφαρμογής */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATRES FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};

// Stylesheet για τη διαμόρφωση της εμφάνισης
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navBar: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    navLogo: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 100 },
    pageTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
    formCard: { backgroundColor: '#111', margin: 15, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#222' },
    input: { backgroundColor: '#222', color: 'white', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    label: { color: 'white', fontSize: 16 },
    imagePicker: { height: 180, backgroundColor: '#222', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    sectionTitle: { color: '#8B0000', fontWeight: 'bold', marginBottom: 15, fontSize: 16 },
    checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    checkText: { color: 'white', marginLeft: 10, fontSize: 15 },
    saveButton: { backgroundColor: '#8B0000', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center', position: 'absolute', bottom: 0, width: '100%' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#111', width: '85%', maxHeight: '70%', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#8B0000' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    catOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
    catText: { color: 'white', fontSize: 16, textAlign: 'center' },
    closeBtn: { marginTop: 20, backgroundColor: '#333', padding: 12, borderRadius: 10, alignItems: 'center' }
});

export default AddShow;