import { getAttachSelector, getMenuMode, getSidebarConfig, getDisplayStyle, getMenuSize } from './config/hostStyles';
import { injectHostStyles, pollAndRender, renderMenu, cleanupRender } from './menu';
import { PandaMenuContext } from './types/context';

function initPandaMenu() {
  // Read pre-init config from window.PandaMenuConfig
  const config: Partial<PandaMenuContext> = (window as any).PandaMenuConfig || {};

  // Set up runtime API on window.PandaMenu
  let pandaMenuCtx: PandaMenuContext = (window as any).PandaMenu = (window as any).PandaMenu || {};
  if (pandaMenuCtx.initialized) {
    return;
  }

  // Merge config into context
  Object.assign(pandaMenuCtx, config, {
    initialized: true,
    render: renderMenu,
    attach: pollAndRender,
    cleanup: cleanupRender,
  });

  // Wait for DOM to be ready before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      renderPandaMenu(pandaMenuCtx);
    });
  } else {
    renderPandaMenu(pandaMenuCtx);
  }
}

function renderPandaMenu(pandaMenuCtx: PandaMenuContext) {
  if (document.getElementById('panda-menu-root')) {
    return;
  }

  // Inject host page styles based on domain patterns
  injectHostStyles();

  // Determine menu mode, display style, and size (context override > host config)
  const menuMode = pandaMenuCtx.menuMode || getMenuMode();
  const displayStyle = pandaMenuCtx.displayStyle || getDisplayStyle();
  const menuSize = pandaMenuCtx.menuSize || getMenuSize();

  switch (menuMode) {
    case 'attached': {
      const attachSelector = typeof pandaMenuCtx.attachSelector === 'string'
        ? pandaMenuCtx.attachSelector
        : getAttachSelector();
      if (attachSelector) {
        pollAndRender(attachSelector);
      } else {
        console.warn('[panda-menu] Attached mode specified but no attachSelector found, falling back to floating');
        renderMenu(null, 'floating', undefined, displayStyle, menuSize);
      }
      break;
    }
    case 'sidebar': {
      const sidebarConfig = pandaMenuCtx.sidebarConfig || getSidebarConfig();
      renderMenu(null, 'sidebar', sidebarConfig, displayStyle, menuSize);
      break;
    }
    case 'hidden':
      renderMenu(null, 'hidden', undefined, displayStyle, menuSize);
      break;
    case 'floating':
    default:
      if (!pandaMenuCtx.skipRender) {
        renderMenu(null, 'floating', undefined, displayStyle, menuSize);
      }
      break;
  }
}

initPandaMenu();
