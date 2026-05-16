import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// --- ΕΙΣΑΓΩΓΗ ΟΘΟΝΩΝ (SCREENS) ---
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import ManageUsers from './src/screens/ManageUsers';
import ManageTheatres from './src/screens/ManageTheatres';
import AddShow from './src/screens/AddShow';
import ManageSchedule from './src/screens/ManageSchedule';
import ReportsScreen from './src/screens/ReportsScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import CategoryShowsScreen from './src/screens/CategoryShowsScreen';
import ShowDetailsScreen from './src/screens/ShowDetailsScreen';
import ShowShowtimesScreen from './src/screens/ShowShowtimesScreen';
import SeatSelectionScreen from './src/screens/SeatSelectionScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ReservationSuccessScreen from './src/screens/ReservationSuccessScreen';
import MyReservationsScreen from './src/screens/MyReservationsScreen';
import ReservationDetailsScreen from './src/screens/ReservationDetailsScreen';
import AllReservationsScreen from './src/screens/AllReservationsScreen';
import ShowsFromCarousel from './src/screens/ShowsFromCarousel';

export const BASE_URL = 'http://192.168.3.125:5000';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const AdminStack = createStackNavigator();
const ShowsStack = createStackNavigator();

// --- 1. SHOWS STACK NAVIGATOR ---
const ShowsStackNavigator = () => (
    <ShowsStack.Navigator
        initialRouteName="Categories"
        screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#8B0000',
            headerTitleAlign: 'center'
        }}
    >
        <ShowsStack.Screen
            name="Categories"
            component={CategoriesScreen}
            options={{ title: 'Κατηγορίες' }}
        />
        <ShowsStack.Screen
            name="CategoryShows"
            component={CategoryShowsScreen}
            options={{ title: 'Παραστάσεις' }}
        />
        <ShowsStack.Screen
            name="ShowsFromCarousel"
            component={ShowsFromCarousel}
            options={{ title: 'Παραστάσεις' }}
        />
        <ShowsStack.Screen
            name="ShowDetails"
            component={ShowDetailsScreen}
            options={{ title: 'Λεπτομέρειες' }}
        />
        <ShowsStack.Screen
            name="ShowShowtimes"
            component={ShowShowtimesScreen}
            options={{ title: 'Ημερομηνίες' }}
        />
        <ShowsStack.Screen
            name="SeatSelection"
            component={SeatSelectionScreen}
            options={{ title: 'Επιλογή Θέσης' }}
        />
        <ShowsStack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: 'Πληρωμή' }}
        />
        <ShowsStack.Screen
            name="ReservationSuccess"
            component={ReservationSuccessScreen}
            options={{ 
                headerShown: false,
                gestureEnabled: false, // Απενεργοποιεί το swipe back σε iOS
            }}
        />
        <ShowsStack.Screen
            name="ReservationDetails"
            component={ReservationDetailsScreen}
            options={{ title: 'Λεπτομέρειες Κράτησης' }}
        />
    </ShowsStack.Navigator>
);

// --- 2. ADMIN STACK NAVIGATOR ---
const AdminStackNavigator = () => (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
        <AdminStack.Screen name="AdminDashboard" component={AdminDashboard} />
        <AdminStack.Screen name="ManageUsers" component={ManageUsers} />
        <AdminStack.Screen name="AddShow" component={AddShow} />
        <AdminStack.Screen name="ManageSchedule" component={ManageSchedule} />
        <AdminStack.Screen name="AllReservations" component={AllReservationsScreen} />
        <AdminStack.Screen name="ReportsScreen" component={ReportsScreen} />
        <AdminStack.Screen name="ManageTheatres" component={ManageTheatres} />
    </AdminStack.Navigator>
);

// --- 3. CUSTOM DRAWER CONTENT ---
const CustomDrawerContent = (props) => {
    const { logout, user } = useContext(AuthContext);

    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: '#000000' }}>
            <View style={styles.drawerHeader}>
                <Text style={styles.brandText}>Ziogas Theatres</Text>
                <Text style={styles.userText}>Χρήστης: {user?.username}</Text>
            </View>

            <DrawerItemList {...props} />

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
};

// --- 4. INTERNAL DRAWER NAVIGATOR ---
const InternalDrawer = () => {
    const { user } = useContext(AuthContext);

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: { width: 260, backgroundColor: '#000' },
                drawerActiveBackgroundColor: '#8B0000',
                drawerActiveTintColor: '#fff',
                drawerInactiveTintColor: '#fff',
                drawerLabelStyle: { fontSize: 16, fontWeight: 'bold' }
            }}
        >
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Αρχική' }}
            />

            <Drawer.Screen
                name="MyAccount"
                component={ProfileScreen}
                options={{ title: 'Ο Λογαριασμός μου' }}
            />

            <Drawer.Screen
                name="Shows"
                component={ShowsStackNavigator}
                options={{ title: 'Παραστάσεις' }}
                listeners={({ navigation }) => ({
                    drawerItemPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('Shows', {
                            screen: 'Categories'
                        });
                    }
                })}
            />

            <Drawer.Screen
                name="Reservations"
                component={MyReservationsScreen}
                options={{ title: 'Οι Κρατήσεις μου' }}
            />

            {user && (user.role === 'admin' || user.role === 'employee') && (
                <Drawer.Screen
                    name="AdminPanel"
                    component={AdminStackNavigator}
                    options={{
                        title: user.role === 'admin' ? 'Admin Panel' : 'Employee Panel'
                    }}
                    listeners={({ navigation }) => ({
                        drawerItemPress: (e) => {
                            e.preventDefault();
                            navigation.navigate('AdminPanel', {
                                screen: 'AdminDashboard'
                            });
                        }
                    })}
                />
            )}
        </Drawer.Navigator>
    );
};

// --- 5. ΚΕΝΤΡΙΚΟ NAVIGATION ---
const Navigation = () => {
    const { token, loading } = useContext(AuthContext);

    if (loading) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token == null ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={InternalDrawer} />

                        <Stack.Screen
                            name="ReservationDetails"
                            component={ReservationDetailsScreen}
                            options={{
                                headerShown: false,
                                title: 'Λεπτομέρειες Κράτησης',
                                headerStyle: { backgroundColor: '#8B0000' },
                                headerTintColor: 'white'
                            }}
                        />

                        <Stack.Screen
                            name="ChangePassword"
                            component={ChangePasswordScreen}
                            options={{
                                headerShown: true,
                                title: 'Αλλαγή Κωδικού',
                                headerStyle: { backgroundColor: '#000' },
                                headerTintColor: '#8B0000',
                                headerBackTitleVisible: false
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <Navigation />
        </AuthProvider>
    );
}
//style
const styles = StyleSheet.create({
    drawerHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        marginBottom: 10,
        alignItems: 'center'
    },
    brandText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold'
    },
    userText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 5
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)'
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 15
    },
    backBtn: {
        marginTop: 30,
        padding: 10,
        borderWidth: 1,
        borderColor: '#8B0000',
        borderRadius: 5
    }
});