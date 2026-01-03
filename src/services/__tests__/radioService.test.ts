import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchStations, getTopStations } from '../radioService';

describe('radioService', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    it('searchStations should return formatted stations on success', async () => {
        const mockStations = [
            { stationuuid: '1', name: 'Radio 1', url: 'http://url1', favicon: 'http://fav1' },
            { stationuuid: '2', name: 'Radio 2', url: 'http://url2', favicon: '' }
        ];

        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockStations),
        });

        const results = await searchStations({ name: 'test' });

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('name=test'));
        expect(results).toHaveLength(2);
        expect(results[0].name).toBe('Radio 1');
        expect(results[1].favicon).toBeNull(); // El servicio convierte strings vacíos a null
    });

    it('searchStations should throw an error when API returns not ok', async () => {
        (fetch as any).mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.resolve({ message: 'Server exploded' }),
        });

        await expect(searchStations({})).rejects.toThrow('Server exploded');
    });

    it('searchStations should throw error on invalid format', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ notAnArray: true }),
        });

        await expect(searchStations({})).rejects.toThrow('Invalid response format');
    });

    it('getTopStations should call searchStations with limit 50', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        });

        await getTopStations();
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('limit=50'));
    });
});
