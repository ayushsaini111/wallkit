import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async ({email, name}) => {
  try {
    await transporter.sendMail({
      from: `"WallKit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to WallKit!",
      html: `<h2>Hi ${name || "there"}, welcome to WallKit!</h2>
             <p>We're excited to have you onboard. 🎨</p>`,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
};
