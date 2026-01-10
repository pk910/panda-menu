import { LOGO_DATA_URL } from '../config/logo';
import { GENERIC_LINKS } from '../config/config';
import { NetworkCategory } from './NetworkCategory';
import { CategoryData } from '../hooks/useNetworksData';
import { CurrentLocation } from '../services/networkService';

interface MenuDropdownProps {
  loading: boolean;
  error: string | null;
  sortedCategories: CategoryData[];
  currentLocation: CurrentLocation;
  onClose: () => void;
  onRetry: () => void;
  /** Hide the header with logo and close button (used in sidebar mode) */
  hideHeader?: boolean;
}

export function MenuDropdown({
  loading,
  error,
  sortedCategories,
  currentLocation,
  onClose,
  onRetry,
  hideHeader = false,
}: MenuDropdownProps) {
  return (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-menu-border bg-menu-bg-secondary px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={LOGO_DATA_URL} alt="" className="size-6" />
            <span className="font-semibold text-menu-text">ethPandaOps</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xs p-1 text-menu-text-muted transition-colors hover:bg-menu-hover hover:text-menu-text"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="max-h-[70vh] overflow-y-auto">
        <div className="border-b border-menu-border p-2">
          <div className="flex gap-1">
            {GENERIC_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xs bg-menu-hover/50 px-3 py-2 text-xs text-menu-text-muted transition-colors hover:bg-menu-hover hover:text-menu-text"
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-menu-text-muted">
              <svg
                className="size-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm">Loading networks...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={onRetry}
              className="mt-2 text-xs text-menu-text-muted underline hover:text-menu-text"
            >
              Retry
            </button>
          </div>
        )}

        {sortedCategories.length > 0 && (
          <div>
            {sortedCategories.map((category) => (
              <NetworkCategory
                key={category.categoryKey}
                categoryName={category.categoryName}
                description={category.description}
                networks={category.networks}
                defaultExpanded={
                  category.categoryKey === currentLocation.categoryKey
                }
                currentNetworkKey={currentLocation.networkKey}
                currentServiceKey={currentLocation.serviceKey}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-menu-border bg-menu-bg-secondary px-4 py-2 text-center text-xs text-menu-text-muted">
        <kbd className="rounded-xs bg-menu-hover px-1.5 py-0.5">Ctrl+M</kbd>{' '}
        toggle &middot;{' '}
        <kbd className="rounded-xs bg-menu-hover px-1.5 py-0.5">Esc</kbd> close
      </div>
    </>
  );
}
