export class MainArea extends Phaser.Scene {

    constructor() {
        super('MainArea');
    }

    preload() {
        //this.preloadConfig();
        // Load the Tiled JSON map and the tileset image that the map references
        this.load.tilemapTiledJSON('MainArea', 'assets/maps/MainArea.tmj');
        this.load.image('TownTileset', 'assets/tilemap/tilemap_packed.png');
        
        // Load Kenney Toon Character sprite sheets using TextureAtlas XML format
        // These are atlas files, not grid spritesheets - each frame is 96x128 pixels
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
        // Create the tilemap from the loaded JSON
        const map = this.make.tilemap({ key: 'MainArea' });

        // The first argument ('tiles') must match the tileset name in Tiled
        const tileset = map.addTilesetImage('tiles', 'TownTileset');

        // Layer names must exactly match the layer names in the Tiled map
        const backgroundLayer = map.createLayer('Background', tileset);
        const terrainLayer = map.createLayer('Terrain', tileset);
        const decorationsLayer = map.createLayer('Decorations', tileset);

        // Scale the map to fill more of the screen
        // Map is 35x15 tiles at 16px each = 560x240px
        // Game canvas is 1280x720px, so scale by 2.5x to make it 1400x600px
        backgroundLayer.setScale(2.5);
        terrainLayer.setScale(2.5);
        decorationsLayer.setScale(2.5);

        // Set up collision for terrain layer (walls/buildings)
        terrainLayer.setCollisionByProperty({ collides: true });

        // Calculate scaled map dimensions
        const mapWidth = map.widthInPixels * 2.5;
        const mapHeight = map.heightInPixels * 2.5;

        // Helper function to create a character sprite
        // If spriteKey is provided, it will use that sprite image, otherwise creates a colored rectangle
        const createCharacter = (x, y, color, spriteKey = null) => {
            let sprite;
            
            // If spriteKey is provided and the texture exists, use it
            if (spriteKey && this.textures.exists(spriteKey)) {
                sprite = this.physics.add.sprite(x, y, spriteKey);
                // Scale sprite to match map scale 
                // Original sprite frames are 96x128, scale down to fit nicely (about 48x64 scaled)
                sprite.setDisplaySize(48, 64);
            } else {
                // Fallback: Create a colored rectangle
                const graphics = this.add.graphics();
                graphics.fillStyle(color, 1);
                graphics.fillRect(0, 0, 32, 32);
                const textureKey = 'character_' + color.toString(16);
                graphics.generateTexture(textureKey, 32, 32);
                graphics.destroy();
                sprite = this.physics.add.sprite(x, y, textureKey);
            }
            
            // Set world bounds for all characters
            sprite.setCollideWorldBounds(true);
            
            // Disable gravity for all characters (top-down game)
            sprite.body.setGravityY(0);
            
            return sprite;
        };

        // Create player character - positioned in center of map
        this.player = createCharacter(mapWidth / 2, mapHeight / 2, 0x4a90e2, 'player');
        this.player.setFrame('idle'); // Start with idle frame

        // Create NPCs - positioned within map bounds
        this.npcs = [];
        
        // NPC 1 - Female person (near the house)
        const npc1 = createCharacter(mapWidth * 0.4, mapHeight * 0.3, 0xe24a4a, 'npc1');
        npc1.setFrame('idle');
        npc1.name = 'NPC1';
        this.npcs.push(npc1);

        // NPC 2 - Male person (near the castle)
        const npc2 = createCharacter(mapWidth * 0.7, mapHeight * 0.6, 0x4ae24a, 'npc2');
        npc2.setFrame('idle');
        npc2.name = 'NPC2';
        this.npcs.push(npc2);

        // NPC 3 - Robot (near the barn)
        const npc3 = createCharacter(mapWidth * 0.15, mapHeight * 0.7, 0xe2e24a, 'npc3');
        npc3.setFrame('idle');
        npc3.name = 'NPC3';
        this.npcs.push(npc3);

        // NPC 4 - Zombie
        const npc4 = createCharacter(mapWidth * 0.6, mapHeight * 0.2, 0x9a4ae2, 'npc4');
        npc4.setFrame('idle');
        npc4.name = 'NPC4';
        this.npcs.push(npc4);

        // Set up camera to follow player
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);
        
        // Set world bounds for physics
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');

        // Create walking animations for characters using the atlas frame names
        // Based on the XML, walk frames are walk0-walk7, and we'll use 'down' for down, 'back' for up, 'side' for left/right
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

        // Create idle animation
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 'idle' }],
            frameRate: 1
        });

        // Add collision between player and terrain
        this.physics.add.collider(this.player, terrainLayer);
        
        // Add collision between NPCs and terrain
        this.npcs.forEach(npc => {
            this.physics.add.collider(npc, terrainLayer);
        });
    }

    update() {
        // Player movement
        const speed = 150;
        this.player.setVelocity(0);
        
        let isMoving = false;

        // Arrow keys or WASD
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
        
        // Play idle animation when not moving
        if (!isMoving) {
            this.player.anims.play('idle', true);
        }

        // Optional: Simple NPC movement (random wandering)
        // You can remove this if you want to control NPCs manually
        this.npcs.forEach(npc => {
            // Stop NPCs from falling due to gravity
            npc.setVelocityY(0);
            
            // Random wandering movement
            if (Phaser.Math.Between(0, 100) < 2) {
                npc.setVelocity(
                    Phaser.Math.Between(-50, 50),
                    Phaser.Math.Between(-50, 50)
                );
            }
            
            // Gradually slow down NPCs if they're moving
            if (npc.body.velocity.x !== 0 || npc.body.velocity.y !== 0) {
                npc.body.velocity.x *= 0.95;
                npc.body.velocity.y *= 0.95;
                
                // Stop if velocity is very small
                if (Math.abs(npc.body.velocity.x) < 1) npc.setVelocityX(0);
                if (Math.abs(npc.body.velocity.y) < 1) npc.setVelocityY(0);
            }
        });
    }

}