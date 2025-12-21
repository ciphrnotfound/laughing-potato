'use client';

import { useEffect, useState } from 'react';
import { IconLoader2 } from '@tabler/icons-react';

export default function FullPageLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 10));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg text-white">
      <div className="mb-8 flex items-center gap-3">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand-500" />
        <span className="text-2xl font-semibold">Bothive</span>
      </div>

      <div className="w-80">
        <div className="mb-2 flex justify-between text-sm">
          <span>Loading workspace…</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-paper">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="mt-6 max-w-md text-center text-sm text-gray-400">
        Preparing your AI workforce. This usually takes a few seconds.
      </p>
    </div>
  );
}