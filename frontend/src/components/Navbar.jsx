import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              🏢 Insurance Platform
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {user?.role !== 'customer' && (
              <>
                <Link to="/customers" className={`text-sm font-medium ${isActive('/customers')}`}>
                  Customers
                </Link>
                <Link to="/policies" className={`text-sm font-medium ${isActive('/policies')}`}>
                  Policies
                </Link>
              </>
            )}

            {user?.role !== 'customer' && (
              <Link to="/claims" className={`text-sm font-medium ${isActive('/claims')}`}>
                Claims
              </Link>
            )}

            {user?.role === 'customer' && (
              <>
                <Link to="/" className={`text-sm font-medium ${isActive('/')}`}>
                  Dashboard
                </Link>
              </>
            )}

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {user?.role.toUpperCase()}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
