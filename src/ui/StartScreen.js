import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { CONFIG } from '../config';

export class StartScreen extends Container {
    constructor(game) {
        super();
        this.game = game;
        this.init();
    }

    init() {
        // Background Overlay
        const bg = new Graphics();
        bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        bg.fill({ color: 0x000000, alpha: 0.7 });
        this.addChild(bg);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 80,
            fill: '#ffffff',
            itemFontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 6,
            align: 'center'
        });

        const title = new Text({ text: "Aro's Fruit Catch", style: titleStyle });
        title.anchor.set(0.5);
        title.x = CONFIG.GAME_WIDTH / 2;
        title.y = CONFIG.GAME_HEIGHT / 3;
        this.addChild(title);

        // Instructions
        const instructionsStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 40,
            fill: '#dddddd',
            align: 'center'
        });

        const isMobile = 'ontouchstart' in window;
        const instructionText = isMobile
            ? "Tilt phone to move\nTap to Start"
            : "Use Left/Right Arrows to move\nPress Enter or Click to Start";

        const instructions = new Text({ text: instructionText, style: instructionsStyle });
        instructions.anchor.set(0.5);
        instructions.x = CONFIG.GAME_WIDTH / 2;
        instructions.y = CONFIG.GAME_HEIGHT / 2 + 50;
        this.addChild(instructions);

        // Interaction to start
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', async () => {
            // Request permission for mobile sensors
            if (this.game.inputManager) {
                await this.game.inputManager.requestPermission();
            }
            this.game.startGame();
        });

        // Keyboard listener for Enter
        window.addEventListener('keydown', (e) => {
            if (this.game.state === 'MENU' && e.code === 'Enter') {
                this.game.startGame();
            }
        });
    }
}
