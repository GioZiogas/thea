import React, { useEffect, useState, useContext, useCallback } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    Alert, ActivityIndicator, RefreshControl 
} from 'react-native';
import apiClient from '../api/client'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const ManageUsers = () => {
    const { user } = useContext(AuthContext); // Πρόσβαση στα στοιχεία του συνδεδεμένου διαχειριστή
    const navigation = useNavigation();

    //  STATES ΔΙΑΧΕΙΡΙΣΗΣ ΧΡΗΣΤΩΝ 
    const [displayedUsers, setDisplayedUsers] = useState([]); // Οι χρήστες που εμφανίζονται στην τρέχουσα σελίδα
    const [loading, setLoading] = useState(true); // Κατάσταση αρχικής φόρτωσης
    const [refreshing, setRefreshing] = useState(false); // Κατάσταση ανανέωσης (Pull-to-refresh)
    
    //  PAGINATION STATE (Σελιδοποίηση) 
    const [page, setPage] = useState(1); // Η τρέχουσα σελίδα
    const [hasMore, setHasMore] = useState(false); // Έλεγχος αν υπάρχει επόμενη σελίδα
    const limit = 10; // Πλήθος χρηστών ανά σελίδα

    //  ΛΗΨΗ ΔΕΔΟΜΕΝΩΝ ΑΠΟ ΤΟ API 
    const fetchUsers = async () => {
        try {
            if (!refreshing) setLoading(true);
            
            // Κλήση του API για λήψη όλων των χρηστών
            const response = await apiClient.get(`/auth/users`);
            let data = Array.isArray(response.data) ? response.data : response.data.users || [];
            
            // 1. Logic Ταξινόμησης: Οι Admins εμφανίζονται πρώτοι, μετά οι υπόλοιποι με βάση το ID (νεότεροι πρώτοι)
            const admins = data.filter(u => u.role === 'admin');
            const others = data.filter(u => u.role !== 'admin').sort((a, b) => b.users_id - a.users_id);
            const allSorted = [...admins, ...others];

            // 2. FRONTEND PAGINATION (Τεμαχισμός της λίστας για τη συγκεκριμένη σελίδα)
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedItems = allSorted.slice(startIndex, endIndex);

            setDisplayedUsers(paginatedItems);
            setHasMore(allSorted.length > endIndex); // Ενημέρωση αν υπάρχουν κι άλλοι χρήστες για την επόμενη σελίδα

        } catch (error) {
            console.error("Σφάλμα API:", error.response?.data || error.message);
            Alert.alert("Πρόβλημα", "Αποτυχία ανάκτησης χρηστών.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Επανεκτέλεση της fetchUsers κάθε φορά που αλλάζει η σελίδα
    useEffect(() => {
        fetchUsers();
    }, [page]);

    // Λειτουργία ανανέωσης με τράβηγμα προς τα κάτω (Pull-to-refresh)
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (page === 1) {
            fetchUsers();
        } else {
            setPage(1); // Η αλλαγή σελίδας θα πυροδοτήσει το useEffect
        }
    }, [page]);

    // Εναλλαγή ρόλου χρήστη (User <-> Employee)
    const toggleRole = async (userId, currentRole) => {
        let newRole = currentRole === 'user' ? 'employee' : 'user';
        try {
            await apiClient.put('/auth/users/role', { userId, newRole: newRole });
            // Ενημέρωση του UI χωρίς επαναφόρτωση όλης της λίστας
            setDisplayedUsers(prev => 
                prev.map(u => u.users_id === userId ? { ...u, role: newRole } : u)
            );
            Alert.alert("Επιτυχία", `Ο χρήστης είναι πλέον: ${newRole}`);
        } catch (error) {
            Alert.alert("Σφάλμα", "Η ενημέρωση απέτυχε.");
        }
    };

    // Σχεδιασμός του κάθε στοιχείου (κάρτας) χρήστη στη λίστα
    const renderUserItem = ({ item }) => (
        <View style={[
            styles.userCard, 
            item.role === 'admin' && { borderColor: '#8B0000', borderWidth: 1 } // Highlight αν είναι admin
        ]}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.firstname} {item.lastname}</Text>
                <Text style={styles.userSubText}>
                    <Ionicons name="person" size={14} /> {item.username}
                </Text>
                <Text style={styles.userSubText}>
                    <Ionicons name="mail" size={14} /> {item.email}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#8B0000' : '#444' }]}>
                    <Text style={styles.roleText}>{item.role?.toUpperCase()}</Text>
                </View>
            </View>

            {/* Αν ο χρήστης δεν είναι admin, εμφάνισε κουμπί αλλαγής ρόλου */}
            {item.role !== 'admin' ? (
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => toggleRole(item.users_id, item.role)}
                >
                    <Ionicons name="swap-horizontal" size={24} color="white" />
                    <Text style={styles.actionButtonText}>Αλλαγή</Text>
                </TouchableOpacity>
            ) : (
                // Αν είναι admin, εμφάνισε το σήμα "Master" (δεν αλλάζει ο ρόλος του)
                <View style={[styles.actionButton, { backgroundColor: 'transparent' }]}>
                    <Ionicons name="shield-checkmark" size={24} color="#8B0000" />
                    <Text style={[styles.actionButtonText, { color: '#8B0000' }]}>Master</Text>
                </View>
            )}
        </View>
    );

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
                <Text style={styles.pageTitle}>Διαχείριση Χρηστών</Text>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#8B0000" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={displayedUsers}
                        keyExtractor={(item) => item.users_id.toString()}
                        renderItem={renderUserItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>Δεν βρέθηκαν χρήστες στη σελίδα {page}.</Text>}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#8B0000"
                                colors={["#8B0000"]}
                            />
                        }
                    />
                )}
            </View>

            {/*  PAGINATION BAR (Έλεγχος σελίδων)  */}
            <View style={styles.paginationBar}>
                {/* Κουμπί Πίσω */}
                <TouchableOpacity 
                    disabled={page === 1} 
                    onPress={() => setPage(page - 1)}
                    style={{ opacity: page === 1 ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-back-circle" size={50} color="#8B0000" />
                </TouchableOpacity>

                {/* Ένδειξη Σελίδας */}
                <View style={styles.pageIndicator}>
                    <Text style={styles.pageNumberText}>Σελίδα {page}</Text>
                    <Text style={styles.itemCountText}>Χρήστες σελίδας: {displayedUsers.length}</Text>
                </View>

                {/* Κουμπί Επόμενο */}
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
                <Text style={styles.footerText}>© 2026 - Ποιότητα στην Τέχνη</Text>
            </View>
        </View>
    );
};

//  STYLES 
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    navBar: { height: 100, backgroundColor: '#8B0000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 },
    navLogo: { color: 'white', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
    content: { flex: 1 },
    pageTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
    listContent: { paddingHorizontal: 15, paddingBottom: 20 },
    userCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#8B0000' },
    userInfo: { flex: 0.7 },
    userName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    userSubText: { color: '#aaa', fontSize: 13, marginTop: 4 },
    roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, marginTop: 10 },
    roleText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    actionButton: { backgroundColor: '#333', padding: 10, borderRadius: 8, alignItems: 'center', flex: 0.25 },
    actionButtonText: { color: 'white', fontSize: 9, fontWeight: 'bold', marginTop: 5 },
    emptyText: { color: 'white', textAlign: 'center', marginTop: 20 },
    paginationBar: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        paddingVertical: 10, 
        backgroundColor: '#000', 
        borderTopWidth: 1, 
        borderTopColor: '#222' 
    },
    pageIndicator: { alignItems: 'center' },
    pageNumberText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    itemCountText: { color: '#8B0000', fontSize: 10, fontWeight: 'bold' },
    footer: { backgroundColor: '#8B0000', padding: 15, alignItems: 'center' },
    footerTitle: { color: 'white', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
    footerText: { color: 'white', fontSize: 11, opacity: 0.9 }
});

export default ManageUsers;