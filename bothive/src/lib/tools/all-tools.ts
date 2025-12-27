import { ToolDescriptor } from "@/lib/agentTypes";
import {
    generalTools,
    codingTools,
    studyTools,
    socialTools,
    messagingTools,
    integrationTools,
    agentTools,
    lifeFixerTools,
    doppelgangerTools
} from "@/lib/tools";

export const allTools: ToolDescriptor[] = [
    ...generalTools,
    ...codingTools,
    ...studyTools,
    ...socialTools,
    ...messagingTools,
    ...integrationTools,
    ...agentTools,
    ...lifeFixerTools,
    ...doppelgangerTools
];


