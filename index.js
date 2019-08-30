var classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
let net;
let count1 = 0, count2 = 0, count3 = 0;

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => {
    addExample(0);
    count1++;
  }
  );
  document.getElementById('class-b').addEventListener('click', () => {
    addExample(1);
    count2++}
  );
  document.getElementById('class-c').addEventListener('click', () => {
    addExample(2);
    count3++}
  );
  document.getElementById('class-reset').addEventListener('click', () => {
    classifier = knnClassifier.create();
    count1 = 0;
    count2 = 0;
    count3 = 0;
    document.getElementById('result-table').innerHTML = `
    <tr>
      <td>Count of Class A</td>
      <td>0</td>
    </tr>
    <tr>
      <td>Count of Class A</td>
      <td>0</td>
    </tr>
    <tr>
      <td>Count of Class A</td>
      <td>0</td>
    </tr>
    <tr>
      <td>Prediction</td>
      <td>-</td>
    </tr>
    <tr>
      <td>Probability</td>
      <td>0</td>
    </tr>`}
  );

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from t5he classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['A', 'B', 'C'];

      document.getElementById('result-table').innerHTML = `
      <tr>
        <td>Count of Class A</td>
        <td>${count1}</td>
      </tr>
      <tr>
        <td>Count of Class A</td>
        <td>${count2}</td>
      </tr>
      <tr>
        <td>Count of Class A</td>
        <td>${count3}</td>
      </tr>
      <tr>
        <td>Prediction</td>
        <td>Class ${classes[result.classIndex]}</td>
      </tr>
      <tr>
        <td>Probability</td>
        <td>${Math.round(100*result.confidences[result.classIndex],2)}\%</td>
      </tr>
      `;
    }

    // Give some breathing room by waiting for the next animation frame to
    // fire.
    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();
