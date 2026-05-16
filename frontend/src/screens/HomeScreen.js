import React, { useContext, useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, 
    FlatList, ImageBackground, Dimensions, ScrollView 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // Βεβαιώσου ότι έχεις το expo-vector-icons
import { useNavigation, DrawerActions } from '@react-navigation/native';


// Εισαγωγή τοπικών εικόνων για το Carousel
import UnderImg from '../image/free.jpg';
import ShowsImg from '../image/new.jpg';
import KidsImg from '../image/comedy.jpg';
import TragedyImg from '../image/sad.jpg';
import love from '../image/love.jpg';

// Λήψη του πλάτους της οθόνης για σωστό υπολογισμό του Carousel
const { width } = Dimensions.get('window');

const HomeScreen = () => {
    // Χρήση του AuthContext για πρόσβαση στα στοιχεία του χρήστη 
    const { user, logout } = useContext(AuthContext);
    const navigation = useNavigation();

    // Δεδομένα που τροφοδοτούν το Carousel (ID, τίτλος, εικόνα και παράμετροι φιλτραρίσματος)
    const carouselItems = [
        {
            id: '1',
            title: 'Παραστάσεις και για παιδιά',
            image: UnderImg,
            filterType: 'kids',
            categoryLabel: 'Παιδικές Παραστάσεις'
        },
        {
            id: '2',
            title: 'Νέες παραστάσεις',
            image: ShowsImg,
            filterType: 'new',
            categoryLabel: 'Νέες Παραστάσεις'
        },
        {
            id: '3',
            title: 'Κωμωδίες',
            image: KidsImg,
            filterType: 'comedy',
            categoryLabel: 'Κωμωδίες'
        },
        {
            id: '4',
            title: 'Αρχαίες τραγωδίες',
            image: TragedyImg,
            filterType: 'tragedy',
            categoryLabel: 'Αρχαίες Τραγωδίες'
        },
    ];

    // Συνάρτηση για το πώς θα εμφανίζεται το κάθε item μέσα στο FlatList (Carousel)
    const renderCarouselItem = ({ item }) => (
        <ImageBackground 
            source={item.image} 
            style={styles.carouselCard} 
            imageStyle={{ borderRadius: 15 }}
        >
            {/* Overlay για να φαίνονται καλύτερα τα γράμματα πάνω από την εικόνα */}
            <View style={styles.overlay}>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <TouchableOpacity
                    style={styles.ticketButton}
                    onPress={() =>
                        // Πλοήγηση στο Stack 'Shows' και στην οθόνη 'ShowsFromCarousel' με παραμέτρους
                        navigation.navigate('Shows', {
                            screen: 'ShowsFromCarousel',
                            params: {
                                filterType: item.filterType,
                                categoryLabel: item.categoryLabel,
                            },
                        })
                    }
                >
                    <Text style={styles.ticketButtonText}>Δες εδώ</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );

    return (
        <View style={styles.container}>
            {/*  CUSTOM NAVIGATION BAR: Περιλαμβάνει το Logo και το κουμπί για το Drawer  */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navLogo}>Ziogas Theaters</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}> 
                    <Ionicons name="menu" size={32} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Μήνυμα καλωσορίσματος με το όνομα του συνδεδεμένου χρήστη */}
                <Text style={styles.welcomeText}>Καλώς ήρθες, {user?.username}!</Text>

                {/*  CAROUSEL SECTION: Οριζόντια λίστα παραστάσεων  */}
                <View style={styles.carouselContainer}>
                    <FlatList
                        data={carouselItems}
                        renderItem={renderCarouselItem}
                        horizontal
                        pagingEnabled // Για να "κλειδώνει" η οθόνη σε κάθε item
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                    />
                </View>

                {/*  Πρόσθετο Περιεχόμενο  */}
                <View style={{ padding: 20 }}>
                    <Text style={{ color: 'white', fontSize: 18 }}>
                        Δείτε τις τελευταίες παραστάσεις μας και κάντε κράτηση στα καλύτερα θέατρα της χώρας.
                    </Text>
                </View>
            </ScrollView>

            {/*  FOOTER: Σταθερό κάτω τμήμα με πληροφορίες franchise  */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>ZIOGAS THEATERS FRANCHISE</Text>
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};

//  STYLES: Ορισμός εμφάνισης των στοιχείων 
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
    scrollContent: { paddingBottom: 20 },
    welcomeText: { color: 'white', fontSize: 18, textAlign: 'center', marginVertical: 20 },
    
    // Carousel Styles
    carouselContainer: { height: 400, marginTop: 10 },
    carouselCard: { 
        width: width - 40, 
        height: 380, 
        marginHorizontal: 20, 
        justifyContent: 'flex-end',
        overflow: 'hidden'
    },
    overlay: { 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        padding: 20, 
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
    },
    carouselTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    ticketButton: { 
        backgroundColor: '#8B0000', 
        paddingVertical: 10, 
        paddingHorizontal: 30, 
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'white'
    },
    ticketButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Footer Styles
    footer: { 
        backgroundColor: '#8B0000', 
        padding: 20, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.8 }
});

export default HomeScreen;