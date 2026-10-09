'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchCategories,
  fetchSubCategories,
  fetchSarees,
} from '../utils/api';
import {
  FolderTree,
  Layers,
  ShoppingBag,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardOverview({ onNavigate }) {
  const [counts, setCounts] = useState({
    categories: 0,
    subCategories: 0,
    products: 0,
    activeProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [catRes, subRes, prodRes] = await Promise.all([
        fetchCategories(),
        fetchSubCategories(),
        fetchSarees({ limit: 1000 }),
      ]);

      const catCount = catRes.count ?? catRes.total ?? (Array.isArray(catRes.data) ? catRes.data.length : 0);
      const subCount = subRes.count ?? subRes.total ?? (Array.isArray(subRes.data) ? subRes.data.length : 0);
      const prodList = Array.isArray(prodRes.data) ? prodRes.data : [];
      const prodTotal = prodRes.total ?? prodRes.count ?? prodList.length;
      const activeProdCount = prodList.filter((p) => p.isActive !== false).length;

      setCounts({
        categories: catCount,
        subCategories: subCount,
        products: prodTotal,
        activeProducts: activeProdCount,
      });

      setRecentProducts(prodList.slice(0, 5));
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
      subtitle: 'Active Store Categories',
      badge: 'Organized',
      icon: FolderTree,
      tab: 'categories',
      accentColor: 'from-amber-500 to-amber-600',
      bgGlow: 'bg-amber-50 border-amber-100 text-amber-700',
    },
    {
      title: 'SUBCATEGORIES',
      value: counts.subCategories,
      subtitle: 'Parent Mapped Weaves',
      badge: 'Cataloged',
      icon: Layers,
      tab: 'categories',
      accentColor: 'from-sky-500 to-sky-600',
      bgGlow: 'bg-sky-50 border-sky-100 text-sky-700',
    },
    {
      title: 'SAREE PRODUCTS',
      value: counts.products,
      subtitle: `${counts.activeProducts} Active on Storefront`,
      badge: 'Live Inventory',
      icon: ShoppingBag,
      tab: 'products',
      accentColor: 'from-emerald-500 to-emerald-600',
      bgGlow: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">ADMIN OVERVIEW</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time saree inventory, category taxonomy, and product management performance metrics.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all border border-slate-800 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 3 Dynamic Stat Cards (Category, Subcategory, Product Count) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate(card.tab)}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className={`p-3 rounded-2xl border ${card.bgGlow} transition-all duration-300 group-hover:scale-110 shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-6 relative z-10">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                    {loading ? (
                      <span className="inline-block w-12 h-8 bg-slate-100 rounded-lg animate-pulse"></span>
                    ) : (
                      card.value
                    )}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${card.bgGlow}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{card.subtitle}</span>
                  <span className="text-slate-900 font-bold group-hover:translate-x-1 transition-all flex items-center gap-0.5">
                    View <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sarees Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" /> Recent Saree Inventory
          </h3>
          <button
            onClick={() => onNavigate && onNavigate('products')}
            className="text-xs font-bold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View All Products</span> &rarr;
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">No sarees added yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Go to Products tab to create your first saree.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Saree Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-3">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
                          {p.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.fabric || p.sareeType || 'Silk Saree'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600">{p.SKU}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ₹{p.discountedPrice > 0 ? p.discountedPrice : p.price}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          p.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-700">
                        {p.stock} units
                      </span>
                    </td>
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

