// Use require instead of import
const QRCode = require("qrcode");
const path = require("path");

// URL of your APK download page
const apkUrl = "https://wallpickr.vercel.app/download";

// Output path for QR code image
const outputPath = path.join(__dirname, "../public/wallpickr-qr.png");

// Generate QR code
QRCode.toFile(outputPath, apkUrl, {
  color: {
    dark: "#000",  // QR code color
    light: "#FFF", // background color
  },
  width: 300, // optional: set QR code size
})
  .then(() => {
    console.log(`✅ QR code saved to ${outputPath}`);
  })
  .catch((err) => {
    console.error("❌ Failed to generate QR code:", err);
  });
