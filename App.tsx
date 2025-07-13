
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BRLMovements from './pages/BRLMovements';
import AssetTrades from './pages/AssetTrades';
import AssetMovements from './pages/AssetMovements';

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/brl-movements" element={<BRLMovements />} />
            <Route path="/asset-trades" element={<AssetTrades />} />
            <Route path="/asset-movements" element={<AssetMovements />} />
          </Routes>
        </Layout>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
