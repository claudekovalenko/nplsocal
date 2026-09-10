import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, WifiOff, X, Share } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useOnline } from '@/hooks/useOnline';

const Toast = ({ children }: { children: React.ReactNode }) => (
  <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-lg border border-line bg-bg/90 px-4 py-3 text-sm shadow-2xl backdrop-blur-xl">
    {children}
  </div>
);

export default function PwaBanners() {
  const online = useOnline();
  const { canInstall, install, dismissed, dismiss, isIOS, installed } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (reg) setInterval(() => reg.update(), 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    if (!isIOS || installed || dismissed) return;
    try {
      const visits = Number(localStorage.getItem('npl:visits') ?? '0') + 1;
      localStorage.setItem('npl:visits', String(visits));
      if (visits >= 2) setShowIosHint(true);
    } catch {}
  }, [isIOS, installed, dismissed]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[4.5rem] z-50 flex flex-col items-center gap-2 px-4 md:bottom-5">
      {!online && (
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-bg/90 px-4 py-2 text-xs text-muted backdrop-blur-xl">
          <WifiOff className="h-3.5 w-3.5" /> Offline — saved pages and your 100 List still work.
        </div>
      )}
      {needRefresh && (
        <Toast>
          <span className="flex items-center gap-2 text-muted">
            <RefreshCw className="h-4 w-4" /> A new version is ready.
          </span>
          <div className="flex items-center gap-1">
            <button className="btn-primary !h-8 !px-4 !text-xs" onClick={() => updateServiceWorker(true)}>
              Update
            </button>
            <button className="p-1.5 text-muted" aria-label="Dismiss" onClick={() => setNeedRefresh(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </Toast>
      )}
      {canInstall && !dismissed && (
        <Toast>
          <span className="flex items-center gap-2 text-muted">
            <Download className="h-4 w-4" /> Install for offline access.
          </span>
          <div className="flex items-center gap-1">
            <button className="btn-primary !h-8 !px-4 !text-xs" onClick={install}>
              Install
            </button>
            <button className="p-1.5 text-muted" aria-label="Dismiss" onClick={dismiss}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </Toast>
      )}
      {showIosHint && !dismissed && (
        <Toast>
          <span className="flex items-center gap-2 text-muted">
            <Share className="h-4 w-4" /> Tap Share, then "Add to Home Screen".
          </span>
          <button
            className="p-1.5 text-muted"
            aria-label="Dismiss"
            onClick={() => {
              setShowIosHint(false);
              dismiss();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </Toast>
      )}
    </div>
  );
}
