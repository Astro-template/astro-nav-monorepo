import Mustache from "mustache";
import type { SiteRow, CategoryRow } from "../types";
import pendingTemplate from "../templates/partials/pending.mustache";
import sitesTemplate from "../templates/partials/sites.mustache";
import categoriesTemplate from "../templates/partials/categories.mustache";

export function renderPending(pending: SiteRow[], approvedCount: number): string {
  return Mustache.render(pendingTemplate, {
    pendingCount: pending.length,
    approvedCount,
    totalCount: pending.length + approvedCount,
    hasPending: pending.length > 0,
    sites: pending,
  });
}

export function renderSites(sites: SiteRow[]): string {
  const viewSites = sites.map((s) => ({
    ...s,
    featured: s.featured === 1,
    statusBadge: statusBadge(s.status),
  }));
  return Mustache.render(sitesTemplate, { sites: viewSites });
}

export function renderCategories(categories: (CategoryRow & { siteCount: number })[]): string {
  return Mustache.render(categoriesTemplate, { categories });
}

function statusBadge(status: string): string {
  switch (status) {
    case "approved": return '<span class="badge badge-success badge-sm">已通过</span>';
    case "rejected": return '<span class="badge badge-error badge-sm">已拒绝</span>';
    default: return '<span class="badge badge-warning badge-sm">待审核</span>';
  }
}
