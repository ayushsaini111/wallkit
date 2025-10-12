const QRCode = require("qrcode");
const path = require("path");

// Direct APK link
const apkUrl = "https://wallpickr.vercel.app/wallpickr-v1.0.0.apk";

// Output path
const outputPath = path.join(__dirname, "../public/wallpickr-qr.png");

// Generate QR code
QRCode.toFile(outputPath, apkUrl, {
  color: {
    dark: "#000",
    light: "#FFF",
  },
  width: 300,
})
.then(() => console.log(`✅ QR code saved to ${outputPath}`))
.catch(err => console.error("❌ Failed to generate QR code:", err));
