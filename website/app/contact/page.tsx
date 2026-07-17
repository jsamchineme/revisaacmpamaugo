import { PageHero } from "@/components/shared";

export const metadata = {
  title: "Contact | Rev. Isaac Mpamaugo",
  description: "Request prayer, ask a question, or invite Reverend Isaac to minister.",
};

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Connect"
        title="Get in Touch"
        subtitle="Whether you'd like prayer, an encouraging word, or to invite Rev. Isaac to minister, we'd love to hear from you."
      />

      <section className="section-padding">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
              <form action="/api/contact" method="POST" className="space-y-5">
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
                    Phone
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
                  className="w-full px-6 py-3 bg-burgundy text-white rounded-full font-medium hover:bg-burgundy-dark transition-colors"
                >
                  Send Message
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
  );
}
