import { Graphics, Assets } from 'pixi.js';
import { CONFIG } from './config';

export class AssetLoader {
    constructor() {
        this.textures = {};
    }

    async load(app) {
        try {
            // Define assets to load
            const assetsToLoad = [
                { alias: 'aro', src: 'assets/aro.png' }
                // { alias: 'foliage', src: 'assets/foliage_top.png' } // Disabled for procedural generation
            ];

            // Add item textures
            CONFIG.ITEM_TYPES.forEach(item => {
                assetsToLoad.push({ alias: item.texture, src: `assets/${item.texture}.png` });
            });

            // Load assets
            // We use a try-catch block for loading specifically to handle missing files gracefully
            // PixiJS v8 Assets.load might throw if files are missing.
            // However, checking existence first is hard in client-side JS without a server endpoint.
            // So we'll try to load, and if it fails, we fall back to placeholders for everything?
            // Or we can try to load them one by one/bundles?

            // Let's try loading them. If it fails, we assume visuals are missing and use placeholders.
            // In a real production app, we'd have a manifest.

            try {
                // Pre-load all
                const loaded = await Promise.all(assetsToLoad.map(async (asset) => {
                    try {
                        console.log(`Attempting to load: ${asset.src}`);
                        const texture = await Assets.load(asset.src);
                        this.textures[asset.alias] = texture;
                        console.log(`Successfully loaded: ${asset.alias}`);
                        return true;
                    } catch (e) {
                        console.warn(`Failed to load ${asset.src}, using placeholder. Error:`, e);
                        return false;
                    }
                }));
            } catch (e) {
                console.warn("Asset loading incomplete", e);
            }

            // Generate placeholders for anything missing
            this.generatePlaceholders(app);

            return this.textures;
        } catch (error) {
            console.error("Error loading assets:", error);
            // Fallback to purely generated
            this.generatePlaceholders(app);
            return this.textures;
        }
    }

    generatePlaceholders(app) {
        const graphics = new Graphics();

        // Helper to generate texture safely
        const generate = (g, options) => {
            if (app.renderer.generateTexture) {
                return app.renderer.generateTexture(g, options);
            } else if (app.renderer.textureGenerator && app.renderer.textureGenerator.generateTexture) {
                return app.renderer.textureGenerator.generateTexture(g, options);
            } else {
                return null;
            }
        };

        // 1. Aro (Player)
        if (!this.textures['aro']) {
            const aroSize = 80;
            graphics.clear();
            graphics.rect(0, 0, aroSize, aroSize);
            graphics.fill(CONFIG.COLORS.ARO);
            this.textures['aro'] = generate(graphics);
        }

        // 2. Items
        CONFIG.ITEM_TYPES.forEach(item => {
            if (!this.textures[item.texture]) {
                graphics.clear();
                if (item.isFruit) {
                    graphics.circle(40, 40, 40);
                } else {
                    graphics.poly([40, 0, 80, 40, 40, 80, 0, 40]);
                }
                graphics.fill(item.color);

                // For rare items, add a border
                if (item.isRare) {
                    graphics.stroke({ width: 4, color: 0xffffff });
                }

                this.textures[item.name] = generate(graphics, {
                    region: { x: 0, y: 0, width: 80, height: 80 }
                });
                // Also map by texture name if different (though config uses same for texture property usually)
                if (item.texture && !this.textures[item.texture]) {
                    this.textures[item.texture] = this.textures[item.name];
                }
            } else {
                // Ensure name mapping exists if texture was loaded by alias
                if (item.texture && this.textures[item.texture] && !this.textures[item.name]) {
                    this.textures[item.name] = this.textures[item.texture];
                }
            }
        });

        // Foliage Placeholder (Procedural Leaf Texture)
        if (!this.textures['foliage']) {
            graphics.clear();

            const drawLeaves = (count, colorPalette, heightLimit) => {
                for (let i = 0; i < count; i++) {
                    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

                    // Position: Exact width (0 to WIDTH)
                    const x = Math.random() * CONFIG.GAME_WIDTH;

                    // Height: Concentrate at top (0), spread down to heightLimit
                    const yBias = Math.pow(Math.random(), 2);
                    const y = yBias * heightLimit - 20;

                    const size = 15 + Math.random() * 25;
                    const angle = Math.random() * Math.PI * 2;

                    const w = size;
                    const h = size * 0.4;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);

                    const points = [];
                    for (let k = 0; k < 8; k++) {
                        const t = (k / 8) * Math.PI * 2;
                        const px = w * Math.cos(t);
                        const py = h * Math.sin(t);
                        const rpx = px * cos - py * sin;
                        const rpy = px * sin + py * cos;
                        points.push(x + rpx, y + rpy);
                    }
                    graphics.poly(points);
                    graphics.fill({ color: color, alpha: 0.95 });
                }
            };

            // 1. Front Foliage (Brighter)
            graphics.clear();

            // Base layer to prevent gaps at top
            graphics.rect(0, 0, CONFIG.GAME_WIDTH, 40);
            graphics.fill({ color: 0x1e8449, alpha: 1 });

            drawLeaves(900, [0x2ecc71, 0x27ae60, 0x229954, 0x1e8449], 130);

            this.textures['foliage'] = generate(graphics, {
                region: { x: 0, y: 0, width: CONFIG.GAME_WIDTH, height: 150 }
            });

            // 2. Back Foliage (Darker)
            graphics.clear();
            // Base layer 
            graphics.rect(0, 0, CONFIG.GAME_WIDTH, 50);
            graphics.fill({ color: 0x145a32, alpha: 1 });

            drawLeaves(600, [0x145a32, 0x196f3d, 0x117864], 110);

            this.textures['foliage_back'] = generate(graphics, {
                region: { x: 0, y: 0, width: CONFIG.GAME_WIDTH, height: 150 }
            });
        }


        // 3. Indicator (Generic Warning)
        // Yellow-Orange circle outline to be neutral
        graphics.clear();
        graphics.circle(30, 30, 25);
        graphics.stroke({ width: 4, color: 0xffaa00 }); // Orange-ish

        // Actually, let's just keep it a simple circle but neutral color
        this.textures['indicator'] = generate(graphics, {
            region: { x: 0, y: 0, width: 60, height: 60 }
        });

        // 4. Indicator (Rare - Gold Star)
        graphics.clear();
        graphics.star(30, 30, 5, 25, 10);
        graphics.stroke({ width: 4, color: CONFIG.COLORS.INDICATOR_RARE });

        this.textures['indicator_rare'] = generate(graphics, {
            region: { x: 0, y: 0, width: 60, height: 60 }
        });
    }
}
