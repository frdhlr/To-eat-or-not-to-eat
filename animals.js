const emptyAnimal = {
    explorer:     undefined,
    eatableType:  undefined,
    health:       maximumHealth,
    lifeDuration: 0,
    sickness:     0,
    reward:       0,
    memory:       undefined
};

const animalPrototype = {
    initPosition: function(world) {
        this.positionX = floor(random(world.width));
        this.positionY = floor(random(world.height));

        this.addToWorld(world);
    },

    chooseBestAction: function(actionBrain, state) {
        let bestAction;

        if(this.explorer) {
            bestAction = floor(random(actionsNumber));
        }
        else {
            tf.tidy(() => {
                const stateTensor = tf.tensor2d([state]);

                bestAction = actionBrain.predict(stateTensor).argMax(1).arraySync()[0];
            });
        }

        return bestAction;
    },

    convertActionToPosition: function(action) {
        const actionTranslation = [-1, 0, 1];

        const deltaX = actionTranslation[action % 3];
        const deltaY = actionTranslation[floor(action / 3)];

        return {x: this.positionX + deltaX, y: this.positionY + deltaY};
    },

    move: function(world, newPositionX, newPositionY) {
        this.removeFromWorld(world);

        this.positionX = world.wrapPosition(newPositionX, 'width');
        this.positionY = world.wrapPosition(newPositionY, 'height');

        this.addToWorld(world);
    },

    eat: function(world) {
        let totalEatenQuantity = 0;

        const availableConsumables = world.getRegionPopulation(this.positionX, this.positionY, this.eatableType);

        availableConsumables.forEach(consumable => {
            if(totalEatenQuantity < maximumFoodPerTurn && this.health < maximumHealth) {
                let eatenQuantity = min(consumable.size, maximumFoodPerTurn - totalEatenQuantity);
                eatenQuantity = min(eatenQuantity, maximumHealth - this.health);

                consumable.beEaten(eatenQuantity);

                if(consumable.species !== this.species) {
                    this.sickness = sicknessTurns;
                }

                totalEatenQuantity += eatenQuantity;
            }
        });

        this.health += totalEatenQuantity;
        this.reward += totalEatenQuantity;
    },

    live: function() {
        this.lifeDuration++;
        this.health -= lifeLossPerTurn;
        this.reward -= lifeLossPerTurn;

        if(this.sickness > 0) {
            this.health -= sicknessLossPerTurn;
            this.reward -= sicknessLossPerTurn;
            this.sickness--;
        }
    },

    resetReward: function() {
        this.reward = 0;
    },

    getCurrentState: function(world) {
        const state = [];

        for(let y = -radar; y <= radar; y++) {
            const wrappedY = world.wrapPosition(this.positionY + y, 'height');

            for(let x = -radar; x <= radar; x++) {
                const wrappedX = world.wrapPosition(this.positionX + x, 'width');

                const regionState = world.getRegionState(wrappedX, wrappedY);

                regionState.forEach(feature => {
                    state.push(feature);
                });
            }
        }

        state.push(normalizeFeature(this.health, healthMean, healthStd));
        state.push(normalizeFeature(this.sickness, sicknessMean, sicknessStd));

        return state;
    },

    memorizeState: function(world) {
        const state = this.getCurrentState(world);

        if(this.memory.length === memoryTerm) {
            this.memory.shift();
        }

        this.memory.push(state);
    },

    die: function() {
        let dead = 1;

        if(this.health <= 0) {
            dead = 0;

            this.health       = maximumHealth;
            this.lifeDuration = 0;
            this.sickness     = 0;
        }

        return dead;
    },

    getMemory: function() {
        const stackedStates = [];

        this.memory.forEach(state => {
            state.forEach(feature => {
                stackedStates.push(feature);
            });
        });

        return stackedStates;
    }
};

const preyPrototype = {
    display: function() {
        noStroke();
        fill(this.color);

        ellipseMode(CENTER);

        const halfRegionSize = regionSize / 2.0;
        const displayPositionX = (this.positionX * regionSize) + halfRegionSize;
        const displayPositionY = (this.positionY * regionSize) + halfRegionSize;

        circle(displayPositionX, displayPositionY, this.size);

        if(!this.explorer) {
            fill(color(255, 0, 0, 150));
            circle(displayPositionX, displayPositionY, 5);
        }
    },

    beEaten: function(quantity) {
        this.health -= quantity;
        this.reward -= quantity;
    }
};

const predatorPrototype = {
    display: function() {
        noStroke();
        fill(this.color);

        ellipseMode(CENTER);

        const halfRegionSize = regionSize / 2.0;
        const displayPositionX = (this.positionX * regionSize) + halfRegionSize;
        const displayPositionY = (this.positionY * regionSize) + halfRegionSize;

        ellipse(displayPositionX, displayPositionY, this.size, this.size / 2.0);

        if(!this.explorer) {
            fill(color(255, 0, 0, 150));
            circle(displayPositionX, displayPositionY, 5);
        }
    }
};

const herbivorePrototype = Object.assign({rewardMean: herbivoreRewardMean, rewardStd: herbivoreRewardStd},
                                         worldElementPrototype, animalPrototype, preyPrototype);
const carnivorePrototype = Object.assign({rewardMean: carnivoreRewardMean, rewardStd: carnivoreRewardStd},
                                         worldElementPrototype, animalPrototype, predatorPrototype);

function createBasisAnimal(emptyAnimal, explorer, eatableType) {
    const newAnimal = Object.assign({}, emptyAnimal);

    newAnimal.explorer    = explorer;
    newAnimal.eatableType = eatableType;
    newAnimal.memory      = [];

    return newAnimal;
};

function createAnimal(emptyWorldElement, emptyAnimal, animalPrototype, explorer, type, species, color, size, eatableType) {
    const basisElement = createBasisElement(emptyWorldElement, type, species, color, size);
    const basisAnimal  = createBasisAnimal(emptyAnimal, explorer, eatableType);

    return Object.assign(Object.create(animalPrototype), basisElement, basisAnimal);
};