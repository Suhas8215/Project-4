import { gameState } from '../GameState.js';

export class HouseOne extends Phaser.Scene {

    constructor() {
        super('HouseOne');
    }

    preload() {
        this.load.tilemapTiledJSON('HouseOne', 'assets/maps/HouseTwo.tmj');
        this.load.image('TownTileset', 'assets/tilemap/tilemap_packed.png');
        
        this.load.atlasXML('player', 
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png',
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.xml'
        );
    }

    create() {
        //this.add.rectangle(640, 360, 1280, 720, 0x8B4513);
        const map = this.make.tilemap({ key: 'HouseOne' });
        const tileset = map.addTilesetImage('tiles', 'TownTileset');

        const backgroundLayer = map.createLayer('background', tileset);
        const terrainLayer = map.createLayer('terrain', tileset);

        backgroundLayer.setScale(2.5);
        terrainLayer.setScale(2.5);

        terrainLayer.setCollisionByProperty({ Collides: true });

        this.add.text(640, 100, 'House 1 - Animal Care', {
            fontSize: '48px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.gameState = gameState;
        
        this.player = this.physics.add.sprite(640, 360, 'player');
        this.player.setFrame('idle');
        this.player.setDisplaySize(48, 64);
        this.physics.add.collider(this.player, terrainLayer);
        
        this.animals = [];
        const totalAnimals = 3;
        
        // Initialize animal states from gameState (persists across scene changes)
        if (!this.gameState.house1WateredStates) {
            this.gameState.house1WateredStates = [false, false, false];
        }
        
        const animalPositions = [
            { x: 500, y: 500 },
            { x: 640, y: 500 },
            { x: 780, y: 500 }
        ];
        
        for (let i = 0; i < totalAnimals; i++) {
            const size = 96;
            const graphics = this.add.graphics();
            const centerX = size / 2;
            const centerY = size / 2;
            
            const animalColors = [
                { body: 0xD2691E, eyes: 0x000000, nose: 0xFF6347 },
                { body: 0x8B4513, eyes: 0x000000, nose: 0xFF6347 },
                { body: 0xCD853F, eyes: 0x000000, nose: 0xFF6347 }
            ];
            const colors = animalColors[i] || animalColors[0];
            
            graphics.fillStyle(colors.body, 1);
            graphics.fillEllipse(centerX, centerY + 10, 50, 40);
            
            graphics.fillStyle(colors.body, 1);
            graphics.fillCircle(centerX, centerY - 15, 25);
            
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillCircle(centerX - 10, centerY - 20, 8);
            graphics.fillCircle(centerX + 10, centerY - 20, 8);
            
            graphics.fillStyle(colors.eyes, 1);
            graphics.fillCircle(centerX - 10, centerY - 20, 5);
            graphics.fillCircle(centerX + 10, centerY - 20, 5);
            
            graphics.fillStyle(colors.nose, 1);
            graphics.fillEllipse(centerX, centerY - 8, 12, 8);
            
            graphics.fillStyle(colors.body, 1);
            graphics.fillEllipse(centerX - 20, centerY + 5, 12, 20);
            graphics.fillEllipse(centerX + 20, centerY + 5, 12, 20);
            
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(centerX - 2, centerY - 5, 4, 2);
            
            graphics.generateTexture('animal_' + i, size, size);
            graphics.destroy();
            
            const animal = this.physics.add.sprite(animalPositions[i].x, animalPositions[i].y, 'animal_' + i);
            animal.setDisplaySize(size, size);
            animal.body.setGravityY(0);
            animal.body.setImmovable(true);
            animal.body.setAllowGravity(false);
            animal.setOrigin(0.5, 0.5);
            animal.watered = this.gameState.house1WateredStates[i] || false;
            animal.index = i;
            
            if (animal.watered) {
                animal.setTint(0x90EE90);
            }
            
            this.animals.push(animal);
        }
        
        this.animalsWatered = this.gameState.house1AnimalsWatered || 0;
        
        this.add.text(640, 200, 'Water all animals (Press E near them)', {
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
                    if (!animal.watered) {
                        // Water only consumed once for all animals
                        if (this.gameState.hasWater || this.gameState.house1WaterUsed) {
                            animal.watered = true;
                            this.gameState.house1WateredStates[animal.index] = true;
                            this.animalsWatered++;
                            this.gameState.house1AnimalsWatered = this.animalsWatered;
                            animal.setTint(0x90EE90);
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
                        this.showMessage('This animal is already watered!');
                        return;
                    }
                }
            });
            
            if (this.animalsWatered === this.animals.length &&
                !this.gameState.house1KeyObtained) {
                this.gameState.house1KeyObtained = true;
                this.gameState.house1Completed = true;
                this.showMessage('All animals watered! You got KEY #1!', 4000);
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
