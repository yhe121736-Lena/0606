// ==========================================
// 深海觀測站：414730191 號生存守則（心理恐怖進階防災版）
// ==========================================

let video;
let classifier;
let isVideoAvailable = false;
let isModelLoaded = false;

// ⚠️ 【重要】請在下方替換成你在 Teachable Machine 訓練好的手勢模型網址
let modelURL = 'https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/'; 

// 遊戲核心狀態
let gameMode = "NORMAL"; // NORMAL, ALERT_OK, ALERT_LIKE, ALERT_HIDE, GAMEOVER, WIN
let label = "等待系統初始化...";
let confidence = 0.0;

// 玩家生存三大指標
let oxygen = 100;
let sanity = 100;
let gameTimer = 180; // 3 分鐘快節奏求生 (180秒)
let alertTimer = 0;

// 古神偽裝機制 (規則怪談精髓)
let isRuleFake = false; 

// AI 訊號防抖動（Debounce）核心變數
let currentDetectedLabel = "";
let lastVerifiedLabel = "None";
let debounceCounter = 0;
const DEBOUNCE_THRESHOLD = 6; 

// 視覺粒子系統
let seaweeds = [];
let planktons = [];

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  
  // 【防崩潰機制 1】嘗試初始化攝影機，失敗則捕捉錯誤不讓程式卡死
  try {
    video = createCapture(VIDEO, function(stream) {
      isVideoAvailable = true;
      console.log("414730191 觀測站：視訊裝置啟動成功。");
    });
    video.size(320, 240);
    video.hide();
  } catch (e) {
    isVideoAvailable = false;
    console.warn("414730191 觀測站警告：未檢測到可用攝影機，已自動啟用鍵盤純享模式。");
  }

  // 【防崩潰機制 2】檢查是否填寫模型網址，避免盲目載入噴 404
  if (modelURL.includes("YOUR_MODEL_ID")) {
    console.warn("414730191 觀測站警告：當前使用的是範例網址，AI 辨識暫時離線。請使用鍵盤 1, 2, 3 進行測試。");
  } else {
    // 只有在網址被修改後，才真正執行載入
    classifier = ml5.imageClassifier(modelURL + 'model.json', video, modelReady);
  }

  // 建立深海動態海草環境
  for (let i = 0; i < 12; i++) {
    seaweeds.push(new Seaweed(random(width), height, random(50, 90)));
  }
}

function modelReady() {
  isModelLoaded = true;
  console.log("414730191 觀測站：AI 手勢雲端模型佈署完成。");
  if (isVideoAvailable) {
    classifier.classify(video, gotResult);
  }
}

function gotResult(error, results) {
  if (error || !isModelLoaded) return;
  
  let detected = results[0].label;
  confidence = results[0].confidence;

  // 當進入古神凝視事件，若玩家伸手遮擋鏡頭導致全黑(Confidence極低)或 Background，自動轉換為 "HIDE"
  if (gameMode === "ALERT_HIDE" && (confidence < 0.25 || detected === "Background")) {
    detected = "HIDE";
  }

  // 防抖動濾波器演算法
  if (detected === currentDetectedLabel) {
    debounceCounter++;
    if (debounceCounter >= DEBOUNCE_THRESHOLD) {
      lastVerifiedLabel = detected;
    }
  } else {
    currentDetectedLabel = detected;
    debounceCounter = 0;
  }

  // 保持非同步無間斷監聽
  if (isVideoAvailable) {
    classifier.classify(video, gotResult);
  }
}

function draw() {
  // 基礎背景：幽暗深海色調
  background(4, 9, 18);

  if (gameMode !== "GAMEOVER" && gameMode !== "WIN") {
    
    // 心理恐怖效果 1：當理智值低於 50%，整個畫面會隨機產生劇烈震動
    push();
    if (sanity < 50 && random(1) < 0.18) {
      translate(random(-8, 8), random(-4, 4));
    }
    
    updateGameLogic();
    drawEnvironment();
    drawFlashlightOverlay();
    drawUI();
    
    pop(); 

    // 心理恐怖效果 2：當理智值低於 30%，手電筒隨機發生故障，畫面瞬間全黑
    if (sanity < 30 && frameCount % 45 < 6) {
      background(0);
      fill(255, 0, 55, 180);
      textSize(24);
      textAlign(CENTER, CENTER);
      text("【 警告：生命維持視覺訊號中斷 】", width/2, height/2);
    }

  } else {
    drawEndScreen();
  }
}

function updateGameLogic() {
  if (frameCount % 60 === 0 && gameTimer > 0) {
    gameTimer--;
    
    // 隨機事件觸發
    if (gameMode === "NORMAL" && random(1) < 0.4 && gameTimer % 5 === 0) {
      let events = ["ALERT_OK", "ALERT_LIKE", "ALERT_HIDE"];
      gameMode = random(events);
      alertTimer = 6; 
      isRuleFake = random(1) < 0.35; // 35% 機率觸發「古神偽裝假規則」
    }
  }

  // 危機事件處理
  if (gameMode !== "NORMAL") {
    if (frameCount % 60 === 0) {
      alertTimer--;
      
      if (alertTimer <= 0) {
        if (!isRuleFake) {
          if (gameMode === "ALERT_OK") oxygen -= 30;
          if (gameMode === "ALERT_LIKE" || gameMode === "ALERT_HIDE") sanity -= 35;
        } else {
          sanity = min(100, sanity + 12); // 成功識破假規則，獎勵理智值
        }
        resetEvent();
      }
    }

    // 檢查動作回應
    let playerAction = lastVerifiedLabel;
    if (playerAction !== "None" && playerAction !== "") {
      if (isRuleFake) {
        // 中了古神的假規則誘騙
        sanity -= 25;
        oxygen -= 15;
        resetEvent();
      } else {
        // 正確執行真實規則
        if (gameMode === "ALERT_OK" && playerAction === "OK") resetEvent();
        if (gameMode === "ALERT_LIKE" && playerAction === "LIKE") resetEvent();
        if (gameMode === "ALERT_HIDE" && playerAction === "HIDE") resetEvent();
      }
    }
  } else {
    if (frameCount % 90 === 0) oxygen = max(0, oxygen - 1);
  }

  if (oxygen <= 0 || sanity <= 0) gameMode = "GAMEOVER";
  if (gameTimer <= 0) gameMode = "WIN";
}

function resetEvent() {
  gameMode = "NORMAL";
  lastVerifiedLabel = "None";
  isRuleFake = false;
}

function drawEnvironment() {
  for (let s of seaweeds) {
    s.update();
    s.display();
  }
  
  if (random(1) < 0.06) {
    planktons.push({x: random(width), y: height + 10, speed: random(1.2, 2.5), size: random(4, 7)});
  }
  
  fill(0, 220, 255, 160);
  noStroke();
  for (let i = planktons.length - 1; i >= 0; i--) {
    planktons[i].y -= planktons[i].speed;
    ellipse(planktons[i].x + sin(frameCount * 0.04 + i) * 6, planktons[i].y, planktons[i].size);
    if (planktons[i].y < -10) planktons.splice(i, 1);
  }

  if (gameMode === "ALERT_HIDE") {
    let eyePulse = map(sin(frameCount * 0.15), -1, 1, 80, 230);
    fill(255, 0, 55, eyePulse);
    ellipse(width/2 - 120, height/2 - 30, 50, 30);
    ellipse(width/2 + 120, height/2 - 30, 50, 30);
    fill(0);
    ellipse(width/2 - 120, height/2 - 30, 15, 15);
    ellipse(width/2 + 120, height/2 - 30, 15, 15);
  }
}

function drawFlashlightOverlay() {
  push();
  fill(3, 7, 15, 245); 
  rect(0, 0, width, height);
  
  erase();
  let flashlightRadius = map(sanity, 0, 100, 140, 240); // 理智值越低，手電筒視線範圍越小
  ellipse(mouseX, mouseY, flashlightRadius, flashlightRadius);
  noErase();
  
  stroke(0, 255, 102, 35);
  strokeWeight(12);
  noFill();
  ellipse(mouseX, mouseY, flashlightRadius, flashlightRadius);
  pop();
}

function drawUI() {
  // 左下角玩家視訊鏡頭（輔助校對）
  push();
  stroke(0, 255, 102, 180);
  strokeWeight(2);
  fill(0);
  rect(20, height - 150, 140, 105);
  
  if (isVideoAvailable && video) {
    image(video, 20, height - 150, 140, 105);
  } else {
    // 鏡頭未開啟時的科幻替代畫面
    fill(10, 25, 15);
    rect(20, height - 150, 140, 105);
    fill(0, 255, 102, 150);
    textSize(11);
    textAlign(CENTER, CENTER);
    text("CAM_OFFLINE\n鍵盤模擬模式啟動", 90, height - 100);
  }
  
  noStroke();
  fill(0, 255, 102);
  textSize(11);
  textAlign(LEFT);
  text(`AI FEED: ${lastVerifiedLabel}`, 25, height - 25);
  pop();

  // 上方儀表板
  fill(0, 255, 102);
  noStroke();
  textSize(14);
  text(`[ 👨‍🚀 氧氣儲量: ${oxygen}% ]`, 30, 40);
  
  if (sanity < 50) fill(255, 0, 55);
  text(`[ 🧠 精神理智: ${sanity}% ]`, 220, 40);
  
  fill(0, 255, 102);
  text(`[ ⚓ 觀測深度: 10,994 M ]`, 400, 40);
  
  let mins = floor(gameTimer / 60);
  let secs = gameTimer % 60;
  text(`[ ⏱️ 救援倒數: ${nf(mins,2)}:${nf(secs,2)} ]`, 600, 40);

  // 【硬核警示】如果網址沒改，在畫面最上方拉一條淡淡的提示線，告訴老師和自己現在是模擬狀態
  if (modelURL.includes("YOUR_MODEL_ID")) {
    push();
    fill(255, 150, 0, 180);
    textSize(11);
    textAlign(CENTER);
    text("⚠️ AI 處於離線模擬狀態。請點擊畫面，並按鍵盤 [1]=OK  [2]=👍  [3]=遮鏡頭 進行機制展示", width/2, height - 25);
    pop();
  }

  // 浮水印
  push();
  let uiAlpha = map(sin(frameCount * 0.06), -1, 1, 90, 255);
  fill(0, 255, 102, uiAlpha);
  textSize(13);
  textAlign(RIGHT);
  text("STATION_PROJECT_ID: 414730191", width - 30, height - 30);
  pop();

  if (gameMode !== "NORMAL") {
    drawAlertBanner();
  }
}

function drawAlertBanner() {
  push();
  rectMode(CENTER);
  
  if (isRuleFake) {
    stroke(160, 0, 255, map(sin(frameCount * 0.3), -1, 1, 120, 255));
    fill(18, 2, 32, 230);
  } else {
    stroke(255, 0, 55);
    fill(5, 5, 5, 210);
  }
  strokeWeight(3);
  rect(width/2, 135, 680, 95);

  textAlign(CENTER, CENTER);
  noStroke();
  
  if (isRuleFake) {
    fill(160, 0, 255);
    textSize(18);
    text(`⚠️ SYSTEM_ERROR_414730191_UNEXPECTED_SIGNAL ⚠️`, width/2, 115);
  } else {
    fill(255, 0, 55);
    textSize(18);
    text(`⚠️ 警告：請嚴格執行第 414730191 號觀測守則 ⚠️`, width/2, 115);
  }
  
  fill(255, 255, 255);
  textSize(14);
  let promptText = "";
  
  if (gameMode === "ALERT_OK") promptText = `高壓外洩！氣閥受損，請立刻在視訊前比出 [ OK ] 進行密封修復 (${alertTimer}s)`;
  if (gameMode === "ALERT_LIKE") promptText = `外壁有發光觸手貼近！請迅速 [ 比讚 👍 ] 釋放脈衝波進行溫和驅趕 (${alertTimer}s)`;
  if (gameMode === "ALERT_HIDE") promptText = `陰影掠過！有龐然大物正在直視窗口，立刻 [ 用手完全遮住鏡頭 ] 規避 (${alertTimer}s)`;
  
  if (isRuleFake && random(1) < 0.2) {
    promptText = "牠在幫你牠在幫你牠在幫你牠在幫你牠在幫你牠在幫你牠在幫你牠在幫你";
  }
  
  text(promptText, width/2, 150);
  pop();
}

function drawEndScreen() {
  textAlign(CENTER, CENTER);
  if (gameMode === "GAMEOVER") {
    fill(255, 0, 55);
    textSize(36);
    text("【 414730191 號觀測站 · 訊號中斷 】", width/2, height/2 - 30);
    fill(255, 255, 255);
    textSize(15);
    text("原因：未遵循深海怪談守則，理智崩潰或艙體解體。你已被深海完全吞噬。", width/2, height/2 + 25);
  } else if (gameMode === "WIN") {
    fill(0, 255, 102);
    textSize(36);
    text("【 觀測艙成功破浪浮上海面 】", width/2, height/2 - 30);
    fill(255, 255, 255);
    textSize(15);
    text("恭喜！你成功靠著冷靜理智守住了 414730191 生存守則，順利迎來破曉的救援。", width/2, height/2 + 25);
  }
}

// ⌨️ 鍵盤後備救援系統
function keyPressed() {
  if (key === '1') {
    lastVerifiedLabel = "OK";
    console.log("偵錯模式：手勢變更為 [OK]");
  } else if (key === '2') {
    lastVerifiedLabel = "LIKE";
    console.log("偵錯模式：手勢變更為 [LIKE]");
  } else if (key === '3') {
    lastVerifiedLabel = "HIDE";
    console.log("偵錯模式：手勢變更為 [HIDE]");
  } else if (key === '0') {
    oxygen = 100;
    sanity = 100;
    gameTimer = 180;
    resetEvent();
    console.log("偵錯模式：觀測站重設成功。");
  }
}

class Seaweed {
  constructor(x, y, h) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.angle = random(200);
    this.wobbleSpeed = random(0.015, 0.035);
  }
  
  update() {
    this.angle += this.wobbleSpeed;
  }
  
  display() {
    push();
    stroke(1, 130, 80, 110);
    strokeWeight(5);
    noFill();
    beginShape();
    let currentX = this.x;
    let currentY = this.y;
    vertex(currentX, currentY);
    
    for (let i = 0; i < this.height; i += 12) {
      currentY -= 12;
      currentX += sin(this.angle + currentY * 0.04) * 2.5;
      vertex(currentX, currentY);
    }
    endShape();
    
    noStroke();
    let glowingGlow = map(sin(this.angle * 2.5), -1, 1, 120, 255);
    fill(0, 255, 150, glowingGlow);
    ellipse(currentX, currentY, 7);
    pop();
  }
}