import { RefObject } from 'react';
import { createRoot } from 'react-dom/client';
import { PandaMenuHandle } from '../components/PandaMenu';

export interface PandaMenuContext {
  attachSelector?: string;
  skipRender?: boolean;

  initialized: boolean;
  currentRender: RenderResult | null;
  render: (attachTarget: HTMLElement | null) => void;
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
