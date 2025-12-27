import { ToolDescriptor, ToolContext, ToolResult } from "@/lib/agentTypes";

/**
 * Mock Tools for the Proactive Life-Fixer Swarm
 * These simulate "Executive Power" over a user's real-life services.
 */

export const lifeFixerTools: ToolDescriptor[] = [
    {
        name: "calendar.cancel_meeting",
        capability: "calendar.manage",
        description: "Cancel a meeting on the user's calendar with a polite excuse. Args: { meeting_time: string, excuse_type: 'stress' | 'conflict' | 'emergency' }",
        run: async (args: Record<string, any>, ctx: ToolContext): Promise<ToolResult> => {
            const { meeting_time, excuse_type } = args;
            const excuses = {
                stress: "The user is experiencing high cognitive load and needs to reschedule for well-being.",
                conflict: "A prioritized life event has caused a scheduling conflict.",
                emergency: "An urgent personal matter requires immediate attention."
            };

            const selectedExcuse = excuses[excuse_type as keyof typeof excuses] || excuses.stress;

            return {
                success: true,
                output: `EXECUTIVE ACTION: Cancelled meeting at ${meeting_time}. Reason: ${selectedExcuse}`,
                data: { status: "cancelled", time: meeting_time, reason: excuse_type }
            };
        }
    },
    {
        name: "finance.check_balance",
        capability: "finance.read",
        description: "Check the user's current bank balance to see if a purchase is authorized. Args: { threshold: number }",
        run: async (args: Record<string, any>, ctx: ToolContext): Promise<ToolResult> => {
            const mockBalance = 12500; // Mock balance
            const isAuthorized = mockBalance >= (args.threshold || 0);

            return {
                success: true,
                output: `FINANCE LOG: Balance is $${mockBalance}. Purchase authorized: ${isAuthorized}`,
                data: { balance: mockBalance, authorized: isAuthorized }
            };
        }
    },
    {
        name: "delivery.order_meal",
        capability: "delivery.order",
        description: "Order a healthy meal to the user's home. Args: { meal_type: 'high-protein' | 'vegan' | 'comfort', address: string }",
        run: async (args: Record<string, any>, ctx: ToolContext): Promise<ToolResult> => {
            const { meal_type, address } = args;
            return {
                success: true,
                output: `EXECUTIVE ACTION: Ordered a ${meal_type} meal to ${address}. Delivery expected in 45 mins.`,
                data: { order_status: "dispatched", eta: "45m", meal: meal_type }
            };
        }
    },
    {
        name: "booking.reserve",
        capability: "booking.manage",
        description: "Book a service (massage, gym, spa) for the user. Args: { service: string, time: string }",
        run: async (args: Record<string, any>, ctx: ToolContext): Promise<ToolResult> => {
            const { service, time } = args;
            return {
                success: true,
                output: `EXECUTIVE ACTION: Booked ${service} for ${time}. Confirmation sent to user's device.`,
                data: { booking_id: `FIX-${Math.random().toString(36).substr(2, 9)}`, status: "confirmed" }
            };
        }
    }
];
