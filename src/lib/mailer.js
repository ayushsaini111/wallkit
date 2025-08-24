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
    from: `"WallPickr" <${process.env.EMAIL_USER}>`,
to: email,
subject: "🎉 Welcome to WallPickr – Your wallpaper journey starts here!",
html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; color: #111827;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 24px;">
      
      <h2 style="color: #2563eb; margin-bottom: 16px;">Hi ${name || "there"} 👋, welcome to <span style="color:#2563eb;">WallPickr</span>!</h2>

      <p style="font-size: 16px; line-height: 1.6; color: #374151;">
        We’re so excited to have you onboard. 🎉  
        With <strong>WallPickr</strong>, you can explore stunning wallpapers, follow your favorite creators, and give your screens a fresh new look anytime!
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL}/explore" 
           style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; 
                  text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          🚀 Start Exploring
        </a>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #374151;">
        Here’s what you can do next:
      </p>
      <ul style="font-size: 15px; color: #374151; padding-left: 20px; line-height: 1.6;">
        <li>🔍 Browse thousands of high-quality wallpapers</li>
        <li>⭐ Save your favorites and build collections</li>
        <li>👥 Follow creators you love and get notified</li>
        <li>📤 Upload your own wallpapers to inspire others</li>
      </ul>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>

      <p style="font-size: 14px; color: #6b7280;">
        Welcome aboard and happy customizing! 🎨  
      </p>

      <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
        Best regards,<br/>
        <strong>The WallPickr Team</strong>
      </p>
    </div>
  </div>
`

    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
};
