export default function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <rect width="512" height="512" rx="112" className="fill-ink-950 dark:fill-white" />
      <g className="stroke-white dark:stroke-ink-950" fill="none" strokeWidth="26" strokeLinecap="round">
        <path d="M256 128 V384" />
        <path d="M128 256 H384" />
        <circle cx="256" cy="256" r="150" />
      </g>
      <circle cx="256" cy="256" r="48" className="fill-sun-500" />
    </svg>
  );
}
