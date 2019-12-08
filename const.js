// Const for the world definition
const worldWidth  = 30; // Number of regions per line
const worldHeight = 20; // Number of regions per column
const regionSize  = 30; // Size of ech region

// Const for the different types of species
const speciesTypes = new Map();

speciesTypes.set('Plant',     0);
speciesTypes.set('Herbivore', 1);
speciesTypes.set('Carnivore', 2);

const typesNumber          = speciesTypes.size;
const speciesNumberPerType = 2;

// Const for the world population
const populationSize = [[200, 200], // Number of plants of species 1 and species 2
                        [50,  50],  // Number of herbivores of species 1 and species 2
                        [10,  10]]; // Number of carnivores of species 1 and species 2

const explorersNumber = [[0, 0],    // Number of explorers per species
                         [2, 2],
                         [2, 2]];

// Const for plants
const plantMaxSize = 20;    // Max size of each plant

// Const for creatures
const lifeLossPerTurn     = 1;      // How much life a creature loses at each turn
const maximumFoodPerTurn  = 5;      // How much food can a creature eat at each turn
const maximumHealth       = 100;    // Maximum health for a creature / initial health
const sicknessLossPerTurn = 3;      // How much health a creature loses at each turn if it's sick
const sicknessTurns       = 3;      // How many turns does sickness last
const radar               = 2;      // Size of the radar
const memoryTerm          = 3;      // How many experiences does a creature remember of

// Const for features normalization
const populationSizeMean   = populationSize.map(row => row.map(population => population / 2.0));
const populationSizeStd    = populationSizeMean;

const plantSizeMean        = plantMaxSize / 2.0;
const plantSizeStd         = plantSizeMean;

const healthMean           = maximumHealth / 2.0;
const healthStd            = healthMean;

const sicknessMean         = sicknessTurns / 2.0;
const sicknessStd          = sicknessMean;

const herbivoreRewardMean  = ((maximumFoodPerTurn - lifeLossPerTurn) -
                              (sicknessLossPerTurn + lifeLossPerTurn + maximumFoodPerTurn)) / 2.0;

const herbivoreRewardStd   = ((maximumFoodPerTurn - lifeLossPerTurn - herbivoreRewardMean) +
                              (sicknessLossPerTurn + lifeLossPerTurn + maximumFoodPerTurn + herbivoreRewardMean)) / 2.0;

const carnivoreRewardMean  = ((maximumFoodPerTurn - lifeLossPerTurn) -
                              (sicknessLossPerTurn + lifeLossPerTurn)) / 2.0;

const carnivoreRewardStd   = ((maximumFoodPerTurn - lifeLossPerTurn - carnivoreRewardMean) +
                              (sicknessLossPerTurn + lifeLossPerTurn + carnivoreRewardMean)) / 2.0;

// Const for actions
const actionsNumber = 9;

// Const for experience replay
const batchSize            = 32;
const maximumExperiences   = 5000;
const experienceDecay      = 0.9;
const brainUpdateFrequency = 1000;
const explorationRatio     = 0.01;