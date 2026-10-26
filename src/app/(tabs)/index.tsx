import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { useTema } from "../../../context/temaContext";
import { konfirmasi } from "../../utils/konfirmasi";
import { cariKota } from "../../services/geocodingService";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { tambahRiwayatPencarian } from "../../services/riwayatPencarian";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";

// Tombol kecil yang dipakai berulang di halaman ini
function TombolAksi({
  judul,
  ikon,
  onPress,
  gaya = "isi",
}: {
  judul: string;
  ikon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  gaya?: "isi" | "garis";
}) {
  const { warna } = useTema();
  const isi = gaya === "isi";
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={judul}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: warna.aksen,
        backgroundColor: isi ? warna.aksen : "transparent",
      }}
    >
      <Ionicons name={ikon} size={18} color={isi ? "#FFFFFF" : warna.aksen} />
      <Text
        style={{
          fontWeight: "600",
          color: isi ? "#FFFFFF" : warna.aksen,
        }}
      >
        {judul}
      </Text>
    </TouchableOpacity>
  );
}

export default function HalamanUtama() {
  const { warna } = useTema();
  const params = useLocalSearchParams<{
    cari?: string;
    id?: string;
    lat?: string;
    lon?: string;
    t?: string;
  }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    []
  );
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  // Kota yang sedang tampil sudah ada di daftar favorit atau belum
  const sudahFavorit =
    kotaTerpilih !== null &&
    daftarFavorit.some((f) => String(f.id) === String(kotaTerpilih.id));

  async function muatKotaTersimpan() {
    try {
      setKotaTersimpan(await daftarKotaTersimpan());
    } catch {
      setKotaTersimpan([]);
    }
  }

  // Muat ulang favorit tiap halaman ini kembali difokuskan
  // (misalnya setelah selesai menambah favorit)
  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit()
        .then(setDaftarFavorit)
        .catch(() => setDaftarFavorit([]));
    }, [])
  );

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  // Dibuka dari tab Riwayat: isi kotak cari dan langsung tampilkan cuacanya
  useEffect(() => {
    if (!params.t || !params.cari || !params.lat || !params.lon) return;

    setTeksCari(params.cari);
    pilihKota({
      id: Number(params.id),
      name: params.cari,
      latitude: Number(params.lat),
      longitude: Number(params.lon),
      country: "",
    });
  }, [params.t]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // Dipakai saat kota dipilih dari HASIL PENCARIAN: catat ke riwayat, lalu muat cuaca
  function pilihDariPencarian(kota: HasilGeocoding) {
    tambahRiwayatPencarian({
      id: kota.id,
      nama: kota.name,
      admin1: kota.admin1,
      latitude: kota.latitude,
      longitude: kota.longitude,
    }).catch(() => {});
    pilihKota(kota);
  }

  function hapusCacheItem(k: RingkasanKotaTersimpan) {
    konfirmasi(
      "Hapus Data Tersimpan",
      "Hapus data cuaca tersimpan untuk " + k.nama + " dari perangkat?",
      "Hapus",
      async () => {
        await hapusCacheKota(k.kunci);
        muatKotaTersimpan();
      }
    );
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas."
      );
      return;
    }

    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual."
      );
      return;
    }

    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: warna.latar }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} nilai={teksCari} />

        <TombolAksi
          judul="Gunakan Lokasi Saat Ini"
          ikon="navigate-outline"
          onPress={gunakanLokasiSaatIni}
        />

        {pesanLokasi && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderRadius: 12,
              backgroundColor: warna.kartu,
              borderWidth: 1,
              borderColor: warna.garis,
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={warna.bahaya}
            />
            <Text
              accessibilityLabel={pesanLokasi}
              style={{ color: warna.teks, flex: 1 }}
            >
              {pesanLokasi}
            </Text>
          </View>
        )}

        {/* Hasil pencarian kota */}
        {hasilPencarian.length > 0 && (
          <View
            style={{
              borderRadius: 12,
              backgroundColor: warna.kartu,
              borderWidth: 1,
              borderColor: warna.garis,
              overflow: "hidden",
            }}
          >
            {hasilPencarian.map((kota, index) => (
              <TouchableOpacity
                key={kota.id}
                onPress={() => pilihDariPencarian(kota)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: warna.garis,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={warna.aksen}
                />
                <Text style={{ color: warna.teks, flex: 1 }}>
                  {kota.name}
                  {kota.admin1 ? ", " + kota.admin1 : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Kota yang tersimpan offline */}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons
                name="cloud-offline-outline"
                size={18}
                color={warna.teksSekunder}
              />
              <Text style={{ fontWeight: "bold", color: warna.teks }}>
                Tersimpan di perangkat (bisa dibuka offline)
              </Text>
            </View>
            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: 14,
                  paddingRight: 6,
                  borderRadius: 12,
                  backgroundColor: warna.kartu,
                  borderWidth: 1,
                  borderColor: warna.garis,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 12 }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text style={{ color: warna.teks }}>{k.nama}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => hapusCacheItem(k)}
                  accessibilityRole="button"
                  accessibilityLabel={"Hapus data tersimpan " + k.nama}
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
        )}

        {sedangMemuat && <ActivityIndicator color={warna.aksen} />}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text accessibilityLabel={pesanError} style={{ color: warna.bahaya }}>
              {pesanError}
            </Text>
            <TombolAksi
              judul="Coba Lagi"
              ikon="refresh-outline"
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            />
            <Text style={{ fontSize: 12, color: warna.teksSekunder }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}{" "}
              {"\u2022"} Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            <TombolAksi
              judul="Perbarui Sekarang"
              ikon="refresh-outline"
              gaya="garis"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />

            {/* Tombol favorit hanya muncul kalau kota belum jadi favorit */}
            {sudahFavorit ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: warna.teksSekunder }}>
                  Kota ini sudah ada di favorit
                </Text>
              </View>
            ) : (
              <TombolAksi
                judul="Tambahkan ke Favorit"
                ikon="heart-outline"
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
              />
            )}
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
