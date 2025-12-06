import { gameState } from '../GameState.js';

export class MainArea extends Phaser.Scene {

    constructor() {
        super('MainArea');
    }

    preload() {
        this.load.tilemapTiledJSON('MainArea', 'assets/maps/MainArea.tmj');
        this.load.image('TownTileset', 'assets/tilemap/tilemap_packed.png');
        
        this.load.atlasXML('player', 
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png',
            'assets/characters/kenney_toon-characters-1/Male adventurer/Tilesheet/character_maleAdventurer_sheet.xml'
        );
        
        this.load.atlasXML('npc1',
            'assets/characters/kenney_toon-characters-1/Female person/Tilesheet/character_femalePerson_sheet.png',
            'assets/characters/kenney_toon-characters-1/Female person/Tilesheet/character_femalePerson_sheet.xml'
        );
        
        this.load.atlasXML('npc2',
            'assets/characters/kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheet.png',
            'assets/characters/kenney_toon-characters-1/Male person/Tilesheet/character_malePerson_sheet.xml'
        );
        
        this.load.atlasXML('npc3',
            'assets/characters/kenney_toon-characters-1/Robot/Tilesheet/character_robot_sheet.png',
            'assets/characters/kenney_toon-characters-1/Robot/Tilesheet/character_robot_sheet.xml'
        );
        
        this.load.atlasXML('npc4',
            'assets/characters/kenney_toon-characters-1/Zombie/Tilesheet/character_zombie_sheet.png',
            'assets/characters/kenney_toon-characters-1/Zombie/Tilesheet/character_zombie_sheet.xml'
        );
    }

    create() {
        const map = this.make.tilemap({ key: 'MainArea' });
        const tileset = map.addTilesetImage('tiles', 'TownTileset');

        const backgroundLayer = map.createLayer('Background', tileset);
        const terrainLayer = map.createLayer('Terrain', tileset);
        const decorationsLayer = map.createLayer('Decorations', tileset);

        // Scale map 2.5x (560x240px -> 1400x600px to fill screen)
        backgroundLayer.setScale(2.5);
        terrainLayer.setScale(2.5);
        decorationsLayer.setScale(2.5);

        terrainLayer.setCollisionByProperty({ Collides: true });

        this.mapWidth = map.widthInPixels * 2.5;
        this.mapHeight = map.heightInPixels * 2.5;
        const createCharacter = (x, y, color, spriteKey = null) => {
            let sprite;
            
            if (spriteKey && this.textures.exists(spriteKey)) {
                sprite = this.physics.add.sprite(x, y, spriteKey);
                sprite.setDisplaySize(48, 64);
            } else {
                const graphics = this.add.graphics();
                graphics.fillStyle(color, 1);
                graphics.fillRect(0, 0, 32, 32);
                const textureKey = 'character_' + color.toString(16);
                graphics.generateTexture(textureKey, 32, 32);
                graphics.destroy();
                sprite = this.physics.add.sprite(x, y, textureKey);
            }
            
            sprite.setCollideWorldBounds(true);
            sprite.body.setGravityY(0);
            
            return sprite;
        };

        this.player = createCharacter(this.mapWidth / 2, this.mapHeight / 2, 0x4a90e2, 'player');
        this.player.setFrame('idle');
        this.physics.add.collider(this.player, terrainLayer);

        this.npcs = [];
        
        const npc1 = createCharacter(this.mapWidth * 0.4, this.mapHeight * 0.3, 0xe24a4a, 'npc1');
        npc1.setFrame('idle');
        npc1.name = 'NPC1';
        this.npcs.push(npc1);

        const npc2 = createCharacter(this.mapWidth * 0.7, this.mapHeight * 0.6, 0x4ae24a, 'npc2');
        npc2.setFrame('idle');
        npc2.name = 'NPC2';
        this.npcs.push(npc2);

        const npc3 = createCharacter(this.mapWidth * 0.15, this.mapHeight * 0.7, 0xe2e24a, 'npc3');
        npc3.setFrame('idle');
        npc3.name = 'NPC3';
        this.npcs.push(npc3);

        const npc4 = createCharacter(this.mapWidth * 0.6, this.mapHeight * 0.2, 0x9a4ae2, 'npc4');
        npc4.setFrame('idle');
        npc4.name = 'NPC4';
        this.npcs.push(npc4);

        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);
        
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
        this.interactKey = this.input.keyboard.addKey('E');
        
        this.gameState = gameState;
        this.interactables = [];
        this.coins = [];
        this.messageText = null;
        this.messageTimer = null;
        
        if(this.gameState.firstLoad)
        {
            this.coinPositions = [
                { x: this.mapWidth * 0.2, y: this.mapHeight * 0.2, collected: false },
                { x: this.mapWidth * 0.3, y: this.mapHeight * 0.4, collected: false },
                { x: this.mapWidth * 0.5, y: this.mapHeight * 0.15, collected: false },
                { x: this.mapWidth * 0.7, y: this.mapHeight * 0.3, collected: false },
                { x: this.mapWidth * 0.15, y: this.mapHeight * 0.55, collected: false },
                { x: this.mapWidth * 0.4, y: this.mapHeight * 0.7, collected: false },
                { x: this.mapWidth * 0.6, y: this.mapHeight * 0.5, collected: false },
                { x: this.mapWidth * 0.8, y: this.mapHeight * 0.4, collected: false },
                { x: this.mapWidth * 0.25, y: this.mapHeight * 0.5, collected: false },
                { x: this.mapWidth * 0.75, y: this.mapHeight * 0.85, collected: false }
            ];
        }

        this.createUI();
        this.createCoins();
        
        this.interactionZones = [
            { x: this.mapWidth * 0.25, y: this.mapHeight * 0.3, type: 'house1', name: 'House 1' },
            { x: this.mapWidth * 0.35, y: this.mapHeight * 0.7, type: 'house2', name: 'House 2' },
            { x: this.mapWidth * 0.4, y: this.mapHeight * 0.75, type: 'house2', name: 'House 2' },
            { x: this.mapWidth * 0.3, y: this.mapHeight * 0.7, type: 'house2', name: 'House 2' },
            { x: this.mapWidth * 0.75, y: this.mapHeight * 0.65, type: 'castle', name: 'Castle' },
            { x: this.mapWidth * 0.5, y: this.mapHeight * 0.45, type: 'well', name: 'Well' }
        ];
        
        this.npcs.forEach(npc => {
            npc.isInteractable = true;
            npc.needsHealing = true;
            npc.healed = false;
            npc.interactionType = 'npc';
            this.interactables.push(npc);
        });

        this.anims.create({
            key: 'walk_down',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'walk',
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'walk_up',
            frames: [{ key: 'player', frame: 'back' }],
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'walk_left',
            frames: [{ key: 'player', frame: 'side' }],
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'walk_right',
            frames: [{ key: 'player', frame: 'side' }],
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 'idle' }],
            frameRate: 1
        });
        
        this.physics.add.collider(this.player, terrainLayer);
        
        this.npcs.forEach(npc => {
            this.physics.add.collider(npc, terrainLayer);
        });
        
        this.coins.forEach(coin => {
            this.physics.add.overlap(this.player, coin, () => this.collectCoin(coin), null, this);
        });

        this.gameState.loaded();
    }
    
    createUI() {
        this.coinText = this.add.text(16, 16, 'Coins: 0', {
            fontSize: '24px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 4
        });
        this.coinText.setScrollFactor(0);
        this.coinText.setDepth(1000);
        
        this.interactHint = this.add.text(16, 50, '', {
            fontSize: '20px',
            fill: '#FFFFFF',
            stroke: '#000',
            strokeThickness: 3
        });
        this.interactHint.setScrollFactor(0);
        this.interactHint.setDepth(1000);
        this.interactHint.setVisible(false);
    }
    
    createCoins() {
        
        this.coinPositions.forEach((pos, index) => {
            if (!pos.collected)
            {
                const graphics = this.add.graphics();
                graphics.fillStyle(0xFFD700, 1);
                graphics.fillCircle(10, 10, 10);
                graphics.generateTexture('coin_' + index, 20, 20);
                graphics.destroy();
                
                const coin = this.physics.add.sprite(pos.x, pos.y, 'coin_' + index);
                this.physics.add.overlap(this.player, coin, () => this.collectCoin(coin, pos), null, this);
                coin.setDisplaySize(20, 20);
                coin.body.setGravityY(0);
                coin.body.setImmovable(true);
                coin.body.setAllowGravity(false);
                coin.setCollideWorldBounds(false);
                this.coins.push(coin);
            }
        });
    }
    
    
    collectCoin(coin, pos) {
        if (!coin.collected) {
            coin.collected = true;
            pos.collected = true;
            this.gameState.addCoins(1);
            this.updateUI();
            coin.destroy();
            this.showMessage('Coin collected! Total: ' + this.gameState.coins);
        }
    }
    
    updateUI() {
        this.coinText.setText('Coins: ' + this.gameState.coins);
    }
    
    showMessage(text, duration = 2000) {
        if (this.messageText) {
            this.messageText.destroy();
        }
        if (this.messageTimer) {
            clearTimeout(this.messageTimer);
        }
        
        this.messageText = this.add.text(this.cameras.main.centerX, 100, text, {
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center'
        });
        this.messageText.setScrollFactor(0);
        this.messageText.setDepth(1000);
        this.messageText.setOrigin(0.5);
        
        this.messageTimer = setTimeout(() => {
            if (this.messageText) {
                this.messageText.destroy();
                this.messageText = null;
            }
        }, duration);
    }
    
    checkInteractions() {
        const interactionRange = 200;
        let nearestInteractable = null;
        let nearestDistance = Infinity;
        
        this.interactionZones.forEach(zone => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                zone.x, zone.y
            );
            
            if (distance < interactionRange && distance < nearestDistance) {
                nearestDistance = distance;
                nearestInteractable = zone;
            }
        });
        
        this.interactables.forEach(item => {
            if (!item.active || item.interactionType !== 'npc') return;
            
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                item.x, item.y
            );
            
            if (distance < interactionRange && distance < nearestDistance) {
                nearestDistance = distance;
                nearestInteractable = item;
            }
        });
        
        if (nearestInteractable) {
            let hintText = 'Press E to interact';
            if (nearestInteractable.name) {
                hintText = 'Press E to enter ' + nearestInteractable.name;
            } else if (nearestInteractable.interactionType === 'npc') {
                hintText = 'Press E to heal NPC';
            }
            this.interactHint.setText(hintText);
            this.interactHint.setVisible(true);
            this.interactHint.setPosition(this.cameras.main.centerX, 50);
            this.interactHint.setOrigin(0.5);
        } else {
            this.interactHint.setVisible(false);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.interactKey) && nearestInteractable) {
            this.handleInteraction(nearestInteractable);
        }
    }
    
    handleInteraction(item) {
        if (item.interactionType === 'well' || item.type === 'well') {
            this.gameState.hasWater = true;
            this.showMessage('Water collected!');
        } else if (item.interactionType === 'npc' && item.needsHealing && !item.healed) {
            if (this.gameState.hasPotion) {
                item.healed = true;
                this.gameState.npcsHealed++;
                this.showMessage('NPC healed! (' + this.gameState.npcsHealed + '/' + this.gameState.totalNPCs + ')');
                
                if (this.gameState.allNPCsHealed()) {
                    this.showMessage('All NPCs healed! Game Complete!', 5000);
                }
            } else {
                this.showMessage('You need a potion to heal NPCs');
            }
        } else if (item.interactionType === 'house1' || item.type === 'house1') {
            this.scene.start('HouseOne');
        } else if (item.interactionType === 'house2' || item.type === 'house2') {
            this.scene.start('HouseTwo');
        } else if (item.interactionType === 'castle' || item.type === 'castle') {
            if (this.gameState.canEnterCastle()) {
                this.scene.start('Castle');
            } else {
                const keysNeeded = [];
                if (!this.gameState.house1KeyObtained) keysNeeded.push('Key #1');
                if (!this.gameState.house2KeyObtained) keysNeeded.push('Key #2');
                this.showMessage('You need ' + keysNeeded.join(' and ') + ' to enter the castle!');
            }
        }
    }

    update() {
        const speed = 150;
        this.player.setVelocity(0, 0);
        
        let isMoving = false;

        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play('walk_left', true);
            isMoving = true;
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play('walk_right', true);
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
            this.player.setVelocityY(-speed);
            this.player.anims.play('walk_up', true);
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
            this.player.setVelocityY(speed);
            this.player.anims.play('walk_down', true);
            isMoving = true;
        }
        
        if (!isMoving) {
            this.player.anims.play('idle', true);
        }
        
        this.checkInteractions();
        
        this.npcs.forEach(npc => {
            if (npc.healed) {
                this.updateNPCPathfinding(npc);
            } else {
                npc.setVelocityY(0, 0);
                
                if (Phaser.Math.Between(0, 100) < 2) {
                    npc.setVelocity(
                        Phaser.Math.Between(-50, 50),
                        Phaser.Math.Between(-50, 50)
                    );
                }
                
                if (npc.body.velocity.x !== 0 || npc.body.velocity.y !== 0) {
                    npc.body.velocity.x *= 0.95;
                    npc.body.velocity.y *= 0.95;
                    
                    if (Math.abs(npc.body.velocity.x) < 1) npc.setVelocityX(0);
                    if (Math.abs(npc.body.velocity.y) < 1) npc.setVelocityY(0);
                }
            }
        });
    }
    
    updateNPCPathfinding(npc) {
        // Simple pathfinding: move towards target, pick new target when reached
        if (!npc.targetX || !npc.targetY || 
            Phaser.Math.Distance.Between(npc.x, npc.y, npc.targetX, npc.targetY) < 20) {
            npc.targetX = Phaser.Math.Between(100, this.mapWidth - 100);
            npc.targetY = Phaser.Math.Between(100, this.mapHeight - 100);
        }
        
        const angle = Phaser.Math.Angle.Between(npc.x, npc.y, npc.targetX, npc.targetY);
        const speed = 80;
        npc.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

}