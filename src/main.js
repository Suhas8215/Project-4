// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Game variables
let player;
let platforms;
let cursors;
let stars;
let score = 0;
let scoreText;

// Preload assets
function preload() {
    // Create simple colored rectangles as placeholders
    // In a real game, you would load images from the assets folder
    this.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    
    // Create a simple player sprite (you can replace with actual images)
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
}

// Create game objects
function create() {
    // Create platforms
    platforms = this.physics.add.staticGroup();
    
    // Ground
    platforms.create(400, 568, 'ground').setScale(800, 1).refreshBody();
    platforms.create(600, 400, 'ground').setScale(200, 1).refreshBody();
    platforms.create(50, 250, 'ground').setScale(200, 1).refreshBody();
    platforms.create(750, 220, 'ground').setScale(200, 1).refreshBody();
    
    // Create player
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setTint(0x00ff00); // Green color for visibility
    
    // Player physics
    this.physics.add.collider(player, platforms);
    
    // Create stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    stars.children.entries.forEach(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setTint(0xffd700); // Gold color
    });
    
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    // Create cursors
    cursors = this.input.keyboard.createCursorKeys();
    
    // Score text
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });
}

// Update game loop
function update() {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }
    
    // Jump
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

// Collect star function
function collectStar(player, star) {
    star.disableBody(true, true);
    
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Respawn stars if all collected
    if (stars.countActive(true) === 0) {
        stars.children.entries.forEach(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

