import { useState, useEffect } from 'react';
import { getRuneTrees, STAT_SHARDS } from '../services/dataDragon/runeService';
import type { RuneTree } from '../services/dataDragon/runeService';

export function useRunes() {
  const [runeTrees, setRuneTrees] = useState<RuneTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRunes() {
      try {
        const trees = await getRuneTrees();
        setRuneTrees(trees);
      } catch (err) {
        setError('Failed to load runes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRunes();
  }, []);

  return { runeTrees, loading, error, statShards: STAT_SHARDS };
}
