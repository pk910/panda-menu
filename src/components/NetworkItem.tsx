import { Network } from '../types/networks';
import {
  getServiceInfo,
  getNetworkDisplayName,
  isExternalUrl,
  isStandaloneNetwork,
} from '../services/networkService';

interface NetworkItemProps {
  networkKey: string;
  network: Network;
  isExpanded: boolean;
  onToggle: () => void;
  isCurrent: boolean;
  currentServiceKey: string | null;
}

export function NetworkItem({
  networkKey,
  network,
  isExpanded,
  onToggle,
  isCurrent,
  currentServiceKey,
}: NetworkItemProps) {
  const services = network.serviceUrls || {};
  // Get all services from network data, with display info from config or fallback
  const availableServices = Object.keys(services)
    .filter((key) => services[key]) // only include services with URLs
    .map((key) => getServiceInfo(key))
    .sort((a, b) => a.name.localeCompare(b.name));

  const displayName = getNetworkDisplayName(networkKey, network);
  const isDevnet = !isStandaloneNetwork(networkKey);
  const devnetHomepageUrl = `https://${networkKey}.ethpandaops.io/`;
  const networkOverviewUrl = `https://ethpandaops.io/networks/${networkKey}/`;

  return (
    <div
      className={`mx-2 mt-0.5 overflow-hidden rounded-xs ${
        isCurrent ? 'bg-menu-accent/10' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-2 py-1.5 text-left transition-colors hover:bg-menu-hover/50"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`size-1.5 shrink-0 rounded-full ${isCurrent ? 'bg-menu-accent' : 'bg-menu-active'}`}
            title={isCurrent ? 'Current network' : 'Active'}
          />
          <span className={`truncate text-[13px] ${isCurrent ? 'font-medium text-menu-accent' : 'text-menu-text-muted'}`}>
            {displayName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isDevnet && (
            <a
              href={devnetHomepageUrl}
              rel="noopener noreferrer"
              className="rounded-xs p-0.5 text-menu-text-muted transition-colors hover:bg-menu-hover hover:text-menu-text"
              title="Devnet Homepage"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </a>
          )}
          <a
            href={networkOverviewUrl}
            rel="noopener noreferrer"
            className="rounded-xs p-0.5 text-menu-text-muted transition-colors hover:bg-menu-hover hover:text-menu-text"
            title="Network Overview"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
          <span className="ml-1 text-[11px] text-menu-text-muted opacity-70">
            {availableServices.length}
          </span>
          <svg
            className={`size-3 text-menu-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && availableServices.length > 0 && (
        <div className="grid grid-cols-2 gap-1 border-t border-menu-border">
          {availableServices.map((svc) => {
            const isCurrentService = currentServiceKey === svc.key;
            const serviceUrl = services[svc.key];
            const isExternal = serviceUrl ? isExternalUrl(serviceUrl) : false;

            return (
              <a
                key={svc.key}
                href={serviceUrl}
                className={`flex items-center gap-2 rounded-xs px-2 py-1.5 text-xs transition-colors ${
                  isCurrentService
                    ? 'bg-menu-accent/20 font-medium text-menu-accent'
                    : 'text-menu-text-muted hover:bg-menu-hover hover:text-menu-text'
                }`}
              >
                <span>{svc.icon}</span>
                <span>{svc.name}</span>
                {isExternal && (
                  <svg className="ml-auto size-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
