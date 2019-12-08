const emptyWorld = {
    width: 0,
    height: 0,
    regions: [],
    speciesTypes: speciesTypes,

    display: function() {
        noFill();
        stroke(255);

        rectMode(CORNER);

        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                square(x * regionSize, y * regionSize, regionSize);
            }
        }
    },

    createRegions: function () {
        this.regions.forEach(row => {
            row.forEach(region => {
                for(let type = 0; type < typesNumber; type++) {
                     region.push([]);
                }
            });
        });
    },

    wrapPosition: function(position, dimensionType) {
        let wrappedPosition = position;

        if(position < 0) {
            wrappedPosition += this[dimensionType];
        }
        else if(position >= this[dimensionType]) {
            wrappedPosition -= this[dimensionType];
        }

        return wrappedPosition;
    },

    isRegionPlantFree: function(positionX, positionY) {
        let regionFree = true;

        const plantsPosition = this.speciesTypes.get('Plant');

        if(this.regions[positionY][positionX][plantsPosition].length > 0) {
            regionFree = false;
        }

        return regionFree;
    },

    getRegionPopulation: function(positionX, positionY, type) {
        return this.regions[positionY][positionX][type];
    },

    splitPopulationSpecies: function(population) {
        const splitedPopulation = [];

        for(let i = 0; i < speciesNumberPerType; i++) {
            splitedPopulation.push([]);
        }

        population.forEach(worldElement => {
            splitedPopulation[worldElement.species].push(worldElement);
        });

        return splitedPopulation;
    },

    getPlantPopulationState: function(plantPopulation) {
        let plantPopulationState = plantPopulation.reduce((accumulator, element) => accumulator + element.size, 0);

        plantPopulationState /= max(plantPopulation.length, 1);
        plantPopulationState = normalizeFeature(plantPopulationState, plantSizeMean, plantSizeStd);

        return plantPopulationState;
    },

    getAnimalPopulationState: function(animalPopulation, type, species) {
        let animalPopulationState = animalPopulation.reduce(accumulator => accumulator + 1, 0);

        animalPopulationState = normalizeFeature(animalPopulationState, populationSizeMean[type][species], populationSizeStd[type][species]);

        return animalPopulationState;
    },

    getRegionState: function(positionX, positionY) {
        const regionState = [];

        for (let type of this.speciesTypes.values()) {
            const regionPopulation    = this.getRegionPopulation(positionX, positionY, type);
            const populationBySpecies = this.splitPopulationSpecies(regionPopulation);

            for(let species = 0; species < populationBySpecies.length; species++) {
                if(type === 0) {
                    const plantState = this.getPlantPopulationState(populationBySpecies[species]);

                    regionState.push(plantState);
                }
                else {
                    const animalPopulationState = this.getAnimalPopulationState(populationBySpecies[species], type, species);

                    regionState.push(animalPopulationState);
                }
            }
        }

        return regionState;
    }
};

function createWorld(emptyWorld, worldWidth, worldHeight) {
    const newWorld = Object.assign({}, emptyWorld);

    newWorld.width  = worldWidth;
    newWorld.height = worldHeight;

    for(let y = 0; y < newWorld.height; y++) {
        newWorld.regions.push([]);

        for(let x = 0; x < newWorld.width; x++) {
            newWorld.regions[y].push([]);
        }
    }

    return newWorld;
};