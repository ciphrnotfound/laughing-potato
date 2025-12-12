import { ToolDescriptor } from "@/lib/agentTypes";
import {
    generalTools,
    codingTools,
    studyTools,
    socialTools,
    messagingTools,
    integrationTools,
    agentTools
} from "@/lib/tools";
import { realDataTools } from "@/lib/tools/real-data-tools";

export const allTools: ToolDescriptor[] = [
    ...generalTools,
    ...codingTools,
    ...studyTools,
    ...socialTools,
    ...messagingTools,
    ...integrationTools,
    ...agentTools,
    ...realDataTools
];
