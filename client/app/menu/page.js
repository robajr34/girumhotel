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
import {
  Utensils,
  Search,
  Clock,
  Layers,
  Coffee,
  Croissant,
  Soup,
  Beef,
  Wine,
  CupSoda,
  CakeSlice,
  Flame,
} from "lucide-react";

export default function MenuPage() {
  const { role, isAuthenticated } = useAuth();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = [
    {
      key: "all",
      label: "All Items",
      icon: Utensils,
      description:
        "Explore our complete selection of food and beverages.",
    },
    {
      key: "breakfast",
      label: "Breakfast",
      icon: Croissant,
      description: "Start your day with a delicious breakfast.",
    },
    {
      key: "lunch",
      label: "Lunch",
      icon: Soup,
      description:
        "Freshly prepared meals for a satisfying afternoon.",
    },
    {
      key: "dinner",
      label: "Dinner",
      icon: Flame,
      description: "Enjoy our selection of evening dishes.",
    },
    {
      key: "meat",
      label: "Meat & Grill",
      icon: Beef,
      description:
        "Grilled and expertly prepared meat selections.",
    },
    {
      key: "beverage",
      label: "Beverages",
      icon: CupSoda,
      description:
        "Refreshing drinks to complement your meal.",
    },
    {
      key: "alcohol",
      label: "Alcohol",
      icon: Wine,
      description:
        "A selection of alcoholic beverages.",
    },
    {
      key: "hot_drink",
      label: "Hot Drink",
      icon: Coffee,
      description:
        "Warm drinks prepared fresh for you.",
    },
    {
      key: "cake",
      label: "Cake",
      icon: CakeSlice,
      description:
        "Sweet treats and freshly prepared desserts.",
    },
  ];

  const groupedMenus =
    selectedCategory === "all"
      ? categories
          .filter((category) => category.key !== "all")
          .map((category) => ({
            ...category,
            items: menus.filter(
              (item) => item.category === category.key
            ),
          }))
          .filter((group) => group.items.length > 0)
      : [
          {
            ...categories.find(
              (category) => category.key === selectedCategory
            ),
            items: menus,
          },
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

  const canManage =
    isAuthenticated && (role === "owner" || role === "manager");

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
              Explore gourmet dishes and refreshing beverages prepared by
              our hotel culinary artisans
            </p>
          </div>

          {canManage && (
            <Link href="/menu/manage">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Layers className="h-4 w-4" />}
              >
                Manage Menu Items
              </Button>
            </Link>
          )}
        </div>

        {/* Category Tabs & Search */}
        <div className="my-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() =>
                  setSelectedCategory(category.key)
                }
                className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === category.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xs w-full"
          >
            <Input
              placeholder="Search dishes & drinks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </form>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="space-y-10">
            {[1, 2, 3].map((section) => (
              <div key={section} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />

                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          <th className="py-3.5 px-5">
                            <Skeleton className="h-3 w-20" />
                          </th>

                          <th className="py-3.5 px-5">
                            <Skeleton className="h-3 w-20" />
                          </th>

                          <th className="py-3.5 px-5">
                            <Skeleton className="h-3 w-24" />
                          </th>

                          <th className="py-3.5 px-5">
                            <Skeleton className="h-3 w-20" />
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {[1, 2, 3].map((row) => (
                          <tr key={row}>
                            <td className="py-4 px-5">
                              <Skeleton className="h-4 w-32" />
                            </td>

                            <td className="py-4 px-5">
                              <Skeleton className="h-4 w-20" />
                            </td>

                            <td className="py-4 px-5">
                              <Skeleton className="h-4 w-20" />
                            </td>

                            <td className="py-4 px-5">
                              <Skeleton className="h-6 w-24" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : menus.length > 0 ? (
          <div className="space-y-10">
            {groupedMenus.map(
              ({
                key,
                label,
                icon: CategoryIcon,
                description,
                items,
              }) => {
                if (!CategoryIcon) return null;

                return (
                  <section
                    key={key}
                    className="space-y-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 shrink-0 rounded-xl bg-[#fbf7f2] border border-[#e8d8c3] flex items-center justify-center">
                          <CategoryIcon className="h-5 w-5 text-[#8c6838]" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                              {label}
                            </h2>

                            <Badge
                              status={key}
                              size="sm"
                            >
                              {items.length}{" "}
                              {items.length === 1
                                ? "item"
                                : "items"}
                            </Badge>
                          </div>

                          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="py-3.5 px-5">
                                Menu Item
                              </th>

                              <th className="py-3.5 px-5">
                                Description
                              </th>

                              <th className="py-3.5 px-5">
                                Preparation
                              </th>

                              <th className="py-3.5 px-5">
                                Price
                              </th>

                              <th className="py-3.5 px-5">
                                Availability
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 text-xs">
                            {items.map((item) => (
                              <tr
                                key={item._id}
                                className="hover:bg-slate-50/70 transition-colors"
                              >
                                {/* Item */}
                                <td className="py-4 px-5 min-w-[190px]">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                                      <CategoryIcon className="h-4 w-4 text-[#8c6838]" />
                                    </div>

                                    <div>
                                      <p className="font-bold text-slate-900">
                                        {item.name}
                                      </p>

                                      <div className="mt-1">
                                        <Badge
                                          status={item.category}
                                          size="sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Description */}
                                <td className="py-4 px-5 max-w-[380px]">
                                  <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                                    {item.description ||
                                      "Prepared fresh to order using quality ingredients."}
                                  </p>
                                </td>

                                {/* Preparation */}
                                <td className="py-4 px-5 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />

                                    <span>
                                      {item.preparationTime || 15} mins
                                    </span>
                                  </div>
                                </td>

                                {/* Price */}
                                <td className="py-4 px-5 whitespace-nowrap">
                                  <span className="font-bold text-[#8c6838]">
                                    {item.price?.toLocaleString()}
                                  </span>

                                  <span className="text-[11px] text-slate-400 ml-1">
                                    ETB
                                  </span>
                                </td>

                                {/* Availability */}
                                <td className="py-4 px-5">
                                  <Badge
                                    variant={
                                      item.isAvailable
                                        ? "success"
                                        : "neutral"
                                    }
                                    size="sm"
                                  >
                                    {item.isAvailable
                                      ? "Available"
                                      : "Unavailable"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden space-y-3">
                      {items.map((item) => (
                        <div
                          key={item._id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card"
                        >
                          {/* Item Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="h-10 w-10 shrink-0 rounded-xl bg-[#fbf7f2] border border-[#e8d8c3] flex items-center justify-center">
                                <CategoryIcon className="h-4.5 w-4.5 text-[#8c6838]" />
                              </div>

                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-slate-900">
                                  {item.name}
                                </h3>

                                <div className="mt-1">
                                  <Badge
                                    status={item.category}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>

                            <Badge
                              variant={
                                item.isAvailable
                                  ? "success"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              {item.isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-xs leading-relaxed text-slate-500 mt-3">
                            {item.description ||
                              "Prepared fresh to order using quality ingredients."}
                          </p>

                          {/* Details */}
                          <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Preparation
                              </span>

                              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />

                                {item.preparationTime || 15} mins
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Price
                              </span>

                              <p className="text-sm font-bold text-[#8c6838] mt-1">
                                {item.price?.toLocaleString()}{" "}
                                <span className="text-[11px] font-normal text-slate-500">
                                  ETB
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }
            )}
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
