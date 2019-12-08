function createModel() {
    const inputShape  = [memoryTerm * ((typesNumber * speciesNumberPerType * (radar * 2 + 1) * (radar * 2 + 1)) + 2)];
    const outputShape = actionsNumber;

    const dropout = 0.1;

    const initializer = tf.initializers.truncatedNormal({mean: 0, stddev: 0.02});

    const model = tf.sequential();

    model.add(tf.layers.dense({units: 300,
                               useBias: true,
                               kernelInitializer: initializer,
                               inputShape: inputShape}));
    model.add(tf.layers.leakyReLU({alpha: 0.2}));

    model.add(tf.layers.dense({units: 10,
                               useBias: true,
                               kernelInitializer: initializer}));
    model.add(tf.layers.leakyReLU({alpha: 0.2}));

    model.add(tf.layers.dense({units: outputShape,
                              useBias: true,
                              kernelInitializer: initializer}));

    model.compile({optimizer: 'adam',
                  loss: 'meanSquaredError'});

    return model;
};