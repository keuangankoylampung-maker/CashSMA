/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Operator' | 'Guru' | 'Pegawai' | 'Siswa' | 'Kepala Sekolah';

export interface User {
  ID_USER: string;
  NIP_NIS: string;
  Nama: string;
  JK: 'Laki-laki' | 'Perempuan';
  Jabatan: string;
  Unit: string;
  Email: string;
  Password?: string;
  Role: UserRole;
  Status: 'Aktif' | 'Nonaktif';
}

export interface FaceData {
  ID_FACE: string;
  ID_USER: string;
  Face_Descriptor: number[][]; // Array of descriptors
  Foto_Wajah: string; // Base64 image
  Tanggal_Register: string;
}

export interface Location {
  ID_LOKASI: string;
  Nama_Lokasi: string;
  Latitude: number;
  Longitude: number;
  Radius_Meter: number;
  Status: 'Aktif' | 'Nonaktif';
}

export interface Shift {
  ID_SHIFT: string;
  Nama_Shift: string; // e.g., "Shift Pagi", "Shift Siang", "Shift Malam"
  Jam_Masuk: string;  // e.g., "07:30"
  Jam_Pulang: string; // e.g., "16:00"
}

export interface Attendance {
  ID_ABSEN: string;
  Tanggal: string; // YYYY-MM-DD
  ID_USER: string;
  Nama: string;
  Jam_Masuk: string;
  Jam_Pulang: string;
  Status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpha' | 'Dinas Luar';
  Latitude: number;
  Longitude: number;
  Jarak: number; // in meters
  Foto_Masuk: string; // Base64
  Foto_Pulang: string; // Base64
  ID_SHIFT?: string; // Opt shift association
  Nama_Shift?: string;
}

export interface IzinRequest {
  ID_IZIN: string;
  ID_USER: string;
  Nama: string;
  Tanggal: string;
  Jenis: 'Izin' | 'Sakit' | 'Cuti' | 'Dinas Luar';
  Alasan: string;
  Lampiran: string; // base64 or link text
  Status: 'Pending' | 'Disetujui' | 'Ditolak';
}

export interface ActivityLog {
  ID_LOG: string;
  Tanggal: string;
  User: string; // Email or name
  Aktivitas: string;
  IP_Address: string;
}

export interface SettingItem {
  Nama_Setting: string;
  Nilai: string;
}

export interface AppSettings {
  Jam_Masuk: string;      // e.g., "07:30"
  Jam_Pulang: string;     // e.g., "16:00"
  Radius_Default: number; // e.g., 100
  Toleransi_Terlambat: number; // in minutes, e.g., 15
  Nama_Sekolah?: string;
  Nama_Yayasan?: string;
  Logo_Url?: string;
}
