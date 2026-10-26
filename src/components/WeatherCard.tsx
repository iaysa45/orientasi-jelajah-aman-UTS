import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WeatherCardProps, TingkatAQI } from "../types/cuaca";
import { typeScale, spacing } from "../constants/styles";
import { useTema } from "../../context/temaContext";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#16A34A",
  SEDANG: "#CA8A04",
  TIDAK_SEHAT: "#EA580C",
  BERBAHAYA: "#DC2626",
};

const labelPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "Baik",
  SEDANG: "Sedang",
  TIDAK_SEHAT: "Tidak Sehat",
  BERBAHAYA: "Berbahaya",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const { warna } = useTema();

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI ${indeksAQI} (${labelPerTingkat[tingkatAQI]})`
      : `AQI ${labelPerTingkat[tingkatAQI]}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang + 4,
        borderRadius: 20,
        backgroundColor: warna.kartu,
        borderWidth: 1,
        borderColor: warna.garis,
        gap: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {/* Nama kota */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name="location" size={20} color={warna.aksen} />
        <Text
          style={{
            fontWeight: "bold",
            fontSize: typeScale.judul,
            color: warna.teks,
            flexShrink: 1,
          }}
        >
          {kota}
        </Text>
      </View>

      {/* Suhu */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name="partly-sunny" size={56} color={warna.aksen} />
        <Text style={{ fontSize: 56, fontWeight: "bold", color: warna.teks }}>
          {suhu}°C
        </Text>
      </View>

      {/* Garis pemisah */}
      <View style={{ height: 1, backgroundColor: warna.garis }} />

      {/* Kualitas udara */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="leaf-outline" size={18} color={warna.teksSekunder} />
          <Text style={{ color: warna.teksSekunder, fontSize: typeScale.isi }}>
            Kualitas udara
          </Text>
        </View>
        <View
          style={{
            backgroundColor: warnaPerTingkat[tingkatAQI],
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: typeScale.isi,
            }}
          >
            {teksAQI}
          </Text>
        </View>
      </View>
    </View>
  );
}
