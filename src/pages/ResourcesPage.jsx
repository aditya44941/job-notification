import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getHistory, getHistoryMeta, getHistoryWarningMessage } from "../lib/history";

function ResourcesPage() {
  const navigate = useNavigate();
  const history = useMemo(() => getHistory(), []);
  const historyMeta = useMemo(() => getHistoryMeta(), []);
  const historyWarning = useMemo(() => getHistoryWarningMessage(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>Saved analysis entries from localStorage. Click any entry to open results.</CardDescription>
      </CardHeader>
      <CardContent>
        {historyMeta.corruptedCount > 0 ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {historyWarning}
          </div>
        ) : null}
        {history.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
            No analysis history yet. Go to Practice and run an analysis.
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  onClick={() => navigate(`/results?id=${encodeURIComponent(entry.id)}`)}
                  className="w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {entry.company?.trim() || "Unknown Company"} - {entry.role?.trim() || "General Role"}
                    </p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Score {entry.finalScore}/100
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{new Date(entry.createdAt).toLocaleString()}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default ResourcesPage;
