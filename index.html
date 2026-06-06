let video;
let handpose;
let predictions = [];
let angleX = 0;
let angleY = 0;

function setup() {
  // 必須啟用 WEBGL 模式才能畫 3D
  createCanvas(640, 480, WEBGL);
  
  // 1. 設定視訊鏡頭
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // 隱藏原本的 HTML 影片元素，我們要在 canvas 裡畫出來

  // 2. 載入 ml5.js 的手部辨識模型
  handpose = ml5.handpose(video, modelReady);
  
  // 監聽辨識結果
  handpose.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("AI 手部辨識模型已準備就緒！");
}

function draw() {
  background(50);

  // 3. 打光，讓 3D 物件更有立體感
  ambientLight(150);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);

  // 4. 處理手勢邏輯
  if (predictions.length > 0) {
    // 取得食指指尖 (indexFinger 的第 3 個節點) 的 X 和 Y 座標
    let indexFinger = predictions[0].annotations.indexFinger[3];
    let fingerX = indexFinger[0];
    let fingerY = indexFinger[1];
    
    // 將手指的座標映射 (map) 成旋轉的角度
    angleY = map(fingerX, 0, width, -PI, PI);
    angleX = map(fingerY, 0, height, -PI, PI);
  }

  // 5. 套用旋轉角度
  rotateX(angleX);
  rotateY(angleY);

  // 6. 繪製 3x3x3 的魔術方塊
  drawRubiksCube();
}

// 繪製魔術方塊的自訂函式
function drawRubiksCube() {
  let blockSize = 40; // 每個小方塊的大小
  let spacing = 42;   // 小方塊之間的間距 (比大小稍微大一點點，產生縫隙)

  // 使用三個迴圈建立 3x3x3 的陣列感
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        push();
        // 計算每個小方塊的 3D 位置
        translate(x * spacing, y * spacing, z * spacing);
        
        // 設定小方塊的外觀
        stroke(0);        // 黑色邊框
        strokeWeight(2);
        fill(200);        // 灰色底色 (若要寫六面不同顏色，需改用自訂幾何體)
        
        box(blockSize);   // 畫出立方體
        pop();
      }
    }
  }
}
