import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    Search, LayoutDashboard, Menu, Activity, Calendar,
    Users, Stethoscope, Pill, Moon, Sun, Settings
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';

const Sidebar = ({ isDark, toggleTheme }) => {
    const location = useLocation();
    const path = location.pathname;

    return (
        <aside className="sidebar">
            <div className="sidebar-icon">
                <Search size={22} />
            </div>
            <div className="sidebar-icon">
                <Menu size={22} />
            </div>

            <div className="sidebar-divider"></div>

            <Link to="/">
                <div className={`sidebar-icon ${path === '/' ? 'active' : ''}`}>
                    <LayoutDashboard size={22} />
                </div>
            </Link>

            <Link to="/inventory">
                <div className={`sidebar-icon ${path === '/inventory' ? 'active' : ''}`}>
                    <Activity size={22} />
                </div>
            </Link>

            <div className="sidebar-icon">
                <Calendar size={22} />
            </div>
            <div className="sidebar-icon">
                <Users size={22} />
            </div>
            <div className="sidebar-icon">
                <Stethoscope size={22} />
            </div>
            <div className="sidebar-icon">
                <Pill size={22} />
            </div>

            <div className="sidebar-divider" style={{ marginTop: 'auto' }}></div>

            <div className="sidebar-icon" onClick={toggleTheme} title="Toggle Theme">
                {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </div>
            <div className="sidebar-icon mb-4">
                <Settings size={22} />
            </div>
        </aside>
    );
};

function App() {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <Router>
            <Toaster position="top-right" />
            <Sidebar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
            <main className="main-surface">
                <div className="main-scroll">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                    </Routes>
                </div>
            </main>
        </Router>
    );
}

export default App;
