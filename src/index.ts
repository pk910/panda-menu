import { getAttachSelector } from './config/hostStyles';
import { injectHostStyles, pollAndRender, renderMenu, cleanupRender } from './menu';
import { PandaMenuContext } from './types/context';

function initPandaMenu() {
  let pandaMenuCtx: PandaMenuContext = (window as any).PandaMenu = (window as any).PandaMenu || {};
  if (pandaMenuCtx.initialized) {
    return;
  }

  Object.assign(pandaMenuCtx, {
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

  // Check if we should attach to an existing element
  const attachSelector = typeof pandaMenuCtx.attachSelector === 'string' ? pandaMenuCtx.attachSelector : getAttachSelector();

  if (attachSelector) {
    pollAndRender(attachSelector);
  } else if (!pandaMenuCtx.skipRender) {
    renderMenu(null);
  }
}

initPandaMenu();
