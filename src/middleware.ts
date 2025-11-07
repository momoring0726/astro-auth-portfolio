// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import jwt from "jsonwebtoken";

const protectedRoutes = ["/dashboard"];

export const onRequest = defineMiddleware(async (context, next) => {
  const isProtectedRoute = protectedRoutes.some((route) =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = context.cookies.get("authToken")?.value;

    if (!token) {
      // No token, redirect to login
      return context.redirect("/login", 302);
    }

    try {
      // Check if token is valid
      jwt.verify(token, import.meta.env.JWT_SECRET);
    } catch (error) {
      // Invalid token (expired, etc), redirect to login
      return context.redirect("/login", 302);
    }
  }

  // All good, continue
  return next();
});
