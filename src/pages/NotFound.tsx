import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container-x py-32 text-center">
      <div className="eyebrow">404</div>
      <h1 className="mt-4 text-4xl md:text-6xl">There's no page here.</h1>
      <p className="mt-4 text-muted">But there are still plenty of places left.</p>
      <Link to="/" className="btn-primary mt-8">
        Back home
      </Link>
    </section>
  );
}
