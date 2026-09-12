"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import menuApi from "@/services/menuApi";
import { useAuth } from "@/context/AuthContext";
import { Utensils, Search, Clock, Plus, Layers, Sparkles } from "lucide-react";

export default function MenuPage() {
  const { role, isAuthenticated } = useAuth();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = [
    { key: "all", label: "All Items" },
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "dinner", label: "Dinner" },
    { key: "meat", label: "Meat & Grill" },
    { key: "beverage", label: "Beverages" },
  ];

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const query = {
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (selectedCategory !== "all") {
        query.category = selectedCategory;
      }

      if (search.trim()) {
        query.search = search.trim();
      }

      const res = await menuApi.getMenu(query);
      setMenus(res.data?.data?.menus || []);
    } catch (err) {
      console.error("Failed to load menu", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMenu();
  };

  const canManage = isAuthenticated && (role === "owner" || role === "manager");

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8c6838]">
              Culinary Collection
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Restaurant & In-Room Dining Menu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore gourmet dishes and refreshing beverages prepared by our hotel culinary artisans
            </p>
          </div>

          {canManage && (
            <Link href="/menu/manage">
              <Button size="sm" variant="primary" leftIcon={<Layers className="h-4 w-4" />}>
                Manage Menu Items
              </Button>
            </Link>
          )}
        </div>

        {/* Category Tabs & Search */}
        <div className="my-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-xs w-full">
            <Input
              placeholder="Search dishes & drinks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </form>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 space-y-3 border border-slate-200 animate-pulse">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : menus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge status={item.category} size="sm" />
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{item.preparationTime || 15} mins</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {item.description ||
                      "Prepared fresh to order using finest culinary techniques and authentic ingredients."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Price
                    </span>
                    <p className="text-base font-bold text-[#8c6838]">
                      {item.price?.toLocaleString()} <span className="text-xs font-normal text-slate-500">ETB</span>
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      item.isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Utensils className="h-6 w-6" />}
            title="No menu items found"
            description="There are currently no dishes listed in this category or matching your search criteria."
            actionLabel="View All Items"
            onAction={() => {
              setSelectedCategory("all");
              setSearch("");
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
