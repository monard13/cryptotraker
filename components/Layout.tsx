
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Icon = ({ path, className }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-6 h-6'}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

const navItems = [
    { to: '/', label: 'Dashboard', icon: 'M10 3H3v7h7V3ZM11 3h7v5h-7V3ZM3 11v10h7V11H3Zm8 0v10h10V11H11Z' },
    { to: '/brl-movements', label: 'Movimientos BRL', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14v-2h2v2h-2Zm2-4h-2V7h2v5Z' },
    { to: '/asset-trades', label: 'Compra/Venta Activos', icon: 'M3 3h2l.4 2H21l-3 7H6.7L6.3 9H3V3Zm2.1 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    { to: '/asset-movements', label: 'Movimiento Activos', icon: 'M4 4h16v16H4V4Zm2 9h12v5H6v-5Zm0-7h12v5H6V6Z' },
];


const Sidebar: React.FC<{ isOpen: boolean; onToggle: () => void; }> = ({ isOpen, onToggle }) => {
    const baseStyle = "flex items-center p-3 my-1 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors";
    const activeStyle = { backgroundColor: '#374151', color: '#FFFFFF' };

    return (
        <div className={`bg-gray-800 text-white flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-center p-4 h-16 flex-shrink-0 border-b border-gray-700/50">
                 <Icon path="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" className="w-8 h-8 text-blue-400" />
                 {isOpen && <span className="text-xl font-bold ml-2 whitespace-nowrap">CriptoApp</span>}
            </div>
            <nav className="flex-grow p-2">
                <ul>
                    {navItems.map(item => (
                        <li key={item.to}>
                            <NavLink 
                                to={item.to}
                                style={({ isActive }) => isActive ? activeStyle : undefined}
                                className={`${baseStyle} ${!isOpen ? 'justify-center' : ''}`}
                                title={!isOpen ? item.label : ''}
                            >
                                <Icon path={item.icon} className="w-6 h-6 flex-shrink-0" />
                                {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            {/* Toggle button for desktop */}
            <div className="p-2 border-t border-gray-700/50">
                <button onClick={onToggle} className={`${baseStyle} w-full ${!isOpen ? 'justify-center' : ''}`}>
                    <Icon path={isOpen ? 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z' : 'M4 11h12.17l-5.58 5.59L12 18l8-8-8-8-1.41 1.41L12.17 9H4v2Z'} className="w-6 h-6"/>
                    {isOpen && <span className="ml-3 whitespace-nowrap">Replegar</span>}
                </button>
            </div>
        </div>
    );
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default to closed on mobile, open on desktop
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
            {/* Mobile overlay for when sidebar is open */}
            <div className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={toggleSidebar}></div>

            {/* Sidebar */}
            {/* Mobile: fixed with transform. Desktop: part of the flex flow */}
            <div className={`
                fixed top-0 left-0 h-full z-40 
                md:relative md:z-auto
                transform transition-transform ease-in-out duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex md:hidden items-center p-3 bg-gray-800 shadow-lg">
                    <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-300 hover:bg-gray-700">
                        <Icon path="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" className="w-6 h-6"/>
                    </button>
                    <span className="text-lg font-bold ml-4">CriptoApp</span>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
