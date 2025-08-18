import { sendWelcomeEmail } from "@/lib/mailer";

export async function POST(req) {
  try {
    const { email, name } = await req.json();
    await sendWelcomeEmail(email, name);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
