"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Database, 
  Globe, 
  Github, 
  Twitter, 
  Mail, 
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "disconnected" | "error";
  icon: React.ReactNode;
  features: string[];
  lastSync?: string;
  configUrl?: string;
}

const integrations: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect your repositories for code analysis and automation",
    category: "Development",
    status: "connected",
    icon: <Github className="w-5 h-5" />,
    features: ["Repository analysis", "Issue tracking", "PR automation"],
    lastSync: "2 minutes ago",
    configUrl: "https://github.com/settings/applications"
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync databases and pages for knowledge management",
    category: "Productivity",
    status: "connected",
    icon: <Database className="w-5 h-5" />,
    features: ["Database sync", "Page creation", "Content indexing"],
    lastSync: "5 minutes ago"
  },
  {
    id: "twitter",
    name: "Twitter/X",
    description: "Monitor and engage with social media content",
    category: "Social",
    status: "disconnected",
    icon: <Twitter className="w-5 h-5" />,
    features: ["Tweet monitoring", "Auto-reply", "Content analysis"]
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Process and organize email communications",
    category: "Communication",
    status: "error",
    icon: <Mail className="w-5 h-5" />,
    features: ["Email sorting", "Smart replies", "Meeting scheduling"],
    lastSync: "2 hours ago"
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Manage schedules and automate meeting coordination",
    category: "Productivity",
    status: "connected",
    icon: <Calendar className="w-5 h-5" />,
    features: ["Event scheduling", "Meeting prep", "Availability tracking"],
    lastSync: "1 hour ago"
  },
  {
    id: "slack",
    name: "Slack",
    description: "Integrate with team communication channels",
    category: "Communication",
    status: "disconnected",
    icon: <Zap className="w-5 h-5" />,
    features: ["Message monitoring", "Channel summaries", "Bot integration"]
  }
];

const categories = ["All", "Development", "Productivity", "Communication", "Social"];

export default function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [integrationsList, setIntegrationsList] = useState(integrations);

  const filteredIntegrations = integrationsList.filter(integration => 
    selectedCategory === "All" || integration.category === selectedCategory
  );

  const getStatusColor = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "disconnected":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-3 h-3" />;
      case "disconnected":
        return <AlertCircle className="w-3 h-3" />;
      case "error":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const handleToggleIntegration = (id: string, enabled: boolean) => {
    setIntegrationsList(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, status: enabled ? "connected" as const : "disconnected" as const }
          : integration
      )
    );
  };

  const handleConnect = (id: string) => {
    // Handle OAuth flow or connection process
    console.log(`Connecting to ${id}`);
    handleToggleIntegration(id, true);
  };

  const handleDisconnect = (id: string) => {
    handleToggleIntegration(id, false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-violet-500" />
            Integrations
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Connect external services to extend your bot capabilities
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Integration
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/20 rounded-lg text-violet-600 dark:text-violet-400">
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.category}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(integration.status)}>
                      {getStatusIcon(integration.status)}
                      <span className="ml-1 capitalize">{integration.status}</span>
                    </Badge>
                    <Switch
                      checked={integration.status === "connected"}
                      onCheckedChange={(enabled) => {
                        if (enabled) {
                          handleConnect(integration.id);
                        } else {
                          handleDisconnect(integration.id);
                        }
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {integration.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Last Sync */}
                {integration.lastSync && (
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Last sync</span>
                    <span>{integration.lastSync}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {integration.status === "connected" ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDisconnect(integration.id)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConnect(integration.id)}
                    >
                      Connect
                    </Button>
                  )}
                  {integration.configUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={integration.configUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No integrations found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No integrations match the selected category.
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrationsList.filter(i => i.status === "connected").length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrationsList.filter(i => i.status === "disconnected").length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrationsList.filter(i => i.status === "error").length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Needs Attention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrationsList.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}