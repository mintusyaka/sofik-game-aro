import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { CONFIG } from '../config';

export class GameOverScreen extends Container {
    constructor(game, message = "GAME OVER", isWin = false) {
        super();
        this.game = game;
        this.message = message;
        this.isWin = isWin;
        this.init();
    }

    init() {
        // Background Overlay
        const bg = new Graphics();
        bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        bg.fill({ color: 0x000000, alpha: 0.8 });
        this.addChild(bg);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: this.isWin ? 60 : 80, // Smaller font for longer win message
            fill: this.isWin ? '#2ecc71' : '#e74c3c', // Green for win
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 6,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: CONFIG.GAME_WIDTH - 100
        });

        const title = new Text({ text: this.message, style: titleStyle });
        title.anchor.set(0.5);
        title.x = CONFIG.GAME_WIDTH / 2;
        title.y = CONFIG.GAME_HEIGHT / 3;
        this.addChild(title);

        // Score
        const scoreStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 60,
            fill: '#ffffff',
            align: 'center'
        });

        const scoreMsg = new Text({ text: `Final Score: ${this.game.score}`, style: scoreStyle });
        scoreMsg.anchor.set(0.5);
        scoreMsg.x = CONFIG.GAME_WIDTH / 2;
        scoreMsg.y = CONFIG.GAME_HEIGHT / 2;
        this.addChild(scoreMsg);

        // Instructions
        const instructionsStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 40,
            fill: '#dddddd',
            align: 'center'
        });

        const instructions = new Text({ text: "Tap or Press Enter to Play Again", style: instructionsStyle });
        instructions.anchor.set(0.5);
        instructions.x = CONFIG.GAME_WIDTH / 2;
        instructions.y = CONFIG.GAME_HEIGHT / 2 + 100;
        this.addChild(instructions);

        // Interaction to restart
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', () => this.game.resetGame());

        // Keyboard listener for Enter
        const keyHandler = (e) => {
            if (this.game.state === 'GAME_OVER' && e.code === 'Enter') {
                window.removeEventListener('keydown', keyHandler); // Clean up
                this.game.resetGame();
            }
        };
        window.addEventListener('keydown', keyHandler);
    }
}
