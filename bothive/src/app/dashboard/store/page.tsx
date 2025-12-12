"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Package,
  Download,
  Heart,
  Star,
  Grid3x3,
  List,
  Bot,
  Layers,
  Workflow,
  CircuitBoard,
  Filter,
  ChevronDown,
  RefreshCw,
  Users,
  CheckCircle2,
  X,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import ThemeToggle from "@/components/ThemeToggle";
import AIChatInterface from "@/components/AIChatInterface";

// Types
interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  author: string;
  authorAvatar: string;
  rating: number;
  reviews: number;
  downloads: number;
  price: number;
  currency: string;
  image: string;
  tags: string[];
  features: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  isFree: boolean;
  isInstalled: boolean;
  compatibility: string[];
  requirements: string[];
  version: string;
  lastUpdated: string;
  icon: React.ReactNode;
}

interface UserLibrary {
  items: MarketplaceItem[];
  totalSpent: number;
  savings: number;
  favorites: string[];
}

// Real marketplace data with compelling AI products
// Real marketplace data fetched from API
const MARKETPLACE_ITEMS: MarketplaceItem[] = [];

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: Grid3x3 },
  { id: 'bot', name: 'Bots', icon: Bot },
  { id: 'swarm', name: 'Swarms', icon: Layers },
  { id: 'template', name: 'Templates', icon: Workflow },
  { id: 'integration', name: 'Integrations', icon: CircuitBoard }
];

const SORT_OPTIONS = [
  { id: 'popular', name: 'Most Popular' },
  { id: 'newest', name: 'Newest First' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'downloads', name: 'Most Downloaded' }
];

export default function HiveStorePage() {
  const { profile } = useAppSession();
  const { theme } = useTheme();
  const [items, setItems] = useState<MarketplaceItem[]>(MARKETPLACE_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLibrary, setUserLibrary] = useState<UserLibrary>({
    items: [],
    totalSpent: 0,
    savings: 0,
    favorites: []
  });

  // Bothive background styling
  const rootBackground = cn(
    "min-h-screen relative overflow-hidden",
    theme === "dark"
      ? "bg-[#0C1024]"
      : "bg-gradient-to-br from-[#0C1024] via-[#1a1f3a] to-[#0C1024]"
  );

  const gridOverlayClass = cn(
    "absolute inset-0 bg-[length:64px_64px]",
    theme === "dark"
      ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] opacity-40"
      : "bg-[linear-gradient(to_right,rgba(12,16,36,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(12,16,36,0.08)_1px,transparent_1px)] opacity-70"
  );

  const radialOverlayClass = cn(
    "absolute inset-x-0 top-[-240px] h-[520px] rounded-full",
    theme === "dark"
      ? "bg-[radial-gradient(circle_at_center,rgba(108,67,255,0.15),transparent_70%)]"
      : "bg-[radial-gradient(circle_at_center,rgba(108,67,255,0.12),transparent_70%)]"
  );

  // Fetch marketplace items
  useEffect(() => {
    const fetchItems = async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);

      try {
        const response = await fetch(`/api/store/bots?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setItems(data.bots || []);
        }
      } catch (error) {
        console.error("Failed to fetch store items:", error);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(fetchItems, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery, sortBy]);

// Handle item installation
const handleInstall = useCallback(async (item: MarketplaceItem) => {
  if (item.isInstalled) return;

  setLoading(true);
  try {
    const response = await fetch(`/api/store/install/${item.id}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Installation failed');
    }

    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, isInstalled: true } : i
    ));

    setUserLibrary(prev => ({
      ...prev,
      items: [...prev.items, item],
      totalSpent: prev.totalSpent + item.price
    }));

    // Show success toast or notification here
    console.log(`Installed ${item.name} successfully`);
  } catch (error) {
    console.error('Installation failed:', error);
    // Show error toast
  } finally {
    setLoading(false);
  }
}, []);

// Handle favorite toggle
const handleFavorite = useCallback((itemId: string) => {
  setUserLibrary(prev => ({
    ...prev,
    favorites: prev.favorites.includes(itemId)
      ? prev.favorites.filter(id => id !== itemId)
      : [...prev.favorites, itemId]
  }));
}, []);

// Get category icon
const getCategoryIcon = (category: string) => {
  const categoryConfig = CATEGORIES.find(c => c.id === category);
  return categoryConfig?.icon || Grid3x3;
};

return (
  <div className={rootBackground}>
    {/* Background overlays */}
    <div className="pointer-events-none absolute inset-0">
      <div className={radialOverlayClass} />
      <div className={gridOverlayClass} />
    </div>

    <div className="relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] rounded-xl sm:rounded-2xl blur-xl opacity-50" />
            <div className="relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 backdrop-blur-sm border border-white/20">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text">
              Hive Store
            </h1>
            <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-2xl">Discover and install AI bots, swarms, and integrations from our marketplace</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Stats Overview */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#6C43FF]/10 to-[#8A63FF]/5 backdrop-blur-sm hover:border-[#6C43FF]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C43FF]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C43FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] shadow-lg shadow-[#6C43FF]/25 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{items.length}</p>
                  <p className="text-white/60 text-sm">Total Items</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs">Live marketplace</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#8A63FF]/10 to-[#6C43FF]/5 backdrop-blur-sm hover:border-[#8A63FF]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#8A63FF]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8A63FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#8A63FF] to-[#6C43FF] shadow-lg shadow-[#8A63FF]/25 group-hover:scale-110 transition-transform duration-300">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{userLibrary.items.length}</p>
                  <p className="text-white/60 text-sm">Your Library</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs">Installed items</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#FF6B6B]/10 to-[#6C43FF]/5 backdrop-blur-sm hover:border-[#FF6B6B]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF6B6B]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#6C43FF] shadow-lg shadow-[#FF6B6B]/25 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">${userLibrary.totalSpent.toFixed(2)}</p>
                  <p className="text-white/60 text-sm">Total Spent</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-xs">Lifetime purchases</span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#4ECDC4]/10 to-[#6C43FF]/5 backdrop-blur-sm hover:border-[#4ECDC4]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#4ECDC4]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4ECDC4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#6C43FF] shadow-lg shadow-[#4ECDC4]/25 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{userLibrary.favorites.length}</p>
                  <p className="text-white/60 text-sm">Favorites</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                <span className="text-xs">Saved items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/40" />
              <input
                type="text"
                placeholder="Search AI bots, swarms, templates, integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-[#6C43FF]/50 focus:outline-none focus:bg-white/15 transition-all duration-300 text-lg"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/50">Live search</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 whitespace-nowrap ${selectedCategory === category.id
                      ? 'border-[#6C43FF] bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 text-white shadow-lg shadow-[#6C43FF]/25'
                      : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10'
                      }`}
                  >
                    {selectedCategory === category.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF]/10 to-[#8A63FF]/10 rounded-2xl" />
                    )}
                    <div className="relative flex items-center gap-3">
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`group p-4 rounded-2xl border transition-all duration-300 ${showFilters
                  ? 'border-[#6C43FF] bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 text-white shadow-lg shadow-[#6C43FF]/25'
                  : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10'
                  }`}
              >
                <Filter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-6 py-4 pr-12 rounded-2xl border border-white/20 bg-white/5 text-white/60 focus:border-[#6C43FF]/50 focus:outline-none focus:bg-white/10 transition-all duration-300 font-medium"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.id} value={option.id} className="bg-black text-white">
                      {option.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              </div>

              <div className="flex rounded-2xl border border-white/20 bg-white/5 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-4 transition-all duration-300 ${viewMode === 'grid'
                    ? 'bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 text-[#6C43FF] shadow-lg shadow-[#6C43FF]/25'
                    : 'text-white/60 hover:bg-white/10'
                    }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-4 transition-all duration-300 ${viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 text-[#6C43FF] shadow-lg shadow-[#6C43FF]/25'
                    : 'text-white/60 hover:bg-white/10'
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className={subduedText}>
            Showing {filteredItems.length} of {items.length} items
          </p>
          <button className="flex items-center gap-2 text-[#6C43FF] hover:text-[#8A63FF] transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Items Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const CategoryIcon = getCategoryIcon(item.category);
              const isFavorite = userLibrary.favorites.includes(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative ${viewMode === 'grid'
                    ? 'relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg hover:border-[#6C43FF]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#6C43FF]/20 hover:scale-[1.02]'
                    : 'flex items-center gap-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.08] to-white/[0.02] backdrop-blur-sm hover:border-[#6C43FF]/30 transition-all duration-300'
                    }`}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleFavorite(item.id)}
                    className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-red-500/20"
                  >
                    <Heart className={`w-5 h-5 transition-colors duration-300 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>

                  {/* Item Content */}
                  {viewMode === 'grid' ? (
                    <div className="p-6 space-y-6">
                      {/* Header with Icon */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#6C43FF]/20 to-[#8A63FF]/10 backdrop-blur-sm border border-white/20">
                              <CategoryIcon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#6C43FF] transition-colors duration-300">{item.name}</h3>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm text-white/90 font-medium">{item.rating}</span>
                              </div>
                              <span className="text-xs text-white/50">({item.reviews.toLocaleString()})</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{item.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium border border-white/20">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium border border-white/20">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Stats Bar */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-white/40" />
                            <span className="text-sm text-white/60">{(item.downloads / 1000).toFixed(1)}k</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-white/40" />
                            <span className="text-sm text-white/60">{item.author}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${item.isFree
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 text-[#6C43FF] border border-[#6C43FF]/30'
                            }`}>
                            {item.isFree ? 'FREE' : `$${item.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#6C43FF]/20 to-[#8A63FF]/10 backdrop-blur-sm border border-white/20">
                          <CategoryIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#6C43FF] transition-colors duration-300">{item.name}</h3>
                        <p className="text-white/70 mb-4 line-clamp-2">{item.description}</p>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-white font-medium">{item.rating}</span>
                            <span className="text-white/50 text-sm">({item.reviews.toLocaleString()} reviews)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Download className="w-5 h-5 text-white/50" />
                            <span className="text-white/50 text-sm">{item.downloads.toLocaleString()} downloads</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${item.isFree
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 text-[#6C43FF] border border-[#6C43FF]/30'
                            }`}>
                            {item.isFree ? 'FREE' : `$${item.price}`}
                          </span>
                          <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium border border-white/20">
                            {item.category}
                          </span>
                          <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium border border-white/20">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className={viewMode === 'grid' ? 'absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent' : 'ml-auto'}>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleInstall(item)}
                        className={`flex-1 px-6 py-3 bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white rounded-2xl font-bold shadow-lg shadow-[#6C43FF]/25 hover:shadow-xl hover:shadow-[#6C43FF]/40 transition-all duration-300 hover:scale-105 ${item.isInstalled ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#7C5CFF] hover:to-[#9B7CFF]'
                          }`}
                        disabled={item.isInstalled}
                      >
                        {item.isInstalled ? '✓ Installed' : loading ? 'Installing...' : `Install ${item.isFree ? 'Free' : `$${item.price}`}`}
                      </button>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>

    {/* Floating AI Assistant */}
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <button
        onClick={() => setShowChat(!showChat)}
        className="relative group p-4 rounded-full bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white shadow-lg shadow-[#6C43FF]/25 hover:shadow-xl hover:shadow-[#6C43FF]/40 transition-all duration-300 hover:scale-110"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
        <div className="relative">
          <Bot className="w-6 h-6" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Store Assistant
      </div>
    </motion.div>

    {/* AI Chat Interface */}
    <AnimatePresence>
      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-8 z-40 w-96 max-w-[90vw]"
        >
          <AIChatInterface />
        </motion.div>
      )}
    </AnimatePresence>

    {/* Item Detail Modal */}
    <AnimatePresence>
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0C1024] border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#6C43FF]/20 to-[#8A63FF]/20 backdrop-blur-sm border border-white/20">
                {selectedItem.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h2>
                <p className="text-white/70 mb-4">{selectedItem.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-white">{selectedItem.rating}</span>
                    <span className="text-white/50">({selectedItem.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-5 h-5 text-white/50" />
                    <span className="text-white">{selectedItem.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedItem.isFree ? 'bg-green-500/20 text-green-400' : 'bg-[#6C43FF]/20 text-[#6C43FF]'
                    }`}>
                    {selectedItem.isFree ? 'Free' : `$${selectedItem.price}`}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/70">
                    {selectedItem.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/70">
                    {selectedItem.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
              <ul className="space-y-2">
                {selectedItem.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!selectedItem.isInstalled) {
                    handleInstall(selectedItem);
                  }
                  setSelectedItem(null);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white rounded-lg font-medium shadow-lg shadow-[#6C43FF]/25 hover:shadow-[#6C43FF]/40 transition-all duration-200"
              >
                {selectedItem.isInstalled ? 'Already Installed' : loading ? 'Installing...' : `Install for ${selectedItem.isFree ? 'Free' : `$${selectedItem.price}`}`}
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}
