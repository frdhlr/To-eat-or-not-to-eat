const emptyWorldElement = {
    type:      undefined,
    species:   undefined,
    color:     undefined,
    size:      undefined,
    positionX: undefined,
    positionY: undefined,
    rank:      undefined
};

const worldElementPrototype = {
    addToWorld: function(world) {
        const regionPopulation = world.getRegionPopulation(this.positionX, this.positionY, this.type);

        this.rank = regionPopulation.length;

        regionPopulation.push(this);
    },

    removeFromWorld: function(world) {
        const regionPopulation = world.getRegionPopulation(this.positionX, this.positionY, this.type);

        regionPopulation.splice(this.rank);
    }
};

function createBasisElement(emptyWorldElement, type, species, color, size) {
    const newWorldElement = Object.assign({}, emptyWorldElement);

    newWorldElement.type     = type;
    newWorldElement.species  = species;
    newWorldElement.color    = color;
    newWorldElement.size     = size;

    return newWorldElement;
};