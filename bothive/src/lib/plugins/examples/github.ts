/**
 * HiveTool Example: GitHub Integration ⚙️
 * Manage repos, issues, PRs, and automate workflows
 */

import { ToolDescriptor } from "@/lib/agentTypes";

/**
 * Create GitHub issue from bot
 */
export const githubCreateIssue: ToolDescriptor = {
    name: "github.createIssue",
    capability: "integrations.github",
    description: "Create GitHub issues automatically - perfect for bug tracking and feature requests",

    async run(input, context) {
        try {
            const { repo, title, body, labels } = input as {
                repo: string; // format: "owner/repo"
                title: string;
                body: string;
                labels?: string[];
            };

            if (!repo || !title || !body) {
                return {
                    success: false,
                    output: "Missing required fields: repo, title, and body",
                };
            }

            const mockIssue = {
                number: Math.floor(Math.random() * 1000) + 1,
                url: `https://github.com/${repo}/issues/123`,
                title,
                state: 'open',
                labels: labels || [],
                createdAt: new Date().toISOString(),
            };

            return {
                success: true,
                output: `✓ Created GitHub issue #${mockIssue.number} in ${repo}\n"${title}"`,
                data: mockIssue,
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to create GitHub issue: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Auto-merge pull requests that pass CI
 */
export const githubAutoMergePR: ToolDescriptor = {
    name: "github.autoMergePR",
    capability: "integrations.github",
    description: "Automatically merge PRs when CI passes and approvals are met",

    async run(input, context) {
        try {
            const { repo, prNumber, requireApprovals } = input as {
                repo: string;
                prNumber: number;
                requireApprovals?: number;
            };

            if (!repo || !prNumber) {
                return {
                    success: false,
                    output: "Missing required fields: repo and prNumber",
                };
            }

            const requiredApprovals = requireApprovals || 1;

            // Mock PR status check
            const mockStatus = {
                prNumber,
                ciPassed: true,
                approvals: 2,
                requiredApprovals,
                canMerge: true,
            };

            if (!mockStatus.ciPassed) {
                return {
                    success: false,
                    output: `Cannot merge: CI checks are failing for PR #${prNumber}`,
                };
            }

            if (mockStatus.approvals < requiredApprovals) {
                return {
                    success: false,
                    output: `Cannot merge: PR #${prNumber} needs ${requiredApprovals - mockStatus.approvals} more approval(s)`,
                };
            }

            return {
                success: true,
                output: `✓ Auto-merged PR #${prNumber} in ${repo}\nCI passed ✓ | Approvals: ${mockStatus.approvals}/${requiredApprovals} ✓`,
                data: {
                    merged: true,
                    mergedAt: new Date().toISOString(),
                    ...mockStatus,
                },
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to auto-merge PR: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};

/**
 * Get repository stats and insights
 */
export const githubGetRepoStats: ToolDescriptor = {
    name: "github.getRepoStats",
    capability: "integrations.github",
    description: "Track repository metrics: stars, forks, issues, commits, and contributor activity",

    async run(input, context) {
        try {
            const { repo } = input as {
                repo: string;
            };

            if (!repo) {
                return {
                    success: false,
                    output: "Missing required field: repo",
                };
            }

            const mockStats = {
                stars: 1234,
                forks: 156,
                watchers: 89,
                openIssues: 23,
                openPRs: 7,
                contributors: 45,
                commits: 2341,
                languages: {
                    TypeScript: 65,
                    JavaScript: 25,
                    CSS: 8,
                    Other: 2,
                },
                recentActivity: {
                    commitsLastWeek: 34,
                    prsLastWeek: 5,
                    issuesLastWeek: 8,
                },
            };

            return {
                success: true,
                output: `✓ ${repo} Stats:\n` +
                    `⭐ ${mockStats.stars} stars | 🍴 ${mockStats.forks} forks\n` +
                    `📝 ${mockStats.openIssues} open issues | 🔀 ${mockStats.openPRs} open PRs\n` +
                    `👥 ${mockStats.contributors} contributors | 📊 ${mockStats.commits} commits`,
                data: mockStats,
            };
        } catch (error) {
            return {
                success: false,
                output: `Failed to fetch GitHub repo stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    },
};
