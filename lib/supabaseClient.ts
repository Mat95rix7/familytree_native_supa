// // lib/supabaseClient.ts
// import { createClient } from "@supabase/supabase-js"
// import AsyncStorage from "@react-native-async-storage/async-storage"

// // Adaptateur AsyncStorage pour Supabase
// // const AsyncStorageAdapter = {
// //   getItem: (key: string) => AsyncStorage.getItem(key),
// //   setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
// //   removeItem: (key: string) => AsyncStorage.removeItem(key),
// // }

// // Variables d'environnement - Pour Expo avec variables publiques
// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

// // Vérification que les variables sont bien définies
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error(
//     'Variables d\'environnement Supabase manquantes. Vérifiez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env'
//   )
// }

// // Client Supabase principal
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
//   realtime: {
//     params: { eventsPerSecond: 10 },
//   },
// })

// // Helpers pour l'authentification
// export const authHelpers = {
//   // Vérifier si un utilisateur est connecté
//   async isAuthenticated() {
//     const { data: { session } } = await supabase.auth.getSession()
//     return !!session
//   },

//   // Récupérer l'utilisateur actuel
//   async getCurrentUser() {
//     const { data: { user } } = await supabase.auth.getUser()
//     return user
//   },

//   // Récupérer la session actuelle
//   async getCurrentSession() {
//     const { data: { session } } = await supabase.auth.getSession()
//     return session
//   },

//   // Déconnexion
//   async signOut() {
//     const { error } = await supabase.auth.signOut()
//     if (error) throw error
//   },

//   // Suivre les changements de session
//   onAuthStateChange(callback: (event: string, session: any) => void) {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (event, session) => callback(event, session)
//     )
//     return subscription
//   },
// }

// export default supabase
// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"
import AsyncStorageLib from "@react-native-async-storage/async-storage"
import type { SupabaseClientOptions } from "@supabase/supabase-js"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

// Adaptateur pour rendre AsyncStorage compatible avec Supabase
const AsyncStorage: SupabaseClientOptions["auth"]["storage"] = {
  getItem: (key: string) => {
    return AsyncStorageLib.getItem(key)
  },
  setItem: (key: string, value: string) => {
    return AsyncStorageLib.setItem(key, value)
  },
  removeItem: (key: string) => {
    return AsyncStorageLib.removeItem(key)
  },
}

// Variables d'environnement depuis le `.env`
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variables d'environnement Supabase manquantes. Vérifiez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env"
  )
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important pour React Native
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})

// Helpers facultatifs
export const authHelpers = {
  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return subscription
  },
}

export default supabase
