import AsyncStorage from "@react-native-async-storage/async-storage";
import { RiwayatPencarian } from "../types/riwayat";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
export const MAKS_RIWAYAT = 10;

export async function ambilRiwayatPencarian(): Promise<RiwayatPencarian[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);
    return json ? (JSON.parse(json) as RiwayatPencarian[]) : [];
  } catch {
    return [];
  }
}

export async function tambahRiwayatPencarian(
  item: RiwayatPencarian
): Promise<void> {
  const daftar = await ambilRiwayatPencarian();
  const tanpaDuplikat = daftar.filter((r) => r.id !== item.id);
  const daftarBaru = [item, ...tanpaDuplikat].slice(0, MAKS_RIWAYAT);
  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftarBaru));
}

export async function hapusRiwayatPencarian(id: number) {
  const semua = await ambilRiwayatPencarian();
  const sisa = semua.filter((r) => r.id !== id);
  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(sisa));
}

export async function hapusSemuaRiwayat() {
  await AsyncStorage.removeItem(KUNCI_RIWAYAT);
}