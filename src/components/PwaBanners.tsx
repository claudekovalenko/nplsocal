import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, WifiOff, X, Share } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useOnline } from '@/hooks/useOnline';

export default function PwaBanners() {
  const online = useOnline();
  const { canInstall, install, dismissed, dismiss, isIOS, installed } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // Check for updates periodically while the app is open.
      if (reg) setInterval(() => reg.update(), 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    // Show a gentle iOS hint after a few visits.
    if (!isIOS || installed || dismissed) return;
    try {
      const visits = Number(localStorage.getItem('npl:visits') ?? '0') + 1;
      localStorage.setItem('npl:visits', String(visits));
      if (visits >= 2) setShowIosHint(true);
    } catch {}
  }, [isIOS, installed, dismissed]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 flex flex-col items-center gap-2 px-4 md:bottom-4">
      {!online && (
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-white dark:text-ink-950">
          <WifiOff className="h-4 w-4" /> You're offline — saved pages and your 100 List still work.
        </div>
      )}

      {needRefresh && (
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-white dark:text-ink-950">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> A new version is ready.
          </span>
          <div className="flex gap-2">
            <button className="btn-primary !py-1.5 !px-3" onClick={() => updateServiceWorker(true)}>
              Update
            </button>
            <button className="p-1.5" aria-label="Dismiss" onClick={() => setNeedRefresh(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {canInstall && !dismissed && (
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm shadow-lg ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-700">
          <span className="flex items-center gap-2">
            <Download className="h-4 w-4 text-sun-500" /> Install NPL SoCal for offline access.
          </span>
          <div className="flex gap-2">
            <button className="btn-primary !py-1.5 !px-3" onClick={install}>
              Install
            </button>
            <button className="p-1.5" aria-label="Dismiss" onClick={dismiss}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showIosHint && !dismissed && (
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm shadow-lg ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-700">
          <span className="flex items-center gap-2">
            <Share className="h-4 w-4 text-sun-500" /> Tap Share, then "Add to Home Screen" to install.
          </span>
          <button
            className="p-1.5"
            aria-label="Dismiss"
            onClick={() => {
              setShowIosHint(false);
              dismiss();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
