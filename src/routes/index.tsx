import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Bell, MapPin, Users, Route as RouteIcon, Sparkles, ChevronRight, PhoneCall } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecureWay — Women's Safety, Always One Tap Away" },
      { name: "description", content: "SecureWay is a women's safety companion: instant SOS, trusted contacts, live location sharing, and curated safe routes." },
      { property: "og:title", content: "SecureWay — Women's Safety App" },
      { property: "og:description", content: "Instant SOS, trusted contacts, live location, and safe routes — designed for women, by safety-first design." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-emergency grid place-items-center text-primary-foreground shadow-card">
              <Shield className="size-5" />
            </div>
            <span className="font-display text-lg font-semibold">SecureWay</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#trust" className="hover:text-foreground">Trust & privacy</a>
          </nav>
          <Link
            to="/app/login"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Open app <ChevronRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-hero">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> Built with care, designed for safety
            </span>
            <h1 className="mt-5 text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Safety that lives in your pocket.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              SecureWay puts an emergency response, your trusted circle, and the safest path home one tap away — every hour, every street, every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/app/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-emergency text-primary-foreground px-6 py-3 text-base font-semibold shadow-sos hover:opacity-95"
              >
                Try the live demo <ChevronRight className="size-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-base font-medium hover:bg-muted"
              >
                See what's inside
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Demo phone: +91 99999 99999 · OTP: 123456</p>
          </div>

          {/* Phone mock */}
          <div className="relative mx-auto">
            <div className="absolute -inset-10 bg-gradient-violet opacity-20 blur-3xl rounded-full" />
            <div className="relative w-[300px] h-[600px] rounded-[3rem] bg-foreground p-3 shadow-card">
              <div className="w-full h-full rounded-[2.4rem] bg-background overflow-hidden flex flex-col">
                <div className="px-6 pt-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Good evening</p>
                  <p className="text-2xl font-semibold">Sarah</p>
                  <div className="mt-4 rounded-2xl bg-safe/15 text-safe-foreground px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Current status</p>
                      <p className="font-semibold">You're safe</p>
                    </div>
                    <div className="size-3 rounded-full bg-safe animate-pulse" />
                  </div>
                </div>

                <div className="flex-1 grid place-items-center">
                  <div className="text-center">
                    <button className="size-44 rounded-full bg-gradient-emergency text-primary-foreground font-display text-3xl font-bold tracking-widest animate-sos-pulse">
                      SOS
                    </button>
                    <p className="mt-4 text-xs text-muted-foreground">Hold for 2 seconds</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 px-5 pb-6">
                  {[
                    { icon: MapPin, label: "Location", c: "bg-info/15 text-info" },
                    { icon: Users, label: "Contacts", c: "bg-violet/15 text-violet" },
                    { icon: RouteIcon, label: "Routes", c: "bg-warn/20 text-warn-foreground" },
                  ].map((q, i) => (
                    <div key={i} className={`rounded-2xl p-3 ${q.c} grid place-items-center`}>
                      <q.icon className="size-5" />
                      <span className="mt-1 text-[10px] font-medium">{q.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Built for moments that matter</p>
          <h2 className="mt-2 text-4xl md:text-5xl font-semibold">Every feature, designed around one second of urgency.</h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: Bell, title: "One-tap SOS", body: "A giant emergency button instantly alerts your trusted circle with your live location.", color: "bg-emergency/10 text-emergency" },
            { icon: Users, title: "Trusted contacts", body: "Mom, your best friend, your brother — they're all reachable in a single tap.", color: "bg-violet/15 text-violet" },
            { icon: MapPin, title: "Live location", body: "Share where you are in real time so loved ones can stay close even from afar.", color: "bg-info/15 text-info" },
            { icon: RouteIcon, title: "Safe routes", body: "Community-rated paths home, scored on lighting, foot traffic and time of day.", color: "bg-warn/20 text-warn-foreground" },
            { icon: Shield, title: "Status check-ins", body: "Mark yourself safe after a late ride, a long shift or a solo walk.", color: "bg-safe/20 text-safe-foreground" },
            { icon: PhoneCall, title: "Quick call", body: "Direct dial to any contact, no fumbling through menus when seconds count.", color: "bg-accent text-accent-foreground" },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className={`size-12 rounded-2xl grid place-items-center ${f.color}`}>
                <f.icon className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-10">
          {[
            { n: "01", t: "Sign in with your number", b: "Quick OTP login — no passwords to remember." },
            { n: "02", t: "Add your circle", b: "Pick the 3–5 people you'd call in any emergency." },
            { n: "03", t: "Walk with confidence", b: "Tap SOS when something feels off. Your circle is notified instantly." },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-display text-5xl font-semibold text-primary">{s.n}</p>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-semibold">Your data stays yours.</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Location is only shared with the contacts you choose. No ads, no selling your data, no tracking — just safety, built by people who know it matters.
          </p>
        </div>
        <div className="rounded-3xl bg-gradient-violet text-primary-foreground p-8 shadow-card">
          <h3 className="text-2xl font-semibold">Try the working demo</h3>
          <p className="mt-2 opacity-90">A complete walkthrough of every screen — login, SOS, contacts, location, routes and profile.</p>
          <Link to="/app/login" className="mt-6 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-5 py-3 font-medium">
            Launch demo <ChevronRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-emergency grid place-items-center text-primary-foreground">
              <Shield className="size-4" />
            </div>
            <span className="font-display font-semibold">SecureWay</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SecureWay. Made with care.</p>
        </div>
      </footer>
    </div>
  );
}
