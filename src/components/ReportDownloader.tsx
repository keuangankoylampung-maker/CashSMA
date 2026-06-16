/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Attendance, User } from '../types';
import { Download, FileText, Printer } from 'lucide-react';

interface ReportDownloaderProps {
  records: Attendance[];
  users: User[];
  filterType: 'hari' | 'bulan' | 'tahun' | 'pegawai' | 'unit';
  filterValue: string;
  selectedUnit: string;
}

export default function ReportDownloader({
  records,
  users,
  filterType,
  filterValue,
  selectedUnit,
}: ReportDownloaderProps) {
  
  // Export structured Excel-compliant CSV Table
  const exportToExcelCSV = () => {
    // Columns to define header
    const headers = [
      'ID Absen',
      'Tanggal',
      'ID User',
      'NIP/NIS',
      'Nama Karyawan',
      'Jabatan',
      'Unit Kerja',
      'Jam Masuk',
      'Jam Pulang',
      'Status Kehadiran',
      'Latitude',
      'Longitude',
      'Jarak Geofence (Meter)'
    ];

    const csvRows = [headers.join(',')];

    records.forEach(r => {
      const u = users.find(user => user.ID_USER === r.ID_USER);
      const row = [
        `"${r.ID_ABSEN}"`,
        `"${r.Tanggal}"`,
        `"${r.ID_USER}"`,
        `"${u?.NIP_NIS || '-'}"`,
        `"${r.Nama}"`,
        `"${u?.Jabatan || '-'}"`,
        `"${u?.Unit || '-'}"`,
        `"${r.Jam_Masuk || '-'}"`,
        `"${r.Jam_Pulang || '-'}"`,
        `"${r.Status}"`,
        `"${r.Latitude}"`,
        `"${r.Longitude}"`,
        `"${r.Jarak}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    const dateStamp = new Date().toISOString().substring(0, 10);
    link.setAttribute('download', `REKAP_ABSENSI_${filterType.toUpperCase()}_${filterValue || 'SEMUA'}_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate printable elegant document layout which opens the print preview dialog (allows saving as PDF)
  const printPDFReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan popup window untuk mencetak laporan PDF.');
      return;
    }

    const tBodyRows = records.map((r, idx) => {
      const u = users.find(user => user.ID_USER === r.ID_USER);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 8px; text-align: center;">${idx + 1}</td>
          <td style="padding: 8px;">${r.Tanggal}</td>
          <td style="padding: 8px; font-weight: bold;">${u?.NIP_NIS || '-'}</td>
          <td style="padding: 8px; font-weight: bold;">${r.Nama}</td>
          <td style="padding: 8px;">${u?.Unit || '-'}</td>
          <td style="padding: 8px; text-align: center; color: #1e3a8a;">${r.Jam_Masuk || '-'}</td>
          <td style="padding: 8px; text-align: center; color: #b45309;">${r.Jam_Pulang || '-'}</td>
          <td style="padding: 8px; text-align: center;">
            <span style="
              padding: 2px 6px; 
              border-radius: 4px; 
              font-weight: bold;
              font-size: 10px;
              display: inline-block;
              background-color: ${
                r.Status === 'Hadir' ? '#d1fae5; color: #065f46;' :
                r.Status === 'Terlambat' ? '#fef3c7; color: #92400e;' :
                r.Status === 'Sakit' ? '#e0f2fe; color: #0369a1;' :
                r.Status === 'Izin' ? '#f3e8ff; color: #6b21a8;' :
                '#fee2e2; color: #991b1b;'
              }
            ">
              ${r.Status}
            </span>
          </td>
          <td style="padding: 8px; text-align: right;">${r.Jarak}m</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
        <head>
          <title>LAPORAN REKAP ABSENSI DIGITAL</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 40px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .title { font-size: 20px; font-weight: bold; color: #0f172a; margin: 0; text-transform: uppercase; }
            .subtitle { font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 0.5px; }
            .logo-placeholder { font-size: 28px; font-weight: 800; color: #059669; text-align: right; }
            .divider { height: 3px; background: linear-gradient(to right, #059669, #3b82f6); margin-bottom: 20px; }
            .metadata-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 11px; }
            .report-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .report-table th { background-color: #0f172a; color: #ffffff; padding: 10px; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
            .sign-section { margin-top: 50px; width: 100%; font-size: 11px; }
            @media print {
              .no-print { display: none; }
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <h1 class="title">Sheet Face Absensi</h1>
                <p class="subtitle">SISTEM MONITORING ABSENSI & BIOMETRIC RECOGNITION</p>
              </td>
              <td class="logo-placeholder">SF_ABSENSI</td>
            </tr>
          </table>
          
          <div class="divider"></div>
          
          <h2 style="font-size: 14px; color: #1e293b; margin-bottom: 12px;">LAPORAN REKAPITULASI KEHADIRAN</h2>
          
          <div class="metadata-box">
            <table style="width: 100%; font-size: 11px;">
              <tr>
                <td style="width: 15%; font-weight: bold; color: #475569;">Jenis Periode:</td>
                <td style="width: 35%;">${filterType.toUpperCase()}</td>
                <td style="width: 15%; font-weight: bold; color: #475569;">Unit Kerja:</td>
                <td>${selectedUnit}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #475569;">Nilai Filter:</td>
                <td>${filterValue || 'Semua'}</td>
                <td style="font-weight: bold; color: #475569;">Tanggal Cetak:</td>
                <td>${new Date().toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #475569;">Total Record:</td>
                <td colspan="3" style="font-weight: bold; color: #059669;">${records.length} baris data ditemukan</td>
              </tr>
            </table>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 12%;">Tanggal</th>
                <th style="width: 15%;">NIP/NIS</th>
                <th>Nama Karyawan</th>
                <th style="width: 15%;">Unit Kerja</th>
                <th style="width: 10%; text-align: center;">Jam Masuk</th>
                <th style="width: 10%; text-align: center;">Jam Pulang</th>
                <th style="width: 12%; text-align: center;">Status</th>
                <th style="width: 10%; text-align: right;">Presisi</th>
              </tr>
            </thead>
            <tbody>
              ${tBodyRows.length > 0 ? tBodyRows : `<tr><td colspan="9" style="padding: 20px; text-align: center; color: #64748b;">Tidak ada data log absensi untuk filter terpilih.</td></tr>`}
            </tbody>
          </table>
          
          <table class="sign-section">
            <tr>
              <td style="width: 70%;"></td>
              <td style="text-align: center;">
                <p>Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="font-weight: bold; margin-bottom: 60px;">Kepala Instansi / HRD</p>
                <p style="text-decoration: underline; font-weight: bold;">( .................................................. )</p>
                <p style="color: #64748b; font-size: 10px;">NIP. ..................................................</p>
              </td>
            </tr>
          </table>
          
          <div style="font-size: 9px; color: #94a3b8; text-align: center; margin-top: 40px; border-t: 1px solid #e2e8f0; padding-top: 10px;">
            Halaman dicetak otomatis melalui Aplikasi Absensi Google Spreadsheet Integration Center.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-wrap gap-2.5" id="report-downloader">
      <button
        type="button"
        id="btn-export-excel"
        onClick={exportToExcelCSV}
        disabled={records.length === 0}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold font-mono rounded-xl shrink-0 flex items-center gap-1.5 transition shadow-xs"
      >
        <Download className="w-3.5 h-3.5" />
        EKSPOR EXCEL (.CSV)
      </button>

      <button
        type="button"
        id="btn-export-pdf"
        onClick={printPDFReport}
        disabled={records.length === 0}
        className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-100 text-xs font-semibold font-mono rounded-xl shrink-0 flex items-center gap-1.5 transition"
      >
        <Printer className="w-3.5 h-3.5" />
        EKSPOR PDF / CETAK
      </button>
    </div>
  );
}
