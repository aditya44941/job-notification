import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { createAnalysisEntry } from "../lib/analysis";
import { saveAnalysisEntry } from "../lib/history";

function PracticePage() {
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
    <Card>
      <CardHeader>
        <CardTitle>Job Description Analyzer</CardTitle>
        <CardDescription>
          Paste the JD to generate skill extraction, prep checklist, 7-day plan, interview questions, and readiness score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAnalyze} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium text-slate-700">
                Company (optional)
              </label>
              <input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Codex Labs"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-slate-700">
                Role (optional)
              </label>
              <input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SDE Intern"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="jd" className="text-sm font-medium text-slate-700">
              Job Description Text
            </label>
            <textarea
              id="jd"
              rows={14}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste full JD here..."
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-primary"
              required
            />
            {isShortJD ? (
              <p className="text-sm text-amber-700">
                This JD is too short to analyze deeply. Paste full JD for better output.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Analyze JD
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

export default PracticePage;
