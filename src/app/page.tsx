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
    // Fallback plans if DB connection fails
    plans = [
      { id: "1", name: "Trial", slug: "trial", price_pkr_monthly: 0, max_students: 100 },
      { id: "2", name: "Starter", slug: "starter", price_pkr_monthly: 2999, max_students: 100 },
      { id: "3", name: "Growth", slug: "growth", price_pkr_monthly: 7999, max_students: 500 },
      { id: "4", name: "Institution", slug: "institution", price_pkr_monthly: 15999, max_students: 1500 },
    ];
  }

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
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-ink px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Free 21-day trial — no credit card required
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-ink leading-tight mb-6">
            Run your school
            <br />
            <span className="text-accent">without the paper chase</span>
          </h1>
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto mb-8">
            One platform for attendance, fees, exams, and parent communication.
            Built for Pakistani schools and academies — from small coaching
            centers to large institutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8"
              >
                Start your free trial
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="px-8">
                See pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features by Role */}
      <section className="py-20 px-4 bg-paper-raised">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink text-center mb-4">
            Everything your school needs
          </h2>
          <p className="text-slate text-center max-w-xl mx-auto mb-12">
            Role-based dashboards so everyone sees exactly what they need — no
            clutter, no confusion.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-paper rounded-xl p-6 border border-slate-light">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">
                For School Admins
              </h3>
              <ul className="space-y-2 text-sm text-slate">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Complete staff & student management
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Fee collection with PDF receipts
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Real-time dashboard & audit logs
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Module toggles — only pay for what you use
                </li>
              </ul>
            </div>
            <div className="bg-paper rounded-xl p-6 border border-slate-light">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">
                For Teachers
              </h3>
              <ul className="space-y-2 text-sm text-slate">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Mark attendance in seconds
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Gradebook & marks entry
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Homework & class announcements
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Leave requests & timetable view
                </li>
              </ul>
            </div>
            <div className="bg-paper rounded-xl p-6 border border-slate-light">
              <div className="w-12 h-12 rounded-lg bg-danger/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-danger" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">
                For Parents
              </h3>
              <ul className="space-y-2 text-sm text-slate">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  View attendance & report cards
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Track homework & assignments
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Pay fees & download receipts
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  Receive announcements & updates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section — dynamically from plans table */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-slate text-center max-w-xl mx-auto mb-12">
            Start free for 21 days. Choose a plan that fits your school. No
            hidden fees, no surprises.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {(plans || []).filter(p => p.slug !== "enterprise").map((plan, i) => (
              <div
                key={plan.id}
                className={`relative bg-paper-raised rounded-xl p-6 border ${
                  i === 0 ? "border-2 border-accent shadow-lg" : "border-slate-light"
                }`}
              >
                {i === 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold text-ink mb-1">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  {Number(plan.price_pkr_monthly) === 0 ? (
                    <span className="text-3xl font-bold text-ink">PKR 0</span>
                  ) : (
                    <span className="text-3xl font-bold text-ink">
                      {Number(plan.price_pkr_monthly).toLocaleString()}
                    </span>
                  )}
                  <span className="text-slate">
                    {Number(plan.price_pkr_monthly) === 0 ? " / 21 days" : " PKR/mo"}
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-slate mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Up to {plan.max_students} students
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    {Number(plan.price_pkr_monthly) === 0 ? "Full access to all features" : "All core modules"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    {Number(plan.price_pkr_monthly) === 0 ? "No credit card required" : "Email support"}
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    className={`w-full ${
                      i === 0
                        ? "bg-accent hover:bg-accent/90 text-white"
                        : ""
                    }`}
                    variant={i === 0 ? "default" : "outline"}
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
      <section className="py-16 px-4 bg-paper-raised border-t border-slate-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl font-semibold text-ink mb-4">
            Easy payment options
          </h2>
          <p className="text-slate mb-8 max-w-lg mx-auto">
            Pay via bank transfer, JazzCash, or Easypaisa. Card payments
            coming soon.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-accent" />
              Bank Transfer
            </div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-accent" />
              JazzCash
            </div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-accent" />
              Easypaisa
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What happens when the trial ends?",
                a: "Your school's data stays safe. You can view existing records, but new entries (attendance, fees, etc.) are paused until you choose a plan.",
              },
              {
                q: "Can we export our data if we leave?",
                a: "Yes. You can request a full data export at any time. We retain your data for 90 days after cancellation.",
              },
              {
                q: "Is our students' data secure?",
                a: "Yes. Each school's data is completely isolated. We use industry-standard encryption and strict role-based access controls.",
              },
              {
                q: "Do you support both Matric/FSc and O/A-Level?",
                a: "Yes. Sanad works with all board types — Matric/FSc, Cambridge O/A-Level, Montessori, and mixed institutions.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-paper-raised rounded-xl p-6 border border-slate-light"
              >
                <h3 className="font-semibold text-ink mb-2">{faq.q}</h3>
                <p className="text-sm text-slate">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-light bg-paper-raised">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-white font-display font-bold text-xs">
              S
            </div>
            <span className="font-display text-base font-semibold text-ink">
              Sanad
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate">
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors">
              Terms of Service
            </Link>
            <a
              href="mailto:support@sanad.pk"
              className="hover:text-ink transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-xs text-slate">
            &copy; {new Date().getFullYear()} Sanad. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
