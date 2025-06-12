"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleLogin = () => {
    if (name.trim()) {
      localStorage.setItem("userName", name.trim());
      console.log("Login successful, redirecting...");
      router.push("/");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <Card className="w-[350px] bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <h1 className="text-2xl text-white mb-2">Welcome to AlgoTutor</h1>
          <p className="text-gray-400 mb-6">Enter your name to continue</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-gray-800 text-white mb-4 p-2 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded-md font-medium transition-colors"
            disabled={!name.trim()}
          >
            Continue
          </button>
        </CardContent>
      </Card>
    </main>
  );
}
