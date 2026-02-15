import { Sprite } from 'pixi.js';
import { CONFIG } from '../config';

export class Aro extends Sprite {
    constructor(texture) {
        super(texture);
        this.anchor.set(0.5, 1); // Anchor at bottom center

        // Resize to target width while maintaining aspect ratio
        const targetWidth = 180;
        const scale = targetWidth / this.texture.width;
        this.scale.set(scale);

        this.x = CONFIG.GAME_WIDTH / 2;
        this.y = CONFIG.GAME_HEIGHT - 40; // Stand ON TOP of the 40px ground
        this.zIndex = 10; // In front of ground (4) and items (default? need check)
        this.speed = CONFIG.ARO_SPEED;
    }

    update(dt, direction) {
        if (direction === 0) return;

        this.x += direction * this.speed * dt;

        // Clamp to screen bounds
        const halfWidth = this.width / 2;
        if (this.x < halfWidth) {
            this.x = halfWidth;
        } else if (this.x > CONFIG.GAME_WIDTH - halfWidth) {
            this.x = CONFIG.GAME_WIDTH - halfWidth;
        }

        // Handle Teleport Effect
        // Removed teleport effect logic
    }

    setSuperSpeed(active) {
        this.isSuperSpeed = active;
        if (active) {
            this.speed = CONFIG.ARO_SPEED * 2.5; // 2.5x Speed
            this.tint = 0xFFFF00; // Gold tint
        } else {
            this.speed = CONFIG.ARO_SPEED;
            this.tint = 0xFFFFFF; // Reset tint
        }
    }

    createTrail() {
        // Create a ghost sprite
        const ghost = new Sprite(this.texture);
        ghost.anchor.copyFrom(this.anchor);
        ghost.x = this.x;
        ghost.y = this.y;
        ghost.scale.copyFrom(this.scale);
        ghost.alpha = 0.5;
        ghost.tint = 0xFFFF00; // Gold trail
        ghost.zIndex = this.zIndex - 1; // Behind Aro

        this.parent.addChild(ghost);

        // Simple fade out animation
        // We need to manage these ghosts or use a particle container.
        // For simplicity, let's just add a ticker or use a timeout (not ideal for frame-perfect, but okay for prototype)
        // Better: store in a list in Game or let ghost fade itself?
        // Since Aro doesn't have a ticker reference, we'll hack it slightly:

        let fadeTicker = (ticker) => {
            ghost.alpha -= 0.05;
            if (ghost.alpha <= 0) {
                ghost.destroy();
                // We need to remove this listener.
                // But we don't have easy access to the app ticker here without passing it down.
                // Alternative: Game.js handles trails? Or Aro.update handles them?
            }
        };

        // Actually, let's just rely on Game.js updating?
        // OR: use a simple fading property on the sprite and have Game.js running a "cleanup" loop?
        // EASIEST: Just let Game.js update a `trails` array.
        // BUT: I'll use a GSAP-like approach or just a simple requestAnimationFrame loop?
        // No, keep it sync with game loop.

        // Let's attach the update function to the ghost and call it from Game.js?
        // Or simpler: add ghost to a `trailContainer` in Game.js. 

        // REVISION: I'll just change visual effect in Game.js to avoid complex dependencies here.
        // I will revert `createTrail` here and do it in Game.js or just leave `setSuperSpeed`.

        // Wait, I can't easily revert mid-edit.
        // Let's implement `createTrail` to return the ghost, and Game.js adds it to a list.
        return ghost;
    }
}
