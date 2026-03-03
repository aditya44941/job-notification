import { useState } from "react";
import { Code2, Video, ChartNoAxesColumn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createAnalysisEntry } from "../lib/analysis";
import { saveAnalysisEntry } from "../lib/history";

const features = [
  {
    title: "Practice Problems",
    description: "Sharpen your coding skills with structured problem sets.",
    icon: Code2,
  },
  {
    title: "Mock Interviews",
    description: "Simulate real interview rounds and improve communication.",
    icon: Video,
  },
  {
    title: "Track Progress",
    description: "Measure readiness with clear performance insights.",
    icon: ChartNoAxesColumn,
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jdText, setJdText] = useState("");
  const isShortJD = jdText.trim().length > 0 && jdText.trim().length < 200;

  const handleAnalyze = (event) => {
    event.preventDefault();
    const entry = createAnalysisEntry({ company, role, jdText });
    saveAnalysisEntry(entry);
    navigate(`/results?id=${encodeURIComponent(entry.id)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center sm:p-14">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Ace Your Placement</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Practice, assess, and prepare for your dream job
          </p>
          <Link
            to="/app/dashboard"
            className="mt-8 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-primary/90"
          >
            Get Started
          </Link>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">Quick JD Analysis</h2>
          <p className="mt-2 text-sm text-slate-600">
            Paste a complete JD to get skills, round strategy, and readiness insights.
          </p>

          <form onSubmit={handleAnalyze} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company (optional)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              />
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role (optional)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            <textarea
              rows={8}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste Job Description"
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-primary"
              required
            />

            {isShortJD ? (
              <p className="text-sm text-amber-700">
                This JD is too short to analyze deeply. Paste full JD for better output.
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Analyze JD
            </button>
          </form>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <Icon size={20} />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-slate-600">{description}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Placement Readiness Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
