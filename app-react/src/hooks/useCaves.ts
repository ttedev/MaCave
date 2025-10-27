import { useState, useEffect } from 'react';
import { caveService } from '../services/api';
import { CaveDto } from '../types';

export const useCaves = () => {
  const [caves, setCaves] = useState<CaveDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaves = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await caveService.getCaves();
      setCaves(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaves();
  }, []);

  const createCave = async (cave: CaveDto) => {
    try {
      const newCave = await caveService.createCave(cave);
      setCaves(prev => [...prev, newCave]);
      return newCave;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    }
  };

  const updateCave = async (id: number, cave: CaveDto) => {
    try {
      const updatedCave = await caveService.updateCave(id, cave);
      setCaves(prev => prev.map(c => c.id === id ? updatedCave : c));
      return updatedCave;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteCave = async (id: number) => {
    try {
      await caveService.deleteCave(id);
      setCaves(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    caves,
    isLoading,
    error,
    loadCaves,
    createCave,
    updateCave,
    deleteCave,
  };
};