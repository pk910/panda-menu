import { RefObject } from 'react';
import { createRoot } from 'react-dom/client';
import { PandaMenuHandle } from '../components/PandaMenu';
import type { MenuMode, SidebarConfig, DisplayStyle, MenuSize } from '../config/hostStyles';

export interface PandaMenuContext {
  attachSelector?: string;
  skipRender?: boolean;
  /** Override menu mode */
  menuMode?: MenuMode;
  /** Override display style */
  displayStyle?: DisplayStyle;
  /** Override menu size */
  menuSize?: MenuSize;
  /** Override sidebar config */
  sidebarConfig?: SidebarConfig;

  initialized: boolean;
  currentRender: RenderResult | null;
  render: (attachTarget: HTMLElement | null, mode?: MenuMode, sidebarConfig?: SidebarConfig) => void;
  attach: (attachSelector: string) => void;
  cleanup: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface RenderResult {
  hostElement: HTMLElement;
  root: ReturnType<typeof createRoot>;
  menuRef: RefObject<PandaMenuHandle | null>;
  attachTarget: HTMLElement | null;
  clickHandler: ((e: MouseEvent) => void) | null;
}
