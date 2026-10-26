// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
  hapusRiwayatPencarian,
  hapusSemuaRiwayat,
} from "../../services/riwayatPencarian";
import { konfirmasi } from "../../utils/konfirmasi";
import { useTema } from "../../../context/temaContext";
import { KotaFavorit } from "../../types/favorit";
import { RiwayatPencarian } from "../../types/riwayat";

export default function TabRiwayat() {
  const { warna } = useTema();
  const [riwayat, setRiwayat] = useState<RiwayatPencarian[]>([]);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilRiwayatPencarian().then(setRiwayat);
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  // Buka Beranda: kotak cari terisi dan cuaca kota itu langsung dimuat
  function cariUlang(item: RiwayatPencarian) {
    router.navigate({
      pathname: "/",
      params: {
        cari: item.nama,
        id: String(item.id),
        lat: String(item.latitude),
        lon: String(item.longitude),
        t: String(Date.now()), // penanda agar kota yang sama tetap memicu pencarian
      },
    });
  }

  // Hapus satu item riwayat pencarian
  async function hapusRiwayatItem(item: RiwayatPencarian) {
    await hapusRiwayatPencarian(item.id);
    setRiwayat(await ambilRiwayatPencarian());
  }

  // Hapus seluruh riwayat pencarian (pakai konfirmasi)
  function hapusRiwayatSemua() {
    konfirmasi(
      "Hapus Semua Riwayat",
      "Yakin hapus seluruh riwayat pencarian?",
      "Hapus",
      async () => {
        await hapusSemuaRiwayat();
        setRiwayat([]);
      }
    );
  }

  function hapusFavoritItem(kota: KotaFavorit) {
    konfirmasi(
      "Konfirmasi Hapus",
      "Yakin hapus " + kota.nama + " dari favorit?",
      "Hapus",
      async () => {
        await hapusFavorit(kota.id);
        setDaftarFavorit(await ambilSemuaFavorit());
      }
    );
  }

  const judulSection = {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: warna.teks,
  };

  const barisKartu = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: 12,
    backgroundColor: warna.kartu,
    borderWidth: 1,
    borderColor: warna.garis,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        {/* Riwayat pencarian */}
        <View style={{ gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="time-outline" size={20} color={warna.aksen} />
              <Text style={judulSection}>
                Riwayat Pencarian ({riwayat.length}/10)
              </Text>
            </View>

            {riwayat.length > 0 && (
              <TouchableOpacity
                onPress={hapusRiwayatSemua}
                accessibilityRole="button"
                accessibilityLabel="Hapus semua riwayat pencarian"
                hitSlop={8}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={warna.bahaya}
                />
                <Text style={{ color: warna.bahaya, fontSize: 13 }}>
                  Hapus semua
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {riwayat.length === 0 && (
            <Text style={{ color: warna.teksSekunder }}>
              Belum ada riwayat pencarian
            </Text>
          )}

          {riwayat.map((item) => (
            <View key={item.id} style={barisKartu}>
              <TouchableOpacity
                onPress={() => cariUlang(item)}
                accessibilityLabel={"Cari ulang " + item.nama}
                style={{ flex: 1, paddingVertical: 12 }}
              >
                <Text style={{ color: warna.teks }}>
                  {item.nama}
                  {item.admin1 ? ", " + item.admin1 : ""}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => hapusRiwayatItem(item)}
                accessibilityRole="button"
                accessibilityLabel={"Hapus riwayat " + item.nama}
                hitSlop={8}
                style={{ padding: 10 }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={22}
                  color={warna.teksSekunder}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Kota favorit */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="heart" size={20} color={warna.bahaya} />
            <Text style={judulSection}>Kota Favorit</Text>
          </View>
          <Text style={{ color: warna.teksSekunder }}>
            Tersimpan {daftarFavorit.length} kota
          </Text>

          {daftarFavorit.length === 0 && (
            <Text style={{ color: warna.teksSekunder }}>
              Belum ada kota favorit
            </Text>
          )}

          {daftarFavorit.map((kota) => (
            <View key={kota.id} style={barisKartu}>
              <Text style={{ color: warna.teks, flex: 1, paddingVertical: 12 }}>
                {kota.nama}
              </Text>
              <TouchableOpacity
                onPress={() => hapusFavoritItem(kota)}
                accessibilityRole="button"
                accessibilityLabel={"Hapus favorit " + kota.nama}
                hitSlop={8}
                style={{ padding: 10 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={warna.bahaya}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
