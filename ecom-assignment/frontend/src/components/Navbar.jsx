import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { getTotalItems, loading } = useCart();
  const itemCount = getTotalItems();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-10 h-10 bg-black flex items-center justify-center group-hover:bg-gray-800 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.001 3.001 0 01-.621-1.72c.148-.6.537-1.127 1.074-1.451a2.99 2.99 0 012.094-.816c.896 0 1.7.393 2.25 1.016s1.354 1.016 2.25 1.016 1.7-.393 2.25-1.016a2.99 2.99 0 012.094.816c.537.324.926.851 1.074 1.451.148.6.013 1.24-.621 1.72z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-light text-black tracking-tight">
                TechStore
              </h1>
              <p className="text-xs text-gray-500 -mt-1 font-light">Premium Technology</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-12">
            <Link 
              to="/" 
              className={`text-sm font-light transition-colors duration-300 relative ${
                isActive('/') 
                  ? 'text-black' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Products
              {isActive('/') && (
                <div className="absolute -bottom-6 left-0 right-0 h-px bg-black"></div>
              )}
            </Link>
            <Link 
              to="/orders" 
              className={`text-sm font-light transition-colors duration-300 relative ${
                isActive('/orders') 
                  ? 'text-black' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Orders
              {isActive('/orders') && (
                <div className="absolute -bottom-6 left-0 right-0 h-px bg-black"></div>
              )}
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm font-light transition-colors duration-300 relative ${
                isActive('/admin') 
                  ? 'text-black' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Admin
              {isActive('/admin') && (
                <div className="absolute -bottom-6 left-0 right-0 h-px bg-black"></div>
              )}
            </Link>
          </div>

          {/* Cart and Search */}
          <div className="flex items-center space-x-6">
            {/* Search Icon */}
            <button className="text-gray-600 hover:text-black transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Cart Button */}
            <Link 
              to="/cart" 
              className={`relative flex items-center space-x-2 transition-colors duration-300 px-2 py-1 ${
                isActive('/cart') 
                  ? 'text-black' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-[16px] text-[10px]">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              
              {loading ? (
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              ) : (
                <span className="hidden sm:inline text-sm font-light">Cart</span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-black transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-100 bg-white">
        <div className="px-8 py-6 space-y-4">
          <Link 
            to="/" 
            className={`block text-sm font-light transition-colors duration-300 ${
              isActive('/') 
                ? 'text-black' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Products
          </Link>
          <Link 
            to="/orders" 
            className={`block text-sm font-light transition-colors duration-300 ${
              isActive('/orders') 
                ? 'text-black' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Orders
          </Link>
          <Link 
            to="/admin" 
            className={`block text-sm font-light transition-colors duration-300 ${
              isActive('/admin') 
                ? 'text-black' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
