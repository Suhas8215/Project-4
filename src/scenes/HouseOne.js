import { gameState } from '../GameState.js';

export class HouseOne extends Phaser.Scene {

    constructor() {
        super('HouseOne');
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
        this.add.text(640, 100, 'House 1 - Animal Care', {
            fontSize: '48px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.gameState = gameState;
        
        this.player = this.physics.add.sprite(640, 360, 'player');
        this.player.setFrame('idle');
        this.player.setDisplaySize(48, 64);
        
        this.animals = [];
        const totalAnimals = 3;
        
        // Initialize animal states from gameState (persists across scene changes)
        if (!this.gameState.house1AnimalStates) {
            this.gameState.house1AnimalStates = [false, false, false];
        }
        if (!this.gameState.house1WateredStates) {
            this.gameState.house1WateredStates = [false, false, false];
        }
        
        for (let i = 0; i < totalAnimals; i++) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xFFA500, 1);
            graphics.fillRect(0, 0, 40, 40);
            graphics.generateTexture('animal_' + i, 40, 40);
            graphics.destroy();
            
            const animal = this.physics.add.sprite(400 + i * 200, 500, 'animal_' + i);
            animal.setDisplaySize(40, 40);
            animal.body.setGravityY(0);
            animal.body.setImmovable(true);
            animal.body.setAllowGravity(false);
            animal.fed = this.gameState.house1AnimalStates[i] || false;
            animal.watered = this.gameState.house1WateredStates[i] || false;
            animal.index = i;
            this.animals.push(animal);
        }
        
        this.animalsFed = this.gameState.house1AnimalsFed || 0;
        this.animalsWatered = this.gameState.house1AnimalsWatered || 0;
        
        this.add.text(640, 200, 'Feed and water all animals (Press E near them)', {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.add.text(640, 250, 'You need water from the well!', {
            fontSize: '20px',
            fill: '#FFFF00'
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
        
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.animals.forEach(animal => {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    animal.x, animal.y
                );
                
                if (distance < 60) {
                    if (!animal.fed) {
                        animal.fed = true;
                        this.gameState.house1AnimalStates[animal.index] = true;
                        this.animalsFed++;
                        this.gameState.house1AnimalsFed = this.animalsFed;
                        this.showMessage('Animal fed! (' + this.animalsFed + '/' + this.animals.length + ')');
                    } else if (!animal.watered) {
                        // Water only consumed once for all animals
                        if (this.gameState.hasWater || this.gameState.house1WaterUsed) {
                            animal.watered = true;
                            this.gameState.house1WateredStates[animal.index] = true;
                            this.animalsWatered++;
                            this.gameState.house1AnimalsWatered = this.animalsWatered;
                            this.showMessage('Animal watered! (' + this.animalsWatered + '/' + this.animals.length + ')');
                            
                            if (!this.gameState.house1WaterUsed && this.gameState.hasWater) {
                                this.gameState.hasWater = false;
                                this.gameState.house1WaterUsed = true;
                            }
                        } else {
                            this.showMessage('You need water from the well!');
                            return;
                        }
                    } else {
                        this.showMessage('This animal is already cared for!');
                        return;
                    }
                }
            });
            
            if (this.animalsFed === this.animals.length && 
                this.animalsWatered === this.animals.length &&
                !this.gameState.house1KeyObtained) {
                this.gameState.house1KeyObtained = true;
                this.gameState.house1Completed = true;
                this.showMessage('All animals cared for! You got KEY #1!', 4000);
            }
        }
    }
    
    showMessage(text, duration = 2000) {
        if (this.messageText) {
            this.messageText.destroy();
        }
        
        this.messageText = this.add.text(640, 300, text, {
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
