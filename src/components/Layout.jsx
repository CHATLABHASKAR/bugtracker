import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import emobomoLogo from '../assets/emobomo.png';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { notifications, markNotificationRead } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Redesigned Nav Items - Tasks and Bugs removed (only accessible through Projects)
    const navItems = [
        { label: 'DASHBOARD', path: '/', roles: ['Manager', 'Developer', 'Tester', 'Admin'], icon: 'show_chart' },
        { label: 'PROJECTS', path: '/projects', roles: ['Manager', 'Admin', 'Developer', 'Tester'], icon: 'folder_open' }, // All roles can view projects
        { label: 'ADMIN', path: '/admin', roles: ['Admin'], icon: 'admin_panel_settings' },
    ];

    // Handle potential nested user object from API response
    const userRole = user?.role || user?.user?.role || 'Admin';
    const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(userRole));

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-700 overflow-hidden">
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden glass-panel"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Top Header (Full Width) - Matches Reference */}
            <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 shadow-sm">
                {/* Logo Section (Top Left) */}
                <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-auto`}>
                    <div className="flex items-center gap-2">
                        {/* Mobile Toggle Button */}
                        <button onClick={toggleSidebar} className="mr-2 md:hidden text-gray-500">
                            <span className="material-icons">menu</span>
                        </button>

                        <div className="bg-blue-600/10 p-1 rounded hidden md:block">
                             <img src={emobomoLogo} alt="Emobomo" className="w-8 h-8" />
                        </div>
                        <div className={`flex flex-col leading-none ${isCollapsed ? 'hidden' : 'block'}`}>
                            <span className="font-bold text-gray-800 text-lg uppercase tracking-wider">Emobomo</span>
                            <span className="text-[10px] text-gray-500 font-semibold tracking-widest">BUG TRACKER</span>
                        </div>
                    </div>
                    {/* Desktop Sidebar Toggle */}
                    <button onClick={toggleSidebar} className="ml-auto text-gray-400 hover:text-gray-600 hidden md:block">
                        <span className="material-icons">{isCollapsed ? 'menu' : 'menu_open'}</span>
                    </button>
                </div>

                {/* Search Bar (Center) */}
                <div className="flex-1 max-w-2xl mx-4 md:mx-8 hidden md:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SEARCH DATABASE..."
                            className="w-full border border-blue-200 rounded-full px-5 py-2 pl-5 text-sm focus:outline-none focus:border-blue-400 text-blue-900 placeholder-blue-300 uppercase"
                        />
                        <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg">search</span>
                    </div>
                </div>


                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    <button className="text-blue-600 font-medium text-sm px-3 border-r border-gray-300 hidden md:block">
                        {user?.name || user?.email || 'User'}
                    </button>
                    <button className="text-blue-600 font-medium text-sm px-3 border-r border-gray-300 hidden md:block">
                        {user?.role || 'Admin'}
                    </button>
                    {/* Theme Toggle (Mock) */}
                    {/* <button className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center text-blue-400 hover:bg-blue-50">
                        <span className="material-icons text-sm">dark_mode</span>
                    </button> */}
                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-50"
                        title="Logout"
                    >
                        <span className="material-icons text-sm">logout</span>
                    </button>

                    {/* Notifications (Kept from old layout but styled simpler) */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow hover:bg-green-600"
                        >
                            <span className="material-icons text-sm">notifications</span>
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                        </button>
                        {/* Dropdown (Simplified) */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-600 uppercase">Notifications</span>
                                    <button onClick={() => notifications.forEach(n => markNotificationRead(n.id))} className="text-xs text-blue-600 hover:underline">Mark Read</button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? <p className="p-4 text-center text-xs text-gray-400">No alerts</p> :
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-3 border-b text-xs hover:bg-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                                {n.message}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Sidebar (Left) */}
            <aside
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg border-r border-gray-100 transition-transform duration-300 z-40 overflow-y-auto 
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 
                ${isCollapsed ? 'md:w-16' : 'md:w-64'} w-64`}
            >
                <nav className="flex flex-col py-4">
                    {filteredNav.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <div key={item.label} className="mb-2">
                                <Link
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)} // Close on mobile click
                                    className={`flex items-center justify-between px-6 py-3 transition-colors group relative
                                    ${isActive
                                            ? 'bg-[#0F2942] text-white border-l-4 border-blue-500'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-icons ${isActive ? 'text-blue-400' : 'text-blue-500'} ${isCollapsed ? 'md:text-2xl md:ml-[-8px]' : 'text-xl'}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`font-medium text-sm tracking-wide uppercase ${isCollapsed ? 'md:hidden' : 'block'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {/* Dropdown Arrow Indicator */}
                                    {item.isDropdown && (!isCollapsed || window.innerWidth < 768) && (
                                        <span className="material-icons text-gray-400 text-sm">expand_more</span>
                                    )}
                                </Link>
                                {/* Active Indicator for Collapsed Mode (Desktop Only) */}
                                {isCollapsed && isActive && (
                                    <div className="absolute left-0 w-1 bg-blue-500 h-full top-0 hidden md:block"></div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main
                className={`flex-1 pt-16 transition-all duration-300 bg-[#F4F7FE] h-screen overflow-hidden
                ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} ml-0`}
            >
                <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
