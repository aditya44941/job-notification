import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { generateCompanyIntel, generateRoundMapping } from "../lib/analysis";
import { getEntryById, getLatestEntry, updateHistoryEntry } from "../lib/history";

const clampScore = (value) => Math.max(0, Math.min(100, value));

function getUniqueSkills(extractedSkills) {
  return [...new Set(Object.values(extractedSkills || {}).flat())];
}

function buildConfidenceMap(entry) {
  const skills = getUniqueSkills(entry.extractedSkills);
  const currentMap = entry.skillConfidenceMap || {};
  const merged = {};

  skills.forEach((skill) => {
    merged[skill] = currentMap[skill] === "know" ? "know" : "practice";
  });

  return merged;
}

function computeLiveScore(entry) {
  const base = entry.baseReadinessScore ?? entry.readinessScore ?? 0;
  const skills = getUniqueSkills(entry.extractedSkills);
  const map = entry.skillConfidenceMap || {};

  const knowCount = skills.filter((skill) => map[skill] === "know").length;
  const practiceCount = skills.length - knowCount;

  return clampScore(base + knowCount * 2 - practiceCount * 2);
}

function buildChecklistText(entry) {
  return Object.entries(entry.checklist)
    .map(([round, items]) => `${round}\n${items.map((item) => `- ${item}`).join("\n")}`)
    .join("\n\n");
}

function buildPlanText(entry) {
  return entry.plan
    .map(
      (dayBlock) =>
        `${dayBlock.day} (${dayBlock.focus})\n${dayBlock.tasks.map((task) => `- ${task}`).join("\n")}`,
    )
    .join("\n\n");
}

function buildQuestionsText(entry) {
  return entry.questions.map((question, index) => `${index + 1}. ${question}`).join("\n");
}

function buildFullExportText(entry, liveScore) {
  return [
    "Placement Readiness Analysis",
    `Company: ${entry.company?.trim() || "Unknown Company"}`,
    `Role: ${entry.role?.trim() || "General Role"}`,
    `Created At: ${new Date(entry.createdAt).toLocaleString()}`,
    `Readiness Score: ${liveScore}/100 (Base: ${entry.baseReadinessScore ?? entry.readinessScore}/100)`,
    "",
    "Company Intel",
    `Company: ${entry.companyIntel?.companyName || "Not provided"}`,
    `Industry: ${entry.companyIntel?.industry || "Technology Services"}`,
    `Estimated Size: ${entry.companyIntel?.sizeCategory || "Startup (<200)"}`,
    `Typical Hiring Focus: ${entry.companyIntel?.typicalHiringFocus || "Practical problem solving + stack depth"}`,
    `${entry.companyIntel?.demoNote || "Demo Mode: Company intel generated heuristically."}`,
    "",
    "Round Mapping",
    ...(entry.roundMapping || []).map(
      (round) => `${round.title}\nFocus: ${round.focus}\nWhy this round matters: ${round.whyItMatters}`,
    ),
    "",
    "Key Skills Extracted",
    ...Object.entries(entry.extractedSkills).map(([category, skills]) => `${category}: ${skills.join(", ")}`),
    "",
    "Round-wise Preparation Checklist",
    buildChecklistText(entry),
    "",
    "7-Day Plan",
    buildPlanText(entry),
    "",
    "10 Likely Interview Questions",
    buildQuestionsText(entry),
  ].join("\n");
}

function SkillTags({ extractedSkills, skillConfidenceMap, onChangeConfidence }) {
  return (
    <div className="space-y-4">
      {Object.entries(extractedSkills).map(([category, skills]) => (
        <div key={category}>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</p>
          <div className="space-y-2">
            {skills.map((skill) => {
              const confidence = skillConfidenceMap[skill] || "practice";
              return (
                <div
                  key={`${category}-${skill}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <span className="text-sm font-medium text-slate-900">{skill}</span>
                  <div className="inline-flex rounded-lg border border-slate-300 p-1">
                    <button
                      type="button"
                      onClick={() => onChangeConfidence(skill, "know")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                        confidence === "know"
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      I know this
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeConfidence(skill, "practice")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                        confidence === "practice"
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      Need practice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedId = searchParams.get("id");
  const [entry, setEntry] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  const loadedEntry = useMemo(() => {
    if (selectedId) {
      const selected = getEntryById(selectedId);
      if (selected) return selected;
    }
    return getLatestEntry();
  }, [selectedId]);

  useEffect(() => {
    if (!loadedEntry) {
      setEntry(null);
      return;
    }

    const companyIntel =
      loadedEntry.companyIntel ||
      generateCompanyIntel({ company: loadedEntry.company, jdText: loadedEntry.jdText });

    const roundMapping =
      loadedEntry.roundMapping ||
      generateRoundMapping({ extractedSkills: loadedEntry.extractedSkills, companyIntel });

    const normalized = {
      ...loadedEntry,
      companyIntel,
      roundMapping,
      baseReadinessScore: loadedEntry.baseReadinessScore ?? loadedEntry.readinessScore,
      skillConfidenceMap: buildConfidenceMap(loadedEntry),
    };

    const liveScore = computeLiveScore(normalized);
    const finalEntry = { ...normalized, readinessScore: liveScore };
    setEntry(finalEntry);

    const needsPersist =
      loadedEntry.baseReadinessScore == null ||
      !loadedEntry.companyIntel ||
      !loadedEntry.roundMapping ||
      JSON.stringify(loadedEntry.skillConfidenceMap || {}) !==
        JSON.stringify(finalEntry.skillConfidenceMap || {}) ||
      loadedEntry.readinessScore !== finalEntry.readinessScore;

    if (needsPersist) {
      updateHistoryEntry(finalEntry.id, finalEntry);
    }
  }, [loadedEntry]);

  const liveScore = useMemo(() => (entry ? computeLiveScore(entry) : 0), [entry]);

  const weakSkills = useMemo(() => {
    if (!entry) return [];
    return getUniqueSkills(entry.extractedSkills)
      .filter((skill) => (entry.skillConfidenceMap[skill] || "practice") === "practice")
      .slice(0, 3);
  }, [entry]);

  const handleSkillChange = (skill, value) => {
    if (!entry) return;

    const nextMap = { ...entry.skillConfidenceMap, [skill]: value };
    const updatedEntry = {
      ...entry,
      skillConfidenceMap: nextMap,
      baseReadinessScore: entry.baseReadinessScore ?? entry.readinessScore,
    };

    updatedEntry.readinessScore = computeLiveScore(updatedEntry);
    setEntry(updatedEntry);
    updateHistoryEntry(updatedEntry.id, updatedEntry);
  };

  const handleCopy = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${label} copied`);
    } catch {
      setCopyStatus(`Unable to copy ${label.toLowerCase()}`);
    }

    setTimeout(() => setCopyStatus(""), 1800);
  };

  const handleDownload = () => {
    if (!entry) return;
    const text = buildFullExportText(entry, liveScore);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `placement-analysis-${entry.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!entry) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>No analysis found</CardTitle>
            <CardDescription>Run analysis from Practice to generate your first results entry.</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => navigate("/app/practice")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Go to Practice
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            {(entry.company?.trim() || "Unknown Company") + " - " + (entry.role?.trim() || "General Role")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{new Date(entry.createdAt).toLocaleString()}</p>
          <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Readiness Score: {liveScore}/100
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Tools</CardTitle>
          <CardDescription>Copy sections or download a complete text report.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCopy("7-day plan", buildPlanText(entry))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Copy 7-day plan
            </button>
            <button
              onClick={() => handleCopy("round checklist", buildChecklistText(entry))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Copy round checklist
            </button>
            <button
              onClick={() => handleCopy("10 questions", buildQuestionsText(entry))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Copy 10 questions
            </button>
            <button
              onClick={handleDownload}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Download as TXT
            </button>
          </div>
          {copyStatus ? <p className="mt-3 text-sm text-slate-600">{copyStatus}</p> : null}
        </CardContent>
      </Card>

      {entry.company?.trim() ? (
        <Card>
          <CardHeader>
            <CardTitle>Company Intel</CardTitle>
            <CardDescription>Heuristic company context to tailor preparation strategy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Company</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{entry.companyIntel.companyName}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Industry</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{entry.companyIntel.industry}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Estimated Size</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{entry.companyIntel.sizeCategory}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Typical Hiring Focus</p>
              <p className="mt-1 text-sm text-slate-600">{entry.companyIntel.typicalHiringFocus}</p>
            </div>

            <p className="text-xs text-slate-500">{entry.companyIntel.demoNote}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Round Mapping</CardTitle>
          <CardDescription>Dynamic interview flow based on company profile and detected skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entry.roundMapping.map((round, index) => (
              <div key={round.title} className="relative pl-8">
                <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                {index !== entry.roundMapping.length - 1 ? (
                  <span className="absolute left-[5px] top-5 h-[calc(100%-8px)] w-px bg-slate-300" />
                ) : null}
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{round.title}</p>
                  <p className="mt-1 text-sm text-primary">{round.focus}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Why this round matters:</span>{" "}
                    {round.whyItMatters}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Skills Extracted</CardTitle>
            <CardDescription>Mark confidence per skill. Default is Need practice.</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillTags
              extractedSkills={entry.extractedSkills}
              skillConfidenceMap={entry.skillConfidenceMap}
              onChangeConfidence={handleSkillChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Round-wise Preparation Checklist</CardTitle>
            <CardDescription>Template with skill-aware checkpoints for each interview round.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(entry.checklist).map(([round, items]) => (
              <div key={round}>
                <p className="text-sm font-semibold text-slate-800">{round}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {items.map((item) => (
                    <li key={`${round}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Plan</CardTitle>
          <CardDescription>Adaptive plan based on detected stack and role context.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {entry.plan.map((dayBlock) => (
            <div key={dayBlock.day} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{dayBlock.day}</p>
              <p className="text-sm text-primary">{dayBlock.focus}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {dayBlock.tasks.map((task) => (
                  <li key={`${dayBlock.day}-${task}`}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10 Likely Interview Questions</CardTitle>
          <CardDescription>Generated from your extracted skill profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
            {entry.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Next</CardTitle>
          <CardDescription>Focus these weak skills first, then start execution.</CardDescription>
        </CardHeader>
        <CardContent>
          {weakSkills.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {weakSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">Start Day 1 plan now.</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-700">
              All extracted skills are marked as known. Start Day 1 plan now.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultsPage;
