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
    }

    allNPCsHealed() {
        return this.npcsHealed >= this.totalNPCs;
    }

    gameComplete() {
        return this.castleCompleted && this.allNPCsHealed();
    }
}

export const gameState = new GameState();

