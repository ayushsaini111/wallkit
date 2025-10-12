// Use require instead of import
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// URL of your APK download page
const apkUrl = "https://wallpickr.vercel.app/download";

// Output path
const outputPath = path.join(__dirname, "../public/wallpickr-qr.png");

// Generate QR code
QRCode.toFile(outputPath, apkUrl, {
  color: {
    dark: "#000",  // QR code color
    light: "#FFF", // background
  },
})
  .then(() => {
    console.log(`✅ QR code saved to ${outputPath}`);
  })
  .catch((err) => {
    console.error("❌ Failed to generate QR code:", err);
  });
