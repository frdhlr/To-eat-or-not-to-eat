const world = createWorld(emptyWorld, worldWidth, worldHeight);

const prototypes = [plantPrototype, herbivorePrototype, carnivorePrototype];

const animalsBrains = [];
const populations   = [];

async function setup() {
    createCanvas(worldWidth * regionSize, worldHeight * regionSize, P2D);

    world.createRegions();

    initBrains();
    initPopulation();
    intiPlants();
    initAnimals();

    let turn = 0;

    while(turn < 100000) {
        background(100);

        world.display();

        const animalsExperiencesFirstPart = animalsFirstTurn();
        plantsTurn();
        const animalsExperiencesSecondPart = animalsSecondTurn();

        storeAnimalsExperiences(animalsExperiencesFirstPart, animalsExperiencesSecondPart);

        if(turn === maximumExperiences) {
            upgradeAnimals();
        }

        if(turn >= maximumExperiences) {
            for(let type = 1; type < animalsBrains.length; type++) {
                for(let species = 0; species < animalsBrains[type].length; species++) {
                    await animalsBrains[type][species].experienceReplay();

                    if(turn % brainUpdateFrequency === 0) {
                        animalsBrains[type][species].updateValueBrain();
                    }
                }
            }
        }

        turn++;
    }
}

function initPopulation() {
    for(let type = 0; type < typesNumber; type++) {
        populations.push([]);
    }
}

function intiPlants() {
    populationSize[0].forEach((elementsNumber, species) => {
        const col = color(0, 255 * (1 - species), 255 * species);

        for(let i = 0; i< elementsNumber; i++) {
            populations[0].push(createPlant(emptyWorldElement, 0, species, col, 0));
        }
    });

    populations[0].forEach(plant => {
        plant.initPositionAndSize(world, plantMaxSize);
    });
}

function initBrains() {
    for (let type = 0; type < populationSize.length; type++) {
        animalsBrains.push([]);

        if(type > 0) {
            for(let species = 0; species < populationSize[type].length; species++) {
                animalsBrains[type].push(createBrain(createModel(), createModel()));
            }

            animalsBrains[type].forEach(brain => {
                brain.updateValueBrain();
            })
        }
    }
}

function initAnimals() {
    for(let type = 1; type < populationSize.length; type++) {
        for(let species = 0; species < populationSize[type].length; species++) {
            const col = color(0, 255 * (1 - species), 255 * species, 150);

            for(let i = 0; i < populationSize[type][species]; i++) {
                const newAnimal = createAnimal(emptyWorldElement, emptyAnimal, prototypes[type],
                                               true, type, species, col, 20, type - 1);

                populations[type].push(newAnimal);
            }
        }

        populations[type].forEach(animal => {
            animal.initPosition(world);
            animal.memorizeState(world);
        });
    }
}

function animalsFirstTurn() {
    const experiencesFirstPart = [];

    for(let type = 0; type < typesNumber; type++) {
        experiencesFirstPart.push([]);
    }

   for(let type = 1; type < typesNumber; type++) {
        populations[type].forEach(animal => {
            const actionBrain  = animalsBrains[animal.type][animal.species].actionBrain;
            const initialState = animal.getMemory();
            const bestAction   = animal.chooseBestAction(actionBrain, initialState);
            const newPosition  = animal.convertActionToPosition(bestAction);

            animal.move(world, newPosition.x, newPosition.y);

            animal.eat(world);
            animal.live();

            experiencesFirstPart[animal.type].push({initialState: initialState, bestAction: bestAction});
        });
   };

    return experiencesFirstPart;
}

function plantsTurn() {
    populations[0].forEach(plant =>{
        plant.reset(world, plantMaxSize);
        plant.display();
    });
}

function animalsSecondTurn() {
    const experiencesSecondPart = [];

    for(let type = 0; type < typesNumber; type++) {
        experiencesSecondPart.push([]);
    }

    for(let type = 1; type < typesNumber; type++) {
        populations[type].forEach(animal => {
            const reward = normalizeFeature(animal.reward, animal.rewardMean, animal.rewardStd);

            animal.resetReward();

            animal.memorizeState(world);

            const finalState = animal.getMemory();
            const death      = animal.die();

            experiencesSecondPart[animal.type].push({reward: reward, finalState: finalState, death: death});

            animal.display();
        });
    };

    return experiencesSecondPart;
}

function storeAnimalsExperiences(experiencesFirstPart, experiencesSecondPart) {
    for(let type = 1; type < typesNumber; type++) {
        populations[type].forEach((animal, index) => {
            const initialState = experiencesFirstPart[animal.type][index].initialState;
            const bestAction   = experiencesFirstPart[animal.type][index].bestAction;
            const reward       = experiencesSecondPart[animal.type][index].reward;
            const finalState   = experiencesSecondPart[animal.type][index].finalState;
            const death        = experiencesSecondPart[animal.type][index].death;

            animalsBrains[animal.type][animal.species].storeExperience(initialState, bestAction, finalState, reward, death);
        });
    };
}

function upgradeAnimals() {
    for(let type = 1; type < typesNumber; type++) {
        let offset = 0;

        populationSize[type].forEach((speciesPopulation, species) => {
            for(let i = explorersNumber[type][species]; i < speciesPopulation; i++) {
                populations[type][i + offset].explorer = false;
            }

            offset += speciesPopulation;
        });
    }
}
