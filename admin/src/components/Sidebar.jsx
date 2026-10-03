'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderTree,
  Palette,
  ShoppingBag,
  PackageCheck,
  Settings,
  User,
  ChevronDown,
  Sparkles,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { id: 'overview', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'categories', label: 'CATEGORIES', icon: FolderTree },
    { id: 'products', label: 'PRODUCTS', icon: ShoppingBag },
    { id: 'orders', label: 'ORDERS', icon: PackageCheck },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 min-h-screen flex flex-col justify-between border-r border-slate-200 shadow-sm shrink-0">
      <div>
        {/* User Profile Section (Executive White Theme) */}
        <div className="p-6 flex flex-col items-center border-b border-slate-100 text-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md ring-4 ring-slate-100">
              <User className="w-8 h-8 text-slate-100" />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              {user?.name || 'Vaibhav Sonar'}
            </h3>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {user?.role ? `${user.role} CONTROL` : 'SAREE STORE ADMIN'}
          </p>

          {/* Auth Action Buttons */}
          <div className="mt-3 w-full">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200/80 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs tracking-wider transition-all text-left ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">Saree Store Management</p>
        <p className="text-[10px] text-slate-400">v1.0.0 &bull; 2026</p>
      </div>
    </aside>
  );
}
