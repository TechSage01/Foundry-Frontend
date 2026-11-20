import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";

const plans = [
  {
    name: "Builder",
    price: "Free",
    description: "For builders creating, sharing, and finding collaborators.",
    features: ["Public builder profile", "Projects and post updates", "Communities and messaging", "Discover opportunities"],
  },
  {
    name: "Team",
    price: "Contact us",
    description: "For startups and teams shipping products together.",
    features: ["Everything in Builder", "Team project spaces", "Hiring and opportunity tools", "Community-led collaboration"],
    featured: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <PublicHeader />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C66A47]">Pricing & Ecosystem</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Build openly. Grow together.</h1>
          <p className="mt-4 text-base text-stone-600">Foundry is free for builders. Team and ecosystem support is designed around your stage and community goals.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.name} className={`rounded-3xl border p-7 ${plan.featured ? "border-[#C66A47] bg-[#FEF2EC] shadow-[0_12px_32px_rgba(160,70,34,0.08)]" : "border-stone-200 bg-white"}`}>
              <p className="text-sm font-bold text-stone-900">{plan.name}</p>
              <p className="mt-4 font-serif text-3xl font-bold">{plan.price}</p>
              <p className="mt-3 min-h-12 text-sm leading-relaxed text-stone-600">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-stone-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F1E4DC] text-[#A04622]"><Check size={12} strokeWidth={3} /></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/signin" className={`mt-7 flex justify-center rounded-xl px-4 py-3 text-sm font-bold ${plan.featured ? "bg-[#A04622] text-white hover:bg-[#85381a]" : "border border-stone-300 text-stone-800 hover:bg-stone-50"}`}>
                {plan.featured ? "Talk to Foundry" : "Join Foundry Free"}
              </Link>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-stone-200 bg-white p-6 text-center">
          <h2 className="font-serif text-xl font-bold">Building for a community, grant, or university?</h2>
          <p className="mt-2 text-sm text-stone-600">Foundry can support ecosystem programs, project showcases, and builder cohorts.</p>
        </div>
      </section>
    </main>
  );
}
