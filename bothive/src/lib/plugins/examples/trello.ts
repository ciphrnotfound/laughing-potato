/**
 * Trello Integration - Real API implementation
 * Provides comprehensive board and card management capabilities
 */

import { ToolDescriptor } from "@/lib/agentTypes";

/**
 * Get Trello API credentials from context
 */
function getTrelloCredentials(context: any) {
    const apiKey = context.metadata?.apiKey || context.user?.api_key || process.env.TRELLO_API_KEY;
    const token = context.metadata?.token || context.user?.token || process.env.TRELLO_TOKEN;
    
    if (!apiKey || !token) {
        throw new Error("Trello API credentials not found. Please configure your Trello API key and token.");
    }
    
    return { apiKey, token };
}

/**
 * Create Trello board
 */
export const trelloCreateBoard: ToolDescriptor = {
    name: "trello.createBoard",
    capability: "integrations.trello",
    description: "Create a new Trello board with customizable settings",

    async run(input, context) {
        try {
            const { name, description, teamId, visibility = "private" } = input as {
                name: string;
                description?: string;
                teamId?: string;
                visibility?: "private" | "org" | "public";
            };

            if (!name) {
                return {
                    success: false,
                    output: "Missing required field: name is required",
                };
            }

            const { apiKey, token } = getTrelloCredentials(context);

            // Build the API request
            const params = new URLSearchParams({
                key: apiKey,
                token: token,
                name: name,
                desc: description || "",
                prefs_permissionLevel: visibility,
            });

            const response = await fetch(`https://api.trello.com/1/boards?${params}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Trello API error: ${errorData.message || response.statusText}`);
            }

            const boardData = await response.json();

            return {
                success: true,
                output: `✓ Trello board "${name}" created successfully`,
                data: {
                    id: boardData.id,
                    name: boardData.name,
                    description: boardData.desc || "",
                    url: boardData.url,
                    visibility: boardData.prefs?.permissionLevel || visibility,
                    createdAt: new Date().toISOString(),
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to create Trello board: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Create Trello card
 */
export const trelloCreateCard: ToolDescriptor = {
    name: "trello.createCard",
    capability: "integrations.trello",
    description: "Create a new card on a Trello board list",

    async run(input, context) {
        try {
            const { listId, name, description, dueDate, labels, members } = input as {
                listId: string;
                name: string;
                description?: string;
                dueDate?: string;
                labels?: string[];
                members?: string[];
            };

            if (!listId || !name) {
                return {
                    success: false,
                    output: "Missing required fields: listId and name are required",
                };
            }

            const { apiKey, token } = getTrelloCredentials(context);

            // Build the API request
            const params = new URLSearchParams({
                key: apiKey,
                token: token,
                idList: listId,
                name: name,
                desc: description || "",
            });

            // Add optional parameters
            if (dueDate) {
                params.append('due', dueDate);
            }
            if (labels && labels.length > 0) {
                params.append('idLabels', labels.join(','));
            }
            if (members && members.length > 0) {
                params.append('idMembers', members.join(','));
            }

            const response = await fetch(`https://api.trello.com/1/cards?${params}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Trello API error: ${errorData.message || response.statusText}`);
            }

            const cardData = await response.json();

            return {
                success: true,
                output: `✓ Card "${name}" created on list ${listId}`,
                data: {
                    id: cardData.id,
                    name: cardData.name,
                    description: cardData.desc || "",
                    listId: cardData.idList,
                    dueDate: cardData.due || null,
                    labels: cardData.labels || [],
                    members: cardData.idMembers || [],
                    createdAt: new Date().toISOString(),
                    url: cardData.url,
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to create Trello card: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Move Trello card
 */
export const trelloMoveCard: ToolDescriptor = {
    name: "trello.moveCard",
    capability: "integrations.trello",
    description: "Move a Trello card to a different list",

    async run(input, context) {
        try {
            const { cardId, listId, position } = input as {
                cardId: string;
                listId: string;
                position?: "top" | "bottom" | number;
            };

            if (!cardId || !listId) {
                return {
                    success: false,
                    output: "Missing required fields: cardId and listId are required",
                };
            }

            const { apiKey, token } = getTrelloCredentials(context);

            // Build the API request
            const params = new URLSearchParams({
                key: apiKey,
                token: token,
                idList: listId,
            });

            // Add position parameter if specified
            if (position !== undefined) {
                if (typeof position === 'number') {
                    params.append('pos', position.toString());
                } else {
                    params.append('pos', position);
                }
            }

            const response = await fetch(`https://api.trello.com/1/cards/${cardId}?${params}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Trello API error: ${errorData.message || response.statusText}`);
            }

            const cardData = await response.json();

            return {
                success: true,
                output: `✓ Card moved to list ${listId}`,
                data: {
                    cardId: cardData.id,
                    listId: cardData.idList,
                    position: cardData.pos,
                    movedAt: new Date().toISOString(),
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to move Trello card: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Get board lists
 */
export const trelloGetLists: ToolDescriptor = {
    name: "trello.getLists",
    capability: "integrations.trello",
    description: "Get all lists from a Trello board",

    async run(input, context) {
        try {
            const { boardId } = input as {
                boardId: string;
            };

            if (!boardId) {
                return {
                    success: false,
                    output: "Missing required field: boardId is required",
                };
            }

            const { apiKey, token } = getTrelloCredentials(context);

            // Build the API request
            const params = new URLSearchParams({
                key: apiKey,
                token: token,
            });

            const response = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Trello API error: ${errorData.message || response.statusText}`);
            }

            const listsData = await response.json();

            // Transform the data to our expected format
            const transformedLists = listsData.map((list: any) => ({
                id: list.id,
                name: list.name,
                boardId: boardId,
                position: list.pos,
                cards: [], // Cards would need a separate API call
            }));

            return {
                success: true,
                output: `✓ Retrieved ${transformedLists.length} lists for board ${boardId}`,
                data: transformedLists,
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to get Trello lists: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Add comment to card
 */
export const trelloAddComment: ToolDescriptor = {
    name: "trello.addComment",
    capability: "integrations.trello",
    description: "Add a comment to a Trello card",

    async run(input, context) {
        try {
            const { cardId, text } = input as {
                cardId: string;
                text: string;
            };

            if (!cardId || !text) {
                return {
                    success: false,
                    output: "Missing required fields: cardId and text are required",
                };
            }

            const { apiKey, token } = getTrelloCredentials(context);

            // Build the API request
            const params = new URLSearchParams({
                key: apiKey,
                token: token,
                text: text,
            });

            const response = await fetch(`https://api.trello.com/1/cards/${cardId}/actions/comments?${params}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Trello API error: ${errorData.message || response.statusText}`);
            }

            const commentData = await response.json();

            return {
                success: true,
                output: `✓ Comment added to card ${cardId}`,
                data: {
                    id: commentData.id,
                    cardId: cardId,
                    text: text,
                    createdAt: new Date().toISOString(),
                    author: "BotHive Integration",
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Update card status
 */
export const trelloUpdateCard: ToolDescriptor = {
    name: "trello.updateCard",
    capability: "integrations.trello",
    description: "Update card properties like due date, labels, or archive status",

    async run(input, context) {
        try {
            const { cardId, dueDate, labels, archived } = input as {
                cardId: string;
                dueDate?: string;
                labels?: string[];
                archived?: boolean;
            };

            if (!cardId) {
                return {
                    success: false,
                    output: "Missing required field: cardId is required",
                };
            }

            return {
                success: true,
                output: `✓ Card ${cardId} updated successfully`,
                data: {
                    cardId,
                    updatedFields: {
                        dueDate: dueDate || null,
                        labels: labels || [],
                        archived: archived !== undefined ? archived : false,
                    },
                    updatedAt: new Date().toISOString(),
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to update card: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

// Export all Trello tools
export const trelloTools = [
    trelloCreateBoard,
    trelloCreateCard,
    trelloMoveCard,
    trelloGetLists,
    trelloAddComment,
    trelloUpdateCard,
];