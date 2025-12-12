import { ToolDescriptor } from "@/lib/agentTypes";
import { createClient } from "@supabase/supabase-js";

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables for data tools");
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export interface RealDataTool {
  name: string;
  description: string;
  run(args: any, ctx: any): Promise<any>;
}

/**
 * Real data tools that fetch actual data from Supabase
 * These tools replace mock data with real database queries
 */
export const realDataTools: ToolDescriptor[] = [
  {
    name: "data.fetchBots",
    capability: "data.fetch",
    description: "Fetch real bots data from the database with filtering and pagination",
    async run(args) {
      try {
        const status = typeof args.status === "string" ? args.status : "approved";
        const isPublished = typeof args.isPublished === "boolean" ? args.isPublished : true;
        const limit = typeof args.limit === "number" ? Math.min(args.limit, 100) : 20;
        const offset = typeof args.offset === "number" ? args.offset : 0;
        const search = typeof args.search === "string" ? args.search : null;

        const client = getSupabaseClient();
        let query = client
          .from("bots")
          .select(`id, name, slug, description, price, metadata, default_version_id, capabilities, status, is_published, updated_at, created_at`)
          .eq("status", status)
          .eq("is_published", isPublished)
          .order("updated_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
          return { success: false, output: `Database error: ${error.message}` };
        }

        return {
          success: true,
          output: `Fetched ${data?.length || 0} bots from database`,
          data: data || [],
        };
      } catch (error) {
        return {
          success: false,
          output: `Failed to fetch bots: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },
  {
    name: "data.fetchIntegrations",
    capability: "data.fetch",
    description: "Fetch real integrations data from the database",
    async run(args) {
      try {
        const status = typeof args.status === "string" ? args.status : null;
        const limit = typeof args.limit === "number" ? Math.min(args.limit, 100) : 20;
        const offset = typeof args.offset === "number" ? args.offset : 0;

        const client = getSupabaseClient();
        let query = client
          .from("integrations")
          .select(`id, name, description, status, metadata, created_at, updated_at`)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) {
          return { success: false, output: `Database error: ${error.message}` };
        }

        return {
          success: true,
          output: `Fetched ${data?.length || 0} integrations from database`,
          data: data || [],
        };
      } catch (error) {
        return {
          success: false,
          output: `Failed to fetch integrations: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },
  {
    name: "data.fetchWorkforceRuns",
    capability: "data.fetch",
    description: "Fetch real workforce run data from the database",
    async run(args) {
      try {
        const userId = typeof args.userId === "string" ? args.userId : null;
        const status = typeof args.status === "string" ? args.status : null;
        const limit = typeof args.limit === "number" ? Math.min(args.limit, 100) : 20;
        const offset = typeof args.offset === "number" ? args.offset : 0;

        const client = getSupabaseClient();
        let query = client
          .from("workforce_runs")
          .select(`id, user_id, request, result, status, created_at`)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (userId) {
          query = query.eq("user_id", userId);
        }

        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) {
          return { success: false, output: `Database error: ${error.message}` };
        }

        return {
          success: true,
          output: `Fetched ${data?.length || 0} workforce runs from database`,
          data: data || [],
        };
      } catch (error) {
        return {
          success: false,
          output: `Failed to fetch workforce runs: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },
  {
    name: "data.fetchUserAnalytics",
    capability: "data.fetch",
    description: "Fetch user analytics and usage data",
    async run(args, ctx) {
      try {
        const userId = ctx.metadata?.userId;
        if (!userId) {
          return { success: false, output: "User ID required for analytics" };
        }

        const timeRange = typeof args.timeRange === "string" ? args.timeRange : "30d";
        const metricType = typeof args.metricType === "string" ? args.metricType : "all";

        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case "7d":
            startDate.setDate(now.getDate() - 7);
            break;
          case "30d":
            startDate.setDate(now.getDate() - 30);
            break;
          case "90d":
            startDate.setDate(now.getDate() - 90);
            break;
          default:
            startDate.setDate(now.getDate() - 30);
        }

        const client = getSupabaseClient();
        
        // Fetch user data based on metric type
        let analytics = {};

        if (metricType === "all" || metricType === "bots") {
          const { data: botData } = await client
            .from("bots")
            .select("id, name, status, created_at")
            .eq("user_id", userId)
            .gte("created_at", startDate.toISOString());

          analytics.bots = {
            total: botData?.length || 0,
            active: botData?.filter(b => b.status === "approved").length || 0,
            pending: botData?.filter(b => b.status === "pending").length || 0,
          };
        }

        if (metricType === "all" || metricType === "integrations") {
          const { data: integrationData } = await client
            .from("integrations")
            .select("id, name, status, created_at")
            .eq("user_id", userId)
            .gte("created_at", startDate.toISOString());

          analytics.integrations = {
            total: integrationData?.length || 0,
            active: integrationData?.filter(i => i.status === "active").length || 0,
            pending: integrationData?.filter(i => i.status === "pending").length || 0,
          };
        }

        if (metricType === "all" || metricType === "workforce") {
          const { data: workforceData } = await client
            .from("workforce_runs")
            .select("id, status, created_at")
            .eq("user_id", userId)
            .gte("created_at", startDate.toISOString());

          analytics.workforce = {
            total: workforceData?.length || 0,
            completed: workforceData?.filter(w => w.status === "completed").length || 0,
            failed: workforceData?.filter(w => w.status === "failed").length || 0,
          };
        }

        return {
          success: true,
          output: `Fetched user analytics for ${timeRange} period`,
          data: analytics,
        };
      } catch (error) {
        return {
          success: false,
          output: `Failed to fetch analytics: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },
  {
    name: "data.createBot",
    capability: "data.create",
    description: "Create a new bot in the database",
    async run(args, ctx) {
      try {
        const userId = ctx.metadata?.userId;
        if (!userId) {
          return { success: false, output: "User ID required to create bot" };
        }

        const name = typeof args.name === "string" ? args.name : null;
        const description = typeof args.description === "string" ? args.description : "";
        const price = typeof args.price === "number" ? args.price : 0;
        const capabilities = Array.isArray(args.capabilities) ? args.capabilities : [];

        if (!name) {
          return { success: false, output: "Bot name is required" };
        }

        const client = getSupabaseClient();
        const { data, error } = await client
          .from("bots")
          .insert({
            user_id: userId,
            name,
            description,
            price,
            capabilities,
            status: "pending",
            is_published: false,
            slug: name.toLowerCase().replace(/\s+/g, "-"),
            metadata: { createdBy: "orchestrator" },
          })
          .select()
          .single();

        if (error) {
          return { success: false, output: `Database error: ${error.message}` };
        }

        return {
          success: true,
          output: `Created bot "${name}" with ID ${data.id}`,
          data,
        };
      } catch (error) {
        return {
          success: false,
          output: `Failed to create bot: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },
  {
    name: "data.updateBot",
    capability: "data.update",
    description: "Update an existing bot in the database",
    async run(args) {
      try {
        const botId = typeof args.botId === "string" ? args.botId : null;
        if (!botId) {
          return { success: false, output: "Bot ID is required" };
        }

        const updates: any = {};
        if (typeof args.name === "string") updates.name = args.name;
        if (typeof args.description === "string") updates.description = args.description;
        if (typeof args.price === "number") updates.price = args.price;
        if (Array.isArray(args.capabilities)) updates.capabilities = args.capabilities;
        if (typeof args.status === "string") updates.status = args.status;
        if (typeof args.isPublished === "boolean") updates.is_published = args.isPublished;

        const client = getSupabaseClient();
        const { data, error } = await client
          .from("bots")
          .update(updates)
          .eq("id", botId)
          .select()
          .single();

        if (error) {
          return { success: false, output: `Database error: ${error.message}` };
        }

        return {
          success: true,
          output: `Updated bot "${data.name}"`,
          data,
        };
      } catch (error) {
        return {
          success: false,
          output: `Failed to update bot: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  },
];