"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // 🔐 LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      // ❌ alert حذف شد (باعث گیر کردن می‌شد)
      router.push("/dashboard");
    }
  };

  // 🆕 SIGNUP
  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("User created ✅ Now login");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 border border-gray-700 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Login to Fixox
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 bg-black border border-gray-600 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 bg-black border border-gray-600 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-white text-black rounded-xl mb-3"
        >
          Login
        </button>

        <button
          onClick={handleSignup}
          className="w-full py-3 border border-gray-600 rounded-xl"
        >
          Sign Up
        </button>
      </div>
    </main>
  );
}