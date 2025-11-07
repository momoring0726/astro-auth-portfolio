// src/pages/api/login.ts
import type { APIRoute } from "astro";
import postgres from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get the database connection string
const connectionString = import.meta.env.DATABASE_URL;
const { Pool } = postgres;
const pool = new Pool({ connectionString });

export const POST: APIRoute = async ({ request }) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ message: "Email and password are required." }),
      { status: 400 }
    );
  }

  try {
    // 1. Find user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({ message: "Invalid credentials." }), {
        status: 401,
      });
    }
    const user = userResult.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Invalid credentials." }), {
        status: 401,
      });
    }

    // 3. Create JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      import.meta.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Return the token
    return new Response(
      JSON.stringify({ message: "Login successful.", token }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Server error." }), {
      status: 500,
    });
  }
};
