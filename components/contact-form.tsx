"use client";

import { useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage(
        "Something went wrong. Please try emailing ben@sipshield.co.uk directly."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-forest-50 border border-forest-200 p-8 text-center">
        <p className="font-display text-xl text-forest-700 mb-2">
          Message sent
        </p>
        <p className="text-neutral-600">
          Ben will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — hidden from humans, bots fill it */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      >
        <label htmlFor="website">Do not fill this in</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-oak-700 mb-1.5"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={200}
          className="w-full rounded-lg border border-oak-200 bg-white px-4 py-2.5 text-charcoal placeholder:text-neutral-400 focus-visible:outline-none focus-visible:shadow-focus transition-shadow duration-[var(--duration-fast)]"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-oak-700 mb-1.5"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-lg border border-oak-200 bg-white px-4 py-2.5 text-charcoal placeholder:text-neutral-400 focus-visible:outline-none focus-visible:shadow-focus transition-shadow duration-[var(--duration-fast)]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-oak-700 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={5}
          className="w-full rounded-lg border border-oak-200 bg-white px-4 py-2.5 text-charcoal placeholder:text-neutral-400 focus-visible:outline-none focus-visible:shadow-focus transition-shadow duration-[var(--duration-fast)] resize-y"
          placeholder="What can we help with?"
        />
      </div>

      {status === "error" && errorMessage && (
        <p className="text-sm text-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full px-8 py-3.5 bg-forest-500 text-white font-medium rounded-lg shadow-sm hover:bg-forest-600 hover:shadow-md transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
