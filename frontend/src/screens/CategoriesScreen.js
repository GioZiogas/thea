import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

// Δεδομένα των κατηγοριών: Κάθε αντικείμενο περιέχει ID, τίτλο και το όνομα του εικονιδίου Ionicons
const categories = [
    { id: '1', title: 'Τραγωδία', icon: 'sad-outline' },
    { id: '2', title: 'Κωμωδία', icon: 'happy-outline' },
    { id: '3', title: 'Δράμα', icon: 'thunderstorm-outline' },
    { id: '4', title: 'Μιούζικαλ', icon: 'musical-notes-outline' },
    { id: '5', title: 'Όπερα', icon: 'mic-outline' },
    { id: '6', title: 'Παιδικό Θέατρο', icon: 'balloon-outline' },
    { id: '7', title: 'Θέατρο Σκιών', icon: 'moon-outline' },
];

const CategoriesScreen = () => {
    const navigation = useNavigation();

    // Συνάρτηση για τη δημιουργία της εμφάνισης κάθε κατηγορίας στη λίστα
    const renderCategoryBar = ({ item }) => (
        <TouchableOpacity 
            style={styles.categoryBar}
            // Πλοήγηση στην οθόνη CategoryShows στέλνοντας ως παράμετρο το όνομα της κατηγορίας
            onPress={() => navigation.navigate('CategoryShows', { categoryName: item.title })}
        >
            <View style={styles.content}>
                {/* Εικονίδιο κατηγορίας */}
                <Ionicons name={item.icon} size={24} color="#8B0000" />
                {/* Τίτλος κατηγορίας */}
                <Text style={styles.categoryText}>{item.title}</Text>
            </View>
            {/* Βέλος ένδειξης στα δεξιά */}
            <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* HEADER / NAVBAR: Περιλαμβάνει το Logo και το κουμπί για το Drawer Menu */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            {/* ΚΥΡΙΩΣ ΠΕΡΙΕΧΟΜΕΝΟ: Λίστα κατηγοριών */}
            <View style={styles.mainContent}>
                <Text style={styles.pageTitle}>Επιλέξτε Κατηγορία</Text>
                
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCategoryBar}
                    contentContainerStyle={styles.listContainer}
                />
            </View>

            {/* FOOTER: Σταθερό τμήμα στο κάτω μέρος της οθόνης με πληροφορίες franchise */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATERS FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};

// ΣΤΥΛ ΕΦΑΡΜΟΓΗΣ
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    
    // Στυλ για τη μπάρα πλοήγησης στο επάνω μέρος
    navBar: { 
        height: 100, 
        backgroundColor: '#8B0000', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingTop: 40 
    },
    navLogo: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    
    // Στυλ για το κεντρικό περιεχόμενο
    mainContent: { flex: 1, paddingHorizontal: 15 },
    pageTitle: { 
        color: 'white', 
        fontSize: 22, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginVertical: 20 
    },
    
    // Απόσταση στο τέλος της λίστας για να μην καλύπτεται από το footer
    listContainer: { paddingBottom: 100 },

    // Στυλ για κάθε γραμμή (bar) κατηγορίας
    categoryBar: {
        backgroundColor: '#1a1a1a',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 10,
        marginBottom: 12,
        borderLeftWidth: 5,
        borderLeftColor: '#8B0000', // Διακοσμητική κόκκινη γραμμή στα αριστερά
    },
    content: { flexDirection: 'row', alignItems: 'center' },
    categoryText: { color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 15 },
    
    // Στυλ για το Footer
    footer: { 
        backgroundColor: '#8B0000', 
        padding: 15, 
        alignItems: 'center', 
        position: 'absolute', 
        bottom: 0, 
        width: '100%' 
    },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    footerText: { color: 'white', fontSize: 10, opacity: 0.8 },
});

export default CategoriesScreen;