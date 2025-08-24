import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer le profil depuis la table "profiles"
  const fetchProfile = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("username, role, isActive")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Erreur fetch profile:", error.message);
      return;
    }
    setRole(data.role || "user");
    setUsername(data.username || "");
    setIsActive(data.isActive ?? false);
  };

  // Vérifie la session existante au démarrage et écoute les changements
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          setUsername(null);
          setIsActive(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Login
  const login = async (email, password) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
      console.error("Erreur login:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // Register
  const register = async (email, password, usernameInput) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: usernameInput } },
    });
    setIsLoading(false);
    if (error) {
      console.error("Erreur register:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUsername(null);
    setIsActive(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isConnected: !!user,
        role,
        username,
        isActive,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
