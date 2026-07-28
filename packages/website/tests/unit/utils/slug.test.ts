import { describe, it, expect } from 'vitest';
import type { SiteConfig } from '@astro-nav/shared';
import { buildSlugMap, siteKey, toSlugBase } from '../../../src/utils/slug';

function makeConfig(): SiteConfig {
  return {
    site: { title: 't', description: 'd', logo: { text: 't', href: '/' } },
    categoryMap: {},
    menuItems: [
      {
        name: 'A',
        href: '#a',
        icon: 'i',
        type: 'single',
        sites: [
          { title: 'Gmail', url: 'https://mail.google.com', description: '' },
          { title: 'Free SMS', url: 'https://a.example', description: '' },
        ],
      },
      {
        name: 'B',
        href: '#b',
        icon: 'i',
        type: 'tabs',
        submenu: [
          {
            name: 'B1',
            href: '#b1',
            icon: 'i',
            sites: [
              { title: 'Gmail', url: 'https://mail.google.com', description: '' },
              { title: 'Free SMS', url: 'https://b.example', description: '' },
              { title: 'No Url', description: '' },
            ],
          },
        ],
      },
    ],
  } as SiteConfig;
}

describe('toSlugBase', () => {
  it('lowercases and replaces spaces and slashes', () => {
    expect(toSlugBase('Mail / Domain Tools')).toBe('mail-domain-tools');
  });
});

describe('buildSlugMap', () => {
  const map = buildSlugMap(makeConfig());

  it('reuses one slug when title and url match', () => {
    expect(map.get(siteKey('Gmail', 'https://mail.google.com'))).toBe('gmail');
    expect([...map.values()].filter((s) => s === 'gmail')).toHaveLength(1);
  });

  it('suffixes same-title sites that point at different urls', () => {
    expect(map.get(siteKey('Free SMS', 'https://a.example'))).toBe('free-sms');
    expect(map.get(siteKey('Free SMS', 'https://b.example'))).toBe('free-sms-2');
  });

  it('treats a missing url as #', () => {
    expect(map.get(siteKey('No Url', undefined))).toBe('no-url');
    expect(map.get(siteKey('No Url', '#'))).toBe('no-url');
  });

  it('produces unique slugs overall', () => {
    const values = [...map.values()];
    expect(new Set(values).size).toBe(values.length);
  });
});
