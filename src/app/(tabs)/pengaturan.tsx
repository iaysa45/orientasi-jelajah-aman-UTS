import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { useTema, ModeTema } from "../../../context/temaContext";

const PILIHAN_TEMA: {
  nilai: ModeTema;
  label: string;
  ikon: keyof typeof Ionicons.glyphMap;
}[] = [
  { nilai: "terang", label: "Terang", ikon: "sunny-outline" },
  { nilai: "gelap", label: "Gelap", ikon: "moon-outline" },
  { nilai: "sistem", label: "Ikuti Sistem", ikon: "phone-portrait-outline" },
];

export default function TabPengaturan() {
  const { warna, mode, ubahMode } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);

  async function hapusDataTersimpan() {
    await hapusSemuaCache();
    setPesan("Data cuaca tersimpan sudah dihapus.");
  }

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 16, gap: 12, backgroundColor: warna.latar }}
    >
      {/* Kartu info aplikasi */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          padding: 16,
          borderRadius: 16,
          backgroundColor: warna.kartu,
          borderWidth: 1,
          borderColor: warna.garis,
        }}
      >
        <Ionicons name="partly-sunny" size={36} color={warna.aksen} />
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: warna.teks }}>
            Jelajah Aman
          </Text>
          <Text style={{ color: warna.teksSekunder }}>Versi 1.0.0</Text>
        </View>
      </View>

      <Text style={{ fontWeight: "bold", color: warna.teks, marginTop: 8 }}>
        Tampilan
      </Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {PILIHAN_TEMA.map((pilihan) => {
          const dipilih = mode === pilihan.nilai;
          return (
            <TouchableOpacity
              key={pilihan.nilai}
              onPress={() => ubahMode(pilihan.nilai)}
              accessibilityRole="radio"
              accessibilityState={{ selected: dipilih }}
              accessibilityLabel={"Mode tampilan " + pilihan.label}
              style={{
                flex: 1,
                paddingVertical: 12,
                gap: 4,
                borderRadius: 12,
                borderWidth: 1,
                alignItems: "center",
                borderColor: dipilih ? warna.aksen : warna.garis,
                backgroundColor: dipilih ? warna.aksen : warna.kartu,
              }}
            >
              <Ionicons
                name={pilihan.ikon}
                size={22}
                color={dipilih ? "#FFFFFF" : warna.teks}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: dipilih ? "bold" : "normal",
                  color: dipilih ? "#FFFFFF" : warna.teks,
                }}
              >
                {pilihan.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={{ fontWeight: "bold", color: warna.teks, marginTop: 8 }}>
        Data
      </Text>

      <TouchableOpacity
        onPress={hapusDataTersimpan}
        accessibilityRole="button"
        accessibilityLabel="Hapus data cuaca tersimpan"
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: warna.bahaya,
        }}
      >
        <Ionicons name="trash-outline" size={20} color={warna.bahaya} />
        <Text style={{ color: warna.bahaya, fontWeight: "600" }}>
          Hapus Data Cuaca Tersimpan
        </Text>
      </TouchableOpacity>

      {pesan && (
        <Text accessibilityLabel={pesan} style={{ color: warna.teks }}>
          {pesan}
        </Text>
      )}
    </SafeAreaView>
  );
}
