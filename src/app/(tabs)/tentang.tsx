import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { typeScale, spacing } from "../../constants/styles";
import { useTema } from "../../../context/temaContext";

export default function Tentang() {
  const { warna } = useTema();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: warna.latar }}>
      <View
        style={{
          alignItems: "center",
          padding: 24,
          borderRadius: 20,
          backgroundColor: warna.kartu,
          borderWidth: 1,
          borderColor: warna.garis,
        }}
      >
        <Ionicons name="partly-sunny" size={64} color={warna.aksen} />

        <Text
          accessibilityLabel="Judul halaman Tentang Weather App"
          style={{
            marginTop: spacing.sedang,
            fontSize: typeScale.judul,
            fontWeight: "bold",
            color: warna.teks,
          }}
        >
          Weather App
        </Text>

        <Text
          style={{
            marginTop: spacing.kecil,
            fontSize: typeScale.subjudul,
            color: warna.teks,
            textAlign: "center",
          }}
        >
          Aplikasi untuk membantu pengguna melihat informasi cuaca dan kualitas
          udara.
        </Text>

        <Text
          style={{
            marginTop: spacing.sedang,
            fontSize: typeScale.isi,
            color: warna.teksSekunder,
          }}
        >
          Versi 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
