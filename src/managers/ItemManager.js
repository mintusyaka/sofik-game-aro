import { Container } from 'pixi.js';
import { FallingItem } from '../entities/FallingItem';
import { Indicator } from '../entities/Indicator';
import { CONFIG } from '../config';

export class ItemManager {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.indicators = [];
        this.items = [];
        this.indicators = [];

        // Items: zIndex 10 (Behind foliage)
        this.itemContainer = new Container();
        this.itemContainer.zIndex = 10;
        this.game.container.addChild(this.itemContainer);

        // Indicators: zIndex 30 (Above foliage)
        this.indicatorContainer = new Container();
        this.indicatorContainer.zIndex = 30;
        this.game.container.addChild(this.indicatorContainer);

        // this.container = new Container(); // Deprecated unified container
        // this.game.container.addChild(this.container);

        this.spawnTimer = 0;
        this.currentSpawnInterval = CONFIG.SPAWN_INTERVAL_BASE;
        this.currentFallSpeed = CONFIG.ITEM_FALL_SPEED_BASE;

        this.difficultyTimer = 0;

        // Queue for spawning items after indicator finishes
        this.spawnQueue = [];
    }

    update(dt) {
        // 1. Difficulty Ramp (every 30s)
        this.difficultyTimer += dt;
        if (this.difficultyTimer > 30) {
            this.difficultyTimer = 0;
            this.currentSpawnInterval = Math.max(0.4, this.currentSpawnInterval * 0.9);
            this.currentFallSpeed = Math.min(1000, this.currentFallSpeed * 1.1);
            console.log('Difficulty Up!', this.currentSpawnInterval, this.currentFallSpeed);
        }

        // 2. Spawn Logic
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnIndicator();
            this.spawnTimer = this.currentSpawnInterval;
        }

        // 3. Process Spawn Queue (Convert finished indicators to items)
        for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
            const task = this.spawnQueue[i];
            task.time -= dt;
            if (task.time <= 0) {
                this.spawnItem(task.x, task.type);
                this.spawnQueue.splice(i, 1);
            }
        }

        // 4. Update Indicators
        for (let i = this.indicators.length - 1; i >= 0; i--) {
            const ind = this.indicators[i];
            ind.update(dt);
            if (!ind.active) {
                this.indicatorContainer.removeChild(ind);
                this.indicators.splice(i, 1);
            }
        }

        // 5. Update Items & Collision
        const aro = this.game.aro; // Access Aro from game instance
        const aroHitBox = { x: aro.x, y: aro.y - aro.height / 2, width: aro.width * 0.6, height: aro.height * 0.6 };

        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update(dt);

            // Collision Check (Simple AABB / Circleish)
            if (item.active && this.checkCollision(item, aroHitBox)) {
                this.handleCollection(item);
                item.active = false;
            }

            if (!item.active) {
                this.itemContainer.removeChild(item);
                this.items.splice(i, 1);
            }
        }
    }

    spawnIndicator() {
        // Pick random x
        const margin = 100;
        const x = margin + Math.random() * (CONFIG.GAME_WIDTH - margin * 2);

        // Weighted spawn logic
        let type;
        const roll = Math.random();

        // 10% chance for Rare item (if exists)
        const rareItems = CONFIG.ITEM_TYPES.filter(t => t.isRare);
        if (roll < 0.1 && rareItems.length > 0) {
            type = rareItems[Math.floor(Math.random() * rareItems.length)];
        } else {
            // 90% chance for Standard item
            const standardItems = CONFIG.ITEM_TYPES.filter(t => !t.isRare);
            type = standardItems[Math.floor(Math.random() * standardItems.length)];
        }

        // Determine indicator type
        const indicatorTexture = type.isRare ? this.game.assets['indicator_rare'] : this.game.assets['indicator'];

        // Create visible indicator
        const indicator = new Indicator(indicatorTexture, x, CONFIG.INDICATOR_DURATION);
        this.indicatorContainer.addChild(indicator);
        this.indicators.push(indicator);

        // Queue the actual item spawn
        this.spawnQueue.push({
            time: CONFIG.INDICATOR_DURATION,
            x: x,
            type: type
        });
    }

    spawnItem(x, type) {
        const item = new FallingItem(this.game.assets[type.name], type, x, this.currentFallSpeed);
        this.itemContainer.addChild(item);
        this.items.push(item);
    }

    checkCollision(item, aroBox) {
        // Simple box collision
        // item anchor is 0.5, so x is center. y is center? falling item anchor is 0.5.
        // item hit box
        const radius = item.width / 2;
        const dx = Math.abs(item.x - aroBox.x);
        const dy = Math.abs(item.y - aroBox.y);

        if (dx < (radius + aroBox.width / 2) && dy < (radius + aroBox.height / 2)) {
            return true;
        }
        return false;
    }

    handleCollection(item) {
        // Check for Superpower (Guava)
        if (item.type.name === 'guava') {
            this.game.activateSuperpower();
        }

        if (item.type.isRare) {
            this.game.addScore(CONFIG.SCORE.GUAVA);
        } else if (item.type.isFruit) {
            this.game.addScore(CONFIG.SCORE.FRUIT);
        } else {
            this.game.addScore(CONFIG.SCORE.BAD_ITEM);
        }
    }
}
