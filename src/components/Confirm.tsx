import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * A confirmation you have to read.
 *
 * The native confirm() this replaces said "Remove Jane?" with an OK button, in
 * a dialog the browser styles and nobody reads. Removing somebody from a roster
 * deletes a real person's details, so it is worth a sentence saying exactly
 * what happens and whether it can be undone.
 */
export default function Confirm({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  /** True for the irreversible ones, which get the red treatment. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Focus the dialog, not the page behind it, and let Escape back out.
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="card w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="flex items-center gap-2.5 text-lg">
          {danger && <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />}
          {title}
        </h2>
        <div className="mt-2.5 text-sm text-muted">{body}</div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={danger ? 'btn-primary !bg-red-500 !text-white hover:!bg-red-600' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
