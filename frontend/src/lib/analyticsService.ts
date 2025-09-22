// Mock analytics service for frontend-only demo
export const getSummary = async (start?: string, end?: string) => {
  // small delay to simulate network
  await new Promise((r) => setTimeout(r, 160));

  // For the demo we keep values deterministic-ish but allow the date range to influence numbers slightly.
  const days =
    start && end
      ? Math.max(
          1,
          (new Date(end).getTime() - new Date(start).getTime()) /
            (24 * 60 * 60 * 1000)
        )
      : 14;

  const activeStudents = 80; // single source of truth for demo
  const newThisMonth = Math.max(0, Math.round(12 * (days / 30)));
  const pendingApplications = Math.max(0, Math.round(34 * (days / 14)));
  const avgDecisionDays = 9;

  // generate small spark arrays sized to 10
  const makeSpark = (base: number) =>
    Array.from({ length: 10 }).map((_, i) =>
      Math.max(0, Math.round(base + Math.sin(i / 2) * 2))
    );

  return {
    activeStudents,
    newThisMonth,
    pendingApplications,
    avgDecisionDays,
    sparklineApplications: makeSpark(4),
    sparklineNewUsers: makeSpark(1),
    sparklineAvgDecision: makeSpark(9),
    // leave-related demo metrics
    pendingLeaves: Math.round(8 * Math.max(0.5, Math.min(2, days / 14))),
    sparklineLeaveRequests: makeSpark(3),
    // percentage-like spark for interview rate
    sparklineInterviewRate: makeSpark(40),
  };
};

export const getTrends = async (start?: string, end?: string) => {
  await new Promise((r) => setTimeout(r, 160));

  const days =
    start && end
      ? Math.max(
          1,
          Math.round(
            (new Date(end).getTime() - new Date(start).getTime()) /
              (24 * 60 * 60 * 1000)
          )
        )
      : 14;

  const data = Array.from({ length: days }).map((_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    applications: Math.max(
      0,
      Math.round(3 + Math.sin(i / 2) * 3 + (i % 3 === 0 ? 2 : 0))
    ),
    hires: Math.max(0, Math.round(Math.sin(i / 3) * 1.5 + 1)),
  }));
  return data;
};

export const getPipeline = async (start?: string, end?: string) => {
  await new Promise((r) => setTimeout(r, 140));
  // Keep pipeline totals stable but scale minorly with date range
  const scale =
    start && end
      ? Math.max(
          0.5,
          Math.min(
            2,
            (new Date(end).getTime() - new Date(start).getTime()) /
              (24 * 60 * 60 * 1000) /
              14
          )
        )
      : 1;
  return {
    applied: Math.round(200 * scale),
    reviewed: Math.round(150 * scale),
    interviewed: Math.round(80 * scale),
    offered: Math.round(25 * scale),
    accepted: Math.round(20 * scale),
    rejected: Math.round(130 * scale),
  };
};
