import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const readinessScore = 72;
const readinessMax = 100;

const radarData = [
  { skill: "DSA", score: 75 },
  { skill: "System Design", score: 60 },
  { skill: "Communication", score: 80 },
  { skill: "Resume", score: 85 },
  { skill: "Aptitude", score: 70 },
];

const upcomingAssessments = [
  { title: "DSA Mock Test", time: "Tomorrow, 10:00 AM" },
  { title: "System Design Review", time: "Wed, 2:00 PM" },
  { title: "HR Interview Prep", time: "Friday, 11:00 AM" },
];

const weeklyDays = [
  { day: "Mon", active: true },
  { day: "Tue", active: true },
  { day: "Wed", active: false },
  { day: "Thu", active: true },
  { day: "Fri", active: false },
  { day: "Sat", active: true },
  { day: "Sun", active: false },
];

function OverallReadinessCard() {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - readinessScore / readinessMax);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Readiness</CardTitle>
        <CardDescription>Your current placement preparation score.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-8">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg className="h-56 w-56 -rotate-90" viewBox="0 0 200 200" aria-label="Readiness score">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(226 23% 88%)" strokeWidth="14" />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="hsl(245 58% 51%)"
              strokeLinecap="round"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="readiness-ring-progress"
              style={{
                ["--ring-length"]: `${circumference}`,
                ["--ring-target"]: `${offset}`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-5xl font-bold text-slate-900">{readinessScore}/100</p>
            <p className="mt-2 text-sm font-medium text-slate-600">Readiness Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillBreakdownCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Breakdown</CardTitle>
        <CardDescription>Performance across core placement dimensions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="74%">
              <PolarGrid stroke="hsl(215 20% 80%)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215 16% 35%)", fontSize: 12 }} />
              <Tooltip />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(245 58% 51%)"
                fill="hsl(245 58% 51%)"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ContinuePracticeCard() {
  const completed = 3;
  const total = 10;
  const progressPercent = (completed / total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Practice</CardTitle>
        <CardDescription>Pick up where you left off.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base font-medium text-slate-900">Last Topic: Dynamic Programming</p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-600">{completed}/10 completed</p>
        <button className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
          Continue
        </button>
      </CardContent>
    </Card>
  );
}

function WeeklyGoalsCard() {
  const solved = 12;
  const goal = 20;
  const progressPercent = (solved / goal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Goals</CardTitle>
        <CardDescription>Track momentum for this week.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base font-medium text-slate-900">Problems Solved: 12/20 this week</p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {weeklyDays.map(({ day, active }) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full border border-slate-300 ${
                  active ? "bg-primary" : "bg-white"
                }`}
                title={day}
              />
              <span className="text-xs text-slate-500">{day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingAssessmentsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Assessments</CardTitle>
        <CardDescription>Stay ahead of your scheduled preparation events.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {upcomingAssessments.map((item) => (
            <li key={item.title} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.time}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <OverallReadinessCard />
      <SkillBreakdownCard />
      <ContinuePracticeCard />
      <WeeklyGoalsCard />
      <div className="lg:col-span-2">
        <UpcomingAssessmentsCard />
      </div>
    </section>
  );
}

export default DashboardPage;
