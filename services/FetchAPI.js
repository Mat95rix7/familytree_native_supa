import { supabase } from '../lib/supabaseClient';

// Configuration de votre API Vercel
const API_BASE_URL = 'https://familytreez.vercel.app';

export async function apiFetch(path, options = {}) {
  try {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${API_BASE_URL}/api${cleanPath}`;
    
    // Récupérer le token Supabase à la volée
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || null;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, { 
      ...options, 
      headers 
    });

    // Gérer ici les erreurs si besoin (401 par exemple)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;

  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

export function getPhotoUrl(photoUrl) {
  return photoUrl || 'https://ik.imagekit.io/csooo1xpoo/users/default.png';
}

// // Fonction utilitaire pour parser les réponses JSON
// export async function apiRequest(path, options = {}) {
//   try {
//     const response = await apiFetch(path, options);
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('API Request Error:', error);
//     throw error;
//   }
// }

// // Exemples d'utilisation spécifiques pour React Native
// export const apiMethods = {
//   get: async (path, params = {}) => {
//     const queryString = Object.keys(params).length 
//       ? '?' + new URLSearchParams(params).toString() 
//       : '';
//     return apiRequest(`${path}${queryString}`, { method: 'GET' });
//   },

//   post: async (path, data) => {
//     return apiRequest(path, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   put: async (path, data) => {
//     return apiRequest(path, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },

//   delete: async (path) => {
//     return apiRequest(path, { method: 'DELETE' });
//   },
// };