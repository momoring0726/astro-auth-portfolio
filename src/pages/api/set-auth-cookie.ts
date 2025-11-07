// src/pages/api/set-auth-cookie.ts
import type { APIRoute } from "astro";

// --- ADD THIS LINE ---
export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const { token } = await request.json();

  if (!token) {
    return new Response("Token required", { status: 400 });
  }

  // Set the cookie
  cookies.set("authToken", token, {
    path: "/",
    httpOnly: true, // Prevents client-side JS from reading it
    secure: import.meta.env.PROD, // Only use HTTPS in production
    maxAge: 60 * 60, // 1 hour (must match token expiration)
  });

  return new Response("Cookie set successfully", { status: 200 });
};
