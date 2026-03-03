import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getChecklistState, getPassedCount, isChecklistComplete, TEST_ITEMS } from "../lib/testChecklist";

function ShipGatePage() {
  const checklist = getChecklistState();
  const complete = isChecklistComplete(checklist);
  const passed = getPassedCount(checklist);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Gate</CardTitle>
          <CardDescription>Tests Passed: {passed} / {TEST_ITEMS.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {!complete ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Shipping is locked. Complete all test checklist items before shipping.
              </div>
              <Link
                to="/prp/07-test"
                className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Open Test Checklist
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Shipping unlocked. All test checklist items are complete.
              </div>
              <p className="text-sm text-slate-600">Proceed with release steps confidently.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ShipGatePage;
