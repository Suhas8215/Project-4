export class MainArea extends Phaser.Scene {

    constructor() {
        super('MainArea');
    }

    preload() {
        //this.preloadConfig();
        this.load.tilemapTiledJSON('MainArea', 'assets/tilemaps/MainArea.tmj');
        this.load.image('TownTileset', 'assets/tilemap/tilemap_packed.png');
    }

    create() {
        const map = this.add.tilemap("MainArea");
        const tiles = map.addTilesetImage("tiles", "TownTileset");

        const backgroundLayer = map.createLayer("Background", tiles);
        const decorationLayer = map.createLayer("Decoration", tiles);
        const terrainLayer = map.createLayer("Terrain", tiles);
    }

}