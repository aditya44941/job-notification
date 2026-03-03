import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  getChecklistState,
  getPassedCount,
  isChecklistComplete,
  resetChecklistState,
  saveChecklistState,
  TEST_ITEMS,
} from "../lib/testChecklist";

function TestChecklistPage() {
  const [checklist, setChecklist] = useState(() => getChecklistState());

  const passedCount = useMemo(() => getPassedCount(checklist), [checklist]);
  const complete = useMemo(() => isChecklistComplete(checklist), [checklist]);

  const handleToggle = (id) => {
    const updated = { ...checklist, [id]: !checklist[id] };
    setChecklist(updated);
    saveChecklistState(updated);
  };

  const handleReset = () => {
    const empty = resetChecklistState();
    setChecklist(empty);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>PRP Test Checklist</CardTitle>
          <CardDescription>Tests Passed: {passedCount} / 10</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!complete ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Fix issues before shipping.
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              All tests passed. Ship route is now unlocked.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Reset checklist
            </button>
            <Link
              to="/prp/08-ship"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Go to Ship Gate
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Validation Items</CardTitle>
          <CardDescription>Mark each item only after verifying behavior in the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {TEST_ITEMS.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-200 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[item.id])}
                    onChange={() => handleToggle(item.id)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                    <span className="block text-xs text-slate-500">How to test: {item.hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default TestChecklistPage;
