import { Application, Container, Sprite, Graphics } from 'pixi.js';
import { CONFIG } from './config';
import { AssetLoader } from './AssetLoader';
import { InputManager } from './managers/InputManager';
import { ItemManager } from './managers/ItemManager';
import { Aro } from './entities/Aro';

import { HUD } from './ui/HUD';
import { StartScreen } from './ui/StartScreen';
import { GameOverScreen } from './ui/GameOverScreen';

export class Game {
    constructor() {
        this.app = null;
        this.container = null; // Main game container
        this.uiContainer = null; // UI container on top
        this.assets = {};
        this.state = 'INIT'; // INIT, MENU, PLAYING, GAME_OVER

        this.inputManager = null;
        this.itemManager = null;
        this.aro = null;
        this.hud = null;

        this.score = 0;
        this.trails = [];
    }

    async init() {
        this.app = new Application();

        // Initialize the application
        await this.app.init({
            background: '#000000', // Black background for letterboxing
            resizeTo: window,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // Append canvas to DOM
        document.getElementById('app').appendChild(this.app.canvas);

        // Load assets
        const loader = new AssetLoader();
        this.assets = await loader.load(this.app);

        // Create main container for game world (scaled to fit)
        this.container = new Container();
        this.app.stage.addChild(this.container);





        // Sortable children to handle zIndex
        this.container.sortableChildren = true;

        // Create UI container (also scaled to fit, or overlay?)
        // If we want UI to be resolution independent, we might want it separate.
        // But for this game, let's keep it in the same logical space (1920x1080)
        // so it scales with the game.
        this.uiContainer = new Container();
        this.app.stage.addChild(this.uiContainer);

        // Initialize Managers
        this.inputManager = new InputManager();



        // Handle resizing
        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        // Start game loop
        this.app.ticker.add((ticker) => this.update(ticker));

        console.log('Game Initialized');
        this.showStartScreen();
    }

    showStartScreen() {
        this.state = 'MENU';
        this.uiContainer.removeChildren();
        this.container.removeChildren(); // Clean up any game stuff

        const startScreen = new StartScreen(this);
        this.uiContainer.addChild(startScreen);
    }

    startGame() {
        console.log('Starting Game...');
        this.state = 'PLAYING';
        this.score = 0;

        // Clear UI
        this.uiContainer.removeChildren();

        // Clear Game Container
        this.container.removeChildren();

        // 1. Add Game Background (Sky)
        const bg = new Graphics();
        bg.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        bg.fill(0x1099bb); // Sky color
        bg.zIndex = -10; // Lowest layer
        this.container.addChild(bg);

        // 2. Add Ground (Brown)
        const ground = new Graphics();
        ground.rect(0, CONFIG.GAME_HEIGHT - 40, CONFIG.GAME_WIDTH, 40);
        ground.fill(0x5d4037); // Brown color
        ground.zIndex = 4; // Behind foliage (5) but above bg
        this.container.addChild(ground);

        // 3. Add Game Border
        const border = new Graphics();
        border.rect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        border.stroke({ width: 4, color: 0xFFFFFF });
        border.zIndex = 1000; // Ensure on top
        this.container.addChild(border);

        // Create Entities

        // Add Foliage (Foreground)
        // Add Foliage (Foreground)
        // Add Foliage (Foreground)
        if (this.assets['foliage']) {
            console.log("Adding foliage sprite to container (startGame)");

            // 1. Background Foliage (Darker, behind items)
            if (this.assets['foliage_back']) {
                const foliageBack = new Sprite(this.assets['foliage_back']);
                foliageBack.anchor.set(0, 0);
                foliageBack.y = -15; // Push up to hide top gap
                foliageBack.zIndex = 5; // Behind items (10)
                this.container.addChild(foliageBack);
            }

            // 2. Front Foliage (Brighter, in front of items)
            const foliage = new Sprite(this.assets['foliage']);
            foliage.anchor.set(0, 0);
            foliage.y = -15; // Push up to hide top gap
            // foliage.x/y default 0
            // Size handled by texture region usually, but we can enforce width
            foliage.width = CONFIG.GAME_WIDTH;
            foliage.height = 150; // Adjust size
            foliage.zIndex = 20; // Above background items (10), below indicators (30)
            this.container.addChild(foliage);
        }

        this.aro = new Aro(this.assets['aro']);
        this.container.addChild(this.aro);

        // ItemManager
        this.itemManager = new ItemManager(this);
        // ItemManager adds its container to this.container in its constructor

        // HUD
        this.hud = new HUD(this);
        // HUD adds itself to hud container? 
        // Wait, HUD currently adds to game.app.stage or game.container.
        // Let's modify HUD to add to uiContainer or we manage it here.
        // My previous HUD implementation added to game.container.
        // Let's stick with that for now, or move HUD to uiContainer.
        // Actually, let's look at HUD.js: it adds to this.game.container.
        // That's fine, it will be behind the uiContainer if we added uiContainer last.
        // But we want HUD to be visible.
        // We should probably explicitly add HUD to uiContainer.
        // But let's leave it as is for now, it should work.
    }

    gameOver() {
        this.state = 'GAME_OVER';
        console.log('Game Over');

        // Show Game Over Screen
        const gameOverScreen = new GameOverScreen(this);
        this.uiContainer.addChild(gameOverScreen);
    }

    resetGame() {
        this.showStartScreen();
    }

    update(ticker) {
        if (this.state !== 'PLAYING') return;

        const dt = ticker.deltaTime / 60; // Approximate seconds

        // Update Input
        const direction = this.inputManager.getDirection();

        // Update Entities
        if (this.aro) this.aro.update(dt, direction);
        if (this.itemManager) this.itemManager.update(dt);

        // Update Superpower
        if (this.superpowerActive) {
            this.superpowerTimer -= dt;
            if (this.hud) this.hud.updateSuperpower(this.superpowerTimer);

            // Create trail effect while moving fast
            if (Math.abs(direction) > 0 && this.aro) {
                const ghost = this.aro.createTrail();
                this.container.addChild(ghost);
                this.trails.push(ghost);
            }

            if (this.superpowerTimer <= 0) {
                this.superpowerActive = false;
                if (this.hud) this.hud.showSuperpower(false);
                if (this.aro) this.aro.setSuperSpeed(false);
            }
        }

        // Update Trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const ghost = this.trails[i];
            ghost.alpha -= 0.05 * dt * 60; // Approximate fade speed
            if (ghost.alpha <= 0) {
                ghost.destroy();
                this.trails.splice(i, 1);
            }
        }
    }

    activateSuperpower() {
        this.superpowerActive = true;
        this.superpowerTimer = 5.0;
        if (this.hud) this.hud.showSuperpower(true);
        if (this.aro) this.aro.setSuperSpeed(true);
        console.log("Superpower Activated!");
    }

    addScore(points) {
        this.score += points;
        if (this.hud) this.hud.updateScore(this.score);

        // Win Condition
        if (this.score >= 300 && this.state === 'PLAYING') {
            this.gameWon();
        }
    }

    gameWon() {
        this.state = 'GAME_OVER'; // Stops updates
        console.log("Game Won!");
        const message = "Вітаємо! Ви отримали значок \"Сила швидкості\"";
        const winScreen = new GameOverScreen(this, message, true);
        this.uiContainer.addChild(winScreen);
    }

    onResize() {
        if (!this.app) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Calculate scale to fit 1920x1080 into the screen while maintaining aspect ratio
        const scaleX = screenWidth / CONFIG.GAME_WIDTH;
        const scaleY = screenHeight / CONFIG.GAME_HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        // Scale and center Main Container
        this.container.scale.set(scale);
        this.container.x = (screenWidth - CONFIG.GAME_WIDTH * scale) / 2;
        this.container.y = (screenHeight - CONFIG.GAME_HEIGHT * scale) / 2;

        // Scale and center UI Container independently (same transform)
        if (this.uiContainer) {
            this.uiContainer.scale.set(scale);
            this.uiContainer.x = this.container.x;
            this.uiContainer.y = this.container.y;
            // Ensure UI is visually on top (it should be since it's added last, but zIndex can help if we use sortableChildren on stage)
            // this.app.stage.sortableChildren = true; // Use this if needed, but addition order is usually enough
        }
    }
}
