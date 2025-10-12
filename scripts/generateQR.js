import QRCode from "qrcode";
import path from "path";

const apkUrl = "https://wallpickr.vercel.app/download";
const outputPath = path.join(process.cwd(), "public/wallpickr-qr.png");

QRCode.toFile(outputPath, apkUrl)
  .then(() => console.log("QR code generated!"))
  .catch(console.error);
