/**
 * Shared Memory for bot execution
 * Allows tools to communicate and share data during bot runs
 */

export interface SharedMemory {
    data: Record<string, any>;
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    keys(): string[];
    values(): any[];
    entries(): [string, any][];
    append(key: string, value: any): Promise<void>;
}

/**
 * Create a new shared memory instance
 */
export function createSharedMemory(namespace: string = 'default'): SharedMemory {
    const data: Record<string, any> = {};

    return {
        data,
        async set(key: string, value: any) {
            data[key] = value;
        },
        async get(key: string) {
            return data[key];
        },
        has(key: string) {
            return key in data;
        },
        delete(key: string) {
            const existed = key in data;
            delete data[key];
            return existed;
        },
        clear() {
            Object.keys(data).forEach(key => delete data[key]);
        },
        keys() {
            return Object.keys(data);
        },
        values() {
            return Object.values(data);
        },
        entries() {
            return Object.entries(data);
        },
        async append(key: string, value: any) {
            if (!Array.isArray(data[key])) {
                data[key] = [];
            }
            data[key].push(value);
        },
    };
}
