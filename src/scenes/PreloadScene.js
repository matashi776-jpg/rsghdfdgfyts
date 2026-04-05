import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Loading bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x222222);
        barBg.fillRect(200, 280, 400, 20);

        // Loading bar fill
        const bar = this.add.graphics();

        this.load.on('progress', (value) => {
            bar.clear();
            bar.fillStyle(0x4ade80);
            bar.fillRect(200, 280, 400 * value, 20);
        });

        this.load.on('complete', () => {
            bar.destroy();
            barBg.destroy();
        });

        // Loading label
        this.add.text(400, 260, 'Loading...', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        // Generate procedural textures so the game works without external assets
        this._generateTextures();
    }

    _generateTextures() {
        // --- Background ---
        const bgGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Sky gradient approximation
        bgGfx.fillGradientStyle(0x1a1a4e, 0x1a1a4e, 0x2d2d6e, 0x2d2d6e, 1);
        bgGfx.fillRect(0, 0, 800, 300);
        // Ground
        bgGfx.fillStyle(0x4a7c59);
        bgGfx.fillRect(0, 300, 800, 300);
        // Ground highlight strip
        bgGfx.fillStyle(0x5a9c69);
        bgGfx.fillRect(0, 300, 800, 20);
        bgGfx.generateTexture('background', 800, 600);
        bgGfx.destroy();

        // --- Hero (player character) ---
        const heroGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Body
        heroGfx.fillStyle(0x3b82f6);
        heroGfx.fillRect(6, 12, 20, 24);
        // Head
        heroGfx.fillStyle(0xfbbf24);
        heroGfx.fillRect(8, 2, 16, 14);
        // Eyes
        heroGfx.fillStyle(0x1e3a5f);
        heroGfx.fillRect(10, 6, 4, 4);
        heroGfx.fillRect(18, 6, 4, 4);
        // Legs
        heroGfx.fillStyle(0x1d4ed8);
        heroGfx.fillRect(6, 36, 8, 12);
        heroGfx.fillRect(18, 36, 8, 12);
        // Arms
        heroGfx.fillStyle(0x2563eb);
        heroGfx.fillRect(0, 14, 6, 16);
        heroGfx.fillRect(26, 14, 6, 16);
        heroGfx.generateTexture('hero', 32, 48);
        heroGfx.destroy();

        // --- Enemy ---
        const enemyGfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Body
        enemyGfx.fillStyle(0xef4444);
        enemyGfx.fillRect(4, 16, 40, 32);
        // Head
        enemyGfx.fillStyle(0xdc2626);
        enemyGfx.fillRect(8, 0, 32, 20);
        // Eyes
        enemyGfx.fillStyle(0xfef08a);
        enemyGfx.fillRect(12, 6, 6, 6);
        enemyGfx.fillRect(30, 6, 6, 6);
        // Horns
        enemyGfx.fillStyle(0x7f1d1d);
        enemyGfx.fillRect(10, -8, 6, 12);
        enemyGfx.fillRect(32, -8, 6, 12);
        // Legs
        enemyGfx.fillStyle(0xb91c1c);
        enemyGfx.fillRect(8, 48, 10, 16);
        enemyGfx.fillRect(30, 48, 10, 16);
        enemyGfx.generateTexture('enemy', 48, 64);
        enemyGfx.destroy();

        // --- Projectile (magic bolt) ---
        const projGfx = this.make.graphics({ x: 0, y: 0, add: false });
        projGfx.fillStyle(0xfbbf24);
        projGfx.fillCircle(6, 6, 6);
        projGfx.fillStyle(0xfef08a);
        projGfx.fillCircle(6, 6, 3);
        projGfx.generateTexture('projectile', 12, 12);
        projGfx.destroy();

        // --- Enemy projectile ---
        const eProjGfx = this.make.graphics({ x: 0, y: 0, add: false });
        eProjGfx.fillStyle(0xef4444);
        eProjGfx.fillCircle(6, 6, 6);
        eProjGfx.fillStyle(0xfca5a5);
        eProjGfx.fillCircle(6, 6, 3);
        eProjGfx.generateTexture('enemy_projectile', 12, 12);
        eProjGfx.destroy();

        // --- Ground tile ---
        const tileGfx = this.make.graphics({ x: 0, y: 0, add: false });
        tileGfx.fillStyle(0x4a7c59);
        tileGfx.fillRect(0, 0, 32, 32);
        tileGfx.lineStyle(1, 0x3a6c49);
        tileGfx.strokeRect(0, 0, 32, 32);
        tileGfx.generateTexture('ground_tile', 32, 32);
        tileGfx.destroy();

        // --- Platform ---
        const platGfx = this.make.graphics({ x: 0, y: 0, add: false });
        platGfx.fillStyle(0x78716c);
        platGfx.fillRect(0, 0, 128, 24);
        platGfx.fillStyle(0xa8a29e);
        platGfx.fillRect(0, 0, 128, 6);
        platGfx.lineStyle(1, 0x57534e);
        platGfx.strokeRect(0, 0, 128, 24);
        platGfx.generateTexture('platform', 128, 24);
        platGfx.destroy();

        // --- UI panel ---
        const panelGfx = this.make.graphics({ x: 0, y: 0, add: false });
        panelGfx.fillStyle(0x0f172a, 0.85);
        panelGfx.fillRoundedRect(0, 0, 760, 100, 10);
        panelGfx.lineStyle(2, 0x334155);
        panelGfx.strokeRoundedRect(0, 0, 760, 100, 10);
        panelGfx.generateTexture('ui_panel', 760, 100);
        panelGfx.destroy();

        // --- HP bar fill ---
        const hpGfx = this.make.graphics({ x: 0, y: 0, add: false });
        hpGfx.fillStyle(0x22c55e);
        hpGfx.fillRect(0, 0, 200, 16);
        hpGfx.generateTexture('hp_fill', 200, 16);
        hpGfx.destroy();

        // --- HP bar background ---
        const hpBgGfx = this.make.graphics({ x: 0, y: 0, add: false });
        hpBgGfx.fillStyle(0x374151);
        hpBgGfx.fillRect(0, 0, 200, 16);
        hpBgGfx.lineStyle(1, 0x6b7280);
        hpBgGfx.strokeRect(0, 0, 200, 16);
        hpBgGfx.generateTexture('hp_bg', 200, 16);
        hpBgGfx.destroy();

        // --- Button ---
        const btnGfx = this.make.graphics({ x: 0, y: 0, add: false });
        btnGfx.fillStyle(0x1d4ed8);
        btnGfx.fillRoundedRect(0, 0, 160, 44, 8);
        btnGfx.fillStyle(0x3b82f6);
        btnGfx.fillRoundedRect(0, 0, 160, 22, { tl: 8, tr: 8, bl: 0, br: 0 });
        btnGfx.lineStyle(2, 0x60a5fa);
        btnGfx.strokeRoundedRect(0, 0, 160, 44, 8);
        btnGfx.generateTexture('btn', 160, 44);
        btnGfx.destroy();

        // --- Button hover ---
        const btnHoverGfx = this.make.graphics({ x: 0, y: 0, add: false });
        btnHoverGfx.fillStyle(0x2563eb);
        btnHoverGfx.fillRoundedRect(0, 0, 160, 44, 8);
        btnHoverGfx.fillStyle(0x60a5fa);
        btnHoverGfx.fillRoundedRect(0, 0, 160, 22, { tl: 8, tr: 8, bl: 0, br: 0 });
        btnHoverGfx.lineStyle(2, 0x93c5fd);
        btnHoverGfx.strokeRoundedRect(0, 0, 160, 44, 8);
        btnHoverGfx.generateTexture('btn_hover', 160, 44);
        btnHoverGfx.destroy();

        // --- Particle spark ---
        const sparkGfx = this.make.graphics({ x: 0, y: 0, add: false });
        sparkGfx.fillStyle(0xfbbf24);
        sparkGfx.fillRect(0, 0, 4, 4);
        sparkGfx.generateTexture('spark', 4, 4);
        sparkGfx.destroy();

        // --- Hit flash overlay ---
        const hitGfx = this.make.graphics({ x: 0, y: 0, add: false });
        hitGfx.fillStyle(0xff0000, 0.4);
        hitGfx.fillRect(0, 0, 800, 600);
        hitGfx.generateTexture('hit_flash', 800, 600);
        hitGfx.destroy();
    }

    create() {
        this.scene.start('BattleScene');
    }
}
