import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext.js';

// Type pour les items de navigation
type NavItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function Navbar() {
  const { logout, username, role } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Navigation items avec useMemo pour éviter la recréation à chaque render
  const navItems = useMemo((): NavItem[] => {
    const baseItems: NavItem[] = [
      { label: 'Accueil', route: '/', icon: 'home-outline' },
      { label: 'Personnes', route: '/personnes', icon: 'person-circle-outline' },
      { label: 'Familles', route: '/familles', icon: 'people-outline' },
    ];

    if (role === 'admin') {
      baseItems.push({ label: 'Administration', route: '/admin', icon: 'shield-checkmark-outline' });
    }

    return baseItems;
  }, [role]);

  return (
    <View style={styles.container}>
      {/* Logo et titre */}
      <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/')}>
        <Image
          source={require('../assets/images/arbre.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Généalogie</Text>
      </TouchableOpacity>

      {username && (
        <>
          {/* User greeting et menu burger */}
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.userGreeting}>
            <Text style={styles.greetingText}>
              Salam,{" "}
              <Text style={styles.userName}>
                {username.charAt(0).toUpperCase() + username.slice(1)}
              </Text>{" "}
              👋
            </Text>
            <Ionicons name="menu" size={28} color="#f59e0b" />
          </TouchableOpacity>

          {/* Modal pour menu burger */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  {navItems.map((item) => (
                    <TouchableOpacity
                      key={item.route}
                      style={styles.modalItem}
                      onPress={() => {
                        router.push(item.route as any);
                        setModalVisible(false);
                      }}
                    >
                      <Ionicons name={item.icon} size={24} color="#f59e0b" />
                      <Text style={styles.modalItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.modalItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#f59e0b" />
                    <Text style={styles.modalItemText}>Déconnexion</Text>
                  </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
    minHeight: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  userGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    color: '#e5e7eb',
    fontWeight: '600',
    marginRight: 6,
    fontSize: 18,
  },
    userName: {
    color: "#67e8f9", 
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalItemText: {
    color: '#67e8f9',
    fontWeight: 'bold',
    marginLeft: 12,
    fontSize: 18,
  },
  modalClose: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 18,
  },
});