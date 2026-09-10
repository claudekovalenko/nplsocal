export default function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
      <circle cx="32" cy="32" r="22" className="stroke-fg" strokeWidth="2.5" />
      <path d="M32 14V50M14 32H50" className="stroke-fg" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="5" className="fill-fg" />
    </svg>
  );
}
