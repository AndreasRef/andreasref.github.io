/* global describe tf */

var NN = {}
NN.CLASS2OBJECTS = {
  "architecture":["barn","bridge","castle","church","hospital","house","skyscraper","tent","The Eiffel Tower","The Great Wall of China","windmill"],
  "bird":["bird","duck","flamingo","owl","parrot","penguin","swan"],
  "container":["bucket","coffee cup","cup","mug","suitcase","vase","wine bottle","wine glass"],
  "fish":["dolphin","fish","shark","whale"],
  "food":["birthday cake","bread","cake","carrot","cookie","donut","hamburger","hot dog","ice cream","lollipop","onion","peanut","peas","pizza","popsicle","sandwich","steak"],
  "fruit":["apple","banana","blackberry","blueberry","pear","pineapple","strawberry","watermelon"],
  "furniture":["bed","bench","chair","couch","dresser","table","toilet"],
  "garment":["belt","bowtie","bracelet","crown","hat","helmet","jacket","necklace","pants","rollerskates","shoe","shorts","sock","sweater","t-shirt","underwear"],
  "humanoid":["angel","face","teddy-bear","yoga"],
  "insect":["ant","bat","bee","butterfly","lobster","mosquito","scorpion","snail","snake","spider"],
  "instrument":["cello","clarinet","drums","guitar","harp","piano","saxophone","trombone","trumpet","violin"],
  "plant":["bush","cactus","flower","grass","mushroom","house plant","palm tree","tree"],
  "quadruped":["bear","camel","cat","cow","crocodile","dog","elephant","giraffe","hedgehog","horse","kangaroo","lion","monkey","mouse","panda","pig","rabbit","raccoon","rhinoceros","sea turtle","sheep","squirrel","tiger","zebra"],
  "ship":["aircraft carrier","canoe","sailboat","cruise ship","speedboat"],
  "technology":["calculator","camera","cell phone","computer","laptop","megaphone","microphone","microwave","radio","remote control","telephone","television"],
  "tool":["axe","broom","hammer","knife","pliers","rake","rifle","saw","shovel","sword","toothbrush"],
  "vehicle":["ambulance","bicycle","bulldozer","bus","car","firetruck","motorbike","pickup truck","police car","school bus","tractor","train","truck","van"],
}
NN.CLASSES = Object.keys(NN.CLASS2OBJECTS).sort();
NN.OBJECTS = [].concat(...NN.CLASSES.map((x)=>NN.CLASS2OBJECTS[x])).sort()
NN.NUM_OBJECTS = NN.OBJECTS.length;

NN.IMAGE_W = 32,
NN.IMAGE_H = 32,
NN.IMAGE_SIZE = NN.IMAGE_H * NN.IMAGE_W;
NN.NUM_CLASSES = NN.CLASSES.length;
NN.SAMPLE_PER_CLASS = 7800;
NN.TEST_PER_CLASS = 200;
NN.NUM_DATASET_ELEMENTS = (NN.SAMPLE_PER_CLASS+NN.TEST_PER_CLASS) * NN.NUM_CLASSES;
NN.NUM_TRAIN_ELEMENTS = NN.SAMPLE_PER_CLASS * NN.NUM_CLASSES;
NN.NUM_TEST_ELEMENTS = NN.NUM_DATASET_ELEMENTS - NN.NUM_TRAIN_ELEMENTS;
NN.IMAGES_SPRITE_PATH ='https://cdn.glitch.com/020962cd-097d-4482-80ac-da19c192c845%2Fquickdraw_image_17.png?1556327507101';
NN.LABELS_PATH ='https://cdn.glitch.com/020962cd-097d-4482-80ac-da19c192c845%2Fquickdraw_labels_uint8_17?1556327333064';
NN.EPOCHS = 50;
NN.model = undefined;
NN.data = undefined;

NN.DESCRIPTION = `A <i>Quick, Draw!</i> knock-off based on a ConvNet for MNIST trained on a ${NN.CLASSES.length} class, ${NN.NUM_TRAIN_ELEMENTS} drawings re-categorized version of quickdraw containing ${NN.NUM_OBJECTS} classes of the original dataset.`


/**
 * A class that fetches the sprited dataset and provide data as
 * tf.Tensors.
 */
NN.Dataset = class {
  constructor() {}
  async load() {
    // Make a request for the sprited image.
    const img = new Image();
    const canvas = document.createElement('canvas');
    // document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const imgRequest = new Promise((resolve, reject) => {
      img.crossOrigin = '';
      img.onload = () => {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        const datasetBytesBuffer =
            new ArrayBuffer(NN.NUM_DATASET_ELEMENTS * NN.IMAGE_SIZE * 4);

        const chunkSize = 2;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < NN.NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
              datasetBytesBuffer, i * NN.IMAGE_SIZE * chunkSize * 4,
              NN.IMAGE_SIZE * chunkSize);
          ctx.drawImage(
              img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width,
              chunkSize);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          for (let j = 0; j < imageData.data.length / 4; j++) {
            // All channels hold an equal value since the image is grayscale, so
            // just read the red channel.
            datasetBytesView[j] = imageData.data[j * 4] / 255;
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer);
        // console.log(this.datasetImages);

        resolve();
      };
      img.src = NN.IMAGES_SPRITE_PATH;
    });

    const labelsRequest = fetch(NN.LABELS_PATH);
    const [imgResponse, labelsResponse] =
        await Promise.all([imgRequest, labelsRequest]);

    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

    // Slice the the images and labels into train and test sets.
    this.trainImages =
        this.datasetImages.slice(0, NN.IMAGE_SIZE * NN.NUM_TRAIN_ELEMENTS);
    this.testImages = this.datasetImages.slice(NN.IMAGE_SIZE * NN.NUM_TRAIN_ELEMENTS);
    this.trainLabels =
        this.datasetLabels.slice(0, NN.NUM_CLASSES * NN.NUM_TRAIN_ELEMENTS);
    this.testLabels =
        this.datasetLabels.slice(NN.NUM_CLASSES * NN.NUM_TRAIN_ELEMENTS);
    
  }

  /**
   * Get all training data as a data tensor and a labels tensor.
   *
   * @returns
   *   xs: The data tensor, of shape `[numTrainExamples, 28, 28, 1]`.
   *   labels: The one-hot encoded labels tensor, of shape
   *     `[numTrainExamples, 10]`.
   */
  getTrainData() {
    console.log([this.trainImages.length / NN.IMAGE_SIZE, NN.IMAGE_H, NN.IMAGE_W, 1]);
    const xs = tf.tensor4d(
        this.trainImages,
        [this.trainImages.length / NN.IMAGE_SIZE, NN.IMAGE_H, NN.IMAGE_W, 1]);
    const labels = tf.tensor2d(
        this.trainLabels, [this.trainLabels.length / NN.NUM_CLASSES, NN.NUM_CLASSES]);
    return {xs, labels};
  }

  /**
   * Get all test data as a data tensor a a labels tensor.
   *
   * @param {number} numExamples Optional number of examples to get. If not
   *     provided,
   *   all test examples will be returned.
   * @returns
   *   xs: The data tensor, of shape `[numTestExamples, 28, 28, 1]`.
   *   labels: The one-hot encoded labels tensor, of shape
   *     `[numTestExamples, 10]`.
   */
  getTestDataRandom(numExamples) {
    var indices = []
    for (var i = 0; i < numExamples; i++){
      indices.push(Math.floor(Math.random()*NN.NUM_TEST_ELEMENTS));
    }
    indices = tf.tensor1d(indices,'int32');
    let xs = tf.tensor4d(
        this.testImages,
        [this.testImages.length / NN.IMAGE_SIZE, NN.IMAGE_H, NN.IMAGE_W, 1]);
    let labels = tf.tensor2d(
        this.testLabels, [this.testLabels.length / NN.NUM_CLASSES, NN.NUM_CLASSES]);

    if (numExamples != null) {
      xs = xs.gather(indices);
      labels = labels.gather(indices);
    }
    
    return {xs, labels};
  }
  getTestData(numExamples) {
    let xs = tf.tensor4d(
        this.testImages,
        [this.testImages.length / NN.IMAGE_SIZE, NN.IMAGE_H, NN.IMAGE_W, 1]);
    let labels = tf.tensor2d(
        this.testLabels, [this.testLabels.length / NN.NUM_CLASSES, NN.NUM_CLASSES]);

    if (numExamples != null) {
      xs = xs.slice([0, 0, 0, 0], [numExamples, NN.IMAGE_H, NN.IMAGE_W, 1]);
      labels = labels.slice([0, 0], [numExamples, NN.NUM_CLASSES]);
    }
    return {xs, labels};
  }
}

NN.loadData = async function(){
  NN.data = new NN.Dataset();
  await NN.data.load();  
}

NN.saveModel = async function(){
  await NN.model.save('downloads://tfjs-model-'+Math.random().toString().slice(2));
}

NN.loadModel = async function(){
  NN.model = await tf.loadLayersModel('models/tfjs-model-6862016756513443.json');
}

NN.newModel = function() {
  // Create a sequential neural network model. tf.sequential provides an API
  // for creating "stacked" models where the output from one layer is used as
  // the input to the next layer.
  const model = tf.sequential();

  // The first layer of the convolutional neural network plays a dual role:
  // it is both the input layer of the neural network and a layer that performs
  // the first convolution operation on the input. It receives the 28x28 pixels
  // black and white images. This input layer uses 16 filters with a kernel size
  // of 5 pixels each. It uses a simple RELU activation function which pretty
  // much just looks like this: __/
  model.add(tf.layers.conv2d({
    inputShape: [NN.IMAGE_H, NN.IMAGE_W, 1],
    kernelSize: 5,
    filters: 32,
    activation: 'relu'
  }));

  // After the first layer we include a MaxPooling layer. This acts as a sort of
  // downsampling using max values in a region instead of averaging.
  // https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks
  model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));

  // Our third layer is another convolution, this time with 32 filters.
  model.add(tf.layers.conv2d({kernelSize: 5, filters: 64, activation: 'relu'}));

  // Max pooling again.
  model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));

  // Add another conv2d layer.
  model.add(tf.layers.conv2d({kernelSize: 3, filters: 64, activation: 'relu'}));
  
  // Now we flatten the output from the 2D filters into a 1D vector to prepare
  // it for input into our last layer. This is common practice when feeding
  // higher dimensional data to a final classification output layer.
  model.add(tf.layers.flatten({}));

  model.add(tf.layers.dense({units: 512, activation: 'relu'}));
  
  model.add(tf.layers.dropout({rate:0.5}));

  // Our last layer is a dense layer which has 10 output units, one for each
  // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Here the classes actually
  // represent numbers, but it's the same idea if you had classes that
  // represented other entities like dogs and cats (two output classes: 0, 1).
  // We use the softmax function as the activation for the output layer as it
  // creates a probability distribution over our 10 classes so their output
  // values sum to 1.
  model.add(tf.layers.dense({units: NN.NUM_CLASSES, activation: 'softmax'}));
  NN.model = model;
}



NN.train = async function train() {
  var canv_g = document.createElement("canvas");
  canv_g.width = 800;
  canv_g.height = 400;
  var ctx_g = canv_g.getContext('2d');
  ctx_g.fillStyle = "silver";
  ctx_g.fillRect(0,0,canv_g.width,canv_g.height);
  
  document.body.appendChild(canv_g);
  
  console.log('Training model...');

  // Now that we've defined our model, we will define our optimizer. The
  // optimizer will be used to optimize our model's weight values during
  // training so that we can decrease our training loss and increase our
  // classification accuracy.

  // We are using rmsprop as our optimizer.
  // An optimizer is an iterative method for minimizing an loss function.
  // It tries to find the minimum of our loss function with respect to the
  // model's weight parameters.
  const optimizer = 'adam';

  // We compile our model by specifying an optimizer, a loss function, and a
  // list of metrics that we will use for model evaluation. Here we're using a
  // categorical crossentropy loss, the standard choice for a multi-class
  // classification problem like MNIST digits.
  // The categorical crossentropy loss is differentiable and hence makes
  // model training possible. But it is not amenable to easy interpretation
  // by a human. This is why we include a "metric", namely accuracy, which is
  // simply a measure of how many of the examples are classified correctly.
  // This metric is not differentiable and hence cannot be used as the loss
  // function of the model.
  NN.model.compile({
    optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  // Batch size is another important hyperparameter. It defines the number of
  // examples we group together, or batch, between updates to the model's
  // weights during training. A value that is too low will update weights using
  // too few examples and will not generalize well. Larger batch sizes require
  // more memory resources and aren't guaranteed to perform better.
  const batchSize = 320;

  // Leave out the last 15% of the training data for validation, to monitor
  // overfitting during training.
  const validationSplit = 0;

  // Get number of training epochs from the UI.
  const trainEpochs = NN.EPOCHS;

  // We'll keep a buffer of loss and accuracy values over time.
  let trainBatchCount = 0;

  const trainData = NN.data.getTrainData();
  const testData = NN.data.getTestData();

  const totalNumBatches =
      Math.ceil(trainData.xs.shape[0] * (1 - validationSplit) / batchSize) *
      trainEpochs;

  // During the long-running fit() call for model training, we include
  // callbacks, so that we can plot the loss and accuracy values in the page
  // as the training progresses.

  function evaluateTest(epoch){
    
    const testResult = NN.model.evaluate(testData.xs, testData.labels);
    const testAccPercent = testResult[1].dataSync()[0] * 100;
    console.log(`Epoch test accuracy: ${testAccPercent.toFixed(1)}%`);
    ctx_g.fillStyle = "red";
    ctx_g.fillRect(canv_g.width * (epoch+1)/NN.EPOCHS, canv_g.height*(1-testResult[1].dataSync()[0]), 3, 3);
  }
  
  await NN.model.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationSplit,
    epochs: trainEpochs,
    shuffle: true,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        trainBatchCount++;
        ctx_g.fillStyle = "black";
        ctx_g.fillRect(canv_g.width * trainBatchCount / totalNumBatches, canv_g.height*(1-logs.acc), 1, 1);
        if (trainBatchCount % 20 == 0){
          // console.log(`${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%`, "train loss:",logs.loss)
          console.log(`${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%`, "train accuracy:",logs.acc)
        }
        await tf.nextFrame();
      },
      onEpochEnd: async (epoch, logs) => {
        evaluateTest(epoch);
        await NN.test();
        // await NN.model.save('localstorage://tfjs-tmp-ckpt-'+epoch);
        await tf.nextFrame();
      }
    }
  });
  await NN.test();

}


NN.drawTensor1D = function(image, canvas) {
  const [width, height] = [NN.IMAGE_W, NN.IMAGE_H];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = data[i] * 255;
    imageData.data[j + 1] = data[i] * 255;
    imageData.data[j + 2] = data[i] * 255;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}



NN.test = async function (){
  var res_div = document.getElementById("test-result");
  if (!res_div){
    res_div = document.createElement('div');
    res_div.id = "test-result";
    document.body.appendChild(res_div);
  }
  res_div.innerHTML = "";
  
  function show(batch, predictions, labels, probdist) {
    var correctCnt = 0;
    var confusion = [];
    for (var i = 0; i < NN.NUM_CLASSES; i++){
      confusion[i] = [];
      for (var j = 0; j < NN.NUM_CLASSES; j++){
        confusion[i][j] = 0;
      }
    }
    const testExamples = batch.xs.shape[0];

    for (let i = 0; i < testExamples; i++) {
      const image = batch.xs.slice([i, 0], [1, batch.xs.shape[1]]);
      const div = document.createElement('div');

      const canvas = document.createElement('canvas');
      NN.drawTensor1D(image.flatten(), canvas);
      canvas.style.display = "inline-block";

      const pred = document.createElement('span');

      const prediction = predictions[i];
      const label = labels[i];
      const correct = prediction === label;
      if (correct){
        correctCnt ++;
      }
      confusion[label][prediction] ++;
      var col = correct ? "green" : (NN.CLASSES[label] == probdist[i][1][0] ? "orange" : (NN.CLASSES[label] == probdist[i][2][0] ? "OrangeRed" : "red"))
      div.style.color="white"
      div.style.background =col
      pred.innerHTML = `TRUTH:${NN.CLASSES[label]} ${correct?"==":"!="} GUESS:${JSON.stringify(probdist[i].slice(0,3))}`;

      div.appendChild(canvas);
      div.appendChild(pred);
      res_div.appendChild(div);
    }
    var cf_div = document.createElement('div');
    var cf_str = "<table>"
    for (var i = 0; i < confusion.length; i++){
      if (i == 0){
        cf_str += `<tr><td></td><td></td>`
        for (var j = 0; j < confusion[i].length; j++){
          cf_str += `<td><b>${j}</b></td>`
        }
        cf_str += `</tr>`
      }
      var accu = confusion[i][i]/confusion[i].reduce((a,b)=>(a+b));

      cf_str += `<tr><td style="white-space: nowrap;"><b>${i}</b> ${NN.CLASSES[i]}</td><td>(${Math.round(accu*100)}%)</td>`
      for (var j = 0; j < confusion[i].length; j++){
        cf_str += `<td>${confusion[i][j]}</td>`
      }
      cf_str += "</tr>"
    }
    cf_str += "</table>";
    cf_div.innerHTML += cf_str;
    
    res_div.insertBefore(cf_div,res_div.childNodes[0]);
    console.log("accuracy:",correctCnt/testExamples)
    
  }  
  
  
  const testExamples = NN.TEST_PER_CLASS*NN.NUM_CLASSES;
  const examples = NN.data.getTestData(testExamples);

  // Code wrapped in a tf.tidy() function callback will have their tensors freed
  // from GPU memory after execution without having to call dispose().
  // The tf.tidy callback runs synchronously.
  tf.tidy(() => {
    const output = NN.model.predict(examples.xs);

    // tf.argMax() returns the indices of the maximum values in the tensor along
    // a specific axis. Categorical classification tasks like this one often
    // represent classes as one-hot vectors. One-hot vectors are 1D vectors with
    // one element for each output class. All values in the vector are 0
    // except for one, which has a value of 1 (e.g. [0, 0, 0, 1, 0]). The
    // output from model.predict() will be a probability distribution, so we use
    // argMax to get the index of the vector element that has the highest
    // probability. This is our prediction.
    // (e.g. argmax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
    // dataSync() synchronously downloads the tf.tensor values from the GPU so
    // that we can use them in our normal CPU JavaScript code
    // (for a non-blocking version of this function, use data()).
    // console.log(output.dataSync());
    var _probdist = output.dataSync();
    var probdist = [];
    for (var i = 0; i < testExamples; i++){
      probdist[i] = []
      for (var j = 0; j < NN.NUM_CLASSES; j++){
        probdist[i].push([NN.CLASSES[j],_probdist[i*NN.NUM_CLASSES+j]]);
      }
      probdist[i].sort((a,b)=>(b[1]-a[1]));
    }
    const axis = 1;
    const labels = Array.from(examples.labels.argMax(axis).dataSync());
    const predictions = Array.from(output.argMax(axis).dataSync());

    show(examples,predictions, labels, probdist);
  });
}



NN.predictRaster = function(canvas, callback){
  var ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var arr = [];
  for (let i = 0; i < imageData.data.length / 4; i++) {
    arr[i] = imageData.data[i * 4] / 255;
  }
  const xs = tf.tensor4d(new Float32Array(arr), [1, NN.IMAGE_H, NN.IMAGE_W, 1]);
  return tf.tidy(() => {
    const output = NN.model.predict(xs);
    var _probdist = output.dataSync();
    var probdist = [];
    for (var i = 0; i < NN.NUM_CLASSES; i++){
      probdist.push([NN.CLASSES[i],_probdist[i]]);
    }
    probdist.sort((a,b)=>(b[1]-a[1]));
    return probdist;
  });
}


NN.predict = function(strokes){
  var canvas = document.createElement("canvas");
  canvas.width = NN.IMAGE_W;
  canvas.height = NN.IMAGE_H;
  var context = canvas.getContext('2d');
  function brect(P){
    var xmin = Infinity
    var xmax = -Infinity
    var ymin = Infinity
    var ymax = -Infinity
    for (var i = 0; i < P.length; i++){
      if (P[i][0] < xmin){xmin = P[i][0]}
      if (P[i][0] > xmax){xmax = P[i][0]}
      if (P[i][1] < ymin){ymin = P[i][1]}
      if (P[i][1] > ymax){ymax = P[i][1]}
    }
    return {
      x:xmin,y:ymin,width:xmax-xmin,height:ymax-ymin
    }
  }
  function draw_strokes(ctx,strokes){
    for (var i = 0; i < strokes.length; i++){
      ctx.beginPath();
      for (var j = 0; j < strokes[i].length; j++){
        if (j == 0){
          ctx.moveTo(strokes[i][j][0], strokes[i][j][1]);
        }else{
          ctx.lineTo(strokes[i][j][0], strokes[i][j][1]);
        }
      }
      ctx.stroke(); 
    }
  }
  context.lineWidth = 1;
  context.fillStyle="black";
  context.fillRect(0,0,NN.IMAGE_W,NN.IMAGE_H);
  context.strokeStyle="white";
  var box = brect([].concat(...strokes));
  var scale = Math.min(NN.IMAGE_W/box.width, NN.IMAGE_H/box.height);
  draw_strokes(context,strokes.map(x=>(x.map((y)=>([(y[0]-box.x)*scale,(y[1]-box.y)*scale])))));

  var probdist = NN.predictRaster(canvas);
  return {
    prediction:probdist[0][0],
    probabilityDistribution: probdist,
    layer0: canvas,
  }
}