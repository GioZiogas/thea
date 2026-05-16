import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, StyleSheet,
    Image, TouchableOpacity, Dimensions, Alert
} from 'react-native';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://192.168.3.125:5000';

const ShowsFromCarousel = ({ route }) => {
    // Λήψη παραμέτρων από το route: ο τύπος φίλτρου και η ετικέτα που θα εμφανιστεί στον τίτλο
    const { filterType, categoryLabel } = route.params;
    const navigation = useNavigation();

    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    
    //  PAGINATION STATES 
    // Διαχείριση της σελίδας και του ορίου αποτελεσμάτων ανά σελίδα
    const [page, setPage] = useState(1);
    const limit = 10;

    // Επανεκτέλεση του fetch όταν αλλάζει ο τύπος φίλτρου ή η σελίδα
    useEffect(() => {
        fetchFilteredShows();
    }, [filterType, page]);

    //  ΣΥΝΑΡΤΗΣΗ FETCH ΜΕ ΦΙΛΤΡΑ 
    const fetchFilteredShows = async () => {
        setLoading(true);
        try {
            // Δημιουργία βασικού endpoint με pagination query params
            let endpoint = `/shows?page=${page}&limit=${limit}`;

            // Προσθήκη επιπλέον παραμέτρων στο URL βάσει του filterType
            if (filterType === 'kids') {
                endpoint += '&is_kid_friendly=1';
            } else if (filterType === 'new') {
                endpoint += '&sort=newest';
            } else if (filterType === 'comedy') {
                endpoint += '&category=Κωμωδία';
            } else if (filterType === 'tragedy') {
                endpoint += '&category=Τραγωδία';
            }

            const response = await apiClient.get(endpoint);
            const data = response.data || [];
            setShows(data);
            
        } catch (error) {
            console.error('Error fetching shows:', error);
            Alert.alert("Σφάλμα", "Αποτυχία φόρτωσης παραστάσεων.");
            setShows([]);
        } finally {
            setLoading(false);
        }
    };

    //  RENDER ITEM ΓΙΑ ΤΗ ΛΙΣΤΑ 
    const renderShowItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ShowDetails', { showItem: item })}
        >
            {/* Διαχείριση εικόνας: έλεγχος αν το path είναι πλήρες URL ή relative path από το upload */}
            <Image
                source={{
                    uri: item.image_path?.startsWith('http')
                        ? item.image_path
                        : `${BASE_URL}/uploads/${item.image_path}`,
                }}
                style={styles.image}
            />
            <View style={styles.info}>
                <View>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.base_price}€</Text>
                    <View style={styles.ticketButtonSmall}>
                        <Text style={styles.ticketButtonTextSmall}>Κράτηση</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/*  CUSTOM NAV BAR  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                {/* Τίτλος Σελίδας βάσει της κατηγορίας που επιλέχθηκε */}
                <View style={styles.titleContainer}>
                    <Text style={styles.pageTitle}>{categoryLabel}</Text>
                </View>

                {loading ? (
                    <View style={styles.centerer}>
                        <ActivityIndicator size="large" color="#8B0000" />
                    </View>
                ) : (
                    <FlatList
                        data={shows}
                        keyExtractor={(item) => item.shows_id.toString()}
                        renderItem={renderShowItem}
                        contentContainerStyle={styles.listPadding}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                Δεν βρέθηκαν παραστάσεις.
                            </Text>
                        }
                    />
                )}
            </View>

            {/*  PAGINATION BAR  */}
            {/* Μπάρα πλοήγησης μεταξύ σελίδων */}
            <View style={styles.paginationBar}>
                {/* Κουμπί Πίσω */}
                <TouchableOpacity 
                    disabled={page === 1} 
                    onPress={() => setPage(page - 1)}
                    style={{ opacity: page === 1 ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-back-circle" size={50} color="#8B0000" />
                </TouchableOpacity>

                <Text style={styles.pageNumberText}>Σελίδα {page}</Text>

                {/* Κουμπί Επόμενο - Απενεργοποιείται αν τα αποτελέσματα είναι λιγότερα από το limit */}
                <TouchableOpacity 
                    disabled={shows.length < limit} 
                    onPress={() => setPage(page + 1)}
                    style={{ opacity: shows.length < limit ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-forward-circle" size={50} color="#8B0000" />
                </TouchableOpacity>
            </View>

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
    container: { flex: 1, backgroundColor: '#000' },
    navBar: {
        height: 100,
        backgroundColor: '#8B0000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    titleContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    pageTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
    listPadding: { paddingHorizontal: 20, paddingBottom: 20 },
    centerer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'gray', textAlign: 'center', marginTop: 50 },
    card: {
        backgroundColor: '#111',
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#222',
    },
    image: { width: 110, height: 150 },
    info: { flex: 1, padding: 15, justifyContent: 'space-between' },
    title: { color: 'white', fontSize: 17, fontWeight: 'bold' },
    categoryText: { color: '#8B0000', fontSize: 13, marginTop: 4, fontWeight: '600' },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    ticketButtonSmall: {
        backgroundColor: '#8B0000',
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    ticketButtonTextSmall: { color: 'white', fontWeight: 'bold', fontSize: 14 },
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
    footer: {
        backgroundColor: '#8B0000',
        padding: 15,
        alignItems: 'center',
    },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 13, marginBottom: 3 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 },
});

export default ShowsFromCarousel;