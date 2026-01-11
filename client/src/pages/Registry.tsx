import RegistryLinks from '../components/RegistryLinks';

export default function Registry() {
  return (
    <div className="registry-page">
      <div className="registry-hero">
        <h1 className="registry-title">Our Registry</h1>
        <p className="registry-philosophy">
          Your presence at our wedding is the greatest gift we could ask for.
          <br />
          If you'd like to celebrate with us in another way, we've curated a few
          registries to help us build our home together.
        </p>
        <div className="registry-divider" aria-hidden="true" />
      </div>
      <RegistryLinks />
    </div>
  );
}
