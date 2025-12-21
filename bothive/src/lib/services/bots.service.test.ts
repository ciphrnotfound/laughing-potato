import { describe, it, expect, vi } from 'vitest'
import { createBot, getUserBots } from '@/lib/services/bots.service'
import { supabase } from '@/lib/supabase'

describe('Bots Service', () => {
    it('should fetch user bots', async () => {
        const mockBots = [{ id: '1', name: 'Bot 1' }, { id: '2', name: 'Bot 2' }]

        // Setup mock response
        const mockSelect = vi.fn().mockResolvedValue({ data: mockBots, error: null })
        const mockEq = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue({ then: (cb: any) => cb({ data: mockBots, error: null }) }) })

        vi.mocked(supabase.from).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockImplementation(() => Promise.resolve({ data: mockBots, error: null }))
        } as any)

        const bots = await getUserBots('user-123')

        expect(bots).toHaveLength(2)
        expect(bots[0].name).toBe('Bot 1')
    })

    it('should create a new bot', async () => {
        const mockBot = { id: 'new-id', name: 'New Bot', slug: 'new-bot' }

        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => Promise.resolve({ data: mockBot, error: null }))
        } as any)

        const bot = await createBot('user-123', { name: 'New Bot' })

        expect(bot.name).toBe('New Bot')
        expect(bot.slug).toBe('new-bot')
    })
})
