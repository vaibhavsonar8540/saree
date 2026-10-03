'use client';

import React from 'react';
import { Search, HelpCircle, Menu, Bell } from 'lucide-react';

export default function Navbar({ title }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-xs">
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-slate-700">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 transition-all"
          />
        </div>

        {/* Action Icons matching mockup */}
        <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
