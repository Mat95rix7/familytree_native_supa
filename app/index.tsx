import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isConnected, role } = useAuth();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#0f172a", // bg-slate-900
      }}
    >
      {/* Mascotte SVG */}
      <View style={{ marginBottom: 20 }}>
        <Svg width={100} height={100} viewBox="0 0 100 100" fill="none">
          <Ellipse cx="50" cy="60" rx="40" ry="30" fill="#222b3a" />
          <Ellipse cx="50" cy="60" rx="30" ry="22" fill="#0dcaf0" />
          <Circle cx="40" cy="55" r="6" fill="#6610f2" />
          <Circle cx="60" cy="55" r="6" fill="#6610f2" />
          <Ellipse cx="50" cy="75" rx="12" ry="6" fill="#20c997" />
          <Ellipse cx="50" cy="80" rx="6" ry="2" fill="#111" />
          <Ellipse cx="40" cy="53" rx="2" ry="1" fill="#fff" />
          <Ellipse cx="60" cy="53" rx="2" ry="1" fill="#fff" />
          <Path d="M44 70 Q50 78 56 70" stroke="#fff" strokeWidth="2" />
          <Ellipse cx="50" cy="65" rx="18" ry="6" fill="#111" fillOpacity="0.12" />
        </Svg>
      </View>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#22d3ee", // text-cyan-300
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Bienvenue dans ta Généalogie Familiale !
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#a5f3fc", // text-cyan-100
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Découvre, gère et amuse-toi avec ta grande Famille. {"\n"}
        Ajoute des membres, explore les arbres, et partage la joie des liens
        familiaux !
      </Text>

      {/* Bouton login si pas connecté */}
      {!isConnected && (
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={{
            backgroundColor: "#06b6d4",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            marginBottom: 30,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            Se connecter / S&apos;enregistrer
          </Text>
        </TouchableOpacity>
      )}

      {isConnected && (
        <View style={{ width: "100%", gap: 20 }}>
          <TouchableOpacity
            onPress={() => router.push("/personnes")}
            style={{
              backgroundColor: "#34d399",
              padding: 20,
              borderRadius: 12,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111" }}>
              Personnes
            </Text>
            <Text style={{ textAlign: "center", color: "#111" }}>
              Voir, ajouter ou modifier les membres.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/familles")}
            style={{
              backgroundColor: "#38bdf8",
              padding: 20,
              borderRadius: 12,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111" }}>
              Familles
            </Text>
            <Text style={{ textAlign: "center", color: "#111" }}>
              Voir les familles.
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {role === "admin" && (
        <TouchableOpacity
          onPress={() => router.push("/admin")}
          style={{
            width: "100%",
            backgroundColor: "#c084fc",
            padding: 20,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 20,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111" }}>
            Administration
          </Text>
          <Text style={{ textAlign: "center", color: "#111" }}>
            Gérer les utilisateurs, rôles et paramètres.
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
