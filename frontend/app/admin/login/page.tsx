"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.adminLogin(username.trim(), password);
      if (res?.access_token) {
        localStorage.setItem("next_aura_admin_token", res.access_token);
        router.push("/admin");
      } else {
        setError("Invalid response received from authentication server.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorAny = err as { status?: number; detail?: string };
        if (errorAny.status === 401) {
          setError(errorAny.detail || "Incorrect username or password. Please verify your credentials.");
        } else if (errorAny.status === 404) {
          setError(
            "Authentication endpoint not found (404). Please ensure NEXT_PUBLIC_API_URL or backend API proxy is properly configured."
          );
        } else if (errorAny.status === 500) {
          setError("Backend server error (500). Please verify database connection.");
        } else if (
          err.message.includes("Cannot connect to API") ||
          err.message.includes("Network request failed") ||
          err.message.includes("Failed to fetch")
        ) {
          setError(
            "Cannot connect to the FastAPI backend API server. Verify that the backend is deployed, running, and that CORS permits requests from this Vercel domain."
          );
        } else {
          setError(err.message || "Authentication failed. Please verify your credentials.");
        }
      } else {
        setError("Authentication failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#09090b]">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-950"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Studio</span>
          </Link>
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            Next Aura Innovation · Admin Console
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex flex-1 items-center justify-center p-6 bg-[#F8F8F8]">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="mb-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800">
              <Lock className="h-4 w-4" />
            </div>
            <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
              Admin Authentication
            </h1>
            <p className="mt-2 text-xs text-zinc-500">
              Sign in with authorized studio credentials to manage projects, services, and content.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-950 focus:outline-hidden transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-950 focus:outline-hidden transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-zinc-100 pt-6 text-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Next Aura INNOVATION · Secure FastAPI + PostgreSQL Engine
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
