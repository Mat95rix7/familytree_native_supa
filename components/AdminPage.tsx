import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiFetch } from '../services/FetchAPI';

const { width } = Dimensions.get('window');

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulaire pour créer/modifier un utilisateur
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });

  // Charger les statistiques
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs
  const loadUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await apiFetch(
        `/admin/users?page=${page}&limit=10&search=${search}`
      );
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiFetch(`/admin/users/${userId}`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                loadUsers(currentPage, searchTerm);
              } else {
                const error = await response.json();
                Alert.alert('Erreur', error.error);
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
            }
          }
        }
      ]
    );
  };

  // Mettre à jour un utilisateur
  const updateUser = async (userData) => {
    try {
      const response = await apiFetch(`/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        setEditingUser(null);
        loadUsers(currentPage, searchTerm);
      } else {
        const error = await response.json();
        Alert.alert('Erreur', error.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Créer un utilisateur
  const createUser = async (userData) => {
    try {
      const response = await apiFetch('/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setUserForm({ username: '', email: '', password: '', role: 'user', isActive: true });
        loadUsers(currentPage, searchTerm);
      } else {
        const error = await response.json();
        Alert.alert('Erreur', error.error);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers(currentPage, searchTerm);
    }
  }, [activeTab, currentPage, searchTerm]);

  // Composant Modal pour éditer un utilisateur
  const EditUserModal = ({ user, onSave, onCancel }) => (
    <Modal visible={!!user} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier l'utilisateur</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={user?.username || ''}
            onChangeText={(text) => setEditingUser({...user, username: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={user?.email || ''}
            onChangeText={(text) => setEditingUser({...user, email: text})}
            keyboardType="email-address"
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Rôle:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleButton, user?.role === 'user' && styles.roleButtonActive]}
                onPress={() => setEditingUser({...user, role: 'user'})}
              >
                <Text style={[styles.roleButtonText, user?.role === 'user' && styles.roleButtonTextActive]}>
                  Utilisateur
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, user?.role === 'admin' && styles.roleButtonActive]}
                onPress={() => setEditingUser({...user, role: 'admin'})}
              >
                <Text style={[styles.roleButtonText, user?.role === 'admin' && styles.roleButtonTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Compte actif</Text>
            <Switch
              value={user?.isActive || false}
              onValueChange={(value) => setEditingUser({...user, isActive: value})}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => onSave(user)}>
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Composant Modal pour créer un utilisateur
  const CreateUserModal = () => (
    <Modal visible={showCreateModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Créer un utilisateur</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={userForm.username}
            onChangeText={(text) => setUserForm({...userForm, username: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={userForm.email}
            onChangeText={(text) => setUserForm({...userForm, email: text})}
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={userForm.password}
            onChangeText={(text) => setUserForm({...userForm, password: text})}
            secureTextEntry
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Rôle:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleButton, userForm.role === 'user' && styles.roleButtonActive]}
                onPress={() => setUserForm({...userForm, role: 'user'})}
              >
                <Text style={[styles.roleButtonText, userForm.role === 'user' && styles.roleButtonTextActive]}>
                  Utilisateur
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, userForm.role === 'admin' && styles.roleButtonActive]}
                onPress={() => setUserForm({...userForm, role: 'admin'})}
              >
                <Text style={[styles.roleButtonText, userForm.role === 'admin' && styles.roleButtonTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Compte actif</Text>
            <Switch
              value={userForm.isActive}
              onValueChange={(value) => setUserForm({...userForm, isActive: value})}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => createUser(userForm)}
            >
              <Text style={styles.createButtonText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administration</Text>
        <View style={styles.headerRight}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <Text style={styles.headerSubtitle}>Administrateur</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Ionicons name="bar-chart" size={20} color={activeTab === 'stats' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Statistiques
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'users' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Utilisateurs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'stats' && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Tableau de bord</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : stats ? (
              <>
                <View style={styles.statsGrid}>
                  {/* Cartes de statistiques */}
                  <View style={styles.statCard}>
                    <Ionicons name="people" size={32} color="#3B82F6" />
                    <View style={styles.statInfo}>
                      <Text style={styles.statLabel}>Total Utilisateurs</Text>
                      <Text style={styles.statValue}>
                        {stats.users.reduce((sum, user) => sum + parseInt(user.count), 0)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="person-add" size={32} color="#10B981" />
                    <View style={styles.statInfo}>
                      <Text style={styles.statLabel}>Personnes</Text>
                      <Text style={styles.statValue}>{stats.persons.totalPersons}</Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="trending-up" size={32} color="#F59E0B" />
                    <View style={styles.statInfo}>
                      <Text style={styles.statLabel}>Décédés</Text>
                      <Text style={styles.statValue}>{stats.persons.deceased}</Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <Ionicons name="calendar" size={32} color="#8B5CF6" />
                    <View style={styles.statInfo}>
                      <Text style={styles.statLabel}>Âge moyen</Text>
                      <Text style={styles.statValue}>
                        {Math.round(stats.persons.averageAge || 0)} ans
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Graphiques */}
                <View style={styles.chartsContainer}>
                  <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Répartition par rôle</Text>
                    {stats.users.map((user, idx) => (
                      <View key={idx} style={styles.chartRow}>
                        <Text style={styles.chartLabel}>
                          {user.role === 'admin' ? 'Administrateurs' : 'Utilisateurs'}
                        </Text>
                        <Text style={styles.chartValue}>{user.count}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Répartition par genre</Text>
                    {stats.genderDistribution.map((gender, idx) => (
                      <View key={idx} style={styles.chartRow}>
                        <Text style={styles.chartLabel}>
                          {gender.gender || 'Non spécifié'}
                        </Text>
                        <Text style={styles.chartValue}>{gender.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : null}
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.usersContainer}>
            <View style={styles.usersHeader}>
              <Text style={styles.sectionTitle}>Gestion des utilisateurs</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Nouvel utilisateur</Text>
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setCurrentPage(1);
                }}
              />
            </View>

            {/* Liste des utilisateurs */}
            <View style={styles.usersList}>
              {users
                .sort((a, b) => (a.role === 'admin' ? -1 : 1))
                .map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={[
                      styles.userAvatar,
                      user.role === 'admin' ? styles.adminAvatar : styles.userAvatar
                    ]}>
                      <Ionicons 
                        name={user.role === 'admin' ? "shield" : "person"} 
                        size={20} 
                        color={user.role === 'admin' ? "#DC2626" : "#6B7280"} 
                      />
                    </View>
                    <View style={styles.userDetails}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{user.username}</Text>
                        {!user.isActive && (
                          <Ionicons name="person-remove" size={16} color="#DC2626" />
                        )}
                      </View>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <View style={[
                        styles.roleBadge,
                        user.role === 'admin' ? styles.adminBadge : styles.userBadge
                      ]}>
                        <Text style={[
                          styles.roleBadgeText,
                          user.role === 'admin' ? styles.adminBadgeText : styles.userBadgeText
                        ]}>
                          {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setEditingUser(user)}
                    >
                      <Ionicons name="create" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteUser(user.id)}
                    >
                      <Ionicons name="trash" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <View style={styles.pagination}>
                <Text style={styles.paginationText}>
                  Page {pagination.currentPage} sur {pagination.pages}
                </Text>
                <View style={styles.paginationButtons}>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                    onPress={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Text style={styles.paginationButtonText}>Précédent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === pagination.pages && styles.disabledButton]}
                    onPress={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    <Text style={styles.paginationButtonText}>Suivant</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modales */}
      <EditUserModal
        user={editingUser}
        onSave={updateUser}
        onCancel={() => setEditingUser(null)}
      />
      <CreateUserModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1E1E3F',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D5A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E5E7EB',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E3F',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D5A',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#60A5FA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#60A5FA',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1E1E3F',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2D2D5A',
  },
  statInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chartsContainer: {
    marginTop: 8,
  },
  chartCard: {
    backgroundColor: '#1E1E3F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2D2D5A',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chartLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
  },
  usersContainer: {
    padding: 16,
  },
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E3F',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D5A',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  usersList: {
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#1E1E3F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2D2D5A',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminAvatar: {
    backgroundColor: '#4C1D95',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#60A5FA',
    marginVertical: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  adminBadge: {
    backgroundColor: '#4C1D95',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  userBadge: {
    backgroundColor: '#2D2D5A',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  adminBadgeText: {
    color: '#C4B5FD',
  },
  userBadgeText: {
    color: '#D1D5DB',
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#2D2D5A',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  paginationButtons: {
    flexDirection: 'row',
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2D2D5A',
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: '#1E1E3F',
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E3F',
    borderRadius: 16,
    padding: 24,
    width: width - 32,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2D2D5A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2D2D5A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#2D2D5A',
    color: '#FFFFFF',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2D2D5A',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#2D2D5A',
  },
  roleButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  roleButtonTextActive: {
    color: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2D2D5A',
    borderRadius: 6,
    backgroundColor: '#2D2D5A',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#10B981',
    borderRadius: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});

export default AdminDashboard;