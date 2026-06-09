import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { calculateDynamicWaterStats, type WaterStats } from '../lib/waterMath';

export function useWaterStats() {
  const { properties, activePropertyId } = useStore();
  const property = properties.find(p => p.id === activePropertyId);
  const location = property?.location;
  const lawnAreaSqFt = property?.lawns.reduce((sum, lawn) => sum + lawn.areaSqFt, 0) || 0;
  const [stats, setStats] = useState<WaterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const lat = location?.coords?.[0];
    const lon = location?.coords?.[1];

    calculateDynamicWaterStats(lawnAreaSqFt, lat, lon, location?.city)
      .then((data) => {
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lawnAreaSqFt, location?.city, location?.coords?.[0], location?.coords?.[1]]);

  return { stats, loading, error };
}
