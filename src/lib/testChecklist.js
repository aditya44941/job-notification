const STORAGE_KEY = "placement_prp_test_checklist_v1";

export const TEST_ITEMS = [
  {
    id: "jd_required_validation",
    label: "JD required validation works",
    hint: "Try submitting the analyzer form with empty JD and confirm browser required validation blocks submit.",
  },
  {
    id: "short_jd_warning",
    label: "Short JD warning shows for <200 chars",
    hint: "Paste a short JD and verify the warning text appears under textarea.",
  },
  {
    id: "skills_grouping",
    label: "Skills extraction groups correctly",
    hint: "Use a JD with React, SQL, AWS, DSA and confirm skills appear in correct groups.",
  },
  {
    id: "round_mapping_dynamic",
    label: "Round mapping changes based on company + skills",
    hint: "Compare Amazon + DSA vs unknown startup + React/Node and confirm timeline differs.",
  },
  {
    id: "score_deterministic",
    label: "Score calculation is deterministic",
    hint: "Run same JD twice and verify base score remains the same.",
  },
  {
    id: "skill_toggle_live_score",
    label: "Skill toggles update score live",
    hint: "Toggle skill confidence and verify final score updates immediately.",
  },
  {
    id: "persist_after_refresh",
    label: "Changes persist after refresh",
    hint: "Refresh /results and verify skill confidence + final score remain unchanged.",
  },
  {
    id: "history_save_load",
    label: "History saves and loads correctly",
    hint: "Create analysis and confirm it appears in history and reopens from /results?id=.",
  },
  {
    id: "export_buttons",
    label: "Export buttons copy the correct content",
    hint: "Use copy and download actions on /results and validate output text blocks.",
  },
  {
    id: "no_console_errors",
    label: "No console errors on core pages",
    hint: "Open browser devtools and check /, /results, /app/practice, /app/resources for errors.",
  },
];

function defaultChecklistState() {
  return TEST_ITEMS.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {});
}

function normalizeState(raw) {
  const defaults = defaultChecklistState();
  if (!raw || typeof raw !== "object") return defaults;

  return TEST_ITEMS.reduce((acc, item) => {
    acc[item.id] = Boolean(raw[item.id]);
    return acc;
  }, {});
}

export function getChecklistState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultChecklistState();
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return defaultChecklistState();
  }
}

export function saveChecklistState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
}

export function resetChecklistState() {
  const empty = defaultChecklistState();
  saveChecklistState(empty);
  return empty;
}

export function getPassedCount(state) {
  return Object.values(state || {}).filter(Boolean).length;
}

export function isChecklistComplete(state) {
  return getPassedCount(state) === TEST_ITEMS.length;
}
