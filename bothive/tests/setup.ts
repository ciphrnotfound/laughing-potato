import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            rpc: vi.fn().mockReturnThis(),
        })),
    },
}))

// Mock Kinde Auth
vi.mock('@kinde-oss/kinde-auth-nextjs/server', () => ({
    getKindeServerSession: vi.fn(() => ({
        getUser: vi.fn().mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }),
        isAuthenticated: vi.fn().mockResolvedValue(true),
    })),
}))
