let video;
let handpose;
let predictions = [];

// 視角與旋轉變數
let angleX = 0;
let angleY = 0;
let topLayerAngle = 0; // 頂層獨立旋轉的角度
let isPinching = false; // 判斷是否捏合

// 魔術方塊設定
let blockSize = 40;
let spacing = 42;

function setup() {
  createCanvas(640, 480, WEBGL);
  
  // 啟動攝影機
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 載入 ml5.js 手部辨識模型
  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("模型準備完成！");
  document.getElementById('loading').style.display = 'none'; // 隱藏載入文字
}

function draw() {
  background(30);

  // 打光設定
  ambientLight(150);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  pointLight(255, 200, 200, 0, 0, 200);

  // 處理手勢辨識邏輯
  if (predictions.length > 0) {
    let hand = predictions[0].annotations;
    
    // 取得食指與大拇指指尖座標
    let indexFinger = hand.indexFinger[3];
    let thumb = hand.thumb[3];
    
    let indexX = indexFinger[0];
    let indexY = indexFinger[1];
    let thumbX = thumb[0];
    let thumbY = thumb[1];

    // 1. 食指位置控制整體 3D 視角 (映射到 -PI 到 PI)
    angleY = lerp(angleY, map(indexX, 0, width, -PI, PI), 0.1);
    angleX = lerp(angleX, map(indexY, 0, height, -PI, PI), 0.1);

    // 2. 計算食指與大拇指的距離，判斷是否「捏合」
    let pinchDistance = dist(indexX, indexY, thumbX, thumbY);
    if (pinchDistance < 40) {
      isPinching = true;
    } else {
      isPinching = false;
    }
  }

  // 如果觸發捏合動作，頂層不斷旋轉
  if (isPinching) {
    topLayerAngle += 0.1;
  }

  // 繪製畫面上的提示 UI（需先切換回 2D 矩陣）
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);
  fill(255);
  textSize(16);
  noStroke();
  text(isPinching ? "狀態：旋轉頂層中！" : "狀態：移動手指觀看方塊，捏合手指轉動頂層", 20, 30);
  pop();

  // 套用整體視角旋轉
  rotateX(angleX);
  rotateY(angleY);

  // 繪製 3D 魔術方塊
  drawRubiksCube();
}

function drawRubiksCube() {
  // x, y, z 迴圈建立 3x3x3 陣列
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        push();
        
        // 如果是頂層 (y == -1)，且正在發生旋轉，則套用獨立的旋轉矩陣
        if (y === -1) {
          rotateY(topLayerAngle);
        }

        // 定位每個小方塊
        translate(x * spacing, y * spacing, z * spacing);
        
        // 幫不同層設定不同的顏色，增加魔術方塊的層次感
        stroke(20);
        strokeWeight(2);
        if (y === -1) fill(255, 50, 50);       // 頂層：紅色
        else if (y === 0) fill(50, 255, 50);   // 中層：綠色
        else fill(50, 50, 255);                // 底層：藍色
        
        box(blockSize);
        pop();
      }
    }
  }
}
