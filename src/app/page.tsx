import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Banknote,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Globe,
  Lock,
  BarChart3,
  MessageSquare,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { createClient } from "@/lib/supabase/server";
import { MobileNav } from "@/components/mobile-nav";
import { getTranslations } from "@/i18n/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sanad — School & Academy Management Platform",
  description:
    "The digital backbone of Pakistani education. Manage attendance, fees, exams, and parent communication — all in one platform built for Pakistani schools.",
};

export default async function LandingPage() {
  const t = getTranslations();

  interface Plan {
    id: string;
    name: string;
    slug: string;
    price_pkr_monthly: number;
    max_students: number;
    max_staff: number;
    is_active?: boolean;
  }
  let plans: Plan[] = [];
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
      { id: "1", name: "Trial", slug: "trial", price_pkr_monthly: 0, max_students: 100, max_staff: 20 },
      { id: "2", name: "Starter", slug: "starter", price_pkr_monthly: 2999, max_students: 100, max_staff: 25 },
      { id: "3", name: "Growth", slug: "growth", price_pkr_monthly: 7999, max_students: 500, max_staff: 50 },
      { id: "4", name: "Institution", slug: "institution", price_pkr_monthly: 15999, max_students: 1500, max_staff: 200 },
    ];
  }

  const features = [
    {
      icon: Calendar,
      title: t("landing.smartAttendance"),
      description: t("landing.smartAttendanceDesc"),
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Banknote,
      title: t("landing.feeManagement"),
      description: t("landing.feeManagementDesc"),
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: BarChart3,
      title: t("landing.performanceAnalytics"),
      description: t("landing.performanceAnalyticsDesc"),
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: MessageSquare,
      title: t("landing.parentCommunication"),
      description: t("landing.parentCommunicationDesc"),
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: BookOpen,
      title: t("landing.libraryTransport"),
      description: t("landing.libraryTransportDesc"),
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Shield,
      title: t("landing.enterpriseSecurity"),
      description: t("landing.enterpriseSecurityDesc"),
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  const stats = [
    { value: "37+", label: t("landing.databaseTables") },
    { value: "11", label: t("landing.roleBasedDashboardsCount") },
    { value: "146", label: t("landing.securityPolicies") },
    { value: "100%", label: t("landing.dataIsolation") },
  ];

  const faqs = [
    {
      q: t("landing.faqTrial"),
      a: t("landing.faqTrialAnswer"),
    },
    {
      q: t("landing.faqExport"),
      a: t("landing.faqExportAnswer"),
    },
    {
      q: t("landing.faqSecurity"),
      a: t("landing.faqSecurityAnswer"),
    },
    {
      q: t("landing.faqBoards"),
      a: t("landing.faqBoardsAnswer"),
    },
    {
      q: t("landing.faqUrdu"),
      a: t("landing.faqUrduAnswer"),
    },
    {
      q: t("landing.faqParents"),
      a: t("landing.faqParentsAnswer"),
    },
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
            <a href="#features" className="hover:text-ink transition-colors">{t("landing.featuresLabel")}</a>
            <a href="#pricing" className="hover:text-ink transition-colors">{t("landing.pricingLabel")}</a>
            <a href="#faq" className="hover:text-ink transition-colors">{t("landing.faq")}</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-ink">
                {t("auth.login")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                {t("landing.startTrial")}
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <MobileNav />
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
            {t("common.freeTrial")} — {t("common.noCreditCard")}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-ink leading-tight mb-6">
            {t("landing.hero")}
          </h1>
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto mb-8">
            {t("landing.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <Button size="xl" className="bg-accent hover:bg-accent/90 text-white px-8">
                {t("landing.startFreeTrialHero")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                {t("landing.seeHowItWorksBtn")}
              </Button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-6 text-sm text-slate">
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-success" />
              <span>{t("landing.bankGradeSecurity")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-success" />
              <span>{t("landing.madeForPakistan")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>{t("landing.noSetupFees")}</span>
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
              {t("landing.everythingYourSchoolNeeds")}
            </h2>
            <p className="text-slate max-w-xl mx-auto">
              {t("landing.powerfulModules")}
              <br />
              {t("landing.roleBasedDashboards")}
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
              {t("landing.upAndRunning")}
            </h2>
            <p className="text-slate max-w-xl mx-auto">
              {t("landing.noComplexSetup")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: t("landing.createYourSchool"),
                description: t("landing.createYourSchoolDesc"),
              },
              {
                step: "02",
                title: t("landing.addStudentsStaff"),
                description: t("landing.addStudentsStaffDesc"),
              },
              {
                step: "03",
                title: t("landing.startManaging"),
                description: t("landing.startManagingDesc"),
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

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-paper-raised">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
              {t("landing.simpleTransparentPricing")}
            </h2>
            <p className="text-slate max-w-xl mx-auto">
              {t("landing.pricingDesc")}
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
                    {t("landing.mostPopular")}
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold text-ink mb-1">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  {Number(plan.price_pkr_monthly) === 0 ? (
                    <span className="text-3xl font-bold text-ink">{t("landing.free")}</span>
                  ) : (
                    <span className="text-3xl font-bold text-ink">
                      Rs {Number(plan.price_pkr_monthly).toLocaleString()}
                    </span>
                  )}
                  <span className="text-slate text-sm">
                    {Number(plan.price_pkr_monthly) === 0 ? t("landing.perTrial") : t("landing.perMonth")}
                  </span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {t("landing.studentsUpTo", { count: String(plan.max_students) })}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {Number(plan.price_pkr_monthly) === 0 ? t("landing.fullAccessFeatures") : t("landing.allCoreModules")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {Number(plan.price_pkr_monthly) === 0 ? t("landing.noCreditCardRequired") : t("landing.emailSupport")}
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    className={`w-full ${i === 1 ? "bg-accent hover:bg-accent/90 text-white" : ""}`}
                    variant={i === 1 ? "default" : "outline"}
                  >
                    {Number(plan.price_pkr_monthly) === 0 ? t("landing.startFreeTrial") : t("landing.getStarted")}
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
            {t("landing.payYourWay")}
          </h2>
          <p className="text-slate mb-8 max-w-lg mx-auto">
            {t("landing.payYourWayDesc")}
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-accent" />
              {t("fees.collect.bankTransfer")}
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-success" />
              {t("fees.collect.jazzcash")}
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-success" />
              {t("fees.collect.easypaisa")}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-paper-raised">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-ink text-center mb-12">
            {t("landing.faqTitle")}
          </h2>
          <Accordion type="single">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-light rounded-xl mb-3 overflow-hidden">
                <AccordionTrigger value={`faq-${i}`} className="px-5 py-4 font-semibold text-ink hover:text-accent hover:no-underline transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent value={`faq-${i}`} className="px-5 pb-4 text-sm text-slate leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">
            {t("landing.readyToTransformHero")}
          </h2>
          <p className="text-lg text-slate mb-8 max-w-xl mx-auto">
            {t("landing.readyToTransformDesc")}
          </p>
          <Link href="/signup">
            <Button size="xl" className="bg-accent hover:bg-accent/90 text-white px-8">
              {t("landing.startFreeTrialCta")}
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
                {t("landing.theDigitalBackbone")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-ink text-sm mb-3">{t("landing.footer.product")}</h4>
              <ul className="space-y-2 text-sm text-slate">
                <li><a href="#features" className="hover:text-ink transition-colors">{t("landing.featuresLabel")}</a></li>
                <li><a href="#pricing" className="hover:text-ink transition-colors">{t("landing.pricingLabel")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-ink text-sm mb-3">{t("landing.footer.support")}</h4>
              <ul className="space-y-2 text-sm text-slate">
                <li><a href="mailto:support@sanad.pk" className="hover:text-ink transition-colors">{t("landing.contactUs")}</a></li>
                <li><a href="#faq" className="hover:text-ink transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-ink text-sm mb-3">{t("landing.footer.legal")}</h4>
              <ul className="space-y-2 text-sm text-slate">
                <li><Link href="/privacy" className="hover:text-ink transition-colors">{t("landing.privacyPolicy")}</Link></li>
                <li><Link href="/terms" className="hover:text-ink transition-colors">{t("landing.termsOfService")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-light pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate">
              {t("landing.allRightsReserved")}
            </p>
            <p className="text-xs text-slate">
              {t("landing.madeWithCare")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
