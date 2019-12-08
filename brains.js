function normalizeFeature(feature, featureMean, featureStd) {
    return (feature - featureMean) / featureStd;
};

const emptyExperience = {
    initialState: undefined,
    action:       undefined,
    finalState:   undefined,
    reward:       undefined,
    death:        undefined
};

const emptyBrain = {
    actionBrain: undefined,
    valueBrain:  undefined,
    memory:      undefined
};

const brainPrototype = {
    storeExperience: function(initialState, action, finalState, reward, death) {
        const newExperience = Object.assign({}, emptyExperience);

        newExperience.initialState = initialState;
        newExperience.action       = action;
        newExperience.finalState   = finalState;
        newExperience.reward       = reward;
        newExperience.death        = death;

        if(this.memory.length === maximumExperiences) {
            this.memory.shift();
        }

        this.memory.push(newExperience);
    },

    createBatch: function() {
        const batch = {
            initialStateBatch: [],
            actionBatch:       [],
            finalStateBatch:   [],
            rewardBatch:       [],
            deathBatch:        []
        };

        for(let i = 0; i < batchSize; i++) {
            const experienceIndex  = floor(random() * this.memory.length);
            const chosenExperience = this.memory[experienceIndex];

            batch.initialStateBatch.push(chosenExperience.initialState);
            batch.actionBatch.push(chosenExperience.action);
            batch.finalStateBatch.push(chosenExperience.finalState);
            batch.rewardBatch.push(chosenExperience.reward);
            batch.deathBatch.push(chosenExperience.death);
        }

        return batch;
    },

    experienceReplay: function() {
        const batch = this.createBatch();

        const trainData = tf.tidy(() => {
            const initialStateTensor = tf.tensor2d(batch.initialStateBatch);
            const actionTensor       = tf.tensor1d(batch.actionBatch, 'int32');
            const finalStateTensor   = tf.tensor2d(batch.finalStateBatch);
            const rewardTensor       = tf.tensor1d(batch.rewardBatch);
            const deathTensor        = tf.tensor1d(batch.deathBatch);

            const nextActions = this.actionBrain.predict(finalStateTensor);
            const nextValues  = this.valueBrain.predict(finalStateTensor);

            const bestAction     = nextActions.argMax(1);
            const bestActionMask = tf.oneHot(bestAction, actionsNumber);
            const bestValueMask  = bestActionMask.mul(nextValues);
            const bestValue      = bestValueMask.dot(tf.ones([actionsNumber, 1])).flatten();

            const newReward   = bestValue.mul(tf.scalar(experienceDecay)).mul(deathTensor);
            const totalReward = rewardTensor.add(newReward);

            const predictedCurrentActions = this.actionBrain.predict(initialStateTensor);

            const actionMask         = tf.oneHot(actionTensor, actionsNumber);
            const actionsToWithdraw  = actionMask.mul(predictedCurrentActions);
            const actionsToAdd       = actionMask.mul(totalReward.reshape([batchSize, 1]));
            const realCurrentActions = predictedCurrentActions.sub(actionsToWithdraw).add(actionsToAdd);

            return {x: initialStateTensor, y: realCurrentActions};
        });

        const trainingResult = this.actionBrain.fit(trainData.x, trainData.y, {batchSize: batchSize,
                                                                               epoch: 1,
                                                                               shuffle: true
                                                                              });

        return trainingResult.then(() => {
            trainData.x.dispose();
            trainData.y.dispose();
        });
    },

    updateValueBrain: function() {
        this.actionBrain.weights.forEach((weight, index) => {
            this.valueBrain.weights[index].val.assign(weight.val)
        });
    }
};

function createBrain(actionBrain, valueBrain) {
    const newBrain = Object.assign({}, emptyBrain);

    newBrain.actionBrain = actionBrain;
    newBrain.valueBrain  = valueBrain;
    newBrain.memory      = [];

    return Object.assign(Object.create(brainPrototype), newBrain);
}
