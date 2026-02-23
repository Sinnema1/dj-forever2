import { PUBLIC_LINKS } from '../config/publicLinks';

type RegistryLink = {
  name: string;
  url: string;
  description: string;
  note?: string;
};

/**
 * All possible registry entries. Each entry's URL is read from an env var
 * via PUBLIC_LINKS. Entries whose URL is empty are filtered out at render
 * time so guests never see a broken or placeholder link.
 */
const allRegistries: RegistryLink[] = [
  {
    name: 'Crate & Barrel',
    url: PUBLIC_LINKS.registry.crateAndBarrel,
    description: 'Kitchen essentials & home goods',
  },
  {
    name: 'Williams-Sonoma',
    url: PUBLIC_LINKS.registry.williamsSonoma,
    description: 'Cookware & entertaining pieces',
  },
  {
    name: 'Costco Registry',
    url: PUBLIC_LINKS.registry.costco,
    description: 'Costco favorites & group gifting options',
    note: 'via MyRegistry',
  },
  {
    name: 'Honeymoon Fund',
    url: PUBLIC_LINKS.registry.honeymoon,
    description: 'Experiences, dinners, and adventures together',
  },
];

export default function RegistryLinks() {
  const registries = allRegistries.filter(r => Boolean(r.url));

  if (registries.length === 0) {
    return (
      <div className="registry-grid" role="list">
        <p style={{ textAlign: 'center', opacity: 0.7 }}>
          Registry information will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div className="registry-grid" role="list">
      {registries.map(registry => (
        <a
          key={registry.name}
          href={registry.url}
          className="registry-card"
          target="_blank"
          rel="noopener noreferrer external"
          aria-label={`Visit our ${registry.name} registry (opens in new tab)`}
        >
          <div className="registry-card-content">
            <div className="registry-card-header">
              <div className="registry-card-titlewrap">
                <h3 className="registry-card-name">{registry.name}</h3>
                {registry.note ? (
                  <span className="registry-card-note">{registry.note}</span>
                ) : null}
              </div>
              <span className="registry-card-arrow" aria-hidden="true">
                →
              </span>
            </div>
            <p className="registry-card-description">{registry.description}</p>
          </div>
          <span className="registry-card-hint">Opens in new tab</span>
        </a>
      ))}
    </div>
  );
}
