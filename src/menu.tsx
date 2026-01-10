import { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { PandaMenu, PandaMenuHandle } from './components/PandaMenu';
import { getMenuCss, getAttachParent, getHostCss, MenuMode, SidebarConfig } from './config/hostStyles';
import { PandaMenuContext, RenderResult } from './types/context';

import styles from './styles/index.css?inline';

const POLL_INTERVAL = 50; // ms
const POLL_TIMEOUT = 5000; // ms
const MAX_ATTEMPTS = POLL_TIMEOUT / POLL_INTERVAL;

const MENU_ELEMENT_ID = 'panda-menu-root';
const STYLE_ELEMENT_ID = 'panda-menu-host-styles';

let pandaMenuCtx: PandaMenuContext = (window as any).PandaMenu = (window as any).PandaMenu || {};
let currentRender: RenderResult | null = null;
let removalObserver: MutationObserver | null = null;

export function cleanupRender() {
  if (currentRender) {
    // Remove click handler from attach target
    if (currentRender.attachTarget && currentRender.clickHandler) {
      currentRender.attachTarget.removeEventListener('click', currentRender.clickHandler);
    }
    // Unmount React
    currentRender.root.unmount();
    // Remove host element
    currentRender.hostElement.remove();
    pandaMenuCtx.currentRender = currentRender = null;
  }
  if (removalObserver) {
    removalObserver.disconnect();
    removalObserver = null;
  }
}

export function renderMenu(
  attachTarget: HTMLElement | null,
  mode: MenuMode = 'floating',
  sidebarConfig?: SidebarConfig
) {
  const hostElement = document.createElement('div');
  hostElement.id = MENU_ELEMENT_ID;

  if (attachTarget) {
    // Insert as a sibling before the target element (relative anchor)
    hostElement.style.position = 'relative';
    hostElement.style.display = 'inline-block';
    hostElement.style.width = '0';
    hostElement.style.height = '0';
    attachTarget.parentElement?.insertBefore(hostElement, attachTarget);
  } else {
    // Default: append to body
    document.body.appendChild(hostElement);
  }

  const shadowRoot = hostElement.attachShadow({ mode: 'open' });

  // Inject base styles
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);

  // Inject host-specific menu styles if any
  const menuCss = getMenuCss();
  if (menuCss) {
    const menuStyleElement = document.createElement('style');
    menuStyleElement.textContent = `/* Host-specific menu styles */\n${menuCss}`;
    shadowRoot.appendChild(menuStyleElement);
  }

  const container = document.createElement('div');
  container.id = 'panda-menu-container';
  shadowRoot.appendChild(container);

  const menuRef = createRef<PandaMenuHandle>();
  const root = createRoot(container);

  let clickHandler: ((e: MouseEvent) => void) | null = null;

  if (mode === 'attached' && attachTarget) {
    // Render in attached mode with target height for positioning
    const targetHeight = attachTarget.offsetHeight;
    root.render(<PandaMenu ref={menuRef} mode="attached" attachTargetHeight={targetHeight} />);

    // Attach click handler to the target element
    attachTarget.style.cursor = 'pointer';
    clickHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      menuRef.current?.toggle();
    };
    attachTarget.addEventListener('click', clickHandler);
  } else if (mode === 'sidebar') {
    // Render in sidebar mode
    root.render(<PandaMenu ref={menuRef} mode="sidebar" sidebarConfig={sidebarConfig} />);
  } else {
    // Default floating button mode
    root.render(<PandaMenu ref={menuRef} mode="floating" />);
  }

  pandaMenuCtx.open = () => menuRef.current?.open();
  pandaMenuCtx.close = () => menuRef.current?.close();
  pandaMenuCtx.toggle = () => menuRef.current?.toggle();
  pandaMenuCtx.currentRender = currentRender = { hostElement, root, menuRef, attachTarget, clickHandler };
}

export function setupRemovalObserver(attachSelector: string) {
  // Watch for removal of our host element or the attach target
  removalObserver = new MutationObserver(() => {
    if (!currentRender) return;

    // Check if our host element was removed
    const hostStillInDOM = document.contains(currentRender.hostElement);
    // Check if attach target was removed (for attached mode)
    const targetStillInDOM = currentRender.attachTarget
      ? document.contains(currentRender.attachTarget)
      : true;

    if (!hostStillInDOM || !targetStillInDOM) {
      // Our elements were removed, clean up and re-attach
      cleanupRender();
      // Re-poll for the element
      pollAndRender(attachSelector);
    }
  });

  // Observe the entire document for child removals
  removalObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export function pollAndRender(attachSelector: string) {
  let attempts = 0;

  const pollForElement = () => {
    // Check if already rendered (prevent double-render)
    if (document.getElementById(MENU_ELEMENT_ID)) {
      return;
    }

    let attachTarget = document.querySelector(attachSelector) as HTMLElement | null;

    if (attachTarget) {
      // Element found, navigate to parent if configured
      const attachParent = getAttachParent();
      for (let i = 0; i < attachParent; i++) {
        if (!(attachTarget = attachTarget.parentElement)) {
          break;
        }
      }

      renderMenu(attachTarget);
      setupRemovalObserver(attachSelector);
    } else if (attempts < MAX_ATTEMPTS) {
      // Keep polling
      attempts++;
      setTimeout(pollForElement, POLL_INTERVAL);
    } else {
      // Timeout, fall back to floating button mode
      console.warn(`[panda-menu] Could not find element "${attachSelector}" after ${POLL_TIMEOUT}ms, using floating button`);
      renderMenu(null);
      // No observer needed for floating mode
    }
  };

  pollForElement();
}

export function injectHostStyles(): void {
  if (document.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }

  const hostname = window.location.hostname;
  const styleElement = document.createElement('style');
  styleElement.id = STYLE_ELEMENT_ID;
  styleElement.textContent = `
/* Panda Menu Host Styles - injected for ${hostname} */
${getHostCss()}
`;

  document.head.appendChild(styleElement);
}
