import { MainArea } from './scenes/MainArea.js';
import { HouseOne } from './scenes/HouseOne.js';
import { HouseTwo } from './scenes/HouseTwo.js';
import { Castle } from './scenes/Castle.js';

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    title: 'Puzzle Town',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                x: 0,
                y: 300
            },
            debug: true
        }
    },
    scene: [
        MainArea, HouseOne, HouseTwo, Castle
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

// Initialize the game
new Phaser.Game(config);


