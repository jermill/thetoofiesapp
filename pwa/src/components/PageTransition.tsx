import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/** Brief fade/rise on route change. */
export function PageTransition({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((n) => n + 1);
  }, [loc.pathname]);

  return (
    <div key={tick} className="page-enter">
      {children}
    </div>
  );
}
