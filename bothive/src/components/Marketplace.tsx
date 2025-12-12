"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, Download, Zap, Globe, Code, Database, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  author: string;
  tags: string[];
  icon: React.ReactNode;
}

const mockItems: MarketplaceItem[] = [
  {
    id: "1",
    name: "Code Assistant Pro",
    description: "Advanced AI-powered coding assistant with multi-language support",
    category: "Development",
    rating: 4.8,
    downloads: 12500,
    author: "DevTeam",
    tags: ["coding", "ai", "productivity"],
    icon: <Code className="w-6 h-6" />
  },
  {
    id: "2", 
    name: "Data Sync Master",
    description: "Automated database synchronization and migration tool",
    category: "Database",
    rating: 4.6,
    downloads: 8300,
    author: "DataCorp",
    tags: ["database", "sync", "migration"],
    icon: <Database className="w-6 h-6" />
  },
  {
    id: "3",
    name: "Global Translator",
    description: "Real-time translation bot for 100+ languages",
    category: "Communication",
    rating: 4.9,
    downloads: 15600,
    author: "LangBot",
    tags: ["translation", "communication", "global"],
    icon: <Globe className="w-6 h-6" />
  },
  {
    id: "4",
    name: "Chat Assistant",
    description: "Intelligent customer service automation bot",
    category: "Communication",
    rating: 4.5,
    downloads: 9200,
    author: "ChatAI",
    tags: ["chat", "customer-service", "automation"],
    icon: <MessageSquare className="w-6 h-6" />
  }
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Development", "Database", "Communication"];

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bot Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover and install powerful bots to automate your workflow
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.author}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{item.downloads.toLocaleString()}</span>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                    {item.category}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Install Bot
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No bots found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}