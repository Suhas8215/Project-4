import { gameState } from '../GameState.js';

export class Castle extends Phaser.Scene {

    constructor() {
        super('Castle');
    }

    preload() {
        this.load.tilemapTiledJSON('Castle', 'assets/maps/Castle.tmj');
        this.load.image('TownTileset', 'assets/tilemap/tilemap_packed.png');
        this.load.image('wizard', 'assets/sprites/wizard.png');
        
        this.load.atlasXML('player', 
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png',
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.xml'
        );
    }

    create() {
        const map = this.make.tilemap({ key: 'Castle' });
        const tileset = map.addTilesetImage('tiles', 'TownTileset');

        const backgroundLayer = map.createLayer('background', tileset);
        const terrainLayer = map.createLayer('terrain', tileset);

        backgroundLayer.setScale(2.5);
        terrainLayer.setScale(2.5);

        //this.add.rectangle(640, 360, 1280, 720, 0x2F2F2F);
        this.add.text(640, 100, 'Castle - Wizard\'s Tower', {
            fontSize: '48px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.gameState = gameState;
        
        this.player = this.physics.add.sprite(640, 360, 'player');
        this.player.setFrame('idle');
        this.player.setDisplaySize(48, 64);
        
        // const wizardGraphics = this.add.graphics();
        // wizardGraphics.fillStyle(0x800080, 1);
        // wizardGraphics.fillRect(0, 0, 60, 60);
        // wizardGraphics.fillStyle(0xFFFF00, 1);
        // wizardGraphics.fillCircle(30, 20, 15);
        // wizardGraphics.generateTexture('wizard', 60, 60);
        // wizardGraphics.destroy();
        
        this.wizard = this.physics.add.sprite(640, 500, 'wizard');
        this.wizard.setDisplaySize(60, 60);
        this.wizard.body.setGravityY(0);
        this.wizard.body.setImmovable(true);
        this.wizard.body.setAllowGravity(false);
        this.wizard.isInteractable = true;
        this.potionGiven = false;
        
        this.add.text(640, 200, 'Wizard requires 10 gold coins for a potion', {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
        this.interactKey = this.input.keyboard.addKey('E');
        
        this.add.text(50, 50, 'Press ESC to exit', {
            fontSize: '20px',
            fill: '#FFFFFF'
        });
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainArea');
        });
        
        this.messageText = null;
        this.coinText = this.add.text(640, 250, 'Coins: ' + this.gameState.coins + ' / 10', {
            fontSize: '32px',
            fill: '#FFD700'
        }).setOrigin(0.5);
    }

    update() {
        const speed = 150;
        this.player.setVelocity(0);
        
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            this.player.setVelocityY(speed);
        }
        
        this.coinText.setText('Coins: ' + this.gameState.coins + ' / 10');
        
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            const wizardDistance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.wizard.x, this.wizard.y
            );
            
            if (wizardDistance < 80) {
                if (!this.potionGiven) {
                    if (this.gameState.hasEnoughCoins(10)) {
                        this.gameState.coins -= 10;
                        this.gameState.hasPotion = true;
                        this.gameState.castleCompleted = true;
                        this.potionGiven = true;
                        this.showMessage('Wizard gave you a POTION! Now heal all NPCs!', 5000);
                        this.coinText.setText('Coins: ' + this.gameState.coins + ' / 10');
                    } else {
                        this.showMessage('You need 10 coins! You have ' + this.gameState.coins);
                    }
                } else {
                    this.showMessage('You already have the potion!');
                }
            }
        }
    }
    
    showMessage(text, duration = 2000) {
        if (this.messageText) {
            this.messageText.destroy();
        }
        
        this.messageText = this.add.text(640, 350, text, {
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center'
        });
        this.messageText.setOrigin(0.5);
        
        setTimeout(() => {
            if (this.messageText) {
                this.messageText.destroy();
                this.messageText = null;
            }
        }, duration);
    }
}
