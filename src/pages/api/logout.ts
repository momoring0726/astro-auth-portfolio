// src/pages/api/logout.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear the cookie
  cookies.delete("authToken", {
    path: "/",
  });

  // Redirect to the login page
  return redirect("/login", 302);
};
