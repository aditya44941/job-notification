import {
  buildDefaultSkillConfidenceMap,
  computeFinalScore,
  createEmptyExtractedSkills,
  generateAnalysis,
  getAllSkillsFromExtracted,
} from "./analysis";

const STORAGE_KEY = "placement_readiness_history_v1";

let lastCorruptedCount = 0;

const LEGACY_CATEGORY_MAP = {
  "Core CS": "coreCS",
  Languages: "languages",
  Web: "web",
  Data: "data",
  "Cloud/DevOps": "cloud",
  Testing: "testing",
  General: "other",
};

function asString(value) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function normalizeExtractedSkills(raw) {
  const base = createEmptyExtractedSkills();
  if (!raw || typeof raw !== "object") return base;

  Object.entries(raw).forEach(([key, value]) => {
    const mapped = LEGACY_CATEGORY_MAP[key] || key;
    if (Object.prototype.hasOwnProperty.call(base, mapped)) {
      base[mapped] = asStringArray(value);
    }
  });

  return base;
}

function normalizeChecklist(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => ({ roundTitle: asString(item?.roundTitle), items: asStringArray(item?.items) }))
      .filter((item) => item.roundTitle);
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([roundTitle, items]) => ({ roundTitle, items: asStringArray(items) }));
  }

  return [];
}

function normalizePlan(raw) {
  const source = Array.isArray(raw) ? raw : [];
  return source
    .map((item) => ({ day: asString(item?.day), focus: asString(item?.focus), tasks: asStringArray(item?.tasks) }))
    .filter((item) => item.day);
}

function normalizeRoundMapping(raw) {
  const source = Array.isArray(raw) ? raw : [];
  return source
    .map((item) => ({
      roundTitle: asString(item?.roundTitle || item?.title),
      focusAreas: Array.isArray(item?.focusAreas)
        ? asStringArray(item.focusAreas)
        : asString(item?.focus)
          ? [asString(item.focus)]
          : [],
      whyItMatters: asString(item?.whyItMatters || item?.why),
    }))
    .filter((item) => item.roundTitle);
}

function normalizeSkillConfidenceMap(rawMap, extractedSkills) {
  const allowedSkills = getAllSkillsFromExtracted(extractedSkills);
  const out = {};
  const input = rawMap && typeof rawMap === "object" ? rawMap : {};

  allowedSkills.forEach((skill) => {
    out[skill] = input[skill] === "know" ? "know" : "practice";
  });

  return out;
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") throw new Error("Invalid entry shape");

  const company = asString(raw.company);
  const role = asString(raw.role);
  const jdText = asString(raw.jdText);

  if (!jdText.trim()) throw new Error("Missing JD text");

  const analysisFallback = generateAnalysis({ company, role, jdText });

  const extractedSkills = normalizeExtractedSkills(raw.extractedSkills);
  const hasAnySkill = getAllSkillsFromExtracted(extractedSkills).length > 0;
  const finalExtracted = hasAnySkill ? extractedSkills : analysisFallback.extractedSkills;

  const checklist = normalizeChecklist(raw.checklist);
  const roundMapping = normalizeRoundMapping(raw.roundMapping);
  const plan7Days = normalizePlan(raw.plan7Days || raw.plan || []);
  const questions = asStringArray(raw.questions).slice(0, 10);

  const baseScore = Number.isFinite(raw.baseScore)
    ? Number(raw.baseScore)
    : Number.isFinite(raw.baseReadinessScore)
      ? Number(raw.baseReadinessScore)
      : Number.isFinite(raw.readinessScore)
        ? Number(raw.readinessScore)
        : analysisFallback.baseScore;

  const skillConfidenceMap = normalizeSkillConfidenceMap(raw.skillConfidenceMap, finalExtracted);
  const resolvedSkillMap =
    Object.keys(skillConfidenceMap).length > 0
      ? skillConfidenceMap
      : buildDefaultSkillConfidenceMap(finalExtracted);
  const finalScore = computeFinalScore(baseScore, resolvedSkillMap);

  return {
    id: asString(raw.id) || crypto.randomUUID(),
    createdAt: asString(raw.createdAt) || new Date().toISOString(),
    company,
    role,
    jdText,
    extractedSkills: finalExtracted,
    roundMapping: roundMapping.length ? roundMapping : analysisFallback.roundMapping,
    checklist: checklist.length ? checklist : analysisFallback.checklist,
    plan7Days: plan7Days.length ? plan7Days : analysisFallback.plan7Days,
    questions: questions.length ? questions : analysisFallback.questions,
    baseScore,
    skillConfidenceMap: resolvedSkillMap,
    finalScore: Math.max(0, Math.min(100, finalScore)),
    updatedAt: asString(raw.updatedAt) || asString(raw.createdAt) || new Date().toISOString(),
    companyIntel: raw.companyIntel || analysisFallback.companyIntel,
  };
}

function readHistoryState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      lastCorruptedCount = 1;
      return { entries: [], corruptedCount: 1 };
    }

    const entries = [];
    let corruptedCount = 0;

    parsed.forEach((item) => {
      try {
        entries.push(normalizeEntry(item));
      } catch {
        corruptedCount += 1;
      }
    });

    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    lastCorruptedCount = corruptedCount;
    return { entries, corruptedCount };
  } catch {
    lastCorruptedCount = 1;
    return { entries: [], corruptedCount: 1 };
  }
}

function writeHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getHistory() {
  return readHistoryState().entries;
}

export function getHistoryMeta() {
  const { corruptedCount } = readHistoryState();
  return { corruptedCount };
}

export function getHistoryWarningMessage() {
  const { corruptedCount } = readHistoryState();
  return corruptedCount > 0 ? "One saved entry couldn't be loaded. Create a new analysis." : "";
}

export function saveAnalysisEntry(entry) {
  const { entries } = readHistoryState();
  const normalized = normalizeEntry(entry);
  entries.unshift(normalized);
  writeHistory(entries);
}

export function getLatestEntry() {
  const history = getHistory();
  return history[0] || null;
}

export function getEntryById(id) {
  if (!id) return null;
  const history = getHistory();
  return history.find((entry) => entry.id === id) || null;
}

export function updateHistoryEntry(id, updater) {
  if (!id) return null;
  const { entries } = readHistoryState();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  const current = entries[index];
  const updatedRaw = typeof updater === "function" ? updater(current) : { ...current, ...updater };
  const updated = normalizeEntry({ ...updatedRaw, id: current.id, createdAt: current.createdAt });
  entries[index] = updated;
  writeHistory(entries);
  return updated;
}
