# FigCraft Live Vibe Coding Architecture

Dokumentasi ini menjelaskan arsitektur komunikasi antara AI Assistant (MCP) dan aplikasi desktop [FigCraft](https://github.com/storytold/figcraft).

---

## 1. Perbedaan: Plugin Manifest vs Native MCP Control Channel

| Aspek | Plugin Manifest (`figcraft-plugin.json`) | Native Control Channel (`--control` & `--attach`) |
|---|---|---|
| **Format** | Modul WebAssembly biner (`.wasm`) | Port Socket Loopback JSON-lines (`127.0.0.1:PORT`) |
| **Runtime** | `wasmi` (Rust WASM interpreter) | Engine FigCraft Native (`Session::execute`) |
| **Akses Jaringan** | **TIDAK ADA (No WASI, zero network)** | Koneksi Loopback Localhost |
| **Tujuan** | Generator offline, palet warna, shape custom | **Live AI Vibe Coding, inspeksi UI, remote control** |
| **Dukungan MCP** | Tidak dapat berkomunikasi dengan MCP | **Didukung langsung oleh `figcraft-cli mcp --attach`** |

> [!IMPORTANT]
> Berbeda dengan Figma (yang berbasis Electron dan mengizinkan iframe plugin mengakses WebSocket), FigCraft mengisolasi plugin secara ketat tanpa modul jaringan. Oleh karena itu, **live vibe coding di FigCraft tidak menggunakan plugin manifest**, melainkan menggunakan **Native JSON Control Channel**.

---

## 2. Cara Kerja Live Vibe Coding di FigCraft

FigCraft memiliki arsitektur *engine-first parity*:
1. Setiap aksi (membuat frame, styling, auto-layout) dieksekusi melalui registri perintah tunggal (`node.create`, `node.set`, `batch`).
2. Aplikasi desktop dibuka dengan parameter kontrol:
   ```cmd
   "C:\Program Files\FigCraft\figcraft.exe" --control 47800 "c:\Nakraku\NakrakuUI.figcraft"
   ```
3. Server MCP Antigravity (`figcraft-cli mcp --attach 47800`) menempel (*attach*) ke port 47800 tersebut.
4. Setiap pemanggilan tool oleh AI Assistant langsung merender dan mengubah kanvas di layar desktop Anda secara instan (*live visual update*).

---

## 3. Langkah Menjalankan Live Session

1. Tutup jendela FigCraft yang sedang terbuka saat ini.
2. Jalankan skrip peluncur:
   ```cmd
   c:\Nakraku\Live-FigCraft.bat
   ```
3. Aplikasi FigCraft akan terbuka dengan file `NakrakuUI.figcraft` dan port kontrol 47800 siap menerima instruksi desain secara real-time.
