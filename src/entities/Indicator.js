import { Sprite } from 'pixi.js';
import { CONFIG } from '../config';

export class Indicator extends Sprite {
    constructor(texture, x, duration) {
        super(texture);
        this.anchor.set(0.5, 0); // Anchor top center
        this.x = x;
        this.y = 10; // Slightly below top edge
        this.life = duration;
        this.maxLife = duration;
        this.active = true;
        this.alpha = 0;
    }

    update(dt) {
        if (!this.active) return;

        this.life -= dt;

        // Blink effect
        const progress = 1 - (this.life / this.maxLife);
        // Blink speed increases as time runs out
        const blinkSpeed = 10 + (progress * 20);
        this.alpha = 0.5 + Math.sin(this.life * blinkSpeed) * 0.5;

        if (this.life <= 0) {
            this.active = false;
        }
    }
}
