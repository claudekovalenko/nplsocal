import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container-x py-24 text-center">
      <div className="eyebrow">404</div>
      <h1 className="mt-2 font-display text-3xl font-bold">There's no page here.</h1>
      <p className="mt-3 text-ink-500 dark:text-ink-300">But there are still plenty of places left.</p>
      <Link to="/" className="btn-primary mt-6">
        Back home
      </Link>
    </section>
  );
}
