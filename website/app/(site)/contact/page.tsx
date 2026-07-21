"use client";

import { useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { PageHero } from "@/components/shared";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        setToastOpen(true);
        form.reset();
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        setToastOpen(true);
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
      setToastOpen(true);
    }
  }

  return (
    <Toast.Provider swipeDirection="right">
      <div>
        <PageHero
          eyebrow="Connect"
          title="Get in Touch"
          subtitle="Whether you'd like prayer, an encouraging word, or to invite Rev. Isaac or Rev. Mrs. Edith to minister, we'd love to hear from you."
        />

        <section className="section-padding">
          <div className="wrap">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-line rounded-[10px] bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-line rounded-[10px] bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1.5">
                      Phone <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 border border-line rounded-[10px] bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-ink mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Share a prayer request, a question, or an invitation…"
                      className="w-full px-4 py-3 border border-line rounded-[10px] bg-white text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full px-6 py-3 bg-burgundy text-white rounded-full font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Details</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                      ✉️
                    </div>
                    <div>
                      <b className="block font-serif text-lg">Email</b>
                      <span className="text-muted text-sm">hello@isaacmpamaugo.org</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                      📞
                    </div>
                    <div>
                      <b className="block font-serif text-lg">Phone</b>
                      <span className="text-muted text-sm">+234 (0)800 000 0000</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
                      📍
                    </div>
                    <div>
                      <b className="block font-serif text-lg">Location</b>
                      <span className="text-muted text-sm">Lagos, Nigeria</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <b className="block font-serif text-lg mb-3">Follow the Ministry</b>
                  <div className="flex gap-3">
                    <a
                      href="#"
                      className="w-11 h-11 rounded-full bg-cream flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
                      title="Facebook"
                    >
                      f
                    </a>
                    <a
                      href="#"
                      className="w-11 h-11 rounded-full bg-cream flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
                      title="YouTube"
                    >
                      ▶
                    </a>
                    <a
                      href="#"
                      className="w-11 h-11 rounded-full bg-cream flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
                      title="Instagram"
                    >
                      ◎
                    </a>
                  </div>
                </div>

                <div className="mt-8 rounded overflow-hidden border border-line">
                  <iframe
                    src="https://www.google.com/maps?q=Lagos,Nigeria&output=embed"
                    width="100%"
                    height="240"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Lagos, Nigeria map"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Toast notification */}
      <Toast.Root
        open={toastOpen}
        onOpenChange={setToastOpen}
        duration={6000}
        className={`
          flex items-start gap-3 rounded-[12px] px-5 py-4 shadow-lg border max-w-sm
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[swipe=end]:animate-out data-[state=closed]:fade-out-80
          data-[state=open]:slide-in-from-bottom-2
          ${
            status === "success"
              ? "bg-white border-gold/40"
              : "bg-white border-red-200"
          }
        `}
      >
        <div
          className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
            status === "success" ? "bg-gold" : "bg-red-500"
          }`}
        >
          {status === "success" ? "✓" : "!"}
        </div>
        <div className="flex-1 min-w-0">
          <Toast.Title className="font-semibold text-ink text-[.95rem]">
            {status === "success" ? "Message sent" : "Could not send"}
          </Toast.Title>
          <Toast.Description className="text-muted text-sm mt-0.5">
            {status === "success"
              ? "Thank you — we'll be in touch soon."
              : errorMsg}
          </Toast.Description>
        </div>
        <Toast.Close className="text-muted hover:text-ink transition-colors text-lg leading-none mt-0.5">
          ×
        </Toast.Close>
      </Toast.Root>

      <Toast.Viewport className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]" />
    </Toast.Provider>
  );
}
