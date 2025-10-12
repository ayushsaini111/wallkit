import QRCode from "qrcode";
import path from "path";

// URL the QR should open
const url = "http://localhost:3000/download"; // for local testing
// Output path for the QR image
const outputFile = path.join(process.cwd(), "public", "walpicker-qr.png");

QRCode.toFile(outputFile, url, { width: 300 }, (err) => {
  if (err) throw err;
  console.log("✅ QR code saved to public/walpicker-qr.png");
});
