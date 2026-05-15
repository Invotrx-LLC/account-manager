  // src/config/breadcrumbConfig.js

  import DashboardIcon from "@mui/icons-material/GridViewRounded";
  import BusinessIcon  from "@mui/icons-material/CorporateFareRounded";
  import WorkIcon      from "@mui/icons-material/WorkOutlineRounded";
  import PeopleIcon    from "@mui/icons-material/PersonOutlineRounded";
  import CalendarIcon  from "@mui/icons-material/CalendarMonthOutlined";
  import SettingsIcon  from "@mui/icons-material/SettingsOutlined";
import { ManageAccountsOutlined } from "@mui/icons-material";

  // ─────────────────────────────────────────────────────────────
  // Segment → label/icon/path lookup
  // ─────────────────────────────────────────────────────────────
  export const BREADCRUMB_MAP = {
    dashboard:        { label: "Dashboard",    icon: DashboardIcon, path: "/account-manager/dashboard"    },
    organization:     { label: "Organizations",icon: BusinessIcon,  path: "/account-manager/organization" },
    orgrequisitions:  { label: "Requisitions", icon: WorkIcon,      path: null },
    orgcandidates:    { label: "Candidates",   icon: PeopleIcon,    path: null },
    requisitions:     { label: "Requisitions", icon: WorkIcon,      path: "/account-manager/requisitions" },
    interviews:       { label: "Interviews",   icon: CalendarIcon,  path: "/account-manager/interviews"   },
    candidates:       { label: "Candidates",   icon: PeopleIcon,    path: "/account-manager/candidate"   },
    candidate:        { label: "Candidate",    icon: PeopleIcon,    path: null },
    settings:         { label: "Settings",     icon: SettingsIcon,  path: "/account-manager/settings"     },
    _dynamic:         { icon: WorkIcon }, // fallback icon for resolved dynamic segments
  };

  // ─────────────────────────────────────────────────────────────
  // ROUTE_TRAILS

  // ─────────────────────────────────────────────────────────────
export const ROUTE_TRAILS = [

  // ── Dashboard ────────────────────────────────────────────────
  {
    match: "/account-manager/dashboard",
    exact: true,
    trail: [
      {
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/account-manager/dashboard",
        isLast: true,
      },
    ],
  },


  // ── User Management ───────────────────────────────────────
{
  match: "/account-manager/user-management",
  exact: true,
  trail: [
    {
      label: "User Management",
      icon: ManageAccountsOutlined,
      path: "/account-manager/user-management",
      isLast: true,
    },
  ],
},


  // ── Organizations list ───────────────────────────────────────
  {
    match: "/account-manager/organization",
    exact: true,
    trail: [
      {
        label: "Organizations",
        icon: BusinessIcon,
        path: "/account-manager/organization",
        isLast: true,
      },
    ],
  },

  // ── Org Overview ─────────────────────────────────────────────
  // URL: /account-manager/org/:orgId
  {
    match: "/account-manager/org/",
    segmentCount: 3,
    trail: [
      {
        label: "Organizations",
        icon: BusinessIcon,
        path: "/account-manager/organization",
      },
      {
        label: "__orgId__",
        icon: BusinessIcon,
        path: null,
        dynamic: "orgId",
        isLast: true,
      },
    ],
  },

  // ── Org → Requisitions List ──────────────────────────────────
  // URL: /account-manager/org/:orgId/requisitions
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      {
        label: "Organizations",
        icon: BusinessIcon,
        path: "/account-manager/organization",
      },
      {
        label: "__orgId__",
        icon: BusinessIcon,
        path: null,
        dynamic: "orgId",
      },
      {
        label: "Requisitions",
        icon: WorkIcon,
        path: null,
        isLast: true,
      },
    ],
  },

  // ── Requisition Detail ───────────────────────────────────────
  // URL: /account-manager/org/:orgId/requisitions/:jobId
  {
    match: "/account-manager/org/",
    segmentCount: 5,
    trail: [
      {
        label: "Organizations",
        icon: BusinessIcon,
        path: "/account-manager/organization",
      },
      {
        label: "__orgId__",
        icon: BusinessIcon,
        path: null,
        dynamic: "orgId",
      },
      {
        label: "Requisitions",
        icon: WorkIcon,
        path: null,
      },
      {
        label: "__jobId__",
        icon: WorkIcon,
        path: null,
        dynamic: "jobId",
        isLast: true,
      },
    ],
  },

  // ── Org → Candidates (all jobs) ──────────────────────────────
  // URL: /account-manager/org/:orgId/candidates
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      {
        label: "Organizations",
        icon: BusinessIcon,
        path: "/account-manager/organization",
      },
      {
        label: "__orgId__",
        icon: BusinessIcon,
        path: null,
        dynamic: "orgId",
      },
      {
        label: "Candidates",
        icon: PeopleIcon,
        path: null,
        isLast: true,
      },
    ],
  },

  // ── Candidate Detail ─────────────────────────────────────────
  // URL: /account-manager/candidate/:candidateId
// Make sure this trail exists:
{
  match: "/account-manager/candidate/",
  trail: [
    { label: "Organizations",   icon: BusinessIcon, path: "/account-manager/organization"  },
    { label: "__orgId__",       icon: BusinessIcon, path: null, dynamic: "orgId"            },
    { label: "__jobId__",       icon: WorkIcon,     path: null, dynamic: "jobId"            },
    { label: "__candidateId__", icon: PeopleIcon,   path: null, dynamic: "candidateId", isLast: true },
  ],
},

  // ── Interviews (Org level) ───────────────────────────────────
  // URL: /account-manager/org/:orgId/interviews
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      {
        label: "Organizations",
        icon: BusinessIcon,
        path: "/account-manager/organization",
      },
      {
        label: "__orgId__",
        icon: BusinessIcon,
        path: null,
        dynamic: "orgId",
      },
      {
        label: "Interviews",
        icon: CalendarIcon,
        path: null,
        isLast: true,
      },
    ],
  },

  // ── Billing ──────────────────────────────────────────────────
  // URL: /account-manager/org/:orgId/billing
  {
    match: "/account-manager/org/",
    segmentCount: 4,
    trail: [
      {
        label: "Organizations",
        icon: BusinessIcon,
        path: "/account-manager/organization",
      },
      {
        label: "__orgId__",
        icon: BusinessIcon,
        path: null,
        dynamic: "orgId",
      },
      {
        label: "Billing",
        icon: SettingsIcon,
        path: null,
        isLast: true,
      },
    ],
  },
];

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Find the matching trail for the current pathname.
   * Tries exact match first, then startsWith.
   */
export function getTrailForPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  const match = ROUTE_TRAILS.find((r) => {
    if (!pathname.startsWith(r.match)) return false;
    if (r.segmentCount && r.segmentCount !== segments.length) return false;
    if (r.exact && r.match !== pathname) return false;
    return true;
  });

  return match?.trail ?? null;
}

  /**
   * Resolve dynamic placeholders in a trail using the supplied labels.
   * e.g. { orgId: "Inc", jobId: "Statistical Programmer" }
   * Crumbs whose dynamic key has no matching label are hidden (returns null → filtered out).
   */
  export function resolveTrail(trail, dynamicLabels = {}) {
    const resolved = [];

    for (const crumb of trail) {
      if (crumb.dynamic) {
        const label = dynamicLabels[crumb.dynamic];
        if (!label) continue; // hide if no label supplied yet
        resolved.push({ ...crumb, label });
      } else {
        resolved.push({ ...crumb });
      }
    }

    // Re-stamp isLast on the final item after filtering
    if (resolved.length > 0) {
      resolved.forEach((c) => delete c.isLast);
      resolved[resolved.length - 1].isLast = true;
    }

    return resolved;
  }