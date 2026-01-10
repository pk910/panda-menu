export type ColorMode = 'light' | 'dark' | '';
export type MenuMode = 'floating' | 'sidebar' | 'attached';

export interface SidebarConfig {
  /** Position along the edge - defaults to 'center'
   * For left/right sides: 'top' | 'center' | 'bottom' (vertical)
   * For top/bottom sides: 'left' | 'center' | 'right' (horizontal)
   */
  position?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  /** Which side of the screen - defaults to 'left' */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Width/height of the collapsed sidebar in pixels - defaults to 16 */
  collapsedWidth?: number;
}

export interface HostRule {
  pattern: RegExp;
  hostCss?: string;
  menuCss?: string;
  defaultColorMode?: ColorMode;
  /** Menu display mode - defaults to 'floating' if not specified */
  menuMode?: MenuMode;
  /** CSS selector to attach menu to an existing DOM element (only used when menuMode is 'attached') */
  attachTo?: string;
  attachParent?: number;
  /** Sidebar-specific configuration (only used when menuMode is 'sidebar') */
  sidebarConfig?: SidebarConfig;
}

const HOST_RULES: HostRule[] = [
  {
    // Homepage - attach to logo
    pattern: /^(www.)?ethpandaops\.io$/,
    attachTo: 'nav div.navbar__logo',
    hostCss: `
      #panda-menu-root {
        height: 60px !important;
      }
    `,
  },
  {
    // Lab - attach to logo
    pattern: /^(www.)?lab\.ethpandaops\.io$/,
    attachTo: 'a > img[alt="Lab Logo"]',
    attachParent: 1,
  },
  {
    // Dora/Spamoor/Dugtrio - adjust title in mobile view
    pattern: /^(dora|spamoor|beacon)\..*\.ethpandaops\.io$/,
    hostCss: `
      @media (max-width: 576px) {
        .navbar-brand > svg {
          display: none;
        }
        .navbar-brand {
          padding-left: 60px;
        }
      }
      @media (min-width: 577px) {
        nav.navbar {
          padding-left: 60px;
          padding-right: 60px;
        }
      }
    `,
  },
  {
    // Assertoor - adjust title
    pattern: /^assertoor\..*\.ethpandaops\.io$/,
    hostCss: `
      .navbar-brand {
        padding-left: 70px !important;
      }
    `,
  },
  {
    // Tracoor - adjust header
    pattern: /^tracoor\..*\.ethpandaops\.io$/,
    defaultColorMode: 'light',
    hostCss: `
      header {
        padding-left: 50px !important;
      }
    `,
    menuCss: `
      .panda-menu-button {
        position: absolute !important;
      }
    `
  },
  {
    // Syncoor - adjust header
    pattern: /^syncoor\..*\.ethpandaops\.io$/,
    hostCss: `
      header {
        padding-left: 70px !important;
      }
      @media (max-width: 576px) {
        header a > img {
          display: none;
        }
      }
      @media (min-width: 577px) {
        header {
          padding-right: 70px !important;
        }
      }
    `,
  },
  {
    // Ethstats - enforce dark mode
    pattern: /^ethstats\..*\.ethpandaops\.io$/,
    defaultColorMode: 'dark',
  },
  {
    // Checkpointz - adjust header
    pattern: /^checkpoint-sync\..*\.ethpandaops\.io$/,
    defaultColorMode: 'light',
    hostCss: `
      header {
        padding-left: 50px !important;
      }
      @media (min-width: 577px) {
        header {
          padding-right: 50px !important;
        }
      }
    `,
    menuCss: `
      .panda-menu-button {
        position: absolute !important;
      }
    `
  },
  {
    // Forky - adjust header
    pattern: /^forky\..*\.ethpandaops\.io$/,
    defaultColorMode: 'light',
    hostCss: `
      header nav {
        padding-left: 70px;
      }
    `,
    menuCss: `
      .panda-menu-button {
        z-index: 20 !important;
      }
    `
  },
  {
    // Generic catch-all for ethpandaops subdomains
    pattern: /\.ethpandaops\.io$/,
    hostCss: `
      /* Generic panda-menu spacing - override if needed */
    `,
  },
];

function getMatchingRules(hostname: string): HostRule[] {
  return HOST_RULES.filter((rule) => rule.pattern.test(hostname));
}

export function getHostConfig(): HostRule[] {
  const hostname = window.location.hostname;
  return getMatchingRules(hostname);
}

export function getDefaultColorMode(): ColorMode {
  const rules = getHostConfig();
  for (const rule of rules) {
    if (rule.defaultColorMode) {
      return rule.defaultColorMode;
    }
  }
  return '';
}

export function getMenuCss(): string {
  const rules = getHostConfig();
  return rules
    .filter((rule) => rule.menuCss)
    .map((rule) => rule.menuCss)
    .join('\n');
}

export function getHostCss(): string {
  const rules = getHostConfig();
  return rules
    .filter((rule) => rule.hostCss)
    .map((rule) => rule.hostCss)
    .join('\n');
}

export function getAttachSelector(): string | null {
  const rules = getHostConfig();
  for (const rule of rules) {
    if (rule.attachTo) {
      return rule.attachTo;
    }
  }
  return null;
}

export function getAttachParent(): number {
  const rules = getHostConfig();
  for (const rule of rules) {
    if (rule.attachParent) {
      return rule.attachParent;
    }
  }
  return 0;
}

export function getMenuMode(): MenuMode {
  const rules = getHostConfig();
  for (const rule of rules) {
    if (rule.menuMode) {
      return rule.menuMode;
    }
    // Legacy support: if attachTo is defined without menuMode, treat as 'attached'
    if (rule.attachTo) {
      return 'attached';
    }
  }
  return 'floating';
}

export function getSidebarConfig(): SidebarConfig {
  const rules = getHostConfig();
  for (const rule of rules) {
    if (rule.sidebarConfig) {
      return rule.sidebarConfig;
    }
  }
  return {};
}

