// src/pages/api/register.ts
import type { APIRoute } from "astro";
import postgres from "pg";
import bcrypt from "bcryptjs";

// Get the database connection string
const connectionString = import.meta.env.DATABASE_URL;
const { Pool } = postgres;
const pool = new Pool({ connectionString });

export const POST: APIRoute = async ({ request }) => {
  const { email, password } = await request.json();

  // 1. Validate input
  if (!email || !password) {
    return new Response(
      JSON.stringify({ message: "Email and password are required." }),
      { status: 400 }
    );
  }

  try {
    // 2. Check if user already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rows.length > 0) {
      return new Response(JSON.stringify({ message: "User already exists." }), {
        status: 409,
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Save new user
    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
      [email, passwordHash]
    );

    return new Response(
      JSON.stringify({ message: "User registered successfully." }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Server error." }), {
      status: 500,
    });
  }
};
