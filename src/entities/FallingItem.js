import { Sprite } from 'pixi.js';
import { CONFIG } from '../config';

export class FallingItem extends Sprite {
    constructor(texture, type, x, speed) {
        super(texture);
        this.anchor.set(0.5);

        // Resize to target width while maintaining aspect ratio
        const targetWidth = 50;
        // Check if texture is valid to avoid division by zero or errors
        if (this.texture) {
            const scale = targetWidth / this.texture.width;
            this.scale.set(scale);
        }

        this.x = x;
        this.y = -50; // Start just above screen
        this.type = type; // { name, isFruit, color }

        // Bad items fall faster!
        this.fallSpeed = type.isFruit ? speed : speed * 1.5;

        this.active = true;
    }

    update(dt) {
        if (!this.active) return;

        this.y += this.fallSpeed * dt;

        // Check if off screen
        if (this.y > CONFIG.GAME_HEIGHT + 50) {
            this.active = false;
        }
    }
}
