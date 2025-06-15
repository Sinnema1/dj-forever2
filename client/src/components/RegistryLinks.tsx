import React from "react";

const registries = [
  {
    name: "Crate & Barrel",
    url: "https://www.crateandbarrel.com/gift-registry/",
    logo: "/images/registries/crate-and-barrel.svg", 
  },
  {
    name: "Williams-Sonoma",
    url: "https://www.williams-sonoma.com/registry/",
    logo: "/images/registries/williams-sonoma.svg",
  },
  {
    name: "Zola",
    url: "https://www.zola.com/registry/",
    logo: "/images/registries/zola.svg",
  },
  // Add more registries as needed
];

export default function RegistryLinks() {
  return (
    <div className="registry-links">
      <p className="registry-message">
        Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, we have registered at the following places:
      </p>
      
      <div className="registry-buttons">
        {registries.map((registry, index) => (
          <a
            key={index}
            href={registry.url}
            className="registry-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            {registry.logo ? (
              <div className="registry-logo-container">
                <img src={registry.logo} alt={`${registry.name} Registry`} />
              </div>
            ) : (
              registry.name
            )}
          </a>
        ))}
      </div>
      
      <p className="registry-thank-you">
        Thank you for your love and support!
      </p>
    </div>
  );
}
