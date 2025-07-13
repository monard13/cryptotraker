
import React from 'react';
import { NavLink } from 'react-router-dom';

const Icon = ({ path, className }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-6 h-6'}>
        <path d={path} />
    </svg>
);

const navItems = [
    { to: '/', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { to: '/brl-movements', label: 'Movimientos BRL', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zm-2-4h8v2h-8V7z' },
    { to: '/asset-trades', label: 'Compra/Venta Activos', icon: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59L3.62 17H19v-2H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0021 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' },
    { to: '/asset-movements', label: 'Movimiento Activos', icon: 'M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z' },
];

const Sidebar: React.FC = () => {
    const baseStyle = "flex items-center p-3 my-1 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors";
    const activeStyle = { backgroundColor: '#374151' /* bg-gray-700 */, color: '#FFFFFF' };

    return (
        <aside className="w-64 bg-gray-800 p-4 flex flex-col flex-shrink-0">
            <div className="text-white text-2xl font-bold mb-8 flex items-center">
                <Icon path="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" className="w-8 h-8 mr-2 text-blue-400" />
                <span>CriptoApp</span>
            </div>
            <nav>
                <ul>
                    {navItems.map(item => (
                        <li key={item.to}>
                            <NavLink to={item.to}
                                style={({ isActive }) => isActive ? activeStyle : undefined}
                                className={baseStyle}
                            >
                                <Icon path={item.icon} className="w-6 h-6 mr-3" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
