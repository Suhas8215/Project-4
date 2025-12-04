import { gameState } from '../GameState.js';

export class HouseTwo extends Phaser.Scene {

    constructor() {
        super('HouseTwo');
    }

    preload() {
        this.load.tilemapTiledJSON('MainArea', 'assets/maps/MainArea.tmj');
        this.load.image('TownTileset', 'assets/tilemap/tilemap_packed.png');
        
        this.load.atlasXML('player', 
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png',
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.xml'
        );
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x8B4513);
        this.add.text(640, 100, 'House 2 - Mystery Boxes', {
            fontSize: '48px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.gameState = gameState;
        
        this.player = this.physics.add.sprite(640, 360, 'player');
        this.player.setFrame('idle');
        this.player.setDisplaySize(48, 64);
        
        if (!this.gameState.house2BoxesOpened) {
            this.gameState.house2BoxesOpened = [false, false, false];
        }
        if (!this.gameState.house2BoxesWithKeys || this.gameState.house2BoxesWithKeys.length === 0) {
            // Randomly assign keys to 2 out of 3 boxes
            const indices = [0, 1, 2];
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            this.gameState.house2BoxesWithKeys = [indices[0], indices[1]];
        }
        
        this.boxes = [];
        const boxPositions = [400, 640, 880];
        
        for (let i = 0; i < 3; i++) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x8B4513, 1);
            graphics.fillRect(0, 0, 80, 60);
            graphics.fillStyle(0xFFD700, 1);
            graphics.fillRect(20, 10, 40, 10);
            graphics.generateTexture('box_' + i, 80, 60);
            graphics.destroy();
            
            const box = this.physics.add.sprite(boxPositions[i], 500, 'box_' + i);
            box.setDisplaySize(80, 60);
            box.body.setGravityY(0);
            box.body.setImmovable(true);
            box.body.setAllowGravity(false);
            box.index = i;
            box.opened = this.gameState.house2BoxesOpened[i] || false;
            box.hasKey = this.gameState.house2BoxesWithKeys.includes(i);
            this.boxes.push(box);
            
            if (box.opened) {
                if (box.hasKey) {
                    box.setTint(0x00FF00);
                } else {
                    box.setTint(0xFF0000);
                }
            }
        }
        
        this.add.text(640, 200, 'Open 2 boxes to find the key!', {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(640, 240, 'If you don\'t find it in 2 tries, game resets!', {
            fontSize: '20px',
            fill: '#FF0000'
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
        this.attemptsText = this.add.text(640, 280, 'Boxes opened: ' + this.gameState.house2Attempts + ' / 2', {
            fontSize: '20px',
            fill: '#FFFF00'
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
        
        this.attemptsText.setText('Boxes opened: ' + this.gameState.house2Attempts + ' / 2');
        
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.boxes.forEach(box => {
                if (box.opened) return;
                
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    box.x, box.y
                );
                
                if (distance < 60) {
                    box.opened = true;
                    this.gameState.house2BoxesOpened[box.index] = true;
                    this.gameState.house2Attempts++;
                    
                    if (box.hasKey) {
                        this.gameState.house2KeyObtained = true;
                        this.gameState.house2Completed = true;
                        box.setTint(0x00FF00);
                        this.showMessage('You found KEY #2!', 3000);
                    } else {
                        box.setTint(0xFF0000);
                        this.showMessage('Empty box! Attempts: ' + this.gameState.house2Attempts + ' / 2', 2000);
                        
                        if (this.gameState.house2Attempts >= 2 && !this.gameState.house2KeyObtained) {
                            setTimeout(() => {
                                this.showMessage('Game Over! Resetting...', 2000);
                                setTimeout(() => {
                                    this.gameState.resetGame();
                                    this.scene.start('MainArea');
                                }, 2000);
                            }, 2000);
                        }
                    }
                }
            });
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
