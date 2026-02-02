type RegistryLink = {
  name: string;
  url: string;
  description: string;
  note?: string;
};

const registries: RegistryLink[] = [
  {
    name: 'Crate & Barrel',
    url: 'https://www.crateandbarrel.com/gift-registry/',
    description: 'Kitchen essentials & home goods',
  },
  {
    name: 'Williams-Sonoma',
    url: 'https://www.williams-sonoma.com/registry/',
    description: 'Cookware & entertaining pieces',
  },
  {
    name: 'Costco Registry',
    // ⚠️ IMPORTANT: Replace with actual registry URL before deployment
    // Example: 'https://www.myregistry.com/wedding-registry/[your-registry-name]'
    // Current URL is a placeholder and will not direct guests to your registry
    url: 'https://www.myregistry.com/',
    description: 'Costco favorites & group gifting options',
    note: 'via MyRegistry',
  },
  {
    name: 'Honeymoon Fund',
    // ⚠️ IMPORTANT: Replace with actual fund URL before deployment
    // Options: MyRegistry cash fund, Honeyfund.com, Zola cash fund
    // Current URL is a placeholder and will not direct guests to your fund
    url: 'https://www.myregistry.com/',
    description: 'Experiences, dinners, and adventures together',
  },
];

export default function RegistryLinks() {
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
