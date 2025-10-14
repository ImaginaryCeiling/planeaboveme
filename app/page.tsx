import PlaneTracker from '@/components/PlaneTracker';

export default function Home() {
  return (
    <div className="container">
      <header>
        <h1>✈️ Plane Above Me</h1>
        <p className="subtitle">Real-time aircraft tracking overhead</p>
      </header>

      <PlaneTracker />

      <footer>
        <p>
          Data provided by{' '}
          <a href="https://opensky-network.org/" target="_blank" rel="noopener noreferrer">
            OpenSky Network
          </a>
        </p>
        <p>Showing aircraft within 50km radius</p>
      </footer>
    </div>
  );
}
