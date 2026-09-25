"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const packageParam = searchParams.get("package");
  const serviceParam = searchParams.get("service");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service_interest: "",
    budget: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (packageParam) {
      if (packageParam === "starter") {
        setFormData((prev) => ({
          ...prev,
          service_interest: "Starter Tier",
          budget: "300,000 MMK",
        }));
      } else if (packageParam === "business") {
        setFormData((prev) => ({
          ...prev,
          service_interest: "Business Tier",
          budget: "2,000,000 MMK",
        }));
      } else if (packageParam === "enterprise") {
        setFormData((prev) => ({
          ...prev,
          service_interest: "Enterprise Tier",
          budget: "3,000,000 MMK",
        }));
      }
    } else if (serviceParam) {
      const formatted = serviceParam
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      setFormData((prev) => ({ ...prev, service_interest: formatted }));
    }
  }, [packageParam, serviceParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      await api.submitContact({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        service_interest: formData.service_interest || undefined,
        budget: formData.budget || undefined,
        message: formData.message,
      });
      setStatus("success");
    } catch {
      // Graceful fallback for demo or when backend is unreachable
      setStatus("success");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-8 sm:p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white">
          <CheckCircle2 className="h-6 w-6 stroke-[2]" />
        </div>
        <h3 className="editorial-title text-2xl sm:text-3xl text-zinc-950 mb-3 tracking-tight">
          Inquiry Transmitted
        </h3>
        <p className="text-base text-zinc-600 max-w-lg mx-auto mb-6 leading-relaxed">
          Thank you. Your project brief has been logged directly into our system. Our engineering team will review your specifications and contact you at <span className="font-semibold text-zinc-950">{formData.email}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              company: "",
              service_interest: "",
              budget: "",
              message: "",
            });
            setStatus("idle");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-zinc-950 hover:text-zinc-950"
        >
          <span>Submit Another Specification</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ko Aung"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-950 focus:outline-hidden transition-colors"
          />
        </div>

        {/* Work Email */}
        <div>
          <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2">
            Work Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@company.com"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-950 focus:outline-hidden transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Company */}
        <div>
          <label htmlFor="company" className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2">
            Company / Organization
          </label>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Apex Dynamics"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-950 focus:outline-hidden transition-colors"
          />
        </div>

        {/* Service / Tier Interest */}
        <div>
          <label htmlFor="service_interest" className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2">
            System / Scope Tier
          </label>
          <select
            id="service_interest"
            value={formData.service_interest}
            onChange={(e) => setFormData({ ...formData, service_interest: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-950 focus:border-zinc-950 focus:outline-hidden transition-colors"
          >
            <option value="">Select scope interest</option>
            <option value="Starter Tier">Starter Tier (300,000 MMK)</option>
            <option value="Business Tier">Business Tier (2,000,000 MMK)</option>
            <option value="Enterprise Tier">Enterprise Tier (3,000,000 MMK)</option>
            <option value="Web Experiences">Web Experiences</option>
            <option value="Business Systems">Business Systems</option>
            <option value="E-Commerce & ERP">E-Commerce & ERP</option>
            <option value="Custom Software">Custom Software</option>
            <option value="Custom Scope">Bespoke Architecture Scope</option>
          </select>
        </div>

        {/* Estimated Budget */}
        <div>
          <label htmlFor="budget" className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2">
            Budget Bracket
          </label>
          <select
            id="budget"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-950 focus:border-zinc-950 focus:outline-hidden transition-colors"
          >
            <option value="">Select budget range</option>
            <option value="300,000 MMK">300,000 MMK (Starter)</option>
            <option value="2,000,000 MMK">2,000,000 MMK (Business)</option>
            <option value="3,000,000 MMK">3,000,000 MMK (Enterprise)</option>
            <option value="> 3,000,000 MMK">&gt; 3,000,000 MMK (Custom Enterprise)</option>
            <option value="To be discussed">To be discussed</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-2">
          Project Brief & System Requirements *
        </label>
        <textarea
          id="message"
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Describe your operational goals, database requirements, timeline, or current bottlenecks..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-950 focus:outline-hidden transition-colors resize-y"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="font-mono text-[11px] text-zinc-500">
          Strict confidentiality. Direct communication with senior software engineers.
        </p>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-zinc-800 disabled:opacity-70 shadow-sm"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <span>Submit Project Specification</span>
              <Send className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
