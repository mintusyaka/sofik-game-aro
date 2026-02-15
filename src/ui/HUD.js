import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { CONFIG } from '../config';

export class HUD {
    constructor(game) {
        this.game = game;
        this.container = new Container();
        this.container = new Container();
        // Add to UI container to ensure it's above game elements
        if (this.game.uiContainer) {
            this.game.uiContainer.addChild(this.container);
        } else {
            this.game.container.addChild(this.container);
        }

        this.score = 0;
        this.scoreText = null;

        this.init();
    }

    init() {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: CONFIG.COLORS.TEXT,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });

        this.scoreText = new Text({ text: 'Score: 0', style });
        this.scoreText.x = 20;
        this.scoreText.y = 20;

        this.container.addChild(this.scoreText);
    }

    updateScore(newScore) {
        this.score = newScore;
        this.scoreText.text = `Score: ${this.score}`;
    }

    showSuperpower(active) {
        if (!this.superpowerContainer) {
            this.createSuperpowerUI();
        }
        this.superpowerContainer.visible = active;
        if (active) {
            this.updateSuperpower(5.0);
        }
    }

    createSuperpowerUI() {
        this.superpowerContainer = new Container();
        this.container.addChild(this.superpowerContainer);
        this.superpowerContainer.visible = false;

        const centerX = CONFIG.GAME_WIDTH / 2;
        const topY = 80;

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fill: '#FFD700', // Gold
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
        });
        const title = new Text({ text: "СУПЕР ШВИДКІСТЬ", style: titleStyle });
        title.anchor.set(0.5, 0.5);
        title.x = centerX;
        title.y = topY;
        this.superpowerContainer.addChild(title);

        // Bar Background
        this.barBg = new Graphics();
        this.barBg.rect(0, 0, 300, 20);
        this.barBg.fill({ color: 0x000000, alpha: 0.5 });
        this.barBg.x = centerX - 150;
        this.barBg.y = topY + 20;
        this.superpowerContainer.addChild(this.barBg);

        // Bar Fill
        this.barFill = new Graphics();
        this.barFill.rect(0, 0, 300, 20);
        this.barFill.fill({ color: 0x00FF00 }); // Green
        this.barFill.x = centerX - 150;
        this.barFill.y = topY + 20;
        this.superpowerContainer.addChild(this.barFill);

        // Text Timer
        const timeStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#ffffff',
            fontWeight: 'bold',
        });
        this.timeText = new Text({ text: "5.0s left", style: timeStyle });
        this.timeText.anchor.set(0.5, 0);
        this.timeText.x = centerX;
        this.timeText.y = topY + 45;
        this.superpowerContainer.addChild(this.timeText);
    }

    updateSuperpower(timeLeft) {
        if (!this.superpowerContainer || !this.superpowerContainer.visible) return;

        // Update Text
        this.timeText.text = `${Math.max(0, timeLeft).toFixed(1)}s left`;

        // Update Bar
        const progress = Math.max(0, timeLeft / 5.0);
        this.barFill.scale.x = progress;

        // Change color based on time?
        if (progress < 0.3) {
            this.barFill.tint = 0xFF0000; // Red
        } else {
            this.barFill.tint = 0x00FF00; // Green
        }
    }
}
