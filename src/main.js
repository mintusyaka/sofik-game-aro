import { Game } from './Game';

// Prevent context menu on right click
window.addEventListener('contextmenu', (e) => e.preventDefault());

const game = new Game();
game.init().catch(console.error);
