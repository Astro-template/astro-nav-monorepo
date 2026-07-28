import Mustache from "mustache";
import type { SiteRow, CategoryRow, SiteSettings } from "../types";
import pendingTemplate from "../templates/partials/pending.mustache";
import sitesTemplate from "../templates/partials/sites.mustache";
import categoriesTemplate from "../templates/partials/categories.mustache";
import addSiteTemplate from "../templates/partials/add-site.mustache";
import settingsTemplate from "../templates/partials/settings.mustache";

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

type CatWithCount = CategoryRow & { siteCount: number };

export function renderCategories(categories: CatWithCount[]): string {
  const topLevel = categories.filter((c) => !c.parent_id);
  const children = categories.filter((c) => c.parent_id);
  const rows = topLevel.flatMap((cat) => {
    const subs = children.filter((c) => c.parent_id === cat.id);
    return [
      { ...cat, isChild: false, hasChildren: subs.length > 0 },
      ...subs.map((sub) => ({ ...sub, isChild: true, hasChildren: false })),
    ];
  });
  const parents = topLevel.map((c) => ({ id: c.id, name: c.name }));
  return Mustache.render(categoriesTemplate, { categories: rows, parents });
}

export function renderAddSite(categories: CatWithCount[]): string {
  const topLevel = categories.filter((c) => !c.parent_id);
  const children = categories.filter((c) => c.parent_id);
  const options = topLevel.flatMap((cat) => {
    const subs = children.filter((c) => c.parent_id === cat.id);
    if (subs.length > 0) {
      return [
        { id: cat.id, label: cat.name, disabled: true, isChild: false },
        ...subs.map((sub) => ({ id: sub.id, label: sub.name, disabled: false, isChild: true })),
      ];
    }
    return [{ id: cat.id, label: cat.name, disabled: false, isChild: false }];
  });
  return Mustache.render(addSiteTemplate, { categories: options });
}

export function renderSettings(settings: SiteSettings): string {
  return Mustache.render(settingsTemplate, settings);
}

function statusBadge(status: string): string {
  switch (status) {
    case "approved": return '<span class="badge badge-success badge-sm">已通过</span>';
    case "rejected": return '<span class="badge badge-error badge-sm">已拒绝</span>';
    default: return '<span class="badge badge-warning badge-sm">待审核</span>';
  }
}
