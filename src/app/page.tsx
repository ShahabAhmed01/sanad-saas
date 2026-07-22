import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  Banknote,
  ClipboardCheck,
  Shield,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  Lock,
  BarChart3,
  MessageSquare,
  Calendar,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  let plans: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("price_pkr_monthly");
    plans = data || [];
  } catch {
    plans = [
      { id: "1", name: "Trial", slug: "trial", price_pkr_monthly: 0, max_students: 100 },
      { id: "2", name: "Starter", slug: "starter", price_pkr_monthly: 2999, max_students: 100 },
      { id: "3", name: "Growth", slug: "growth", price_pkr_monthly: 7999, max_students: 500 },
      { id: "4", name: "Institution", slug: "institution", price_pkr_monthly: 15999, max_students: 1500 },
    ];
  }

  const features = [
    {
      icon: Calendar,
      title: "Smart Attendance",
      description: "Mark attendance in seconds with keyboard shortcuts, GPS verification, and real-time parent alerts.",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Banknote,
      title: "Fee Management",
      description: "Auto-generate invoices, track payments via JazzCash, Easypaisa, or bank transfer. Never miss a rupee.",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Beautiful charts showing student progress, staff effectiveness, and school-wide trends at a glance.",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: MessageSquare,
      title: "Parent Communication",
      description: "Announcements, homework alerts, and fee reminders delivered via email and WhatsApp.",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: BookOpen,
      title: "Library & Transport",
      description: "Complete book management with issue/return tracking and transport route assignment.",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, role-based access, immutable audit logs. Your data stays isolated and safe.",
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  const testimonials = [
    {
      name: "Fatima Khan",
      role: "Principal, Al-Noor Academy",
      content: "Sanad transformed how we manage our 800-student academy. Fee collection time dropped from 3 days to 3 hours. The parent portal alone was worth it.",
      rating: 5,
    },
    {
      name: "Ahmed Raza",
      role: "Director, Punjab STEM School",
      content: "We tried 4 different systems before Sanad. The Urdu support and Pakistani calendar integration made it an instant fit for our staff.",
      rating: 5,
    },
    {
      name: "Dr. Saima Malik",
      role: "Owner, Smart Learning Center",
      content: "The attendance system is brilliant. Parents get instant notifications and our teachers can mark a class of 60 students in under 2 minutes.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "50+", label: "Schools Onboarded" },
    { value: "12,000+", label: "Students Managed" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9/5", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-paper-raised/80 backdrop-blur-md border-b border-slate-light">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white font-display font-bold text-sm">
              S
            </div>
            <span className="font-display text-xl font-semibold text-ink">
              Sanad
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-ink transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-ink">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                Start free trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-ink px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Free 21-day trial — no credit card required
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-ink leading-tight mb-6">
            The digital backbone
            <br />
            <span className="text-accent">of Pakistani education</span>
          </h1>
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto mb-8">
            One platform for attendance, fees, exams, and parent communication.
            Built for Pakistani schools — from small coaching centers to large institutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8">
                Start your free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                See how it works
              </Button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-6 text-sm text-slate">
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-success" />
              <span>Bank-grade security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-success" />
              <span>Made for Pakistan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>No setup fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-4 bg-paper-raised border-y border-slate-light">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-accent font-display">{stat.value}</div>
              <div className="text-sm text-slate mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
              Everything your school needs
            </h2>
            <p className="text-slate max-w-xl mx-auto">
              Powerful modules designed specifically for Pakistani schools and academies.
              Role-based dashboards so everyone sees exactly what they need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-paper-raised rounded-xl p-6 border border-slate-light hover:border-accent/30 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-paper-raised">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
              Up and running in minutes
            </h2>
            <p className="text-slate max-w-xl mx-auto">
              No complex setup. No training required. Start managing your school today.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create your school",
                description: "Sign up, enter your school details, and invite your team. Takes less than 5 minutes.",
              },
              {
                step: "02",
                title: "Add students & staff",
                description: "Import from CSV or add manually. Set up classes, subjects, and fee structures.",
              },
              {
                step: "03",
                title: "Start managing",
                description: "Mark attendance, collect fees, track exams. Your parents get instant notifications.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-2xl font-bold text-accent">{item.step}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-slate">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
              Trusted by schools across Pakistan
            </h2>
            <p className="text-slate max-w-xl mx-auto">
              See what educators are saying about Sanad.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-paper-raised rounded-xl p-6 border border-slate-light"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-slate leading-relaxed mb-4">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-ink text-sm">{t.name}</p>
                  <p className="text-xs text-slate">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-paper-raised">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate max-w-xl mx-auto">
              Start free for 21 days. Choose a plan that fits your school.
              No hidden fees, no surprises.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {(plans || []).filter(p => p.slug !== "enterprise").map((plan, i) => (
              <div
                key={plan.id}
                className={`relative bg-paper rounded-xl p-6 border ${
                  i === 1
                    ? "border-2 border-accent shadow-xl scale-[1.02]"
                    : "border-slate-light"
                }`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold text-ink mb-1">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  {Number(plan.price_pkr_monthly) === 0 ? (
                    <span className="text-3xl font-bold text-ink">Free</span>
                  ) : (
                    <span className="text-3xl font-bold text-ink">
                      Rs {Number(plan.price_pkr_monthly).toLocaleString()}
                    </span>
                  )}
                  <span className="text-slate text-sm">
                    {Number(plan.price_pkr_monthly) === 0 ? " / 21 days" : " / month"}
                  </span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    Up to {plan.max_students} students
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {Number(plan.price_pkr_monthly) === 0 ? "Full access to all features" : "All core modules"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {Number(plan.price_pkr_monthly) === 0 ? "No credit card required" : "Email & WhatsApp support"}
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    className={`w-full ${i === 1 ? "bg-accent hover:bg-accent/90 text-white" : ""}`}
                    variant={i === 1 ? "default" : "outline"}
                  >
                    {Number(plan.price_pkr_monthly) === 0 ? "Start free trial" : "Get started"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-16 px-4 border-t border-slate-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl font-semibold text-ink mb-4">
            Pay your way
          </h2>
          <p className="text-slate mb-8 max-w-lg mx-auto">
            Bank transfer, JazzCash, or Easypaisa. Whatever works for your school.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-accent" />
              Bank Transfer
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              JazzCash
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Easypaisa
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-paper-raised">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-ink text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What happens when the trial ends?",
                a: "Your school's data stays safe. You can view existing records, but new entries are paused until you choose a plan.",
              },
              {
                q: "Can we export our data if we leave?",
                a: "Yes. You can request a full data export at any time. We retain your data for 90 days after cancellation.",
              },
              {
                q: "Is our students' data secure?",
                a: "Yes. Each school's data is completely isolated with row-level security. We use industry-standard encryption and strict role-based access controls.",
              },
              {
                q: "Do you support both Matric/FSc and O/A-Level?",
                a: "Yes. Sanad works with all board types — Matric/FSc, Cambridge O/A-Level, Montessori, and mixed institutions.",
              },
              {
                q: "Do you support Urdu?",
                a: "Yes. Full Urdu language support with RTL layout is built-in. Toggle between English and Urdu anytime.",
              },
              {
                q: "Can parents access the system?",
                a: "Yes. Every school gets a parent portal where parents can view attendance, marks, fees, homework, and announcements for their children.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-paper rounded-xl border border-slate-light overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-ink hover:text-accent transition-colors">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-slate group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
            Ready to transform your school?
          </h2>
          <p className="text-lg text-slate mb-8 max-w-xl mx-auto">
            Join 50+ schools across Pakistan already using Sanad to streamline their operations.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8">
              Start your free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-light bg-paper-raised">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-white font-display font-bold text-xs">
                  S
                </div>
                <span className="font-display text-base font-semibold text-ink">Sanad</span>
              </div>
              <p className="text-sm text-slate">
                The digital backbone of Pakistani education. Built with care in Pakistan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-ink text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate">
                <li><a href="#features" className="hover:text-ink transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-ink transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-ink transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-ink text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate">
                <li><a href="mailto:support@sanad.pk" className="hover:text-ink transition-colors">Contact Us</a></li>
                <li><a href="#faq" className="hover:text-ink transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-ink text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate">
                <li><Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-light pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate">
              &copy; {new Date().getFullYear()} Sanad. All rights reserved.
            </p>
            <p className="text-xs text-slate">
              Made with care in Pakistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
