'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CategoryManager from '../components/CategoryManager';
import ProductManager from '../components/ProductManager';
import DashboardOverview from '../components/DashboardOverview';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldCheck, Mail, Phone, Calendar, KeyRound, LogOut } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products'); // default view
  const { user, isAuthenticated, logout } = useAuth();

  const getTitle = () => {
    switch (activeTab) {
      case 'categories':
        return 'CATEGORIES & SUBCATEGORIES MANAGEMENT';
      case 'products':
        return 'SAREE PRODUCTS MANAGEMENT';
      case 'orders':
        return 'ORDERS MANAGEMENT';
      case 'settings':
        return 'ADMIN SETTINGS & ACCOUNT MANAGEMENT';
      default:
        return 'DASHBOARD OVERVIEW';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* LEFT SIDEBAR WITH EXECUTIVE WHITE THEME */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* RIGHT MAIN CONTENT AREA WITH WHITE CARDS */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Navbar title={getTitle()} />

        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab === 'overview' && (
            <DashboardOverview onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'categories' && <CategoryManager />}

          {activeTab === 'products' && <ProductManager />}

          {activeTab === 'settings' && (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
              {isAuthenticated ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                          Role: <span className="font-bold text-slate-800 uppercase">{user?.role}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <Mail className="w-5 h-5 text-sky-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                        <p className="text-xs font-semibold text-slate-800">{user?.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                        <p className="text-xs font-semibold text-slate-800">{user?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <KeyRound className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Authenticated Active Session
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Created</p>
                        <p className="text-xs font-semibold text-slate-800">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Admin'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <AuthForm initialMode="login" />
                </div>
              )}
            </div>
          )}

          {activeTab !== 'overview' &&
            activeTab !== 'categories' &&
            activeTab !== 'products' &&
            activeTab !== 'settings' && (
              <div className="p-8 max-w-4xl mx-auto text-center py-20 bg-white m-8 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                  {getTitle()}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  This section is ready for extension. Select <span className="font-bold text-slate-900">Categories</span> or <span className="font-bold text-slate-900">Products</span> from the left sidebar.
                </p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
