'use client'

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login"); // ❌ اگر لاگین نیست
      } else {
        setUserEmail(data.user.email);
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dashboard 🚀</h1>

        {userEmail && (
          <p className="mb-6">Welcome {userEmail}</p>
        )}

        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-white text-black rounded-xl"
        >
          Logout
        </button>
      </div>
    </main>
  );
}