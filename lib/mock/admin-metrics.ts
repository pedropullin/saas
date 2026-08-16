import type { AdminMetrics } from "../types";

export const adminMetrics: AdminMetrics = {
  totalUsers: 2841,
  newUsersThisMonth: 214,
  identitiesCreated: 1926,
  activeProjects: 358,
  activeDesigners: 42,
  revenue: 186400,
  conversionRate: 7.8,
  usersOverTime: [
    { label: "Mar", value: 1620 },
    { label: "Abr", value: 1810 },
    { label: "Mai", value: 2005 },
    { label: "Jun", value: 2260 },
    { label: "Jul", value: 2540 },
    { label: "Ago", value: 2841 },
  ],
  revenueOverTime: [
    { label: "Mar", value: 92000 },
    { label: "Abr", value: 104500 },
    { label: "Mai", value: 121800 },
    { label: "Jun", value: 143200 },
    { label: "Jul", value: 168900 },
    { label: "Ago", value: 186400 },
  ],
  planDistribution: [
    { label: "Free", value: 48 },
    { label: "Pro", value: 37 },
    { label: "Business", value: 15 },
  ],
};
