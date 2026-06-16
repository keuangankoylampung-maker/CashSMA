/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GASFile {
  name: string;
  description: string;
  content: string;
}

export const GOOGLE_SHEET_SCHEMA = [
  {
    sheetName: "Pengguna",
    columns: ["ID_USER", "NIP_NIS", "Nama", "JK", "Jabatan", "Unit", "Email", "Password", "Role", "Status"],
    description: "Menyimpan data pengguna (Admin, Operator, Guru, Pegawai, Siswa, Kepala Sekolah)."
  },
  {
    sheetName: "Data_Wajah",
    columns: ["ID_FACE", "ID_USER", "Face_Descriptor", "Foto_Wajah", "Tanggal_Register"],
    description: "Menyimpan data embedding / descriptor koordinat wajah hasil olahan face-api.js dan foto utama."
  },
  {
    sheetName: "Lokasi",
    columns: ["ID_LOKASI", "Nama_Lokasi", "Latitude", "Longitude", "Radius_Meter", "Status"],
    description: "Menyimpan unit kerja atau sekolah sebagai titik geofence absensi."
  },
  {
    sheetName: "Absensi",
    columns: ["ID_ABSEN", "Tanggal", "ID_USER", "Nama", "Jam_Masuk", "Jam_Pulang", "Status", "Latitude", "Longitude", "Jarak", "Foto_Masuk", "Foto_Pulang"],
    description: "Menyimpan record data kehadiran pegawai maupun siswa secara real-time."
  },
  {
    sheetName: "Izin",
    columns: ["ID_IZIN", "ID_USER", "Nama", "Tanggal", "Jenis", "Alasan", "Lampiran", "Status"],
    description: "Menyimpan form permohonan izin (Sakit, Cuti, Izin, Dinas Luar) beserta status persetujuan."
  },
  {
    sheetName: "Log_Aktivitas",
    columns: ["ID_LOG", "Tanggal", "User", "Aktivitas", "IP_Address"],
    description: "Audit Trail log audit system keamanan."
  },
  {
    sheetName: "Pengaturan",
    columns: ["Nama_Setting", "Nilai"],
    description: "Penyimpanan konfigurasi global jam kerja reguler, radius toleransi default, dll."
  }
];

export const GAS_FILES: GASFile[] = [
  {
    name: "Setup.gs",
    description: "Script SETUP Database Otomatis - Jalankan script ini SEKALI saja dari Google Apps Script untuk membuat, menamai 7 halaman sheet, menyusun kolom-kolom, dan memoles warnanya secara otomatis dalam 2 detik.",
    content: `/**
 * Google Apps Script - Setup Database Otomatis
 * File: Setup.gs
 * 
 * =========================================================================
 * CARA MENGGUNAKAN SCRIPT SETUP OTOMATIS:
 * 1. Buka Google Spreadsheet baru (kosong).
 * 2. Klik menu 'Ekstensi' > 'Apps Script' pada toolbar Spreadsheet Anda.
 * 3. Hapus kode bawaan yang kosong, buat file baru dinamai 'Setup.gs' 
 *    dan tempelkan seluruh script ini di dalamnya.
 * 4. Buat file-file script lainnya (seperti Code.gs, API.gs, dll) sesuai modul tab lainnya.
 * 5. Pilih fungsi 'setupDatabaseSheets' di dropdown toolbar atas Apps Script,
 *    lalu klik tombol 'Run' (Jalankan).
 * 6. Setujui dialog izin/otorisasi akun Google Anda (klik Advanced > Go to Safe).
 * 7. Selamat! Ke-7 lembar (tabs) database absen wajah Anda terbentuk rapi dalam sekejap!
 * =========================================================================
 */

function setupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var schema = [
    {
      name: "Pengguna",
      columns: ["ID_USER", "NIP_NIS", "Nama", "JK", "Jabatan", "Unit", "Email", "Password", "Role", "Status"],
      description: "Menyimpan data pengguna (Admin, Operator, Guru, Pegawai, Siswa, Kepala Sekolah)."
    },
    {
      name: "Data_Wajah",
      columns: ["ID_FACE", "ID_USER", "Face_Descriptor", "Foto_Wajah", "Tanggal_Register"],
      description: "Menyimpan data embedding / descriptor koordinat wajah hasil olahan face-api.js dan foto utama."
    },
    {
      name: "Lokasi",
      columns: ["ID_LOKASI", "Nama_Lokasi", "Latitude", "Longitude", "Radius_Meter", "Status"],
      description: "Menyimpan unit kerja atau sekolah sebagai titik geofence absensi."
    },
    {
      name: "Absensi",
      columns: ["ID_ABSEN", "Tanggal", "ID_USER", "Nama", "Jam_Masuk", "Jam_Pulang", "Status", "Latitude", "Longitude", "Jarak", "Foto_Masuk", "Foto_Pulang"],
      description: "Menyimpan record data kehadiran pegawai maupun siswa secara real-time."
    },
    {
      name: "Izin",
      columns: ["ID_IZIN", "ID_USER", "Nama", "Tanggal", "Jenis", "Alasan", "Lampiran", "Status"],
      description: "Menyimpan form permohonan izin (Sakit, Cuti, Izin, Dinas Luar) beserta status persetujuan."
    },
    {
      name: "Log_Aktivitas",
      columns: ["ID_LOG", "Tanggal", "User", "Aktivitas", "IP_Address"],
      description: "Audit Trail log audit system keamanan."
    },
    {
      name: "Pengaturan",
      columns: ["Nama_Setting", "Nilai"],
      description: "Penyimpanan konfigurasi global jam kerja reguler, radius toleransi default, dll."
    }
  ];
  
  schema.forEach(function(item) {
    var sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    } else {
      sheet.clear();
    }
    
    // Tulis Header Kolom
    sheet.getRange(1, 1, 1, item.columns.length).setValues([item.columns]);
    
    // Styling Kolom Header (Warna Hijau Emerald Premium)
    var headerRange = sheet.getRange(1, 1, 1, item.columns.length);
    headerRange
      .setBackground("#059669") // Emerald-600
      .setFontColor("#FFFFFF") // Putih bersih
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setFontFamily("Arial")
      .setFontSize(10);
      
    // Set auto width columns
    try {
      sheet.autoResizeColumns(1, item.columns.length);
    } catch(e) {}
    
    // Inisialisasi default settings
    if (item.name === "Pengaturan") {
      var defaultSettings = [
        ["Jam_Masuk", "07:30"],
        ["Jam_Pulang", "15:00"],
        ["Toleransi_Terlambat", "15"],
        ["Radius_Default", "100"]
      ];
      defaultSettings.forEach(function(sRow, idx) {
        sheet.getRange(idx + 2, 1).setValue(sRow[0]);
        sheet.getRange(idx + 2, 2).setValue(sRow[1]);
      });
      try { sheet.autoResizeColumns(1, 2); } catch(err) {}
    }
    
    // Inisialisasi akun Administrator bawaan & Staff Contoh agar siap dimainkan
    if (item.name === "Pengguna") {
      var sampleUsers = [
        [
          "USR_ADMIN_1",
          "1000000000000000",
          "Keuangan Koy",
          "Laki-laki",
          "System Administrator",
          "Kantor Pusat",
          "keuangankoylampung@gmail.com",
          "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f", // SHA-256 hash default
          "Admin",
          "Aktif"
        ],
        [
          "USR_GURU_1",
          "197604122002121003",
          "Budi Santoso",
          "Laki-laki",
          "Wakil Kepala Sekolah",
          "SMP Negeri 1",
          "budi@sekolah.id",
          "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
          "Guru",
          "Aktif"
        ]
      ];
      sheet.getRange(2, 1, sampleUsers.length, item.columns.length).setValues(sampleUsers);
      try { sheet.autoResizeColumns(1, item.columns.length); } catch(err) {}
    }
  });
  
  // Hapus lembar default "Sheet1" jika ada agar rapi
  var defSheet1 = ss.getSheetByName("Sheet1");
  var defSheet2 = ss.getSheetByName("Sheet 1");
  if (defSheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defSheet1); } catch(e) {}
  }
  if (defSheet2 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defSheet2); } catch(e) {}
  }
  
  var ui = SpreadsheetApp.getUi();
  ui.alert("Berhasil!", "🎉 Semua 7 lembar sheet database absensi wajah telah berhasil dikonstruksikan otomatis secara sempurna! Anda kini dapat melanjutkan mengunggah Kode Apps Script API lainnya.", ui.ButtonSet.OK);
}
`
  },
  {
    name: "Code.gs",
    description: "Entry point utama Google Apps Script Web App untuk melayani router, serving static html, dan sinkronisasi API eksternal.",
    content: `/**
 * Google Apps Script Web App - Entry Point & REST API Router
 * File: Code.gs
 */

function doGet(e) {
  var page = e.parameter.page || 'Login';
  var template = HtmlService.createTemplateFromFile(page);
  
  // Custom metadata & responsive viewports
  return template.evaluate()
    .setTitle("Sheet Face Absensi Portal")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Helper untuk menyertakan file HTML lain (CSS / JS Modular)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Global Database Connection
 */
function getSpreadsheet() {
  var SHEET_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || SpreadsheetApp.getActiveSpreadsheet().getId();
  return SpreadsheetApp.openById(SHEET_ID);
}

/**
 * POST Web API Request Processor (CORS-Enabled)
 * Menjangkau aplikasi React untuk sinkronisasi dua arah yang lancar.
 */
function doPost(e) {
  var response;
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    var ss = getSpreadsheet();
    
    if (action === "test") {
      response = { 
        success: true, 
        message: "Koneksi Berhasil! Google Spreadsheet Anda (" + ss.getName() + ") telah terhubung secara realtime." 
      };
    } else if (action === "getData") {
      response = {
        success: true,
        pengguna: getRowsData(ss.getSheetByName("Pengguna")),
        data_wajah: retrieveFaceRegistry(),
        lokasi: getRowsData(ss.getSheetByName("Lokasi")),
        absensi: getRowsData(ss.getSheetByName("Absensi")),
        izin: getRowsData(ss.getSheetByName("Izin")),
        log_aktivitas: getRowsData(ss.getSheetByName("Log_Aktivitas")),
        pengaturan: getRowsData(ss.getSheetByName("Pengaturan"))
      };
    } else if (action === "syncData") {
      // Sync incoming items to sheet
      if (params.pengguna && params.pengguna.length > 0) {
        syncPengguna(ss, params.pengguna);
      }
      if (params.lokasi && params.lokasi.length > 0) {
        syncLokasi(ss, params.lokasi);
      }
      if (params.absensi && params.absensi.length > 0) {
        syncAbsensi(ss, params.absensi);
      }
      if (params.izin && params.izin.length > 0) {
        syncIzin(ss, params.izin);
      }
      if (params.data_wajah && params.data_wajah.length > 0) {
        syncDataWajah(ss, params.data_wajah);
      }
      if (params.settings) {
        syncSettings(ss, params.settings);
      }
      
      response = {
        success: true,
        message: "Sinkronisasi dua-arah berhasil diselesaikan!",
        pengguna: getRowsData(ss.getSheetByName("Pengguna")),
        data_wajah: retrieveFaceRegistry(),
        lokasi: getRowsData(ss.getSheetByName("Lokasi")),
        absensi: getRowsData(ss.getSheetByName("Absensi")),
        izin: getRowsData(ss.getSheetByName("Izin")),
        log_aktivitas: getRowsData(ss.getSheetByName("Log_Aktivitas")),
        pengaturan: getRowsData(ss.getSheetByName("Pengaturan"))
      };
    } else if (action === "submitAbsen") {
      response = submitAbsensi(params.idUser, params.userName, params.latitude, params.longitude, params.selfieBase64, params.isMasuk, params.ipAddress);
    } else if (action === "submitIzin") {
      response = submitIzinOnline(params.idUser, params.nama, params.tanggal, params.jenis, params.alasan, params.lampiranBase64);
    } else if (action === "saveFace") {
      response = saveFaceRegistration(params.idUser, params.descriptorsArray, params.facePhotoBase64);
    } else {
      response = { success: false, error: "Action '" + action + "' tidak dikenali." };
    }
  } catch (err) {
    response = { success: false, error: "Gagal memproses request: " + err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// === SYNCHRONIZATION HELPERS ===

function syncPengguna(ss, localUsers) {
  var sheet = ss.getSheetByName("Pengguna");
  var dbUsers = getRowsData(sheet);
  
  localUsers.forEach(function(localUser) {
    var existsIdx = dbUsers.findIndex(function(db) { return db.ID_USER.toString() === localUser.ID_USER.toString(); });
    if (existsIdx === -1) {
      appendRowData("Pengguna", localUser);
    } else {
      updateRowData("Pengguna", localUser.ID_USER, localUser);
    }
  });
}

function syncLokasi(ss, localLocations) {
  var sheet = ss.getSheetByName("Lokasi");
  var dbLocs = getRowsData(sheet);
  
  localLocations.forEach(function(localLoc) {
    var existsIdx = dbLocs.findIndex(function(db) { return db.ID_LOKASI.toString() === localLoc.ID_LOKASI.toString(); });
    if (existsIdx === -1) {
      appendRowData("Lokasi", localLoc);
    } else {
      updateRowData("Lokasi", localLoc.ID_LOKASI, localLoc);
    }
  });
}

function syncAbsensi(ss, localAbs) {
  var sheet = ss.getSheetByName("Absensi");
  var dbAbs = getRowsData(sheet);
  
  localAbs.forEach(function(localA) {
    var existsIdx = dbAbs.findIndex(function(db) { return db.ID_ABSEN.toString() === localA.ID_ABSEN.toString(); });
    if (existsIdx === -1) {
      appendRowData("Absensi", localA);
    } else {
      updateRowData("Absensi", localA.ID_ABSEN, localA);
    }
  });
}

function syncIzin(ss, localIzin) {
  var sheet = ss.getSheetByName("Izin");
  var dbIzin = getRowsData(sheet);
  
  localIzin.forEach(function(localI) {
    var existsIdx = dbIzin.findIndex(function(db) { return db.ID_IZIN.toString() === localI.ID_IZIN.toString(); });
    if (existsIdx === -1) {
      appendRowData("Izin", localI);
    } else {
      updateRowData("Izin", localI.ID_IZIN, localI);
    }
  });
}

function syncDataWajah(ss, localFaces) {
  var sheet = ss.getSheetByName("Data_Wajah");
  var dbFaces = getRowsData(sheet);
  
  localFaces.forEach(function(f) {
    var existsIdx = dbFaces.findIndex(function(db) { return db.ID_USER.toString() === f.ID_USER.toString(); });
    if (existsIdx === -1) {
      var doc = {
        ID_FACE: f.ID_FACE || ("FCE_" + new Date().getTime() + Math.floor(Math.random()*100)),
        ID_USER: f.ID_USER,
        Face_Descriptor: typeof f.Face_Descriptor === 'string' ? f.Face_Descriptor : JSON.stringify(f.Face_Descriptor),
        Foto_Wajah: f.Foto_Wajah,
        Tanggal_Register: f.Tanggal_Register || new Date().toISOString()
      };
      appendRowData("Data_Wajah", doc);
    } else {
      var rowNum = existsIdx + 2;
      sheet.getRange(rowNum, 3).setValue(typeof f.Face_Descriptor === 'string' ? f.Face_Descriptor : JSON.stringify(f.Face_Descriptor));
      sheet.getRange(rowNum, 4).setValue(f.Foto_Wajah);
      sheet.getRange(rowNum, 5).setValue(f.Tanggal_Register || new Date().toISOString());
    }
  });
}

function syncSettings(ss, localSettings) {
  var sheet = ss.getSheetByName("Pengaturan");
  var defaultSettings = [
    ["Jam_Masuk", localSettings.Jam_Masuk],
    ["Jam_Pulang", localSettings.Jam_Pulang],
    ["Toleransi_Terlambat", localSettings.Toleransi_Terlambat ? localSettings.Toleransi_Terlambat.toString() : "15"],
    ["Radius_Default", localSettings.Radius_Default ? localSettings.Radius_Default.toString() : "100"]
  ];
  
  defaultSettings.forEach(function(sRow) {
    updateRowSetting(sheet, sRow[0], sRow[1]);
  });
}

function updateRowSetting(sheet, key, value) {
  var rows = sheet.getLastRow();
  if (rows < 2) return;
  var keys = sheet.getRange(2, 1, rows - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i][0].toString() === key) {
      sheet.getRange(i + 2, 2).setValue(value);
      return;
    }
  }
}
`
  },
  {
    name: "API.gs",
    description: "Modul manipulasi Google Spreadsheet (CRUD engine) yang mengekspos pemanggilan api internal antara frontend dan Google Sheet.",
    content: `/**
 * Google Apps Script Web App - API Engine
 * File: API.gs
 */

// Format data baris sheet menjadi serializable JSON Object
function getRowsData(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (sheet.getLastRow() < 2) return [];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  
  return rows.map(function(row) {
    var obj = {};
    headers.forEach(function(header, idx) {
      obj[header] = row[idx];
    });
    return obj;
  });
}

// Menambahkan data baris baru ke sheet spesifik
function appendRowData(sheetName, dataObject) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = headers.map(function(header) {
    return dataObject[header] !== undefined ? dataObject[header] : "";
  });
  sheet.appendRow(newRow);
  return { success: true };
}

// Mengupdate baris berdasar Unique Identifier (ID kolom pertama)
function updateRowData(sheetName, idValue, dataObject) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = getRowsData(sheet);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  for (var i = 0; i < data.length; i++) {
    var currentId = sheet.getRange(i + 2, 1).getValue().toString();
    if (currentId === idValue.toString()) {
      headers.forEach(function(header, colIdx) {
        if (dataObject[header] !== undefined) {
          sheet.getRange(i + 2, colIdx + 1).setValue(dataObject[header]);
        }
      });
      return { success: true };
    }
  }
  return { success: false, error: "Data dengan ID " + idValue + " tidak ditemukan." };
}

// Menghapus baris berdasarkan ID
function deleteRowData(sheetName, idValue) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: false, error: "Sheet kosong." };
  
  for (var i = 2; i <= lastRow; i++) {
    var currentId = sheet.getRange(i, 1).getValue().toString();
    if (currentId === idValue.toString()) {
      sheet.deleteRow(i);
      return { success: true };
    }
  }
  return { success: false, error: "ID tidak ditemukan." };
}
`
  },
  {
    name: "Auth.gs",
    description: "Modul pengolahan autentikasi, enkripsi password algoritma SHA-256, verifikasi session digital, dan pencatatan log audit sistem.",
    content: `/**
 * Google Apps Script Web App - Autentikasi dan Keamanan
 * File: Auth.gs
 */

// Enkripsi string ke SHA-256 untuk keamanan data password
function hashPassword(password) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  var output = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteString = byteVal.toString(16);
    if (byteString.length == 1) byteString = '0' + byteString;
    output += byteString;
  }
  return output;
}

// Autentikasi user saat melakukan Login
function doLogin(email, password, ipAddress) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Pengguna");
    var users = getRowsData(sheet);
    
    var hashedPassword = hashPassword(password);
    var foundUser = users.find(function(user) {
      return user.Email.toLowerCase() === email.toLowerCase() && user.Password === hashedPassword;
    });
    
    if (foundUser) {
      if (foundUser.Status !== "Aktif") {
        return { success: false, message: "Akun Anda dinonaktifkan oleh Admin." };
      }
      
      // Hapus kolom password untuk keamanan transmisi data
      var userPayload = Object.assign({}, foundUser);
      delete userPayload.Password;
      
      // Tulis Log Aktivitas
      writeLog(foundUser.Email, "Login berhasil", ipAddress || "0.0.0.0");
      
      return { success: true, user: userPayload };
    } else {
      writeLog(email, "Gagal Login (Password salah/Email tidak terdaftar)", ipAddress || "0.0.0.0");
      return { success: false, message: "Email atau Password Anda salah." };
    }
  } catch (error) {
    return { success: false, message: "Kesalahan server: " + error.toString() };
  }
}

// Registrasi pengguna baru sekaligus hash password otomatis
function registerNewUser(userDoc) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("Pengguna");
  var users = getRowsData(sheet);
  
  // Periksa apakah email sudah terdaftar
  var isExist = users.some(function(u) {
    return u.Email.toLowerCase() === userDoc.Email.toLowerCase();
  });
  
  if (isExist) {
    return { success: false, error: "Email sudah terdaftar di sistem." };
  }
  
  // Enkripsi pass
  if (userDoc.Password) {
    userDoc.Password = hashPassword(userDoc.Password);
  }
  
  userDoc.ID_USER = "USR_" + new Date().getTime();
  userDoc.Status = "Aktif";
  
  return appendRowData("Pengguna", userDoc);
}

// Tulis riwayat audit ke Log_Aktivitas
function writeLog(user, aktivitas, ipAddress) {
  try {
    var logDoc = {
      ID_LOG: "LOG_" + new Date().getTime() + Math.floor(Math.random() * 100),
      Tanggal: new Date().toISOString(),
      User: user,
      Aktivitas: aktivitas,
      IP_Address: ipAddress || "127.0.0.1"
    };
    appendRowData("Log_Aktivitas", logDoc);
  } catch(e) {
    console.error("Gagal mencatat log", e);
  }
}
`
  },
  {
    name: "Absensi.gs",
    description: "Mesin utama pencatatan absensi masuk/pulang, validasi Geofencing GPS menggunakan kalkulasi Haversine, dan konfirmasi validitas kehadiran.",
    content: `/**
 * Google Apps Script Web App - Fitur Absensi dan GPS Haversine
 * File: Absensi.gs
 */

// Rumus Haversine menghitung jarak antara 2 koordinat (meter)
function computeDistance(lat1, lon1, lat2, lon2) {
  var R = 6371000; // Radius bumi dalam meter
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return Math.round(d); // Bulatkan dalam meter
}

// Proses Absensi Masuk dan Pulang Terintegrasi
function submitAbsensi(idUser, userName, latitude, longitude, selfieBase64, isMasuk, ipAddress) {
  try {
    var ss = getSpreadsheet();
    var now = new Date();
    // Konversi tanggal format lokal YYYY-MM-DD
    var dateString = now.getFullYear() + "-" + 
                     ("0" + (now.getMonth() + 1)).slice(-2) + "-" + 
                     ("0" + now.getDate()).slice(-2);
    
    var timeString = ("0" + now.getHours()).slice(-2) + ":" + 
                     ("0" + now.getMinutes()).slice(-2) + ":" + 
                     ("0" + now.getSeconds()).slice(-2);
    
    // 1. Ambil setting regulasi
    var settingsSheet = ss.getSheetByName("Pengaturan");
    var settingsData = getRowsData(settingsSheet);
    var settings = {};
    settingsData.forEach(function(item) {
      settings[item.Nama_Setting] = item.Nilai;
    });
    
    var jamMasukBatasan = settings["Jam_Masuk"] || "07:30";
    var toleransiMenit = parseInt(settings["Toleransi_Terlambat"] || "15", 10);
    var maxRadius = parseInt(settings["Radius_Default"] || "100", 10);
    
    // 2. Ambil Geofence Unit Kerja User
    var userSheet = ss.getSheetByName("Pengguna");
    var users = getRowsData(userSheet);
    var foundUser = users.find(function(u) { return u.ID_USER === idUser; });
    if (!foundUser) return { success: false, message: "Data pengguna tidak valid." };
    
    var lokasiSheet = ss.getSheetByName("Lokasi");
    var lokasiList = getRowsData(lokasiSheet);
    
    // Temukan koordinat lokasi absensi berdasarkan unit kerja pengguna
    var unitKerja = foundUser.Unit;
    var targetLocation = lokasiList.find(function(l) {
      return l.Nama_Lokasi.toLowerCase() === unitKerja.toLowerCase() && l.Status === "Aktif";
    });
    
    // Fallback jika tidak ada lokasi spesifik, pakai lokasi pertama yang aktif
    if (!targetLocation) {
      targetLocation = lokasiList.find(function(l) { return l.Status === "Aktif"; });
    }
    
    if (!targetLocation) {
      return { success: false, message: "Lokasi kerja aktif tidak terkonfigurasi. Hubungi Admin." };
    }
    
    // Hitung jarak Haversine
    var jarakMeter = computeDistance(
      parseFloat(latitude), 
      parseFloat(longitude), 
      parseFloat(targetLocation.Latitude), 
      parseFloat(targetLocation.Longitude)
    );
    
    var radiusKerja = parseInt(targetLocation.Radius_Meter || maxRadius, 10);
    if (jarakMeter > radiusKerja) {
      writeLog(foundUser.Email, "Gagal absensi: Di luar radius ("+jarakMeter+"m dari "+targetLocation.Nama_Lokasi+")", ipAddress);
      return { 
        success: false, 
        message: "Anda berada di luar area absensi. Jarak Anda " + jarakMeter + " meter dari " + targetLocation.Nama_Lokasi + " (Maksimum radius " + radiusKerja + " meter)." 
      };
    }
    
    // 3. Load record absensi hari ini biar aman dari repeat-checking
    var absensiSheet = ss.getSheetByName("Absensi");
    var absensiRecords = getRowsData(absensiSheet);
    
    var todayRecordIndex = -1;
    for (var i = 2; i <= absensiSheet.getLastRow(); i++) {
      var rIdUser = absensiSheet.getRange(i, 3).getValue().toString();
      var rTanggal = absensiSheet.getRange(i, 2).getValue().toString();
      
      // Handle format Tanggal GAS (Date / String)
      if (rTanggal instanceof Date) {
        rTanggal = rTanggal.getFullYear() + "-" + 
                   ("0" + (rTanggal.getMonth() + 1)).slice(-2) + "-" + 
                   ("0" + rTanggal.getDate()).slice(-2);
      } else {
        rTanggal = rTanggal.substring(0, 10);
      }
      
      if (rIdUser === idUser && rTanggal === dateString) {
        todayRecordIndex = i;
        break;
      }
    }
    
    if (isMasuk) {
      // Absensi MASUK
      if (todayRecordIndex !== -1) {
        return { success: false, message: "Karyawan sudah tercatat melakukan absensi MASUK hari ini." };
      }
      
      // Definisikan status keterlambatan
      var statusHadir = "Hadir";
      var jamKerjaParts = jamMasukBatasan.split(":");
      var jamBatas = parseInt(jamKerjaParts[0], 10) * 60 + parseInt(jamKerjaParts[1] || "0", 10);
      
      var clockInSecs = now.getHours() * 60 + now.getMinutes();
      if (clockInSecs > (jamBatas + toleransiMenit)) {
        statusHadir = "Terlambat";
      }
      
      var newAbsen = {
        ID_ABSEN: "ABS_" + now.getTime() + "_" + idUser,
        Tanggal: dateString,
        ID_USER: idUser,
        Nama: userName,
        Jam_Masuk: timeString,
        Jam_Pulang: "",
        Status: statusHadir,
        Latitude: latitude,
        Longitude: longitude,
        Jarak: jarakMeter,
        Foto_Masuk: selfieBase64,
        Foto_Pulang: ""
      };
      
      appendRowData("Absensi", newAbsen);
      writeLog(foundUser.Email, "Absen MASUK berhasil. Jarak " + jarakMeter + "m [" + statusHadir + "]", ipAddress);
      return { success: true, message: "Absen MASUK berhasil dicatat pada " + timeString + " dengan Status: " + statusHadir + "." };
      
    } else {
      // Absensi PULANG
      if (todayRecordIndex === -1) {
        return { success: false, message: "Anda tidak bisa melakukan absensi PULANG karena belum tercatat absensi MASUK hari ini." };
      }
      
      var currentPulang = absensiSheet.getRange(todayRecordIndex, 6).getValue();
      if (currentPulang && currentPulang !== "") {
        return { success: false, message: "Anda sudah melakukan absensi PULANG hari ini." };
      }
      
      // Update baris absensi masuk dengan jam pulang, lokasi, dan foto pulang
      absensiSheet.getRange(todayRecordIndex, 6).setValue(timeString);
      absensiSheet.getRange(todayRecordIndex, 12).setValue(selfieBase64); // Foto Pulang
      
      writeLog(foundUser.Email, "Absen PULANG berhasil. Jarak " + jarakMeter + "m", ipAddress);
      return { success: true, message: "Absen PULANG berhasil dicatat pada pukul " + timeString + "." };
    }
    
  } catch (err) {
    return { success: false, message: "Proses absensi gagal: " + err.toString() };
  }
}

// Mengajukan form Izin, Sakit, Cuti Online
function submitIzinOnline(idUser, nama, tanggal, jenis, alasan, lampiranBase64) {
  try {
    var idIzin = "IZN_" + new Date().getTime();
    var info = {
      ID_IZIN: idIzin,
      ID_USER: idUser,
      Nama: nama,
      Tanggal: tanggal,
      Jenis: jenis,
      Alasan: alasan,
      Lampiran: lampiranBase64 || "",
      Status: "Pending" // Menunggu keputusan persetujuan Admin
    };
    appendRowData("Izin", info);
    
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName("Pengguna");
    var users = getRowsData(userSheet);
    var targetUser = users.find(function(u) { return u.ID_USER === idUser; });
    var email = targetUser ? targetUser.Email : "Unknown";
    
    writeLog(email, "Mengajukan permohonan " + jenis + " tanggal " + tanggal, "Browser API");
    return { success: true, message: "Form pengajuan " + jenis + " berhasil diajukan dan sedang diproses." };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}
`
  },
  {
    name: "FaceRecognition.gs",
    description: "Modul pendaftaran koordinat descriptor biometric wajah (5 landmark arrays) dan verifikasi model pencocokan embedding wajah.",
    content: `/**
 * Google Apps Script Web App - Biometric Face Database
 * File: FaceRecognition.gs
 */

// Simpan dataset registrasi wajah baru ke Sheet Data_Wajah
function saveFaceRegistration(idUser, descriptorsArray, facePhotoBase64) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Wajah");
    var faceList = getRowsData(sheet);
    
    // Periksa apakah user sudah meregistrasikan wajah sebelumnya
    var existingIndex = -1;
    for (var i = 2; i <= sheet.getLastRow(); i++) {
      if (sheet.getRange(i, 2).getValue().toString() === idUser.toString()) {
        existingIndex = i;
        break;
      }
    }
    
    var dateReg = new Date().toISOString();
    var doc = {
      ID_FACE: "FCE_" + new Date().getTime(),
      ID_USER: idUser,
      Face_Descriptor: JSON.stringify(descriptorsArray), // Simpan format String JSON
      Foto_Wajah: facePhotoBase64,
      Tanggal_Register: dateReg
    };
    
    if (existingIndex !== -1) {
      // Jika sudah ada, tindih datanya untuk melakukan registrasi ulang
      sheet.getRange(existingIndex, 3).setValue(JSON.stringify(descriptorsArray));
      sheet.getRange(existingIndex, 4).setValue(facePhotoBase64);
      sheet.getRange(existingIndex, 5).setValue(dateReg);
    } else {
      appendRowData("Data_Wajah", doc);
    }
    
    // Update data log
    var userSheet = ss.getSheetByName("Pengguna");
    var uData = getRowsData(userSheet);
    var foundU = uData.find(function(user) { return user.ID_USER === idUser; });
    if (foundU) {
      writeLog(foundU.Email, "Registrasi / Training wajah berhasil", "Browser Biometric");
    }
    
    return { success: true, message: "Registrasi Biometrik wajah Anda berhasil disimpan." };
  } catch (error) {
    return { success: false, message: "Gagal menyimpan biometrik wajah: " + error.toString() };
  }
}

// Mendapatkan data descriptor wajah terdaftar untuk seluruh pengguna aktif
function retrieveFaceRegistry() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Wajah");
    var rawData = getRowsData(sheet);
    
    return rawData.map(function(item) {
      return {
        ID_FACE: item.ID_FACE,
        ID_USER: item.ID_USER,
        Face_Descriptor: JSON.parse(item.Face_Descriptor), // Parse kembali ke Float Array
        Foto_Wajah: item.Foto_Wajah,
        Tanggal_Register: item.Tanggal_Register
      };
    });
  } catch (e) {
    return [];
  }
}
`
  },
  {
    name: "Report.gs",
    description: "Utilitas penyusunan filter laporan rekap absensi, penyajian format laporan tsv/csv dinamis, dan kalkulasi statistik kehadiran.",
    content: `/**
 * Google Apps Script Web App - Pelaporan dan Statistik
 * File: Report.gs
 */

// Ambil statistik absensi real-time hari ini untuk chart visual
function fetchTodayStats() {
  try {
    var ss = getSpreadsheet();
    var now = new Date();
    var dateString = now.getFullYear() + "-" + 
                     ("0" + (now.getMonth() + 1)).slice(-2) + "-" + 
                     ("0" + now.getDate()).slice(-2);
    
    var absSheet = ss.getSheetByName("Absensi");
    var records = getRowsData(absSheet).filter(function(r) {
      // Ambil string tanggal YYYY-MM-DD
      var reqTgl = r.Tanggal;
      if (reqTgl instanceof Date) {
        reqTgl = reqTgl.getFullYear() + "-" + 
                 ("0" + (reqTgl.getMonth() + 1)).slice(-2) + "-" + 
                 ("0" + reqTgl.getDate()).slice(-2);
      } else {
        reqTgl = reqTgl.substring(0, 10);
      }
      return reqTgl === dateString;
    });
    
    var userSheet = ss.getSheetByName("Pengguna");
    var totalPegawaiSiswa = getRowsData(userSheet).filter(function(u) { return u.Status === "Aktif" && u.Role !== "Admin"; }).length;
    
    var stats = {
      hadir: records.filter(function(r) { return r.Status === "Hadir"; }).length,
      terlambat: records.filter(function(r) { return r.Status === "Terlambat"; }).length,
      izin: records.filter(function(r) { return r.Status === "Izin"; }).length,
      sakit: records.filter(function(r) { return r.Status === "Sakit"; }).length,
      dinas_luar: records.filter(function(r) { return r.Status === "Dinas Luar"; }).length,
      total_user: totalPegawaiSiswa
    };
    
    stats.alpha = Math.max(0, totalPegawaiSiswa - (stats.hadir + stats.terlambat + stats.izin + stats.sakit + stats.dinas_luar));
    return stats;
    
  } catch (e) {
    return { hadir: 0, terlambat: 0, izin: 0, sakit: 0, dinas_luar: 0, alpha: 0, total_user: 0 };
  }
}

// Generate link spreadsheet untuk download laporan Excel format .csv / Web Viewable Sheet
function generateReportData(filterType, filterValue, unitFilter) {
  var ss = getSpreadsheet();
  var absSheet = ss.getSheetByName("Absensi");
  var userSheet = ss.getSheetByName("Pengguna");
  
  var users = getRowsData(userSheet);
  var absRecords = getRowsData(absSheet);
  
  // Hubungkan data absensi dengan profile unit kerja user
  var fullRecords = absRecords.map(function(item) {
    var u = users.find(function(user) { return user.ID_USER === item.ID_USER; });
    var doc = Object.assign({}, item);
    doc.Unit = u ? u.Unit : "-";
    doc.Role = u ? u.Role : "-";
    doc.Jabatan = u ? u.Jabatan : "-";
    return doc;
  });
  
  // Filter Data
  return fullRecords.filter(function(r) {
    var matchUnit = true;
    if (unitFilter && unitFilter !== "" && unitFilter !== "Semua") {
      matchUnit = r.Unit.toLowerCase() === unitFilter.toLowerCase();
    }
    
    var matchPeriod = true;
    var dates = r.Tanggal;
    if (dates instanceof Date) {
      dates = dates.getFullYear() + "-" + 
              ("0" + (dates.getMonth() + 1)).slice(-2) + "-" + 
              ("0" + dates.getDate()).slice(-2);
    } else {
      dates = dates.substring(0, 10);
    }
    
    if (filterType === "hari") {
      matchPeriod = dates === filterValue;
    } else if (filterType === "bulan") {
      // filterValue: YYYY-MM
      matchPeriod = dates.substring(0, 7) === filterValue;
    } else if (filterType === "tahun") {
      matchPeriod = dates.substring(0, 4) === filterValue;
    } else if (filterType === "pegawai") {
      matchPeriod = r.ID_USER === filterValue;
    }
    
    return matchUnit && matchPeriod;
  });
}
`
  }
];
