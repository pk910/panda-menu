import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useNetworksData, CategoryData } from '../hooks/useNetworksData';
import { LOGO_DATA_URL } from '../config/logo';
import { MenuDropdown } from './MenuDropdown';
import type { MenuMode, SidebarConfig, DisplayStyle, MenuSize } from '../config/hostStyles';
import { getMenuWidth } from '../config/hostStyles';
import { CurrentLocation } from '../services/networkService';

export interface PandaMenuHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface PandaMenuProps {
  /** Menu display mode */
  mode?: MenuMode;
  /** Height of the attach target element for positioning the dropdown (attached mode only) */
  attachTargetHeight?: number;
  /** Sidebar configuration (sidebar mode only) */
  sidebarConfig?: SidebarConfig;
  /** Display style - 'adjacent' shows next to trigger, 'modal' shows centered with overlay */
  displayStyle?: DisplayStyle;
  /** Menu size preset - 'compact', 'normal', 'large' */
  menuSize?: MenuSize;
}

const MODAL_BOX_SHADOW = '0 0 60px 15px rgba(0, 0, 0, 0.6), 0 25px 50px -12px rgba(0, 0, 0, 0.8)';

interface ModalDropdownProps {
  menuWidth: number;
  loading: boolean;
  error: string | null;
  sortedCategories: CategoryData[];
  currentLocation: CurrentLocation;
  onClose: () => void;
  onRetry: () => void;
}

function ModalDropdown({ menuWidth, loading, error, sortedCategories, currentLocation, onClose, onRetry }: ModalDropdownProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto max-h-[80vh] overflow-hidden rounded-lg border border-menu-border bg-menu-bg"
        style={{ width: menuWidth, boxShadow: MODAL_BOX_SHADOW }}
      >
        <MenuDropdown
          loading={loading}
          error={error}
          sortedCategories={sortedCategories}
          currentLocation={currentLocation}
          onClose={onClose}
          onRetry={onRetry}
        />
      </div>
    </div>
  );
}

export const PandaMenu = forwardRef<PandaMenuHandle, PandaMenuProps>(
  function PandaMenu({ mode = 'floating', attachTargetHeight = 0, sidebarConfig = {}, displayStyle = 'adjacent', menuSize = 'normal' }, ref) {
    const theme = useTheme();
    const menuWidth = getMenuWidth(menuSize);
    const [isOpen, setIsOpen] = useState(false);
    const { loading, error, currentLocation, sortedCategories, retry } =
      useNetworksData(isOpen);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      toggle: () => setIsOpen((prev) => !prev),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    useEffect(() => {
      const handleKeydown = (e: KeyboardEvent) => {
        // Ctrl+M to toggle menu
        if (e.ctrlKey && e.key === 'm') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
          return;
        }
        // Escape to close menu
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
        }
      };
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }, [isOpen]);

    const themeClass = theme === 'light' ? 'theme-light' : '';
    const handleClose = () => setIsOpen(false);

    // Sidebar mode: expanding sidebar panel
    if (mode === 'sidebar') {
      const { position = 'center', side = 'left', collapsedWidth = 16 } = sidebarConfig;
      const isModal = displayStyle === 'modal';

      // Top/Bottom side: horizontal bar
      if (side === 'top' || side === 'bottom') {
        const isTop = side === 'top';
        const hPos = (position === 'left' || position === 'center' || position === 'right') ? position : 'center';

        // Position classes for the container
        const horizontalPositionClasses = {
          left: 'left-8 items-start',
          center: 'inset-x-0 items-center',
          right: 'right-8 items-end',
        };

        // Chevron directions based on side
        const chevronCollapsed = isTop ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7';  // down for top, up for bottom
        const chevronExpanded = isTop ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7';   // up for top, down for bottom
        const isExpandedAdjacent = isOpen && !isModal;

        return (
          <div className={`font-sans ${themeClass}`}>
            {/* Backdrop - darkened for modal, transparent for adjacent */}
            {isOpen && (
              <div
                className={`fixed inset-0 z-[999998] ${isModal ? 'bg-black/50' : ''}`}
                onClick={handleClose}
                aria-hidden="true"
              />
            )}

            {/* Modal: centered dropdown */}
            {isModal && isOpen && (
              <ModalDropdown
                menuWidth={menuWidth}
                loading={loading}
                error={error}
                sortedCategories={sortedCategories}
                currentLocation={currentLocation}
                onClose={handleClose}
                onRetry={retry}
              />
            )}

            {/* Sidebar trigger - always visible, expands inline only in adjacent mode */}
            <div
              className={`panda-menu-sidebar fixed ${isTop ? 'top-0' : 'bottom-0'} ${horizontalPositionClasses[hPos]} z-[999999] flex flex-col ${!isTop ? 'flex-col-reverse' : ''}`}
            >
              <div
                className={`
                  flex overflow-hidden
                  ${isTop ? 'flex-col rounded-b-sm border-b' : 'flex-col-reverse rounded-t-sm border-t'} border-x border-menu-border
                  bg-menu-bg/95 backdrop-blur-sm shadow-xl
                  transition-all duration-200 ease-out
                `}
                style={{
                  width: isExpandedAdjacent ? menuWidth : 96,
                  height: isExpandedAdjacent ? 'auto' : collapsedWidth,
                  maxHeight: isExpandedAdjacent ? 'min(80vh, 600px)' : undefined
                }}
              >
                {/* Toggle button / header area */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`
                    group flex shrink-0 items-center
                    transition-all hover:bg-menu-hover
                    ${isExpandedAdjacent ? 'h-12 justify-between gap-2 px-3' : 'h-full w-full justify-center'}
                  `}
                  aria-label={isOpen ? 'Close Panda Menu' : 'Open Panda Menu'}
                  aria-expanded={isOpen}
                >
                  {/* Collapsed: chevron only */}
                  {!isExpandedAdjacent && (
                    <svg
                      className="size-4 text-menu-text-muted transition-colors group-hover:text-menu-text"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={chevronCollapsed} />
                    </svg>
                  )}

                  {/* Expanded adjacent: logo + title + chevron */}
                  {isExpandedAdjacent && (
                    <>
                      <div className="flex items-center gap-2">
                        <img src={LOGO_DATA_URL} alt="ethPandaOps" className="size-6" />
                        <span className="text-sm font-medium text-menu-text">ethPandaOps</span>
                      </div>
                      <svg
                        className="size-4 text-menu-text-muted transition-colors group-hover:text-menu-text"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={chevronExpanded} />
                      </svg>
                    </>
                  )}
                </button>

                {/* Adjacent mode: inline expanded content */}
                {isExpandedAdjacent && (
                  <div className={`min-h-0 flex-1 overflow-y-auto ${isTop ? 'border-t' : 'border-b'} border-menu-border`}>
                    <MenuDropdown
                      loading={loading}
                      error={error}
                      sortedCategories={sortedCategories}
                      currentLocation={currentLocation}
                      onClose={handleClose}
                      onRetry={retry}
                      hideHeader
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Left/Right side: vertical bar
      const isLeft = side === 'left';
      const vPos = (position === 'top' || position === 'center' || position === 'bottom') ? position : 'center';
      const isExpandedAdjacent = isOpen && !isModal;

      // Chevron paths for different states
      const chevronExpand = isLeft ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7';
      const chevronCollapse = isLeft ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';

      // For center position, use fixed positioning based on viewport height
      const getPositionStyle = () => {
        if (vPos === 'top') return { top: 32 };
        if (vPos === 'bottom') return { bottom: 32 };
        // Center: position from top, accounting for max menu height
        // This keeps the menu visually centered regardless of its current height
        // In modal mode, sidebar stays collapsed so always use -48
        return { top: '50%', marginTop: isExpandedAdjacent ? -300 : -48 }; // -300 = half of 600px max, -48 = half of 96px
      };

      return (
        <div className={`font-sans ${themeClass}`}>
          {/* Backdrop - darkened for modal, transparent for adjacent */}
          {isOpen && (
            <div
              className={`fixed inset-0 z-[999998] ${isModal ? 'bg-black/50' : ''}`}
              onClick={handleClose}
              aria-hidden="true"
            />
          )}

          {/* Modal: centered dropdown */}
          {isModal && isOpen && (
            <ModalDropdown
              menuWidth={menuWidth}
              loading={loading}
              error={error}
              sortedCategories={sortedCategories}
              currentLocation={currentLocation}
              onClose={handleClose}
              onRetry={retry}
            />
          )}

          {/* Sidebar trigger - always visible, expands inline only in adjacent mode */}
          <div
            className={`panda-menu-sidebar fixed ${isLeft ? 'left-0' : 'right-0'} z-[999999] flex`}
            style={getPositionStyle()}
          >
            <div
              className={`
                flex flex-col overflow-hidden
                ${isLeft ? 'rounded-r-sm border-r' : 'rounded-l-sm border-l'} border-y border-menu-border
                bg-menu-bg/95 backdrop-blur-sm shadow-xl
                transition-all duration-200 ease-out
              `}
              style={{
                width: isExpandedAdjacent ? menuWidth : collapsedWidth,
                height: isExpandedAdjacent ? 'auto' : 96,
                maxHeight: isExpandedAdjacent ? 'min(80vh, 600px)' : undefined
              }}
            >
              {/* Toggle button / header area */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                  group flex shrink-0 items-center
                  transition-all hover:bg-menu-hover
                  ${isExpandedAdjacent ? 'h-24 justify-between gap-2 px-3' : 'h-full w-full justify-center'}
                `}
                aria-label={isOpen ? 'Close Panda Menu' : 'Open Panda Menu'}
                aria-expanded={isOpen}
              >
                {/* Collapsed: chevron only */}
                {!isExpandedAdjacent && (
                  <svg
                    className="size-4 text-menu-text-muted transition-colors group-hover:text-menu-text"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={chevronExpand} />
                  </svg>
                )}

                {/* Expanded adjacent: logo + title + chevron */}
                {isExpandedAdjacent && (
                  <>
                    <div className={`flex items-center gap-2 ${!isLeft ? 'order-2' : ''}`}>
                      <img src={LOGO_DATA_URL} alt="ethPandaOps" className="size-8" />
                      <span className="text-sm font-medium text-menu-text">ethPandaOps</span>
                    </div>
                    <svg
                      className={`size-4 text-menu-text-muted transition-colors group-hover:text-menu-text ${!isLeft ? 'order-1' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={chevronCollapse} />
                    </svg>
                  </>
                )}
              </button>

              {/* Adjacent mode: inline expanded content */}
              {isExpandedAdjacent && (
                <div className="min-h-0 flex-1 overflow-y-auto border-t border-menu-border">
                  <MenuDropdown
                    loading={loading}
                    error={error}
                    sortedCategories={sortedCategories}
                    currentLocation={currentLocation}
                    onClose={handleClose}
                    onRetry={retry}
                    hideHeader
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Attached mode: render only the dropdown (no button)
    if (mode === 'attached') {
      if (!isOpen) return null;

      return (
        <div className={`font-sans ${themeClass}`}>
          <div
            className="fixed inset-0 z-[999998]"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            className="absolute left-0 z-[999999] overflow-hidden rounded-lg border border-menu-border bg-menu-bg shadow-2xl"
            style={{ top: `${attachTargetHeight + 4}px`, width: menuWidth }}
          >
            <MenuDropdown
              loading={loading}
              error={error}
              sortedCategories={sortedCategories}
              currentLocation={currentLocation}
              onClose={handleClose}
              onRetry={retry}
            />
          </div>
        </div>
      );
    }

    // Hidden mode: no visible button, only keyboard toggle
    if (mode === 'hidden') {
      if (!isOpen) {
        // Render nothing visible, but component stays mounted for keyboard events
        return <div className={`font-sans ${themeClass}`} />;
      }

      return (
        <div className={`font-sans ${themeClass}`}>
          <div
            className="fixed inset-0 z-[999998] bg-black/50"
            onClick={handleClose}
            aria-hidden="true"
          />
          <ModalDropdown
            menuWidth={menuWidth}
            loading={loading}
            error={error}
            sortedCategories={sortedCategories}
            currentLocation={currentLocation}
            onClose={handleClose}
            onRetry={retry}
          />
        </div>
      );
    }

    // Default floating button mode
    const isModal = displayStyle === 'modal';

    return (
      <div
        className={`panda-menu-button fixed left-4 top-4 z-[999999] font-sans ${themeClass}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex size-11 items-center justify-center rounded-lg bg-transparent transition-all hover:scale-105 ${isOpen ? 'scale-105' : ''}`}
          aria-label="Open Panda Menu"
          aria-expanded={isOpen}
        >
          <img
            src={LOGO_DATA_URL}
            alt="ethPandaOps"
            className="size-10 transition-transform group-hover:scale-110"
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop - darkened for modal, transparent for adjacent */}
            <div
              className={`fixed inset-0 ${isModal ? 'z-[999998] bg-black/50' : 'z-[-1]'}`}
              onClick={handleClose}
              aria-hidden="true"
            />
            {/* Menu dropdown - centered for modal, positioned for adjacent */}
            {isModal ? (
              <ModalDropdown
                menuWidth={menuWidth}
                loading={loading}
                error={error}
                sortedCategories={sortedCategories}
                currentLocation={currentLocation}
                onClose={handleClose}
                onRetry={retry}
              />
            ) : (
              <div className="absolute left-0 top-14 overflow-hidden rounded-lg border border-menu-border bg-menu-bg shadow-2xl" style={{ width: menuWidth }}>
                <MenuDropdown
                  loading={loading}
                  error={error}
                  sortedCategories={sortedCategories}
                  currentLocation={currentLocation}
                  onClose={handleClose}
                  onRetry={retry}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);
