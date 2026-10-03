'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchCategories,
  fetchSubCategories,
  fetchColors,
  fetchSarees,
} from '../utils/api';
import {
  FolderTree,
  Layers,
  Palette,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function DashboardOverview({ onNavigate }) {
  const [counts, setCounts] = useState({
    categories: 0,
    subCategories: 0,
    colors: 0,
    products: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [catRes, subRes, colRes, prodRes] = await Promise.all([
        fetchCategories(),
        fetchSubCategories(),
        fetchColors(),
        fetchSarees(),
      ]);

      setCounts({
        categories: catRes.count || catRes.data?.length || 0,
        subCategories: subRes.count || subRes.data?.length || 0,
        colors: colRes.count || colRes.data?.length || 0,
        products: prodRes.count || prodRes.data?.length || 0,
      });

      setRecentProducts((prodRes.data || []).slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const metricCards = [
    {
      title: 'TOTAL CATEGORIES',
      value: counts.categories,
      subtitle: 'Active Categories',
      icon: FolderTree,
      tab: 'categories',
    },
    {
      title: 'SUBCATEGORIES',
      value: counts.subCategories,
      subtitle: 'Parent Mapped',
      icon: Layers,
      tab: 'categories',
    },
    {
      title: 'COLOR PALETTE',
      value: counts.colors,
      subtitle: 'Color Swatches',
      icon: Palette,
      tab: 'colors',
    },
    {
      title: 'SAREE PRODUCTS',
      value: counts.products,
      subtitle: 'Live Products',
      icon: ShoppingBag,
      tab: 'products',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">ADMIN OVERVIEW</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time inventory and database performance analytics</p>
        </div>

        <button
          onClick={loadMetrics}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl shadow-xs border border-slate-200 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Overview
        </button>
      </div>

      {/* Top 4 Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate(card.tab)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className="p-2.5 bg-slate-50 group-hover:bg-slate-900 text-slate-700 group-hover:text-white rounded-xl transition-all">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? '...' : card.value}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 flex items-center justify-between">
                  <span>{card.subtitle}</span>
                  <span className="text-slate-900 group-hover:translate-x-1 transition-all flex items-center gap-0.5 font-bold">
                    View <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sarees Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 tracking-wide flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-900" /> Recent Saree Inventory
          </h3>
          <button
            onClick={() => onNavigate && onNavigate('products')}
            className="text-xs font-bold text-slate-900 hover:underline"
          >
            View All Products &rarr;
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No sarees added yet. Go to Products to create your first saree product.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Saree Name</th>
                  <th className="px-4 py-2.5">SKU</th>
                  <th className="px-4 py-2.5">Price</th>
                  <th className="px-4 py-2.5">Fabric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{p.SKU}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">₹{p.price}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{p.fabric || 'Silk'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
