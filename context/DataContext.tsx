
import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { BRLMovement, AssetTrade, AssetMovement } from '../types';

interface DataContextType {
  brlMovements: BRLMovement[];
  addBrlMovement: (movement: Omit<BRLMovement, 'id'>) => void;
  updateBrlMovement: (movement: BRLMovement) => void;
  deleteBrlMovement: (id: string) => void;
  assetTrades: AssetTrade[];
  addAssetTrade: (trade: Omit<AssetTrade, 'id'>) => void;
  updateAssetTrade: (trade: AssetTrade) => void;
  deleteAssetTrade: (id: string) => void;
  assetMovements: AssetMovement[];
  addAssetMovement: (movement: Omit<AssetMovement, 'id'>) => void;
  updateAssetMovement: (movement: AssetMovement) => void;
  deleteAssetMovement: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brlMovements, setBrlMovements] = useLocalStorage<BRLMovement[]>('brlMovements', []);
  const [assetTrades, setAssetTrades] = useLocalStorage<AssetTrade[]>('assetTrades', []);
  const [assetMovements, setAssetMovements] = useLocalStorage<AssetMovement[]>('assetMovements', []);

  const addBrlMovement = useCallback((movement: Omit<BRLMovement, 'id'>) => {
    const newMovement = { ...movement, id: `brl-${Date.now()}` };
    setBrlMovements(prev => [...prev, newMovement].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setBrlMovements]);
  
  const updateBrlMovement = useCallback((updatedMovement: BRLMovement) => {
    setBrlMovements(prev => 
      prev.map(m => m.id === updatedMovement.id ? updatedMovement : m)
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, [setBrlMovements]);

  const deleteBrlMovement = useCallback((id: string) => {
    setBrlMovements(prev => prev.filter(m => m.id !== id));
  }, [setBrlMovements]);

  const addAssetTrade = useCallback((trade: Omit<AssetTrade, 'id'>) => {
    const newTrade = { ...trade, id: `trade-${Date.now()}` };
    setAssetTrades(prev => [...prev, newTrade].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setAssetTrades]);

  const updateAssetTrade = useCallback((updatedTrade: AssetTrade) => {
    setAssetTrades(prev => 
      prev.map(t => t.id === updatedTrade.id ? updatedTrade : t)
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, [setAssetTrades]);

  const deleteAssetTrade = useCallback((id: string) => {
    setAssetTrades(prev => prev.filter(t => t.id !== id));
  }, [setAssetTrades]);
  
  const addAssetMovement = useCallback((movement: Omit<AssetMovement, 'id'>) => {
    const newMovement = { ...movement, id: `asset-${Date.now()}` };
    setAssetMovements(prev => [...prev, newMovement].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setAssetMovements]);

  const updateAssetMovement = useCallback((updatedMovement: AssetMovement) => {
    setAssetMovements(prev => 
      prev.map(m => m.id === updatedMovement.id ? updatedMovement : m)
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, [setAssetMovements]);

  const deleteAssetMovement = useCallback((id: string) => {
    setAssetMovements(prev => prev.filter(m => m.id !== id));
  }, [setAssetMovements]);

  const value = useMemo(() => ({ 
        brlMovements, addBrlMovement, updateBrlMovement, deleteBrlMovement,
        assetTrades, addAssetTrade, updateAssetTrade, deleteAssetTrade,
        assetMovements, addAssetMovement, updateAssetMovement, deleteAssetMovement
  }), [
      brlMovements, addBrlMovement, updateBrlMovement, deleteBrlMovement,
      assetTrades, addAssetTrade, updateAssetTrade, deleteAssetTrade,
      assetMovements, addAssetMovement, updateAssetMovement, deleteAssetMovement
  ]);


  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
