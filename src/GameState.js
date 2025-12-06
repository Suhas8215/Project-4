export class GameState {
    constructor() {
        this.coins = 0;
        this.keys = 0;
        this.hasWater = false;
        this.hasBucket = false;
        this.hasPotion = false;
        this.house1KeyObtained = false;
        this.house2KeyObtained = false;
        this.house1Completed = false;
        this.house2Completed = false;
        this.castleCompleted = false;
        this.npcsHealed = 0;
        this.totalNPCs = 4;
        this.firstLoad = true;
        
        // House 1 animal states (persist across scene changes)
        this.house1AnimalsFed = 0;
        this.house1AnimalsWatered = 0;
        this.house1AnimalStates = [false, false, false];
        this.house1WateredStates = [false, false, false];
        this.house1WaterUsed = false;
        
        // House 2 box states
        this.house2BoxesOpened = [false, false, false];
        this.house2BoxesWithKeys = [];
        this.house2Attempts = 0;

        // this.coinPositions = [
        //     { x: this.mapWidth * 0.2, y: this.mapHeight * 0.2, collected: false },
        //     { x: this.mapWidth * 0.3, y: this.mapHeight * 0.4, collected: false },
        //     { x: this.mapWidth * 0.5, y: this.mapHeight * 0.15, collected: false },
        //     { x: this.mapWidth * 0.7, y: this.mapHeight * 0.3, collected: false },
        //     { x: this.mapWidth * 0.15, y: this.mapHeight * 0.6, collected: false },
        //     { x: this.mapWidth * 0.4, y: this.mapHeight * 0.7, collected: false },
        //     { x: this.mapWidth * 0.6, y: this.mapHeight * 0.5, collected: false },
        //     { x: this.mapWidth * 0.8, y: this.mapHeight * 0.4, collected: false },
        //     { x: this.mapWidth * 0.25, y: this.mapHeight * 0.5, collected: false },
        //     { x: this.mapWidth * 0.75, y: this.mapHeight * 0.65, collected: false }
        // ];
    }

    addCoins(amount) {
        this.coins += amount;
    }

    hasEnoughCoins(amount) {
        return this.coins >= amount;
    }

    canEnterCastle() {
        return this.house1KeyObtained && this.house2KeyObtained;
    }

    loaded()
    {
        this.firstLoad = false;
    }
    
    resetGame() {
        this.coins = 0;
        this.keys = 0;
        this.hasWater = false;
        this.hasBucket = false;
        this.hasPotion = false;
        this.house1KeyObtained = false;
        this.house2KeyObtained = false;
        this.house1Completed = false;
        this.house2Completed = false;
        this.castleCompleted = false;
        this.npcsHealed = 0;
        
        this.house1AnimalsFed = 0;
        this.house1AnimalsWatered = 0;
        this.house1AnimalStates = [false, false, false];
        this.house1WateredStates = [false, false, false];
        this.house1WaterUsed = false;
        
        this.house2BoxesOpened = [false, false, false];
        this.house2BoxesWithKeys = [];
        this.house2Attempts = 0;
        this.firstLoad = true;
    }

    allNPCsHealed() {
        return this.npcsHealed >= this.totalNPCs;
    }

    gameComplete() {
        return this.castleCompleted && this.allNPCsHealed();
    }
}

export const gameState = new GameState();

