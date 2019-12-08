const ressourcePrototype = {
    display: function() {
        noStroke();
        fill(this.color);

        rectMode(CENTER);

        const halfRegionSize = regionSize / 2.0;
        const displayPositionX = (this.positionX * regionSize) + halfRegionSize;
        const displayPositionY = (this.positionY * regionSize) + halfRegionSize;

        square(displayPositionX, displayPositionY, this.size);
    },

    initPositionAndSize: function(world, maxSize) {
        do {
            this.positionX = floor(random(world.width));
            this.positionY = floor(random(world.height));
        } while (!world.isRegionPlantFree(this.positionX, this.positionY));

        this.size = floor(random(maxSize - 1)) + 1;

        this.addToWorld(world);
    },

    reset: function(world, maxSize) {
        if (this.size <= 0) {
            this.removeFromWorld(world);

            this.initPositionAndSize(world, maxSize);
        }
    },

    beEaten: function(quantity) {
        this.size -= quantity;
    }
};

const plantPrototype = Object.assign({}, worldElementPrototype, ressourcePrototype);

function createPlant(emptyWorldElement, type, species, color, size) {
    const basisElement = createBasisElement(emptyWorldElement, type, species, color, size);

    return Object.assign(Object.create(prototypes[type]), basisElement);
};