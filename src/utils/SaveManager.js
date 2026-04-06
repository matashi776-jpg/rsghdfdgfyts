/**
 * SaveManager.js
 * Persistent save / load via localStorage — Оборона Ланчина V4.0
 */
export default class SaveManager {
    static load() {
        try {
            const data = localStorage.getItem('acidKhutirSave');
            return data ? JSON.parse(data) : SaveManager.defaultSave();
        } catch (_) {
            return SaveManager.defaultSave();
        }
    }

    static save(data) {
        try {
            localStorage.setItem('acidKhutirSave', JSON.stringify(data));
        } catch (_) { /* ignore quota errors */ }
    }

    static defaultSave() {
        return {
            meta: {
                houseLevel: 1,
                weaponLevel: 1,
                permanentPerks: [],
            },
            stats: {
                bestWave:   0,
                totalGold:  0,
                runs:       0,
            },
        };
    }
}
