let walkSpriteSheet; 
let standSpriteSheet; 
let jumpSpriteSheet; 
let jumpMoveSpriteSheet; 
let fallingSpriteSheet; 
let attackSpriteSheet;  
let squatSpriteSheet;      
let squatMoveSpriteSheet;  
let muzzleFlashImg;     
let hitEffectImg;       

let characterX = 100;  
let characterY = 100;  
let velocityY = 0; 
let gravity = 0.8; 
let jumpStrength = -20; 

let facingDirection = 1; 
let currentFrame = 0; 
let lastFrameTime = 0; 
let previousAnimation = "stand"; 
let animationState = "stand"; 

// 裝置控制模式 ("PC" | "MOBILE") 與視角縮放設定
let controlMode = "PC";
let viewZoom = 1.0;
let autoFitMobileZoom = true;
let showSettingsModal = false;
let showExitMapConfirmModal = false;
let showItemGuides = true;
let mobileDashLocked = false;
let dashToggleActive = false; // <--- 新增這 3 行
let chronoWaveTimer = 0;
let safePositionHistory = [];
// <--- 新增以下變數：2-1 地下秘室 + 2-4 黑暗礦坑火把與頭燈系統
let is2_1SubSecret = false;        // 是否正在 2-1 神秘流沙地下 20 秒秘室中
let quicksandExitMode = false;
let quicksandFadeInTimer = -9999;
window.isInMinerSupplyRoom = false; // 是否正在 2-4 全亮礦工裝備補給密室中
let saved2_4MainState = null;       // 暫存 2-4 主礦坑狀態
let torchCount = 0;                // 額外道具欄：火把數量（消耗品）
let placedTorches = [];            // 場上已擺放的火把座標 [{x, y}]
let hasMinerHeadlamp = false;      // 是否戴上礦工頭燈（梯形手電筒光束）
let minerLampPickup = null;        // 2-4 開場地上的頭燈裝備架 {x, y, taken}
let endClearBonusSmoke = [];       // 拉旗結算時頭燈與火把化為白煙特效
// <--- 新增以下變數：沙暴巨蟲 BOSS 系統、拯救新角色過場動畫、角色切換系統
let sandwormBoss = null;           // 2-5 沙暴巨蟲實體
let wormRocks = [];                // 招式1：巨石下落陣列
let playerStunTimer = 0;           // 衝刺菇撞到巨蟲刺甲後的 3 秒自暈計時器
let unlockedNewChar = false;       // 是否已擊敗沙暴巨蟲並解鎖新角色
let activeCharacterId = 0;         // 0 = 原本主角, 1 = 解放的新角色（可按 C 切換）
let rescueCutscene = null;         // 走出神殿大門後的拯救新角色過場動畫狀態

// 遊戲畫面與關卡狀態
let gameState = "DEVICE_SELECT"; 
let currentLevel = 1;   
let is1_2Intro = false; 
let stateTimer = 0;     
let castleTargetX = 0;  
let hideCharacter = false; 
let isExitingPipe = false;
let isExitingCeilingPipe = false;
let flagDropY = 0;
let castleFlagRaised = false;
let castleFlagProgress = 0;
let castleRoofTopY = 0;

// 手機觸控虛擬按鍵狀態
let touchControls = {
  left: false,
  right: false,
  down: false,
  jump: false,
  fire: false
};
let prevTouchJump = false;
let prevTouchFire = false;

// World Map 大地圖選關與多世界架構
let currentWorld = 1;          // 1 = 草原世界, 2 = 沙漠世界
let selectedMapNode = "1-1";   // 改用字串 ID（如 "1-1", "2-0", "2-SHOP", "2-1"）
let mapAvatarX = 0;
let mapAvatarY = 0;
let showMapItemDrawer = false;
let clearedLevels = [false, false, false, false, false]; // 保留相容性

// 1-4 通關前往 World 2 的過場動畫狀態
let worldTransition = {
  active: false,
  phase: "NONE",   // "WHITE_FLAG" -> "EXTEND_ROAD" -> "WALK_EDGE" -> "EXPAND_W2"
  dir: 1,          // 1 = 往右去 World 2, -1 = 往左回 World 1
  timer: 0,
  flagProgress: 0,
  roadProgress: 0,
  spotlightR: 9999
};

// 沙漠補給屋彈窗狀態
let showShopModal = false;
let shopItems = []; // 存放 [3階道具A, 3階道具B, "1up"]

// 全關卡節點資料庫（漸進解鎖＋雙終點分支）
// 全關卡節點資料庫（支援上下左右道路連線＋雙世界往返）
let mapNodesData = {
  // === World 1 ===
  "1-1": { id: "1-1", world: 1, label: "1-1", title: "草原起點",   type: "stage",  unlocked: true,  cleared: false, nextNormal: ["1-2"], neighbors: { right: "1-2" } },
  "1-2": { id: "1-2", world: 1, label: "1-2", title: "地下洞穴",   type: "stage",  unlocked: false, cleared: false, nextNormal: ["1-3"], neighbors: { left: "1-1", right: "1-3" } },
  "1-3": { id: "1-3", world: 1, label: "1-3", title: "黃昏浮島",   type: "stage",  unlocked: false, cleared: false, nextNormal: ["1-4"], neighbors: { left: "1-2", right: "1-4" } },
  "1-4": { id: "1-4", world: 1, label: "1-4", title: "熔岩魔王城", type: "castle", unlocked: false, cleared: false, nextNormal: ["WORLD2_INTRO"], neighbors: { left: "1-3", right: "TO_W2" } },

  // === World 2 沙漠大關（2-4 隱藏礦坑未解鎖前隱藏路線，Boss 房顯示為 2-4；解鎖後長出路線並把 Boss 改名為 2-5） ===
  "2-0":    { id: "2-0",    world: 2, label: "岔路",   title: "沙漠綠洲岔路", type: "junction", unlocked: true,  cleared: true, neighbors: { left: "TO_W1", up: "2-SHOP", right: "2-1", down: "2-1" } },
  "2-SHOP": { id: "2-SHOP", world: 2, label: "補給屋", title: "奇諾比奧帳篷", type: "shop",     unlocked: true,  cleared: false, isOpen: true, neighbors: { left: "2-0", down: "2-0" } },
  "2-1":    { id: "2-1",    world: 2, label: "2-1",    title: "黃沙綠洲",     type: "stage",    unlocked: true,  cleared: false, nextNormal: ["2-2"], nextSecret: ["2-4"], neighbors: { left: "2-0", up: "2-4", down: "2-2", right: "2-2" } },
  "2-2":    { id: "2-2",    world: 2, label: "2-2",    title: "無盡流沙海",   type: "stage",    unlocked: false, cleared: false, nextNormal: ["2-3"], neighbors: { left: "2-1", up: "2-1", right: "2-3" } },
  "2-3":    { id: "2-3",    world: 2, label: "2-3",    title: "太陽神殿",     type: "stage",    unlocked: false, cleared: false, nextNormal: ["2-5"], neighbors: { left: "2-2", up: "2-5", right: "2-5" } },
  "2-4":    { id: "2-4",    world: 2, label: "2-4",    title: "幽暗古礦坑",   type: "stage",    unlocked: false, cleared: false, nextNormal: ["2-5"], neighbors: { left: "2-1", down: "2-1", right: "2-5" } },
  "2-5":    { id: "2-5",    world: 2, label: "2-4",    title: "沙暴巨蟲巢穴", type: "castle",   unlocked: false, cleared: false, neighbors: { left: "2-3", down: "2-3" } }
};
let levelTimer = 400;
let checkpointState = {
  active: false,
  world: 1,
  level: 1,
  x: 100,
  y: 100
};
let isSecretClear = false;
let lastLevelTimerTick = 0;

// 進關前狀態快照（防止按 M 退出關卡洗道具）
let levelEntrySnapshot = { lives: 3, powerLevel: 1, powerType: "none", reservedItem: null, coinCount: 0, score: 0 };

// 首次獲得道具圖鑑說明系統
let seenPowerups = {};
let activeGuideData = null;
let guideOpenTime = 0;

const POWERUP_GUIDE_DB = {
  mushroom: {
    title: "超級蘑菇 (Super Mushroom)",
    color: "#E63946",
    desc: [
      "• 體型變大，獲得額外 1 點耐傷護盾！",
      "• 跳躍頂撞「紅磚塊」時可直接將其擊碎。",
      "• 受傷時會縮小回原狀，不會直接損失生命。"
    ]
  },
  fire: {
    title: "火焰花 (Fire Flower)",
    color: "#FF5400",
    desc: [
      "• 攻擊進化為「追蹤彈跳火焰彈」！",
      "• 射出的火球會自動微幅追蹤前方敵人與魔王。",
      "• 命中魔王可造成 3 倍高額傷害！"
    ]
  },
  feather: {
    title: "羽翼披風 (Feather Cape)",
    color: "#FFB703",
    desc: [
      "• 跳躍中再按跳躍鍵，可施展「二段振翅飛升」！",
      "• 每次騰空最多可連續振翅 2 次，輕鬆跨越深淵。",
      "• 滯空時具備緩降滑翔效果，方便精準落點。"
    ]
  },
  speed: {
    title: "疾風加速菇 (Speed Mushroom)",
    color: "#0096C7",
    desc: [
      "• 大幅提升最高奔跑速度與慣性衝刺距離！",
      "• 電腦版按一下 [Ctrl/Shift] 切換衝刺開關；手機版點一下 [DASH] 開啟。",
      "• 滿速衝刺時撞擊敵人可將其撞退並暈眩 3 秒。"
    ]
  },
  cactus: {
    title: "仙人掌刺甲菇 (Cactus Mushroom)",
    color: "#2D6A4F",
    desc: [
      "• 【沙漠專屬】按住蹲下 [↓/S] 展開尖刺護罩，可反殺撞過來的怪物並震碎仙人掌柱！",
      "• 按 [F] 射擊會發射「穿透仙人掌飛針」，可一路貫穿整排敵人。",
      "• 注意：站立或走路碰到怪物仍會受傷喔！"
    ]
  },
  chrono: {
    title: "時光沙漏菇 (Chrono Mushroom)",
    color: "#D97706",
    desc: [
      "• 【時間領域】按一下 [Ctrl/Shift]（手機點 [DASH]）展開廣域緩速場，瞬間震暈周圍敵人並可直接撞飛！",
      "• 【流沙免疫】踩在沙漠流沙坑上完全不下沉，如履平地。",
      "• 【時光倒流】致命墜落或受傷時自動消耗能力回溯至安全位置，免死一次！"
    ]
  },
  star: {
    title: "無敵星星 (Super Star)",
    color: "#FFD166",
    desc: [
      "• 8 秒內進入全彩閃爍無敵狀態！",
      "• 免疫所有怪物、火棒與魔王火球傷害。",
      "• 直接撞擊敵人即可將其撞飛並獲得額外分數！"
    ]
  }
};

function triggerFirstTimeItemGuide(type) {
  if (!showItemGuides) return false;
  if (!POWERUP_GUIDE_DB[type]) return false;
  if (!seenPowerups[type]) {
    seenPowerups[type] = true;
    activeGuideData = { type: type, ...POWERUP_GUIDE_DB[type] };
    guideOpenTime = millis();
    gameState = "ITEM_GUIDE";
    return true;
  }
  return false;
}

// 狀態系統變數
let isActionLocked = false; 
let isGliding = false; 
let isOnGround = false; 
let isShortJump = false; 
let featherFlapsLeft = 2;        
let isAttacking = false;         
let hasFiredThisAttack = false;  
let isCrouching = false;         
let prevHitboxH = 46;            
let activeEffects = [];          

// 3層生命力梯度系統 (1 = 一般小隻, 2 = 蘑菇大隻, 3 = 能力強化狀態)
let powerLevel = 1;
let powerType = "none";
let reservedItem = null;         

// 變身/受擊定格閃爍、無敵與無敵星計時器
let transformTimer = 0;          
let transformIsDamage = false;   
let transformFromBig = false;
let transformToBig = false;
let invincibleTimer = 0;         
let starTimer = 0;               

// 加速菇衝刺蓄力系統與撞擊反彈
let currentSprintBonus = 0;
let knockbackVX = 0;      

// 生命值與金幣計數系統
let lives = 3;
let coinCount = 0;
let score = 0;

// 場上實體陣列
let items = [];                  
let enemies = [];                
let playerFireballs = [];     
let cactusNeedles = [];
let chronoFieldActive = false;   
let brickParticles = [];         
let coins = []; 
let floatingTexts = []; 
let bumpingTiles = [];           

// 1-3 / 1-4 移動浮空平台系統
let movingPlatforms = [];
let platformCarryDX = 0;

// 1-4 魔王城專屬系統
let fireBars = [];
let boss = null;
let bossFireballs = [];
let bridgeCollapsing = false;
let bridgeCollapseTimer = 0;
let bridgeTiles = [];

// 動畫影格設定
const WALK_FRAME_COUNT = 8; 
const STAND_FRAME_COUNT = 7; 
const JUMP_FRAME_COUNT = 10; 
const JUMP_MOVE_FRAME_COUNT = 23; 
const FALLING_FRAME_COUNT = 3;    
const ATTACK_FRAME_COUNT = 12;   
const SQUAT_FRAME_COUNT = 5;        
const SQUAT_MOVE_FRAME_COUNT = 12;  

let spriteMetrics = {};
const BASE_FRAME_INTERVAL = 100;  
const MOVE_SPEED = 4; 

// 離線生成高質感像素材質包
let textures = {};

// --- 內建 8-bit 晶片音效與動態 BGM 合成引擎 ---
// --- 內建輕量級原生 Web Audio 8-bit 晶片音效與 BGM 引擎（相容 iOS / iPad Safari） ---
let audioMuted = false;
let bgmStep = 0;
let lastBgmNoteTime = 0;
let nativeAudioCtx = null;

function initAudioEngine() {
  try {
    let AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!nativeAudioCtx && AudioCtx) {
      nativeAudioCtx = new AudioCtx();
    }
    if (nativeAudioCtx && nativeAudioCtx.state === "suspended") {
      nativeAudioCtx.resume();
    }
    if (typeof userStartAudio === "function") userStartAudio();
  } catch (e) {}
}

function playTone(freq, type = 'square', duration = 0.1, vol = 0.14, slideTo = null) {
  if (audioMuted) return;
  try {
    initAudioEngine();
    if (!nativeAudioCtx) return;
    if (nativeAudioCtx.state === "suspended") nativeAudioCtx.resume();

    let now = nativeAudioCtx.currentTime;
    let osc = nativeAudioCtx.createOscillator();
    let gain = nativeAudioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(max(20, slideTo), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    let boostedVol = min(0.55, vol * 3.0);
    gain.gain.linearRampToValueAtTime(boostedVol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(nativeAudioCtx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (e) {}
}

function playSFX(name) {
  if (audioMuted) return;
  if (name === "jump") {
    playTone(260, 'square', 0.16, 0.13, 580);
  } else if (name === "flap") {
    playTone(340, 'triangle', 0.12, 0.15, 660);
  } else if (name === "coin") {
    playTone(987.77, 'square', 0.07, 0.13);
    setTimeout(() => playTone(1318.51, 'square', 0.22, 0.13), 65);
  } else if (name === "powerup") {
    let notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((f, idx) => setTimeout(() => playTone(f, 'square', 0.08, 0.13), idx * 55));
  } else if (name === "1up") {
    let notes = [330, 392, 659, 523, 587, 784, 1046.5];
    notes.forEach((f, idx) => setTimeout(() => playTone(f, 'triangle', 0.09, 0.18), idx * 65));
  } else if (name === "shrink") {
    let notes = [523, 440, 349, 261, 196];
    notes.forEach((f, idx) => setTimeout(() => playTone(f, 'sawtooth', 0.08, 0.13), idx * 65));
  } else if (name === "stomp") {
    playTone(220, 'square', 0.09, 0.15, 440);
  } else if (name === "kick") {
    playTone(180, 'triangle', 0.12, 0.16, 520);
  } else if (name === "shoot") {
    playTone(720, 'sawtooth', 0.1, 0.12, 180);
  } else if (name === "fireball") {
    playTone(540, 'square', 0.11, 0.13, 240);
  } else if (name === "brick") {
    playTone(140, 'sawtooth', 0.12, 0.16, 65);
  } else if (name === "death") {
    let notes = [493.88, 698.46, 698.46, 659.25, 587.33, 523.25];
    notes.forEach((f, idx) => setTimeout(() => playTone(f, 'square', 0.13, 0.15), idx * 110));
  } else if (name === "clear") {
    let notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
    notes.forEach((f, idx) => setTimeout(() => playTone(f, 'square', 0.14, 0.15), idx * 120));
  } else if (name === "mapMove") {
    playTone(440, 'triangle', 0.06, 0.11, 587);
  }
}

function updateBGM() {
  if (audioMuted || gameState !== "PLAYING") return;
  initAudioEngine();
  if (!nativeAudioCtx) return;

  const MELODY_1_1 = [659, 659, 0, 659, 0, 523, 659, 0, 784, 0, 0, 0, 392, 0, 0, 0];
  const MELODY_1_2 = [261, 523, 220, 440, 233, 466, 0, 0, 261, 523, 220, 440, 233, 466, 0, 0];
  const MELODY_1_3 = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1046, 880, 784, 659, 587];
  const MELODY_1_4 = [220, 233, 220, 246, 220, 261, 246, 233, 196, 207, 196, 220, 196, 233, 220, 196];
  const MELODY_STAR = [523, 523, 523, 440, 523, 0, 523, 440, 493, 493, 493, 392, 493, 0, 493, 392];

  let activeMelody = MELODY_1_1;
  let tempo = 175;

  if (starTimer > 0) {
    activeMelody = MELODY_STAR;
    tempo = 115;
  } else if (currentLevel === 2 && !is1_2Intro) {
    activeMelody = MELODY_1_2;
    tempo = 190;
  } else if (currentLevel === 3) {
    activeMelody = MELODY_1_3;
    tempo = 170;
  } else if (currentLevel === 4) {
    activeMelody = MELODY_1_4;
    tempo = 155;
  }

  if (millis() - lastBgmNoteTime >= tempo) {
    lastBgmNoteTime = millis();
    let freq = activeMelody[bgmStep % activeMelody.length];
    bgmStep++;
    if (freq > 0) {
      let wave = starTimer > 0 ? 'square' : (currentLevel === 4 ? 'sawtooth' : 'triangle');
      playTone(freq, wave, (tempo / 1000) * 0.72, 0.135);
    }
  }
}

// 地圖系統設定
const TILE_SIZE = 40; 
let cameraX = 0;      

const MAP_1_1 = [
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                            III                  |                  ",
  "                                                                                BBBBBBBB   BBB?                                                                                                  F                  ",
  "                      ?          OOO                                                                                                                       BB?B           II                     F                  ",
  "            B?BMB                                                                  *                                  BMB                                                                        F                  ",
  "                                                                                                                                                       S  SS      BB      I                      F        CCC       ",
  "                                    PP                                                                                                                SS  SSS                                    F       CCCCC      ",
  "                            PP      PP      PP                      ?               ?  ?  ?     B         BB         B   B              P            SSS  SSSS             P                     F       CCCCC      ",
  "                    PP      PP      PP      PP                                                                                         PP           SSSS  SSSSS           PP         BB?B        F       CCCCC      ",
  "                    PP      PP      PP      PP                                                                                        PPP          SSSSS  SSSSSS         PPP                     S       CCCCC      ",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
];

const MAP_1_2_INTRO = [
  "                              ",
  "                              ",
  "                              ",
  "                              ",
  "                              ",
  "                              ",
  "                              ",
  "                              ",
  "                    PP        ",
  "                    PP        ",
  "                    PP        ",
  "                  HHPP        ",
  "                  HHPP        ",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
];

const MAP_1_2 = [
  "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB                                    ",
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                                                 |                  ",
  "                                                                    BBBBBB           BBBBBB                                        BBBBBBBBBBBB                                                  F                  ",
  "               OOO                                                  B    B           B    B                                                                                                      F                  ",
  "                                                                    B ?M B           B ?? B               BBBB      BBBB                                                                         F                  ",
  "            ?????                                                   B    B           B    B                                 *                                     SS                             F                  ",
  "                                                                    BBBBBB           BBBBBB                                                                      SSS         I                   F        CCC       ",
  "                                           PP                                                                       PP                    PP                    SSSS                             F       CCCCC      ",
  "                                 PP        PP                                                       BB?B            PP                    PP                   SSSSS         P                   F       CCCCC      ",
  "                       PP        PP        PP                                                                       PP                    PP                  SSSSSS        PP                   F       CCCCC      ",
  "             S         PP        PP        PP                                                                       PP                    PP                 SSSSSSS       PPP                   S       CCCCC      ",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGG   GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
];

const MAP_1_3 = [
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                                                                    ",
  "                                                                                                                                                                                                 |                  ",
  "                         OOO                                                         ?                                                                                                           F                  ",
  "                                          TTTTT                                                                                                                                TTTTTT            F                  ",
  "                        TTTT                                                      BBBBBBB                                     TTTTT                                                              F                  ",
  "                                                                                                                                                                     TTTT                        F                  ",
  "            B?MB                  TTTTT               TTTTTTT                                            TTTTTT                                           SS                                     F        CCC       ",
  "                                                                               BBBBBBBBBBBBB                                                             SSS                                     F       CCCCC      ",
  "                                                                                                                                                        SSSS                                     F       CCCCC      ",
  "                                                                                                   TTTT                                                SSSSS                                     F       CCCCC      ",
  "                                                                               TTTTTTTTTTTTT                                                          SSSSSS                                     S       CCCCC      ",
  "GGGGGGGGGGGGGGGGGG                                                                                                                               GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  "GGGGGGGGGGGGGGGGGG                                                                                                                               GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
];

const MAP_1_4 = [
  "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
  "G                                                                                                                                                                                                                  G",
  "G                                                                                                                                                                                                                  G",
  "G                                                                                                                                                                                                                  G",
  "G                                                                                                                                                                                                                  G",
  "                OOO                                 BBBBBBBBBBB                                                                                                                                                    G",
  "G                     ?                             B         B                                                                                                                                                    G",
  "G                                                   B   ?M?   B                                                                                 BBBBBBBB                                                           G",
  "G         B?MB                                      B         B                                                                                 B      B                                                           G",
  "G                                                   BBBBBBBBBBB                                     GGGGGGGGGG                                  B   I  B                                       A                   G",
  "G                                                                              GGG                  G        G                                                                                 S                   G",
  "G                        S                                                                          G        G                                                         DDDDDDDDDDDDDDDDDDDDDDDDD     CCCCCCCC      G",
  "G                       SS                                              E                           G        G                                                         G                       G     C      C      G",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGG",
  "GGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGLLLLLLLLLLLLLLLLLLLLLLLGGGGGGGGGGGGGGGGGGG"
];

let levelMap = [];
let flagCol = -1; 
let nextPowerCycle = 0;

function loadLevelMap(sourceMap) {
  flagDropY = 0;
  levelMap = [];
  flagCol = -1;
  bridgeTiles = [];
  for (let r = 0; r < sourceMap.length; r++) {
    let rowArr = sourceMap[r].split('');
    for (let c = 0; c < rowArr.length; c++) {
      if (rowArr[c] === '|' || rowArr[c] === 'F') {
        flagCol = c;
      }
      if (rowArr[c] === 'D') {
        bridgeTiles.push({ r: r, c: c });
      }
    }
    levelMap.push(rowArr);
  }
  bridgeTiles.sort((a, b) => b.c - a.c);
}

const BASE_HITBOX_W = 22;
const BASE_HITBOX_H = 46; 
const BIG_HITBOX_W = 28;
const BIG_HITBOX_H = 74;  

function preload() { 
  walkSpriteSheet = loadImage("action/walk/ALL3.png"); 
  standSpriteSheet = loadImage("action/stand/ALL1.png"); 
  jumpSpriteSheet = loadImage("action/jump/ALL2.png"); 
  jumpMoveSpriteSheet = loadImage("action/jumpforward/ALL4.png"); 
  fallingSpriteSheet = loadImage("action/falling/ALL5.png"); 
  
  squatSpriteSheet = loadImage("action/squat_down/squat_down.png", () => {}, () => console.error("找不到蹲下圖片")); 
  squatMoveSpriteSheet = loadImage("action/squat_down_move/squat_down_move.png", () => {}, () => console.error("找不到蹲下走路圖片")); 

  attackSpriteSheet = loadImage("action/attackA/ALL5.png", () => {}, () => console.error("找不到攻擊圖片")); 
  muzzleFlashImg = loadImage("action/special_effects/hit-removebg-preview.png", () => {}, () => console.error("找不到槍口特效")); 
  hitEffectImg = loadImage("action/special_effects/hited-removebg-preview.png", () => {}, () => console.error("找不到擊中特效")); 
} 

function measureSpriteMetrics(img, frameCount) {
  if (!img || img.width === 0) {
    return { contentHeight: 100, minY: 0, frameBottomPaddings: new Array(frameCount).fill(0), frameHeight: 100 };
  }
  img.loadPixels();
  let fw = floor(img.width / frameCount);
  let fh = img.height;
  let frameBottomPaddings = [];
  let maxContentHeight = 0;
  let globalMinY = fh;

  for (let f = 0; f < frameCount; f++) {
    let minY = fh;
    let maxY = 0;
    let startX = f * fw;
    let endX = startX + fw;

    for (let y = 0; y < fh; y++) {
      for (let x = startX; x < endX; x++) {
        let idx = (y * img.width + x) * 4;
        let alpha = img.pixels[idx + 3];
        if (alpha > 20) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (minY > maxY) {
      minY = 0;
      maxY = fh - 1;
    }
    if (minY < globalMinY) globalMinY = minY;
    let ch = maxY - minY + 1;
    if (ch > maxContentHeight) maxContentHeight = ch;
    frameBottomPaddings.push((fh - 1) - maxY);
  }

  return {
    contentHeight: maxContentHeight,
    minY: globalMinY,
    frameBottomPaddings: frameBottomPaddings,
    frameHeight: fh
  };
}

// --- 離線生成高品質像素材質包（完整保留原版細節） ---
function buildTexturePack() {
  let gDay = createGraphics(TILE_SIZE, TILE_SIZE);
  gDay.noStroke();
  gDay.fill("#C85A32");
  gDay.rect(0, 0, TILE_SIZE, TILE_SIZE);
  gDay.fill("#9E3F1E");
  gDay.rect(6, 16, 10, 8, 2);
  gDay.rect(24, 26, 10, 8, 2);
  gDay.fill("#38B000");
  gDay.rect(0, 0, TILE_SIZE, 10);
  gDay.fill("#70E000");
  gDay.rect(0, 0, TILE_SIZE, 4);
  gDay.fill("#38B000");
  gDay.triangle(4, 10, 10, 16, 16, 10);
  gDay.triangle(22, 10, 28, 17, 34, 10);
  textures["G_DAY"] = gDay;

  let gUnder = createGraphics(TILE_SIZE, TILE_SIZE);
  gUnder.noStroke();
  gUnder.fill("#1D4E89");
  gUnder.rect(0, 0, TILE_SIZE, TILE_SIZE);
  gUnder.fill("#3A86FF");
  gUnder.rect(2, 2, TILE_SIZE - 4, 4);
  gUnder.fill("#0B2545");
  gUnder.rect(0, TILE_SIZE - 4, TILE_SIZE, 4);
  gUnder.rect(19, 0, 2, 20);
  gUnder.rect(0, 19, TILE_SIZE, 2);
  textures["G_UNDER"] = gUnder;

  let gSky = createGraphics(TILE_SIZE, TILE_SIZE);
  gSky.noStroke();
  gSky.fill("#6D597A");
  gSky.rect(0, 0, TILE_SIZE, TILE_SIZE);
  gSky.fill("#B56576");
  gSky.rect(0, 0, TILE_SIZE, 8);
  gSky.fill("#355070");
  gSky.rect(0, TILE_SIZE - 5, TILE_SIZE, 5);
  textures["G_SKY"] = gSky;

  let gCastle = createGraphics(TILE_SIZE, TILE_SIZE);
  gCastle.noStroke();
  gCastle.fill("#495057");
  gCastle.rect(0, 0, TILE_SIZE, TILE_SIZE);
  gCastle.fill("#6C757D");
  gCastle.rect(2, 2, 17, 16);
  gCastle.rect(21, 2, 17, 16);
  gCastle.rect(10, 21, 18, 17);
  gCastle.fill("#212529");
  gCastle.rect(0, 19, TILE_SIZE, 2);
  gCastle.rect(19, 0, 2, 20);
  gCastle.rect(8, 20, 2, 20);
  textures["G_CASTLE"] = gCastle;

  let brick = createGraphics(TILE_SIZE, TILE_SIZE);
  brick.noStroke();
  brick.fill("#B5432A");
  brick.rect(0, 0, TILE_SIZE, TILE_SIZE);
  brick.fill("#E07A5F");
  brick.rect(1, 1, 18, 3);
  brick.rect(21, 1, 18, 3);
  brick.rect(1, 21, 8, 3);
  brick.rect(11, 21, 18, 3);
  brick.rect(31, 21, 8, 3);
  brick.fill("#3D1E16");
  brick.rect(0, 18, TILE_SIZE, 2);
  brick.rect(0, 38, TILE_SIZE, 2);
  brick.rect(19, 0, 2, 18);
  brick.rect(9, 20, 2, 18);
  brick.rect(29, 20, 2, 18);
  textures["BRICK"] = brick;

  let qBox = createGraphics(TILE_SIZE, TILE_SIZE);
  qBox.noStroke();
  qBox.fill("#F4A261");
  qBox.rect(0, 0, TILE_SIZE, TILE_SIZE, 4);
  qBox.fill("#FFD166");
  qBox.rect(3, 3, TILE_SIZE - 6, TILE_SIZE - 6, 3);
  qBox.fill("#9C6644");
  qBox.rect(5, 5, 3, 3);
  qBox.rect(TILE_SIZE - 8, 5, 3, 3);
  qBox.rect(5, TILE_SIZE - 8, 3, 3);
  qBox.rect(TILE_SIZE - 8, TILE_SIZE - 8, 3, 3);
  qBox.textAlign(CENTER, CENTER);
  qBox.textSize(24);
  qBox.textStyle(BOLD);
  qBox.fill("#7F4F24");
  qBox.text("?", TILE_SIZE / 2 + 2, TILE_SIZE / 2 + 2);
  qBox.fill("#FFF3B0");
  qBox.text("?", TILE_SIZE / 2, TILE_SIZE / 2);
  textures["QBOX"] = qBox;

  let emptyBox = createGraphics(TILE_SIZE, TILE_SIZE);
  emptyBox.noStroke();
  emptyBox.fill("#582F0E");
  emptyBox.rect(0, 0, TILE_SIZE, TILE_SIZE, 4);
  emptyBox.fill("#7F4F24");
  emptyBox.rect(3, 3, TILE_SIZE - 6, TILE_SIZE - 6, 3);
  emptyBox.fill("#432818");
  emptyBox.rect(6, 6, 3, 3);
  emptyBox.rect(TILE_SIZE - 9, 6, 3, 3);
  emptyBox.rect(6, TILE_SIZE - 9, 3, 3);
  emptyBox.rect(TILE_SIZE - 9, TILE_SIZE - 9, 3, 3);
  textures["EMPTY"] = emptyBox;

  let pipe = createGraphics(TILE_SIZE, TILE_SIZE);
  pipe.noStroke();
  pipe.fill("#1B7F3A");
  pipe.rect(2, 0, TILE_SIZE - 4, TILE_SIZE);
  pipe.fill("#2EC4B6");
  pipe.rect(5, 0, 5, TILE_SIZE);
  pipe.fill("#80ED99");
  pipe.rect(12, 0, 10, TILE_SIZE);
  pipe.fill("#134E27");
  pipe.rect(TILE_SIZE - 8, 0, 6, TILE_SIZE);
  textures["PIPE"] = pipe;

  let pipeTop = createGraphics(TILE_SIZE, TILE_SIZE);
  pipeTop.noStroke();
  pipeTop.fill("#1B7F3A");
  pipeTop.rect(2, 16, TILE_SIZE - 4, TILE_SIZE - 16);
  pipeTop.fill("#80ED99");
  pipeTop.rect(12, 16, 10, TILE_SIZE - 16);
  pipeTop.fill("#134E27");
  pipeTop.rect(TILE_SIZE - 8, 16, 6, TILE_SIZE - 16);
  pipeTop.fill("#0D3B1E");
  pipeTop.rect(0, 0, TILE_SIZE, 18, 3);
  pipeTop.fill("#2EC4B6");
  pipeTop.rect(2, 2, TILE_SIZE - 4, 14, 2);
  pipeTop.fill("#80ED99");
  pipeTop.rect(6, 2, 12, 14);
  pipeTop.fill("#134E27");
  pipeTop.rect(TILE_SIZE - 7, 2, 5, 14);
  pipeTop.fill("#0D3B1E");
  pipeTop.rect(2, 18, TILE_SIZE - 4, 3);
  textures["PIPE_TOP"] = pipeTop;

  let pipeH = createGraphics(TILE_SIZE, TILE_SIZE);
  pipeH.noStroke();
  pipeH.fill("#1B7F3A");
  pipeH.rect(0, 2, TILE_SIZE, TILE_SIZE - 4);
  pipeH.fill("#2EC4B6");
  pipeH.rect(0, 5, TILE_SIZE, 5);
  pipeH.fill("#80ED99");
  pipeH.rect(0, 12, TILE_SIZE, 10);
  pipeH.fill("#134E27");
  pipeH.rect(0, TILE_SIZE - 8, TILE_SIZE, 6);
  pipeH.fill("#0D3B1E");
  pipeH.rect(0, 0, 10, TILE_SIZE);
  pipeH.fill("#80ED99");
  pipeH.rect(2, 10, 6, 12);
  textures["PIPE_H"] = pipeH;

  let stair = createGraphics(TILE_SIZE, TILE_SIZE);
  stair.noStroke();
  stair.fill("#9C6644");
  stair.rect(0, 0, TILE_SIZE, TILE_SIZE);
  stair.fill("#DDB892");
  stair.triangle(0, 0, TILE_SIZE, 0, 0, TILE_SIZE);
  stair.fill("#7F5539");
  stair.triangle(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, 0, TILE_SIZE);
  stair.fill("#B08968");
  stair.rect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12);
  textures["STAIR"] = stair;
  // 1. 城堡紅磚牆材質 (CASTLE_WALL)
  let cWall = createGraphics(TILE_SIZE, TILE_SIZE);
  cWall.noStroke();
  cWall.fill("#9B2226");
  cWall.rect(0, 0, TILE_SIZE, TILE_SIZE);
  cWall.fill("#CA6702");
  cWall.rect(1, 1, 18, 8);
  cWall.rect(21, 1, 18, 8);
  cWall.rect(1, 21, 18, 8);
  cWall.rect(21, 21, 18, 8);
  cWall.fill("#540B0E");
  cWall.rect(0, 18, TILE_SIZE, 2);
  cWall.rect(0, 38, TILE_SIZE, 2);
  cWall.rect(19, 0, 2, 18);
  cWall.rect(9, 20, 2, 18);
  cWall.rect(29, 20, 2, 18);
  textures["CASTLE_WALL"] = cWall;

  // 2. 城堡頂部城垛材質 (CASTLE_TOP)
  let cTop = createGraphics(TILE_SIZE, TILE_SIZE);
  cTop.noStroke();
  cTop.fill("#9B2226");
  cTop.rect(0, 14, TILE_SIZE, TILE_SIZE - 14);
  cTop.fill("#CA6702");
  cTop.rect(2, 0, 14, 16, 2);
  cTop.rect(24, 0, 14, 16, 2);
  cTop.fill("#540B0E");
  cTop.rect(0, 14, TILE_SIZE, 3);
  cTop.rect(0, 38, TILE_SIZE, 2);
  textures["CASTLE_TOP"] = cTop;

  // 3. 城堡黑拱門材質 (CASTLE_DOOR)
  let cDoor = createGraphics(TILE_SIZE, TILE_SIZE);
  cDoor.noStroke();
  cDoor.fill("#9B2226");
  cDoor.rect(0, 0, TILE_SIZE, TILE_SIZE);
  cDoor.fill("#CA6702");
  cDoor.rect(2, 2, TILE_SIZE - 4, TILE_SIZE - 2, 18, 18, 0, 0);
  cDoor.fill("#140B0B");
  cDoor.rect(6, 8, TILE_SIZE - 12, TILE_SIZE - 8, 14, 14, 0, 0);
  textures["CASTLE_DOOR"] = cDoor;
}

function getEffectiveViewZoom() {
  if (controlMode === "MOBILE" && autoFitMobileZoom) {
    return constrain(height / (15 * TILE_SIZE), 0.45, 1.35);
  }
  return viewZoom;
}

function setup() { 
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); 
  imageMode(CENTER); 
  frameRate(60); 

  if (canvas && canvas.style) {
    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";
    canvas.style.webkitUserSelect = "none";
  }

  buildTexturePack();

  spriteMetrics["walk"]      = measureSpriteMetrics(walkSpriteSheet, WALK_FRAME_COUNT);
  spriteMetrics["stand"]     = measureSpriteMetrics(standSpriteSheet, STAND_FRAME_COUNT);
  spriteMetrics["jump"]      = measureSpriteMetrics(jumpSpriteSheet, JUMP_FRAME_COUNT);
  spriteMetrics["jumpMove"]  = measureSpriteMetrics(jumpMoveSpriteSheet, JUMP_MOVE_FRAME_COUNT);
  spriteMetrics["falling"]   = measureSpriteMetrics(fallingSpriteSheet, FALLING_FRAME_COUNT);
  spriteMetrics["attack"]    = measureSpriteMetrics(attackSpriteSheet, ATTACK_FRAME_COUNT);
  spriteMetrics["squat"]     = measureSpriteMetrics(squatSpriteSheet, SQUAT_FRAME_COUNT);
  spriteMetrics["squatMove"] = measureSpriteMetrics(squatMoveSpriteSheet, SQUAT_MOVE_FRAME_COUNT);

  // 防止 Ctrl+D / Ctrl+S 等組合鍵觸發 Chrome 預設書籤或存檔視窗
  window.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
    }
  }, { passive: false });
} 

function draw() { 
  if (controlMode === "MOBILE") {
    updateMobileTouchState();
  }

  if (gameState === "DEVICE_SELECT") {
    drawDeviceSelect();
    return;
  }

  if (gameState === "WORLD_MAP") {
    drawWorldMap();
    if (showSettingsModal) drawSettingsModal();
    return;
  }

  if (gameState === "LEVEL_INTRO") {
    drawLevelIntro();
    return;
  }

  if (gameState === "GAME_OVER") {
    drawGameOver();
    return;
  }

  updateBGM();

  if (currentWorld === 2) {
    if (currentLevel === 4) {
      background(window.isInMinerSupplyRoom ? "#2B1E16" : "#05050C");
    } else if (currentLevel === 3 || currentLevel === 5) {
      background("#2B190E");
    } else {
      background("#F6BD60");
    }
  } else if (currentLevel === 1 || is1_2Intro) {
    background("#6b8cff"); 
  } else if (currentLevel === 2) {
    background("#0a0a12");
  } else if (currentLevel === 3) {
    background("#ff9a76");
  } else {
    background("#1a0505"); 
  }

  let z = getEffectiveViewZoom();
  let viewWorldW = width / z;
  let viewWorldH = height / z;

  // 關卡倒數計時器（開啟設定或道具圖鑑時暫停倒數）
  if (gameState === "PLAYING" && !showSettingsModal && !showExitMapConfirmModal) {
    if (millis() - lastLevelTimerTick >= 1000) {
      lastLevelTimerTick = millis();
      levelTimer--;
      if (levelTimer <= 0) {
        levelTimer = 0;
        handlePlayerDeath();
        return;
      }
    }
  }

  if (gameState !== "ITEM_GUIDE" && !showSettingsModal && !showExitMapConfirmModal) {
    if (invincibleTimer > 0) {
      invincibleTimer -= deltaTime;
      if (invincibleTimer < 0) invincibleTimer = 0;
    }
    if (starTimer > 0) {
      starTimer -= deltaTime;
      if (starTimer < 0) starTimer = 0;
    }
  }

  // --- 0.5 秒時間靜止變身／縮小演出 (TRANSFORM_FREEZE) ---
  if (gameState === "TRANSFORM_FREEZE") {
    transformTimer -= deltaTime;

    push();
    scale(z);
    let mapOffsetY = viewWorldH - (levelMap.length * TILE_SIZE);
    translate(-cameraX, mapOffsetY);

    drawWorld2AtmosphereAndLandmarks();
    drawMap(viewWorldW);
    drawMovingPlatforms();
    drawEnemies();
    if (currentLevel === 4) {
      drawFireBars();
      drawBossAndFireballs();
    }

    let showPhaseA = (floor(transformTimer / 100) % 2 === 0);
    let activeSpriteSheet = standSpriteSheet;
    let activeFrameCount = STAND_FRAME_COUNT;
    let metric = spriteMetrics["stand"] || spriteMetrics["walk"];
    let frameWidth = activeSpriteSheet.width / activeFrameCount;
    let frameHeight = activeSpriteSheet.height;

    let displayRealH = showPhaseA ? (transformFromBig ? 80 : 53) : (transformToBig ? 80 : 53);
    let displayScale = displayRealH / metric.contentHeight;
    let currentHitboxH = (powerLevel >= 2) ? BIG_HITBOX_H : BASE_HITBOX_H;
    let hitboxBottomY = characterY + currentHitboxH / 2;
    let frameBottomPad = metric.frameBottomPaddings[0] || 0;
    let drawCenterY = hitboxBottomY - (frameHeight * displayScale) / 2 + frameBottomPad * displayScale;

    push();
    translate(characterX, drawCenterY);
    scale(facingDirection * displayScale, displayScale);
    if (!showPhaseA && powerLevel === 3) {
      tint(getPowerTintColor(powerType));
    }
    image(activeSpriteSheet, 0, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
    noTint();
    pop();

    pop();

    drawNSMBHUD();
    if (controlMode === "MOBILE") drawMobileControls();

    if (transformTimer <= 0) {
      let oldHitboxH = transformFromBig ? BIG_HITBOX_H : BASE_HITBOX_H;
      let newHitboxH = (powerLevel >= 2) ? BIG_HITBOX_H : BASE_HITBOX_H;
      characterY += (oldHitboxH - newHitboxH) / 2;
      prevHitboxH = newHitboxH;
      if (transformIsDamage) {
        invincibleTimer = 1000;
      }
      gameState = "PLAYING";
    }
    return;
  }

  let isBig = (powerLevel >= 2);

  // 統一整合「鍵盤 + 手機虛擬按鍵（含手機 DASH 鎖定）」輸入
  let inputLeft  = keyIsDown(LEFT_ARROW)  || keyIsDown(65) || (controlMode === "MOBILE" && touchControls.left);
  let inputRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68) || (controlMode === "MOBILE" && touchControls.right);
  let inputDown  = keyIsDown(DOWN_ARROW)  || keyIsDown(83) || (controlMode === "MOBILE" && touchControls.down);
  let inputDash  = (controlMode === "MOBILE" ? mobileDashLocked : dashToggleActive);

  // --- 蹲下狀態判斷 ---
  let standHitboxW = isBig ? BIG_HITBOX_W : BASE_HITBOX_W;
  let standHitboxH = isBig ? BIG_HITBOX_H : BASE_HITBOX_H;

  let currentFeetY = characterY + prevHitboxH / 2;
  let standCenterY = currentFeetY - standHitboxH / 2;
  let hasCeilingAbove = checkCollision(characterX, standCenterY, standHitboxW, standHitboxH);

  if (gameState === "PLAYING" && !showSettingsModal && !isAttacking) {
    if (isOnGround && inputDown) {
      isCrouching = true;
    } else if (isCrouching) {
      if (!hasCeilingAbove) {
        isCrouching = false;
      }
    }
  } else if (!hasCeilingAbove) {
    isCrouching = false;
  }

  let crouchHitboxFactor = isCrouching ? (isBig ? 0.5 : 0.75) : 1.0;
  let currentHitboxW = standHitboxW;
  let currentHitboxH = standHitboxH * crouchHitboxFactor;

  if (currentHitboxH !== prevHitboxH) {
    characterY += (prevHitboxH - currentHitboxH) / 2;
    prevHitboxH = currentHitboxH;
  }

  if (gameState !== "ITEM_GUIDE" && !showSettingsModal && !showExitMapConfirmModal) {
    updateMovingPlatforms();
    updateBumpingTiles();
    updateEnemies(currentHitboxW, currentHitboxH, viewWorldW);
    if (gameState === "TRANSFORM_FREEZE" || gameState === "GAME_OVER" || gameState === "LEVEL_INTRO" || gameState === "ITEM_GUIDE") return;
    updatePlayerFireballs();
    updateCactusNeedles();
    chronoFieldActive = (powerLevel === 3 && powerType === "chrono" && inputDash && gameState === "PLAYING");

    // <--- 新增：2-4 頭燈拾取與火把系統更新
    if (currentWorld === 2 && currentLevel === 4 && gameState === "PLAYING") {
      updateMinerLampAndTorches();
    }

    if (currentLevel === 4) {
      updateFireBars(currentHitboxW, currentHitboxH);
      if (gameState === "TRANSFORM_FREEZE" || gameState === "GAME_OVER" || gameState === "LEVEL_INTRO") return;
      updateBossAndFireballs(currentHitboxW, currentHitboxH, viewWorldW);
      if (gameState === "TRANSFORM_FREEZE" || gameState === "GAME_OVER" || gameState === "LEVEL_INTRO") return;
      updateBridgeCollapse();
    }
    if (currentWorld === 2 && currentLevel === 5) {
      updateSandwormBoss(currentHitboxW, currentHitboxH);
      updateRescueCutscene();
    }
  }

  // --- 1. 處理移動、加速菇漸進衝刺與過場 ---
  let moveX = 0; 
  let isMovingInput = (inputRight || inputLeft) && !isAttacking && !isCrouching;
  let wantsSprint = (powerType === "speed" && inputDash && isMovingInput);

  if (wantsSprint) {
    currentSprintBonus = min(1.0, currentSprintBonus + 0.022);
  } else {
    currentSprintBonus = max(0.0, currentSprintBonus - 0.04);
  }

  let speedMultiplier = 1.0 + currentSprintBonus * 0.85;
  if (starTimer > 0) speedMultiplier = max(speedMultiplier, 1.3);

  let effectiveMoveSpeed = isCrouching ? (MOVE_SPEED / 3) : (MOVE_SPEED * speedMultiplier);

  if (gameState === "PLAYING" && !showSettingsModal && !showExitMapConfirmModal) {
    // 自暈 3 秒時無法操作移動，只能等暈眩結束或受傷解除
    if (playerStunTimer > 0) {
      playerStunTimer -= deltaTime;
      if (playerStunTimer < 0) playerStunTimer = 0;
      currentSprintBonus = 0;
    } else if (!isAttacking) {
      if (inputRight) { moveX = effectiveMoveSpeed; facingDirection = 1; } 
      if (inputLeft)  { moveX = -effectiveMoveSpeed; facingDirection = -1; } 
    }

    if (abs(knockbackVX) > 0.1) {
      moveX = knockbackVX;
      knockbackVX *= 0.82;
    } else {
      knockbackVX = 0;
    }
    
    characterX += moveX + platformCarryDX; 
    characterX = constrain(characterX, currentHitboxW / 2, levelMap[0].length * TILE_SIZE - currentHitboxW / 2);

    if (flagCol !== -1) {
      let flagWallX = flagCol * TILE_SIZE + TILE_SIZE / 2;
      if (characterX + currentHitboxW / 2 > flagWallX) {
        characterX = flagWallX - currentHitboxW / 2;
      }
    }

    if (checkCollision(characterX, characterY, currentHitboxW, currentHitboxH)) {
      characterX -= (moveX + platformCarryDX); 
      currentSprintBonus = 0;
    }

    if (is1_2Intro && inputRight) {
      checkEnterPipe(characterX, characterY, currentHitboxW, currentHitboxH);
    }
    if (currentWorld === 2 && currentLevel === 4 && isOnGround && inputDown) {
    let footRow = floor((characterY + currentHitboxH / 2 + 4) / TILE_SIZE);
    let col = floor(characterX / TILE_SIZE);
    if (footRow >= 0 && footRow < levelMap.length && col >= 0 && col < levelMap[0].length) {
      let belowTile = levelMap[footRow][col];
      if (belowTile === 'p' && !window.isInMinerSupplyRoom) {
        gameState = "ENTERING_SUPPLY_PIPE";
        stateTimer = millis();
        playSFX("shrink");
      } else if (belowTile === 'u' && window.isInMinerSupplyRoom) {
        gameState = "EXITING_SUPPLY_PIPE";
        stateTimer = millis();
        playSFX("shrink");
      }
    }
  }

    if (currentLevel === 4) {
      checkAxeTrigger(characterX, characterY, currentHitboxW, currentHitboxH);
    }

  } else if (gameState === "BOSS_DEFEAT_CUTSCENE") {
    velocityY += gravity;
    characterY += velocityY;
    if (checkCollision(characterX, characterY, currentHitboxW, currentHitboxH)) {
      let bottomTileRow = floor((characterY + currentHitboxH / 2) / TILE_SIZE);
      characterY = bottomTileRow * TILE_SIZE - currentHitboxH / 2 - 0.1;
      velocityY = 0;
      isOnGround = true;
    }
    if (!bridgeCollapsing && boss && !boss.alive) {
      gameState = "WALK_TO_CASTLE";
      castleTargetX = 198 * TILE_SIZE;
    }

  } else if (gameState === "FLAG_SLIDE") {
    velocityY = 5;
    characterY += velocityY;

    // 自動找旗桿最頂端與底部位置，讓綠旗同步往下滑動
    let flagCol = floor(characterX / TILE_SIZE);
    let topFlagRow = 3;
    let bottomFlagRow = 11;
    for (let r = 0; r < levelMap.length; r++) {
      let t = levelMap[r][flagCol];
      if (t === 'F' || t === '|' || (currentWorld === 2 && t === 'H')) {
        topFlagRow = r;
        break;
      }
    }
    for (let r = topFlagRow; r < levelMap.length; r++) {
      let t = levelMap[r][flagCol];
      if (t === 'F' || t === '|' || (currentWorld === 2 && t === 'H')) {
        bottomFlagRow = r;
      }
    }
    let maxFlagDrop = max(0, (bottomFlagRow - topFlagRow) * TILE_SIZE);
    flagDropY = constrain(characterY - topFlagRow * TILE_SIZE, 0, maxFlagDrop);

    // 精準偵測旗桿下方地板高度，雙腳踩在草地表面不再陷進地板
    let groundTopY = (bottomFlagRow + 1) * TILE_SIZE - currentHitboxH / 2 - 0.1;
    if (checkCollision(characterX, characterY, currentHitboxW, currentHitboxH)) {
      let bottomTileRow = floor((characterY + currentHitboxH / 2) / TILE_SIZE);
      groundTopY = bottomTileRow * TILE_SIZE - currentHitboxH / 2 - 0.1;
    }

    if (characterY >= groundTopY) {
      characterY = groundTopY;
      velocityY = 0;
      isOnGround = true;
      flagDropY = maxFlagDrop;
      gameState = "WALK_TO_CASTLE";
    }

  } else if (gameState === "WALK_TO_CASTLE") {
    if (!hideCharacter) {
      moveX = 3;
      facingDirection = 1;
      characterX += moveX;
      if (characterX >= castleTargetX) {
      characterX = castleTargetX;
      hideCharacter = true; 
      stateTimer = millis();
      castleFlagRaised = true;
      castleFlagProgress = 0;
      let topCastleRow = 8;
      for (let r = 0; r < levelMap.length; r++) {
        if (levelMap[r].includes('C')) {
          topCastleRow = r;
          break;
        }
      }
      castleRoofTopY = topCastleRow * TILE_SIZE;
      // <--- 新增：2-4 過關抵達城堡時，頭燈與剩余火把化為白煙消散
      if (currentWorld === 2 && currentLevel === 4 && (hasMinerHeadlamp || torchCount > 0)) {
        for (let s = 0; s < 14; s++) {
          endClearBonusSmoke.push({
            x: characterX + random(-18, 18),
            y: characterY + random(-25, 10),
            vx: random(-1.5, 1.5),
            vy: random(-2.5, -0.8),
            r: random(10, 22),
            alpha: 240
          });
        }
        hasMinerHeadlamp = false;
        torchCount = 0;
        placedTorches = [];
        playSFX("powerup");
        floatingTexts.push({ text: "礦坑裝備已歸還！", x: characterX - 60, y: characterY - 55, vy: -1.2, life: 80 });
      }
    }
    } else {
      if (millis() - stateTimer > 1500) {
        let curId = `${currentWorld}-${currentLevel}`;
        let node = mapNodesData[curId];
        if (node) {
          node.cleared = true;
          // 判斷是否為秘密終點過關（後續關卡會設定 isSecretClear = true）
          let unlockList = (typeof isSecretClear !== "undefined" && isSecretClear && node.nextSecret)
            ? node.nextSecret
            : (node.nextNormal || []);

          for (let nextId of unlockList) {
            if (mapNodesData[nextId]) {
              mapNodesData[nextId].unlocked = true;
            }
          }
        }

        // 通過任意關卡後，沙漠補給屋重新開門營業！
        if (mapNodesData["2-SHOP"]) {
          mapNodesData["2-SHOP"].isOpen = true;
        }

        if (curId === "1-4") {
          // 回到 World 1 大地圖並播放 1-4 城堡白旗 → 聚光燈轉場動畫
          currentWorld = 1;
          selectedMapNode = "1-4";
          worldTransition = {
            active: true,
            phase: "WHITE_FLAG",
            timer: millis(),
            flagProgress: 0,
            roadProgress: 0,
            spotlightR: max(width, height)
          };
          gameState = "WORLD_MAP";
        } else if (curId === "2-5") {
          gameState = "ALL_CLEAR";
        } else {
          // 自動將游標移到剛解鎖的下一關
          let nextTargets = (typeof isSecretClear !== "undefined" && isSecretClear && node && node.nextSecret)
            ? node.nextSecret
            : (node && node.nextNormal ? node.nextNormal : []);
          if (nextTargets.length > 0 && mapNodesData[nextTargets[0]]) {
            selectedMapNode = nextTargets[0];
          }
          gameState = "WORLD_MAP";
        }
      }
    }

  } else if (gameState === "ENTERING_PIPE") {
  moveX = 2.0;
  facingDirection = 1;
  characterX += moveX;
  if (millis() - stateTimer > 650) {
    hideCharacter = true;
  }
  if (millis() - stateTimer > 1100) {
    // ...（原本切換到 MAP_1_2 的程式碼保持不變）
    is1_2Intro = false;
    loadLevelMap(MAP_1_2);
    spawnLevelEnemies(2);

    // 在 1-2 地下場景左側地面上放一根「地下入口水管」，讓主角從管口鑽出來
    let pipeCol = 2;
    let groundRow = 13;
    for (let r = levelMap.length - 1; r >= 0; r--) {
      if (levelMap[r][pipeCol] === 'G' || levelMap[r][pipeCol] === 'B') {
        groundRow = r;
        break;
      }
    }
    if (groundRow >= 3) {
      levelMap[groundRow - 1][pipeCol] = 'P';
      levelMap[groundRow - 2][pipeCol] = 'P';
    }

    cameraX = 0;
    characterX = pipeCol * TILE_SIZE + TILE_SIZE / 2;
    characterY = (groundRow - 1) * TILE_SIZE + 12;
    velocityY = 0;
    hideCharacter = false;
    castleFlagRaised = false;
    castleFlagProgress = 0;
    stateTimer = millis();
    isExitingPipe = true;
    gameState = "PLAYING";
  }
} else if (gameState === "ENTERING_SUPPLY_PIPE") {
    moveX = 0;
    characterY += 1.8;
    if (millis() - stateTimer > 550) {
      saved2_4MainState = {
        map: levelMap.map(r => r.slice()),
        x: characterX,
        y: characterY
      };
      window.isInMinerSupplyRoom = true;
      let roomData = buildWorld2MinerSupplyRoom();
      loadLevelMap(roomData.mapStrings);
      enemies = [];
      if (!hasMinerHeadlamp) {
        minerLampPickup = { x: 12.5 * TILE_SIZE + 20, y: 12 * TILE_SIZE + 12, taken: false };
      }
      characterX = 3 * TILE_SIZE;
      characterY = 4 * TILE_SIZE + 10;
      velocityY = 0;
      cameraX = 0;
      gameState = "PLAYING";
      floatingTexts.push({ text: "礦工裝備補給站（全亮區域）", x: characterX, y: characterY - 25, vy: -1, life: 95, isOneUp: true });
    }
  } else if (gameState === "EXITING_SUPPLY_PIPE") {
    moveX = 0;
    characterY += 1.8;
    if (millis() - stateTimer > 550) {
      window.isInMinerSupplyRoom = false;
      if (saved2_4MainState) {
        loadLevelMap(saved2_4MainState.mapStrings);
        movingPlatforms = saved2_4MainState.platformSpawns || [];
        enemies = [];
        for (let sp of (saved2_4MainState.enemySpawns || [])) {
          let h = sp.type === "goomba" ? 30 : 38;
          enemies.push({
            type: sp.type,
            x: sp.col * TILE_SIZE + 20,
            y: sp.row * TILE_SIZE - h / 2 - 12,
            baseY: sp.row * TILE_SIZE - h / 2 - 24,
            w: 30, h: h, vx: -1.4, vy: 0,
            shellMoving: false, dead: false, flyPhase: random(TWO_PI),
            stunTimer: 0, knockbackX: 0
          });
        }
      }
      characterX = 3 * TILE_SIZE;
      characterY = 12 * TILE_SIZE - currentHitboxH / 2 - 2;
      velocityY = 0;
      cameraX = 0;
      gameState = "PLAYING";
      floatingTexts.push({ text: "進入幽暗古礦坑！按 [E] 插火把", x: characterX - 40, y: characterY - 35, vy: -1, life: 95, isOneUp: true });
    }
  } else if (gameState === "ENTERING_QUICKSAND") {
    let elapsed = millis() - stateTimer;
    moveX = 0;
    velocityY = 0;
    characterY += 1.2;

    if (elapsed > 550) {
      is2_1SubSecret = true;
      let subData = buildWorld2SubSecretMap();
      loadLevelMap(subData.mapStrings);
      enemies = [];
      for (let sp of subData.enemySpawns) {
        let h = sp.type === "goomba" ? 30 : 38;
        enemies.push({
          type: sp.type, x: sp.col * TILE_SIZE + 20, y: sp.row * TILE_SIZE - h / 2 - 12,
          baseY: sp.row * TILE_SIZE - h / 2 - 24, w: 30, h: h, vx: -1.4, vy: 0,
          shellMoving: false, dead: false, flyPhase: random(TWO_PI), stunTimer: 0, knockbackX: 0
        });
      }
      characterX = 3 * TILE_SIZE;
      characterY = 4 * TILE_SIZE;
      velocityY = 0;
      cameraX = 0;
      quicksandFadeInTimer = millis();
      gameState = "PLAYING";
      floatingTexts.push({ text: "被流沙吸入地下秘室！尋找紅色終點旗！", x: characterX, y: characterY - 30, vy: -1, life: 110, isOneUp: true });
    }
  }
if (isExitingPipe) {
  moveX = 0;
  velocityY = 0;
  characterY -= 1.5;
  let pipeCol = floor(characterX / TILE_SIZE);
  let pipeTopRow = 11;
  for (let r = 0; r < levelMap.length; r++) {
    if (levelMap[r][pipeCol] === 'P') {
      pipeTopRow = r;
      break;
    }
  }
  let targetStandY = pipeTopRow * TILE_SIZE - currentHitboxH / 2 - 0.5;
  if (characterY <= targetStandY) {
    characterY = targetStandY;
    isExitingPipe = false;
  }
}
// --- 2. 物理系統與碰撞偵測 ---
  if (isExitingPipe) {
    moveX = 0;
    velocityY = 0;
    characterY -= 1.2; // 慢慢從水管裡往上升上來
    let pipeCol = floor(characterX / TILE_SIZE);
    let pipeTopRow = 11;
    for (let r = 0; r < levelMap.length; r++) {
      if (levelMap[r][pipeCol] === 'P') {
        pipeTopRow = r;
        break;
      }
    }
    let targetStandY = pipeTopRow * TILE_SIZE - currentHitboxH / 2 - 0.5;
    if (characterY <= targetStandY) {
      characterY = targetStandY;
      isExitingPipe = false;
    }
  }

  if (isExitingCeilingPipe) {
    moveX = 0;
    velocityY = 0;
    characterY += 1.4; // 慢慢從天花板水管往下鑽出

    // 自動偵測天花板水管最底端管口的 Y 座標
    let pipeCol = floor(characterX / TILE_SIZE);
    let mouthBottomY = 4 * TILE_SIZE;
    for (let r = 2; r < levelMap.length; r++) {
      let t = levelMap[r][pipeCol];
      if (t === 'P' || t === 'p' || t === 'u') {
        mouthBottomY = (r + 1) * TILE_SIZE;
      } else {
        break;
      }
    }

    // 等到主角頭頂完全離開管口下方，就解除動畫並自然落下
    let headTopY = characterY - currentHitboxH / 2;
    if (headTopY >= mouthBottomY + 2) {
      isExitingCeilingPipe = false;
      velocityY = 1.5;
    }
  }

  platformCarryDX = 0;

  if (!isExitingPipe && !isExitingCeilingPipe && ((gameState === "PLAYING" && !showSettingsModal) || gameState === "WALK_TO_CASTLE")) {
    if (isGliding && velocityY > 0) {
      velocityY += gravity * 0.2; 
      if (velocityY > 2) velocityY = 2; 
    } else {
      velocityY += gravity;    
    }
    
    let prevFeetY = characterY + currentHitboxH / 2;
    characterY += velocityY; 
    isOnGround = false; 
    
    if (velocityY < 0) {
      let headY = characterY - currentHitboxH / 2;
      let hitHiddenLeft  = checkHiddenBlockHit(characterX - currentHitboxW * 0.25, headY);
      let hitHiddenRight = checkHiddenBlockHit(characterX + currentHitboxW * 0.25, headY);
      if (hitHiddenLeft || hitHiddenRight) {
        let topTileRow = floor(headY / TILE_SIZE);
        characterY = (topTileRow + 1) * TILE_SIZE + currentHitboxH / 2 + 0.1;
        velocityY = 0;
      }
    }

   if (checkCollision(characterX, characterY, currentHitboxW, currentHitboxH)) {
      if (velocityY > 0) { 
        let bottomTileRow = floor((characterY + currentHitboxH / 2) / TILE_SIZE);
        characterY = bottomTileRow * TILE_SIZE - currentHitboxH / 2 - 0.1; 
        velocityY = 0; 
        isOnGround = true; 
        isGliding = false; 
        isActionLocked = false; 
        isShortJump = false; 
        featherFlapsLeft = 2;

        // <--- 新增這 4 行：每 10 幀紀錄一次地面安全座標供時光回溯使用
        if (gameState === "PLAYING" && frameCount % 10 === 0) {
          safePositionHistory.push({ x: characterX, y: characterY });
          if (safePositionHistory.length > 12) safePositionHistory.shift();
        }
      } else if (velocityY < 0) { 
        let topTileRow = floor((characterY - currentHitboxH / 2) / TILE_SIZE);
        characterY = (topTileRow + 1) * TILE_SIZE + currentHitboxH / 2 + 0.1; 
        velocityY = 0; 
        
        checkHitTile(characterX - currentHitboxW * 0.48, characterY - currentHitboxH / 2 - 4);
        checkHitTile(characterX, characterY - currentHitboxH / 2 - 4);
        checkHitTile(characterX + currentHitboxW * 0.48, characterY - currentHitboxH / 2 - 4);
      }
    }

    if (velocityY >= 0 && !isOnGround) {
      let newFeetY = characterY + currentHitboxH / 2;
      for (let mp of movingPlatforms) {
        if (characterX + currentHitboxW / 2 > mp.x && characterX - currentHitboxW / 2 < mp.x + mp.w) {
          if (prevFeetY <= mp.y + 8 && newFeetY >= mp.y) {
            characterY = mp.y - currentHitboxH / 2 - 0.1;
            velocityY = 0;
            isOnGround = true;
            isGliding = false;
            isActionLocked = false;
            isShortJump = false;
            featherFlapsLeft = 2;
            platformCarryDX = mp.dx;
            break;
          }
        }
      }
    }
    // World 2 流沙 ('Q') 與仙人掌刺柱 ('K') 互動
    if (currentWorld === 2 && gameState === "PLAYING") {
      let pCol = floor(characterX / TILE_SIZE);
      let footRow = floor((characterY + currentHitboxH / 2 - 4) / TILE_SIZE);
      let bodyRow = floor(characterY / TILE_SIZE);

      if (footRow >= 0 && footRow < levelMap.length && pCol >= 0 && pCol < levelMap[0].length) {
       if (levelMap[footRow][pCol] === 'V' && !is2_1SubSecret) {
  // 跟一般流沙一樣慢慢往下沉（按跳還可以逃出來）
  if (velocityY > 0.5) velocityY = 0.5;
  isOnGround = true;
  isActionLocked = false;

  // 只有整個人沉到流沙格子最底部（第 14 排底部）時，啟動平滑轉場進入地下密室
  let bottomOfSandY = (footRow + 1) * TILE_SIZE;
  if (characterY + currentHitboxH / 2 >= bottomOfSandY - 2 && gameState === "PLAYING") {
    gameState = "ENTERING_QUICKSAND";
    stateTimer = millis();
    quicksandExitMode = false;
    playSFX("shrink");
  }
}
        if (levelMap[footRow][pCol] === 'Q') {
          if (powerLevel === 3 && powerType === "chrono") {
            if (velocityY > 0) {
              velocityY = 0;
              characterY = footRow * TILE_SIZE - currentHitboxH / 2;
              isOnGround = true;
            }
          } else {
            // 減慢下沉速度，給玩家充足反應時間
            if (velocityY > 0.42) velocityY = 0.42;
            isOnGround = true;
            isActionLocked = false;

            // 偵測玩家按跳躍鍵：每按一次就把雙腳往上拔一截並給予脫困向上衝量
            if (keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(32)) {
              characterY -= 12;
              velocityY = -10.5;
              isOnGround = false;
              playSFX("jump");
            } else if (frameCount % 22 === 0) {
              floatingTexts.push({ text: "流沙！連跳脫困", x: characterX - 35, y: characterY - 35, vy: -0.8, life: 25 });
            }
          }
        }
      }

      if (bodyRow >= 0 && bodyRow < levelMap.length && pCol >= 0 && pCol < levelMap[0].length) {
        if (levelMap[bodyRow][pCol] === 'K') {
          if (starTimer > 0 || (powerLevel === 3 && powerType === "cactus" && isCrouching)) {
            levelMap[bodyRow][pCol] = ' ';
            spawnBrickParticles(pCol * TILE_SIZE + 20, bodyRow * TILE_SIZE + 20);
            playSFX("brick");
            score += 200;
          } else {
            takeDamage();
            return;
          }
        }
      }
    }
    if (gameState === "PLAYING" && checkLavaHazard(characterX, characterY, currentHitboxW, currentHitboxH)) {
      handlePlayerDeath();
      return;
    }
  }

  if (gameState === "PLAYING") {
    checkFlagpole(characterX, characterY, currentHitboxW, currentHitboxH);
  }

  if (characterY > levelMap.length * TILE_SIZE + 200) {
    handlePlayerDeath();
    return;
  }
  // --- 3. 判斷動畫狀態 ---
  const isJumping = !isOnGround; 
  
  if (gameState === "FLAG_SLIDE") {
    animationState = "falling";
  } else if (gameState === "WALK_TO_CASTLE" || gameState === "ENTERING_PIPE") {
    animationState = "walk";
  } else if (isAttacking) {
    animationState = "attack"; 
  } else if (isActionLocked) {
    animationState = "jump";
  } else {
    if (isGliding) {
      animationState = "falling";
    } else if (isJumping) {
      if (previousAnimation === "jump") {
        animationState = "falling";
      } else if (moveX !== 0) {
        animationState = "jumpMove"; 
      } else {
        if (velocityY > 0) {
          animationState = "falling";
        } else {
          animationState = "jump";
          isActionLocked = true; 
        }
      }
    } else if (isCrouching) {
      if (moveX !== 0) {
        animationState = "squatMove";
      } else {
        animationState = "squat";
      }
    } else {
      if (moveX !== 0) {
        animationState = "walk";
      } else {
        animationState = "stand";
      }
    }
  }

  let activeSpriteSheet;
  let activeFrameCount;

  if (animationState === "attack") { activeSpriteSheet = attackSpriteSheet; activeFrameCount = ATTACK_FRAME_COUNT; }
  else if (animationState === "squatMove") { activeSpriteSheet = squatMoveSpriteSheet; activeFrameCount = SQUAT_MOVE_FRAME_COUNT; }
  else if (animationState === "squat") { activeSpriteSheet = squatSpriteSheet; activeFrameCount = SQUAT_FRAME_COUNT; }
  else if (animationState === "falling") { activeSpriteSheet = fallingSpriteSheet; activeFrameCount = FALLING_FRAME_COUNT; } 
  else if (animationState === "jumpMove") { activeSpriteSheet = jumpMoveSpriteSheet; activeFrameCount = JUMP_MOVE_FRAME_COUNT; } 
  else if (animationState === "jump") { activeSpriteSheet = jumpSpriteSheet; activeFrameCount = JUMP_FRAME_COUNT; } 
  else if (animationState === "walk") { activeSpriteSheet = walkSpriteSheet; activeFrameCount = WALK_FRAME_COUNT; } 
  else { activeSpriteSheet = standSpriteSheet; activeFrameCount = STAND_FRAME_COUNT; }
  
  const frameWidth = activeSpriteSheet.width / activeFrameCount; 
  const frameHeight = activeSpriteSheet.height; 

  const WALK_REAL_HEIGHT = isBig ? 80 : 53;
  let metric = spriteMetrics[animationState] || spriteMetrics["walk"];

  let targetContentHeight = WALK_REAL_HEIGHT;
  if (animationState === "squat" || animationState === "squatMove") {
    targetContentHeight = WALK_REAL_HEIGHT * 0.78 * 1.15;
  }

  let displayScale = targetContentHeight / metric.contentHeight;

  // --- 4. 動態播放速率控制 ---
  if (animationState !== previousAnimation) { 
    currentFrame = 0; 
    lastFrameTime = millis(); 
    previousAnimation = animationState; 
  } 

  let currentFrameInterval = BASE_FRAME_INTERVAL;
  if (animationState === "walk") {
    currentFrameInterval = BASE_FRAME_INTERVAL / (1.0 + currentSprintBonus * 1.35);
  } else if (animationState === "jumpMove") {
    currentFrameInterval = isShortJump ? 25 : 60; 
  } else if (animationState === "squat") {
    currentFrameInterval = 60; 
  }

  if (gameState !== "ITEM_GUIDE" && !showSettingsModal  && millis() - lastFrameTime >= currentFrameInterval) { 
    currentFrame++;
    lastFrameTime = millis(); 
    
    if (animationState === "attack") {
      if (currentFrame >= activeFrameCount) {
        isAttacking = false; 
        currentFrame = activeFrameCount - 1; 
      }
    } else if (animationState === "squat") {
      currentFrame = min(currentFrame, activeFrameCount - 1);
    } else if (animationState === "jump" && currentFrame >= JUMP_FRAME_COUNT) {
      isActionLocked = false;
      animationState = "falling";
      previousAnimation = "jump"; 
      currentFrame = 0;
    } else {
      currentFrame = currentFrame % activeFrameCount;
    }
  }
  currentFrame = min(currentFrame, activeFrameCount - 1);

  // --- 射擊與火焰花攻擊邏輯 ---
  if (isAttacking && (currentFrame === 6 || currentFrame === 7) && !hasFiredThisAttack) {
    let muzzleOffsetX = (WALK_REAL_HEIGHT * 0.75) * facingDirection; 
    let muzzleOffsetY = isBig ? -15 : -10; 
    
    let startX = characterX + muzzleOffsetX;
    let startY = characterY + muzzleOffsetY;

    if (powerType === "fire") {
      playSFX("fireball");
      playerFireballs.push({
        x: startX,
        y: startY,
        vx: 11.5 * facingDirection,
        vy: -1.2,
        life: 110
      });
    } else if (powerType === "cactus") {
      playSFX("shoot");
      cactusNeedles.push({
        x: startX,
        y: startY,
        vx: 15 * facingDirection,
        life: 70
      });
    } else {
      playSFX("shoot");
    }

    let hitX = startX;
    let hitY = startY;
    let maxDistance = viewWorldW; 
    let step = 10;           
    let currentDistance = 0;

    while (currentDistance < maxDistance) {
      hitX += step * facingDirection;
      currentDistance += step;

      let hitEnemy = false;
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        let en = enemies[ei];
        if (!en.dead && abs(hitX - en.x) < en.w / 2 + 8 && abs(hitY - en.y) < en.h / 2 + 8) {
          en.dead = true;
          en.vy = -6;
          score += 200;
          playSFX("kick");
          floatingTexts.push({ text: "+200", x: en.x, y: en.y - 20, vy: -1.5, life: 45 });
          hitEnemy = true;
          break;
        }
      }
      if (hitEnemy) break;

      if (currentLevel === 4 && boss && boss.alive && !boss.falling) {
        if (abs(hitX - boss.x) < boss.w / 2 && abs(hitY - boss.y) < boss.h / 2) {
          let dmg = (powerType === "fire") ? 3 : 1;
          boss.hp -= dmg;
          boss.flashTimer = 6;
          score += 200 * dmg;
          if (boss.hp <= 0) {
            boss.falling = true;
            boss.vy = -6;
            score += 15000;
            playSFX("clear");
            floatingTexts.push({ text: "+15000 BOSS DEFEATED!", x: boss.x - 60, y: boss.y - 60, vy: -1.5, life: 120 });
            gameState = "BOSS_DEFEAT_CUTSCENE";
          }
          break;
        }
      }
      
      let c = floor(hitX / TILE_SIZE);
      let r = floor(hitY / TILE_SIZE);
      
      if (r >= 0 && r < levelMap.length && c >= 0 && c < levelMap[0].length) {
        let tile = levelMap[r][c];
        if (tile !== ' ' && tile !== 'I' && tile !== 'A' && tile !== 'L' && tile !== '|' && tile !== 'F' && tile !== 'C') { 
          if (tile === 'B') {
            levelMap[r][c] = ' ';
            score += 50;
            playSFX("brick");
            spawnBrickParticles(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
          } else if (tile === '?') {
            levelMap[r][c] = 'E';
            addCoinAndScore(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE);
          } else if (tile === 'M' || tile === '*') {
            levelMap[r][c] = 'E';
            spawnPowerupFromBlock(tile, c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE - TILE_SIZE / 2);
          }
          else if (tile === 't') {
          levelMap[r][c] = 'E';
          addBumpTile(r, c);
          torchCount += 16;
          playSFX("powerup");
          floatingTexts.push({ text: "獲得 16 根火把！", x: c * TILE_SIZE - 30, y: r * TILE_SIZE - 20, vy: -1.5, life: 70, isOneUp: true });
        }
          break; 
        }
      }
    }

    let effectScale = isBig ? 0.24 : 0.166;

    activeEffects.push({
      img: muzzleFlashImg,
      x: startX,
      y: startY,
      spawnTime: millis(),
      duration: 50,      
      scale: effectScale,      
      direction: facingDirection
    });

    activeEffects.push({
      img: hitEffectImg,
      x: hitX,
      y: hitY,
      spawnTime: millis(),
      duration: 50,      
      scale: effectScale,      
      direction: facingDirection
    });

    hasFiredThisAttack = true; 
  }

  // --- 5. 攝影機跟隨（依視角縮放自動計算視野寬度） ---
  let maxCameraX = max(0, levelMap[0].length * TILE_SIZE - viewWorldW);
  cameraX = constrain(characterX - viewWorldW / 3, 0, maxCameraX);

  // --- 6. 繪製世界（套用視角縮放） ---
  push(); 
  scale(z);
  let mapOffsetY = viewWorldH - (levelMap.length * TILE_SIZE);
  translate(-cameraX, mapOffsetY); 

  if (castleFlagRaised) {
  castleFlagProgress = min(1, castleFlagProgress + 0.035);
  let poleHeight = 52 * castleFlagProgress;
  let poleBaseY = castleRoofTopY + 14;
  let poleTopY = poleBaseY - poleHeight;

  push();
  // 旗桿
  stroke("#FFFFFF");
  strokeWeight(4);
  line(castleTargetX, poleBaseY, castleTargetX, poleTopY);

  // 旗桿頂端金球
  noStroke();
  fill("#FFD166");
  ellipse(castleTargetX, poleTopY, 10, 10);

  // 升起超過一半時展開紅色金星小旗子
  if (castleFlagProgress > 0.35) {
    let wave = sin(frameCount * 0.2) * 2.5;
    fill("#E63946");
    stroke("#540B0E");
    strokeWeight(1.5);
    beginShape();
    vertex(castleTargetX, poleTopY + 3);
    vertex(castleTargetX + 34, poleTopY + 12 + wave);
    vertex(castleTargetX, poleTopY + 23);
    endShape(CLOSE);

    // 旗面中央小星星徽章
    noStroke();
    fill("#FFD166");
    ellipse(castleTargetX + 12, poleTopY + 13 + wave * 0.4, 7, 7);
  }
  pop();
}
  drawWorld2AtmosphereAndLandmarks(); // <--- 新增這 1 行（畫在所有磚塊與角色後方）
  drawMap(viewWorldW);
  drawMovingPlatforms();
  drawEnemies();
  if (currentLevel === 4) {
    drawFireBars();
    drawBossAndFireballs();
  }
  if (currentWorld === 2 && currentLevel === 5) {
    drawSandwormBoss();
    drawRescueCutscene();
  }
  if (gameState !== "ITEM_GUIDE" && !showSettingsModal && !showExitMapConfirmModal) {
    updateAndDrawItems(currentHitboxW, currentHitboxH);
  }
  drawPlayerFireballs();
  drawCactusNeedles();

  if (gameState === "PLAYING" && !showSettingsModal && !showExitMapConfirmModal) {
    checkCollectOpenCoins(currentHitboxW, currentHitboxH);
  }
  updateAndDrawCoins(); 
  updateAndDrawBrickParticles();

  let isInvincibleHidden = (invincibleTimer > 0 && floor(invincibleTimer / 100) % 2 === 1);
  if (!hideCharacter && !isInvincibleHidden) {
    let hitboxBottomY = characterY + currentHitboxH / 2;
    let frameBottomPad = metric.frameBottomPaddings[currentFrame] || 0;
    let realFeetOffsetFromCanvasBottom = frameBottomPad * displayScale;
    let drawCenterY = hitboxBottomY - (frameHeight * displayScale) / 2 + realFeetOffsetFromCanvasBottom;

    if (currentSprintBonus > 0.45 && moveX !== 0) {
      push();
      translate(characterX - facingDirection * 14, drawCenterY);
      scale(facingDirection * displayScale, displayScale);
      tint(100, 220, 255, 110);
      image(activeSpriteSheet, 0, 0, frameWidth, frameHeight, currentFrame * frameWidth, 0, frameWidth, frameHeight);
      noTint();
      pop();
    }
    // 當主角正在進出水管過場時，補畫一次地圖圖層在主角前方，讓綠色水管自然遮住主角身體
  if (gameState === "PIPE_ENTER" || gameState === "PIPE_EXIT") {
    drawMap(viewWorldW);
  }
    if (powerLevel === 3 && powerType === "cactus" && isCrouching) {
      push();
      translate(characterX, characterY);
      noFill();
      stroke("#38B000");
      strokeWeight(3);
      ellipse(0, 0, currentHitboxW + 22, currentHitboxH + 14);
      pop();
    }
    if (chronoWaveTimer > 0) {
      chronoWaveTimer -= deltaTime;
      let progress = 1 - max(0, chronoWaveTimer) / 450;
      push();
      translate(characterX, characterY);
      noFill();
      stroke(255, 209, 102, 220 * (1 - progress));
      strokeWeight(5 * (1 - progress) + 1);
      ellipse(0, 0, progress * 520, progress * 520);
      pop();
    }
    if (chronoFieldActive) {
      push();
      translate(characterX, characterY);
      fill(255, 209, 102, 35);
      stroke("#FFD166");
      strokeWeight(2);
      ellipse(0, 0, 520, 520);
      pop();
    }
    if (powerType === "feather") {
      push();
      translate(characterX - facingDirection * 12, drawCenterY - 4);
      fill("#FFF3B0");
      stroke("#E09F3E");
      strokeWeight(2);
      let wingFlap = sin(frameCount * 0.25) * 6;
      ellipse(0, wingFlap, 18, 28);
      pop();
    }

    if (activeCharacterId === 1) {
      // 繪製解鎖的新角色「沙漠遊俠」造型
      push();
      translate(characterX, hitboxBottomY);
      scale(facingDirection * (isBig ? 1.35 : 1.0), (isBig ? 1.35 : 1.0) * (isCrouching ? 0.65 : 1.0));
      noStroke();
      fill(starTimer > 0 ? color((frameCount * 20) % 255, 200, 255) : "#2EC4B6");
      rect(-12, -34, 24, 34, 6);
      fill("#FFD166");
      ellipse(0, -44, 24, 24);
      fill("#E63946");
      rect(-15, -52, 30, 7, 3);
      fill(0);
      ellipse(5, -45, 4, 5);
      pop();
    } else {
      push(); 
      translate(characterX, drawCenterY); 
      scale(facingDirection * displayScale, displayScale); 
      if (starTimer > 0) {
        colorMode(HSB, 360, 100, 100);
        tint((frameCount * 18) % 360, 85, 100);
      } else if (powerLevel === 3) {
        tint(getPowerTintColor(powerType));
      }
      image(activeSpriteSheet, 0, 0, frameWidth, frameHeight, currentFrame * frameWidth, 0, frameWidth, frameHeight); 
      noTint();
      colorMode(RGB, 255); // <--- 補上這行，還原預設 RGB 模式！
      pop(); 
    }

    // 主角自暈 3 秒期間：頭頂畫出 3 顆旋轉金星
    if (playerStunTimer > 0) {
      push();
      translate(characterX, characterY - currentHitboxH / 2 - 14);
      for (let s = 0; s < 3; s++) {
        let ang = frameCount * 0.18 + s * (TWO_PI / 3);
        noStroke();
        fill("#FFD700");
        ellipse(cos(ang) * 16, sin(ang) * 5, 7, 7);
      }
      pop();
    }
  }

  if (gameState === "ENTERING_PIPE" || isExitingPipe || isExitingCeilingPipe || gameState === "ENTERING_SUPPLY_PIPE" || gameState === "EXITING_SUPPLY_PIPE") {
    drawPipesOnly();
}

  for (let i = activeEffects.length - 1; i >= 0; i--) {
    let ef = activeEffects[i];
    if (millis() - ef.spawnTime > ef.duration) {
      activeEffects.splice(i, 1); 
    } else {
      push();
      translate(ef.x, ef.y);
      scale(ef.direction * ef.scale, ef.scale); 
      image(ef.img, 0, 0); 
      pop();
    }
  }

  updateAndDrawFloatingTexts();

  // <--- 新增：2-4 黑暗礦坑頭燈裝備架、火把與黑暗視野遮罩
  if (currentWorld === 2 && currentLevel === 4) {
    drawMinerLampAndTorches(viewWorldW, viewWorldH);
  }
  // 進出水管與流沙黑幕平滑轉場，消除畫面硬切割裂感
let pipeFadeAlpha = 0;
if (gameState === "ENTERING_PIPE") {
  let elapsed = millis() - stateTimer;
  if (elapsed > 650) {
    pipeFadeAlpha = map(elapsed, 650, 1100, 0, 255, true);
  }
} else if (gameState === "ENTERING_SUPPLY_PIPE" || gameState === "EXITING_SUPPLY_PIPE") {
  let elapsed = millis() - stateTimer;
  if (elapsed > 250) {
    pipeFadeAlpha = map(elapsed, 250, 550, 0, 255, true);
  }
} else if (gameState === "ENTERING_QUICKSAND") {
  let elapsed = millis() - stateTimer;
  if (elapsed > 150) {
    pipeFadeAlpha = map(elapsed, 150, 550, 0, 255, true);
  }
} else if (isExitingPipe) {
  let elapsed = millis() - stateTimer;
  if (elapsed < 350) {
    pipeFadeAlpha = map(elapsed, 0, 350, 255, 0, true);
  }
} else if (typeof quicksandFadeInTimer !== "undefined" && millis() - quicksandFadeInTimer < 400) {
  pipeFadeAlpha = map(millis() - quicksandFadeInTimer, 0, 400, 255, 0, true);
}

if (pipeFadeAlpha > 0) {
  push();
  resetMatrix();
  noStroke();
  fill(0, 0, 0, pipeFadeAlpha);
  rect(0, 0, width, height);
  pop();
}

  pop(); 

  drawNSMBHUD();

  if (controlMode === "MOBILE" && gameState === "PLAYING" && !showSettingsModal) {
    drawMobileControls();
  }

  if (gameState === "ITEM_GUIDE" && activeGuideData) {
    drawItemGuideModal();
  }

  if (showSettingsModal) {
    drawSettingsModal();
  }

  if (showExitMapConfirmModal) {
    drawExitMapConfirmModal();
  }

  if (gameState === "ALL_CLEAR") {
    fill(0, 0, 0, 190);
    rect(0, 0, width, height);
    fill("#FFD700");
    textSize(min(52, width * 0.06));
    textAlign(CENTER, CENTER);
    text("ALL COURSES CLEAR!", width / 2, height / 2 - 60);
    fill("#FF6B6B");
    textSize(min(24, width * 0.032));
    text(
      unlockedNewChar
        ? `你擊敗了沙暴巨蟲並救出了沙漠遊俠！（目前：${activeCharacterId === 1 ? "沙漠遊俠" : "原本主角"}）`
        : "你成功擊敗了魔王，拯救了這片大地！",
      width / 2,
      height / 2 - 5
    );
    fill(255);
    textSize(min(24, width * 0.032));
    text(`FINAL SCORE: ${score}`, width / 2, height / 2 + 42);
    textSize(17);
    fill("#FFD166");
    text(
      unlockedNewChar
        ? (controlMode === "MOBILE" ? "點擊螢幕返回大地圖" : "按 [C] 切換角色  ｜  按 [M] 返回大地圖選關畫面")
        : (controlMode === "MOBILE" ? "點擊螢幕返回大地圖" : "按 [M] 返回大地圖選關畫面"),
      width / 2,
      height / 2 + 88
    );
  }
  }
// =====================================================================
// 首次獲得道具圖鑑說明彈窗 (Item Guide Modal) - 自動依文字行數撐高外框
// =====================================================================
function drawItemGuideModal() {
  push();
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, width, height);

  let boxW = min(520, width * 0.90);
  let textAreaW = boxW - 128;
  let fontSize = constrain(boxW * 0.031, 13, 15.5);
  let lineH = fontSize * 1.48;

  textFont("sans-serif");
  textStyle(BOLD);
  textSize(fontSize);

  // 1. 先依實際文字寬度計算每段說明會折成幾行，動態決定彈窗總高度
  let wrappedParagraphs = [];
  let totalLines = 0;
  for (let rawLine of activeGuideData.desc) {
    let lines = [];
    let cur = "";
    for (let ch of rawLine) {
      if (textWidth(cur + ch) > textAreaW && cur.length > 0) {
        lines.push(cur);
        cur = ch;
      } else {
        cur += ch;
      }
    }
    if (cur.length > 0) lines.push(cur);
    wrappedParagraphs.push(lines);
    totalLines += lines.length;
  }

  let contentH = totalLines * lineH + (wrappedParagraphs.length - 1) * 6;
  let boxH = max(230, min(height * 0.88, 118 + contentH));
  let bx = width / 2 - boxW / 2;
  let by = height / 2 - boxH / 2;

  // 深胡桃木咖啡色底板
  stroke("#8D5524");
  strokeWeight(6);
  fill("#3B2414");
  rect(bx, by, boxW, boxH, 18);

  stroke("#D4A373");
  strokeWeight(2.5);
  noFill();
  rect(bx + 8, by + 8, boxW - 16, boxH - 16, 12);

  // 頂部標題橫幅
  noStroke();
  fill(activeGuideData.color);
  rect(bx + 20, by + 18, boxW - 40, 38, 10);

  fill("#FFFFFF");
  textSize(min(19, boxW * 0.041));
  textAlign(CENTER, CENTER);
  text(`NEW ITEM! ${activeGuideData.title}`, width / 2, by + 37);

  // 左側深木展示框（垂直置中於文字區）
  let bodyTop = by + 68;
  let bodyBottom = by + boxH - 38;
  let bodyMidY = (bodyTop + bodyBottom) / 2;
  fill("#26160C");
  rect(bx + 22, bodyMidY - 45, 74, 90, 12);
  drawPowerupIcon(activeGuideData.type, bx + 59, bodyMidY + 4, 1.75);

  // 右側逐行繪製說明文字（絕對不重疊、不超框）
  fill("#FFF8E7");
  textSize(fontSize);
  textAlign(LEFT, TOP);
  let curY = bodyTop + max(0, (bodyBottom - bodyTop - contentH) / 2);
  for (let paraLines of wrappedParagraphs) {
    for (let ln of paraLines) {
      text(ln, bx + 108, curY);
      curY += lineH;
    }
    curY += 6;
  }

  fill("#FFD166");
  textSize(13);
  textAlign(CENTER, BOTTOM);
  text("點擊畫面或按任意鍵繼續冒險 ▼", width / 2, by + boxH - 13);
  pop();
}

function getExitMapConfirmRects() {
  let boxW = min(440, width * 0.88);
  let boxH = min(220, height * 0.82);
  let bx = width / 2 - boxW / 2;
  let by = height / 2 - boxH / 2;
  let compact = (boxH < 195);
  let btnW = (boxW - 68) / 2;
  let btnH = compact ? 36 : 42;
  let btnY = by + boxH - btnH - (compact ? 14 : 22);
  return {
    boxW, boxH, bx, by, compact,
    confirmBtn: { x: bx + 24, y: btnY, w: btnW, h: btnH },
    cancelBtn:  { x: bx + 44 + btnW, y: btnY, w: btnW, h: btnH }
  };
}

function drawExitMapConfirmModal() {
  let r = getExitMapConfirmRects();
  let headerH = r.compact ? 30 : 36;
  push();
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, width, height);

  stroke("#8D5524");
  strokeWeight(6);
  fill("#3B2414");
  rect(r.bx, r.by, r.boxW, r.boxH, 18);

  stroke("#D4A373");
  strokeWeight(2.5);
  noFill();
  rect(r.bx + 8, r.by + 8, r.boxW - 16, r.boxH - 16, 12);

  noStroke();
  fill("#A44A3F");
  rect(r.bx + 20, r.by + 14, r.boxW - 40, headerH, 10);

  fill("#FFF8E7");
  textFont("sans-serif");
  textStyle(BOLD);
  textSize(min(r.compact ? 16 : 18, r.boxW * 0.042));
  textAlign(CENTER, CENTER);
  text("🪧 冒險提示告示牌", width / 2, r.by + 14 + headerH / 2);

  fill("#FFF8E7");
  textSize(min(r.compact ? 14 : 16, r.boxW * 0.036));
  textAlign(CENTER, CENTER);
  text("返回地圖將重置為進入關卡前的狀態，\n請問是否確認返回地圖？", width / 2, r.by + r.boxH * 0.49);

  stroke("#540B0E");
  strokeWeight(2.5);
  fill("#E63946");
  rect(r.confirmBtn.x, r.confirmBtn.y, r.confirmBtn.w, r.confirmBtn.h, 10);

  stroke("#1B4332");
  fill("#2EC4B6");
  rect(r.cancelBtn.x, r.cancelBtn.y, r.cancelBtn.w, r.cancelBtn.h, 10);

  noStroke();
  fill("#FFFFFF");
  textSize(min(r.compact ? 14 : 16, r.boxW * 0.036));
  text("✔ 確認返回", r.confirmBtn.x + r.confirmBtn.w / 2, r.confirmBtn.y + r.confirmBtn.h / 2);
  text("✖ 繼續冒險", r.cancelBtn.x + r.cancelBtn.w / 2, r.cancelBtn.y + r.cancelBtn.h / 2);
  pop();
}

function handleExitMapConfirmClick(px, py) {
  let r = getExitMapConfirmRects();
  const inRect = (b) => (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
  if (inRect(r.confirmBtn)) {
    showExitMapConfirmModal = false;
    exitToWorldMapRestoreEntry();
  } else if (inRect(r.cancelBtn) || !inRect({ x: r.bx, y: r.by, w: r.boxW, h: r.boxH })) {
    showExitMapConfirmModal = false;
    playSFX("mapMove");
  }
}

// =====================================================================
// 畫面視角縮放與裝置操作設定視窗 (Settings Modal) - 支援手機橫螢幕自適應高度
// =====================================================================
function getSettingsModalRects() {
  let panelW = min(440, width * 0.90);
  let panelH = min(340, height * 0.92);
  let px = width / 2 - panelW / 2;
  let py = height / 2 - panelH / 2;

  let topStart = py + panelH * 0.22;
  let availH = panelH * 0.72;
  let rowGap = availH / 4;
  let btnH = min(36, rowGap * 0.80);
  let halfW = (panelW - 84) / 2;

  return {
    panelW, panelH, px, py, btnH,
    zoomOut:   { x: px + 36, y: topStart, w: 54, h: btnH },
    zoomIn:    { x: px + panelW - 90, y: topStart, w: 54, h: btnH },
    autoFit:   { x: px + 36, y: topStart + rowGap * 1, w: panelW - 72, h: btnH * 0.92 },
    guideBtn:  { x: px + 36, y: topStart + rowGap * 2, w: panelW - 72, h: btnH * 0.95 },
    modePc:    { x: px + 36, y: topStart + rowGap * 3, w: halfW, h: btnH },
    modeMob:   { x: px + 48 + halfW, y: topStart + rowGap * 3, w: halfW, h: btnH },
    muteBtn:   { x: px + 36, y: topStart + rowGap * 4 - btnH * 0.1, w: halfW, h: btnH },
    closeBtn:  { x: px + 48 + halfW, y: topStart + rowGap * 4 - btnH * 0.1, w: halfW, h: btnH }
  };
}

function drawSettingsModal() {
  let r = getSettingsModalRects();
  let curZoom = getEffectiveViewZoom();
  let compact = (r.panelH < 300);

  push();
  fill(0, 0, 0, 175);
  noStroke();
  rect(0, 0, width, height);

  stroke("#FFD166");
  strokeWeight(4);
  fill("#1D2D44");
  rect(r.px, r.py, r.panelW, r.panelH, 18);

  noStroke();
  fill("#FFD166");
  textFont("sans-serif");
  textStyle(BOLD);
  textSize(compact ? 17 : 20);
  textAlign(CENTER, TOP);
  text("⚙ 遊戲畫面與操作設定", width / 2, r.py + (compact ? 10 : 14));

  fill("#CBD5E1");
  textSize(compact ? 11.5 : 13);
  text("調整鏡頭視角大小（可完整顯示手機橫向畫面）", width / 2, r.py + (compact ? 33 : 42));

  fill("#32ADE6");
  rect(r.zoomOut.x, r.zoomOut.y, r.zoomOut.w, r.zoomOut.h, 10);
  rect(r.zoomIn.x, r.zoomIn.y, r.zoomIn.w, r.zoomIn.h, 10);

  fill("#FFFFFF");
  textSize(compact ? 18 : 22);
  textAlign(CENTER, CENTER);
  text("－", r.zoomOut.x + r.zoomOut.w / 2, r.zoomOut.y + r.zoomOut.h / 2);
  text("＋", r.zoomIn.x + r.zoomIn.w / 2, r.zoomIn.y + r.zoomIn.h / 2);

  textSize(compact ? 15 : 17);
  text(`視角倍率：${Math.round(curZoom * 100)}%`, width / 2, r.zoomOut.y + r.zoomOut.h / 2);

  fill(autoFitMobileZoom && controlMode === "MOBILE" ? "#34C759" : "#334155");
  rect(r.autoFit.x, r.autoFit.y, r.autoFit.w, r.autoFit.h, 8);
  fill("#FFFFFF");
  textSize(min(13, r.panelW * 0.031));
  text("自動完整顯示 15 格高度（手機推薦）", r.autoFit.x + r.autoFit.w / 2, r.autoFit.y + r.autoFit.h / 2);

  fill(showItemGuides ? "#2A9D8F" : "#475569");
  rect(r.guideBtn.x, r.guideBtn.y, r.guideBtn.w, r.guideBtn.h, 8);
  fill("#FFFFFF");
  textSize(min(13, r.panelW * 0.030));
  text(showItemGuides ? "📖 新手道具提示：ON（首次獲得跳圖鑑）" : "📖 新手道具提示：OFF（不彈窗）", r.guideBtn.x + r.guideBtn.w / 2, r.guideBtn.y + r.guideBtn.h / 2);

  fill(controlMode === "PC" ? "#32ADE6" : "#334155");
  rect(r.modePc.x, r.modePc.y, r.modePc.w, r.modePc.h, 8);
  fill(controlMode === "MOBILE" ? "#34C759" : "#334155");
  rect(r.modeMob.x, r.modeMob.y, r.modeMob.w, r.modeMob.h, 8);

  fill("#FFFFFF");
  textSize(compact ? 13 : 14);
  text("💻 電腦鍵盤", r.modePc.x + r.modePc.w / 2, r.modePc.y + r.modePc.h / 2);
  text("📱 手機觸控", r.modeMob.x + r.modeMob.w / 2, r.modeMob.y + r.modeMob.h / 2);

  fill(audioMuted ? "#E63946" : "#475569");
  rect(r.muteBtn.x, r.muteBtn.y, r.muteBtn.w, r.muteBtn.h, 8);
  fill("#FFD166");
  rect(r.closeBtn.x, r.closeBtn.y, r.closeBtn.w, r.closeBtn.h, 8);

  fill("#FFFFFF");
  text(audioMuted ? "🔇 音效：靜音" : "🔊 音效：開啟", r.muteBtn.x + r.muteBtn.w / 2, r.muteBtn.y + r.muteBtn.h / 2);
  fill("#1D2D44");
  text("✔ 完成設定", r.closeBtn.x + r.closeBtn.w / 2, r.closeBtn.y + r.closeBtn.h / 2);
  pop();
}

function handleSettingsModalClick(px, py) {
  let r = getSettingsModalRects();
  const inRect = (b) => (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
  if (inRect(r.zoomOut)) {
    autoFitMobileZoom = false;
    viewZoom = constrain(round((getEffectiveViewZoom() - 0.1) * 100) / 100, 0.45, 1.35);
    playSFX("mapMove");
  } else if (inRect(r.zoomIn)) {
    autoFitMobileZoom = false;
    viewZoom = constrain(round((getEffectiveViewZoom() + 0.1) * 100) / 100, 0.45, 1.35);
    playSFX("mapMove");
  } else if (inRect(r.autoFit)) {
    autoFitMobileZoom = true;
    viewZoom = constrain(height / (15 * TILE_SIZE), 0.45, 1.35);
    playSFX("powerup");
  } else if (inRect(r.guideBtn)) {
    showItemGuides = !showItemGuides;
    playSFX("mapMove");
  } else if (inRect(r.modePc)) {
    controlMode = "PC";
    autoFitMobileZoom = false;
    viewZoom = 1.0;
    playSFX("mapMove");
  } else if (inRect(r.modeMob)) {
    controlMode = "MOBILE";
    autoFitMobileZoom = true;
    playSFX("mapMove");
  } else if (inRect(r.muteBtn)) {
    audioMuted = !audioMuted;
    if (!audioMuted) playSFX("coin");
  } else if (inRect(r.closeBtn) || !inRect({ x: r.px, y: r.py, w: r.panelW, h: r.panelH })) {
    showSettingsModal = false;
    playSFX("mapMove");
  }
}

// =====================================================================
// 0. 開頭裝置配置選擇畫面 (Device Select Screen) - 支援手機橫螢幕自適應排版
// =====================================================================
function getDeviceSelectCards() {
  let compact = (height < 430);
  let cardW = min(310, width * 0.42);
  let cardH = compact ? constrain(height * 0.44, 148, 185) : min(215, height * 0.42);
  let gap = min(36, width * 0.045);
  let centerY = compact ? height * 0.50 : height * 0.50;
  return [
    {
      mode: "PC",
      x: width / 2 - cardW / 2 - gap / 2,
      y: centerY,
      w: cardW,
      h: cardH,
      title: "電腦版 (PC)",
      sub: "鍵盤操作模式",
      desc: "方向鍵 / WASD 移動｜空白鍵 / W 跳躍\nF 射擊｜Ctrl 加速｜B 空投｜O 設定",
      accent: "#32ADE6"
    },
    {
      mode: "MOBILE",
      x: width / 2 + cardW / 2 + gap / 2,
      y: centerY,
      w: cardW,
      h: cardH,
      title: "手機 / 平板版",
      sub: "自動適應視角＋虛擬按鍵",
      desc: "自動完整縮放 15 格高度\nDASH 點按鎖定｜支援多點觸控",
      accent: "#34C759"
    }
  ];
}

function getDeviceGuideToggleRect() {
  let compact = (height < 430);
  let barW = min(420, width * 0.86);
  let barH = compact ? 36 : 44;
  return {
    x: width / 2 - barW / 2,
    y: compact ? height * 0.80 : height * 0.77,
    w: barW,
    h: barH
  };
}

function drawDeviceSelect() {
  let compact = (height < 430);
  background("#1A2639");
  noStroke();
  fill("#24344D");
  ellipse(width * 0.2, height * 0.85, width * 0.6, height * 0.5);
  ellipse(width * 0.8, height * 0.85, width * 0.6, height * 0.5);

  let logoSize = compact ? min(28, width * 0.042) : min(42, width * 0.055);
  drawColorfulWorldLogo("SUPER PLATFORMER", width / 2 - logoSize * 5.6, compact ? height * 0.11 : height * 0.15, logoSize);

  fill("#FFD166");
  textFont("sans-serif");
  textStyle(BOLD);
  textSize(compact ? min(14, width * 0.024) : min(20, width * 0.030));
  textAlign(CENTER, CENTER);
  text("請選擇你的遊玩裝置配置（遊戲中可隨時在右上角「⚙設定」調整）", width / 2, compact ? height * 0.20 : height * 0.24);

  let cards = getDeviceSelectCards();
  for (let c of cards) {
    let isHover = (mouseX > c.x - c.w / 2 && mouseX < c.x + c.w / 2 &&
                   mouseY > c.y - c.h / 2 && mouseY < c.y + c.h / 2);

    push();
    translate(c.x, c.y);
    stroke(isHover ? "#FFD166" : c.accent);
    strokeWeight(isHover ? 5 : 3.5);
    fill(isHover ? "#2E4365" : "#1F2E46");
    rect(-c.w / 2, -c.h / 2, c.w, c.h, 20);

    noStroke();
    let iconScale = compact ? 0.76 : 1.0;
    push();
    translate(0, -c.h * 0.25);
    scale(iconScale);
    if (c.mode === "PC") {
      fill("#E0E1DD");
      rect(-34, -22, 68, 42, 6);
      fill("#32ADE6");
      rect(-28, -17, 56, 30, 3);
      fill("#ADB5BD");
      rect(-12, 20, 24, 8);
      rect(-24, 28, 48, 5, 2);
    } else {
      fill("#E0E1DD");
      rect(-22, -28, 44, 62, 8);
      fill("#34C759");
      rect(-17, -21, 34, 46, 3);
      fill("#1F2E46");
      ellipse(0, 29, 5, 5);
    }
    pop();

    fill("#FFFFFF");
    textSize(min(compact ? 18 : 23, c.w * 0.085));
    textAlign(CENTER, CENTER);
    text(c.title, 0, c.h * 0.03);

    fill(c.accent);
    textSize(min(compact ? 12 : 14, c.w * 0.055));
    text(c.sub, 0, c.h * 0.16);

    fill("#CBD5E1");
    textStyle(NORMAL);
    textSize(min(compact ? 11 : 12.5, c.w * 0.044));
    text(c.desc, 0, c.h * 0.33);
    pop();
  }

  // 下方：新手道具提示 ON / OFF 滑動切換條
  let tb = getDeviceGuideToggleRect();
  push();
  stroke("#475569");
  strokeWeight(2.5);
  fill("#1F2E46");
  rect(tb.x, tb.y, tb.w, tb.h, 22);

  noStroke();
  fill("#FFF8E7");
  textFont("sans-serif");
  textStyle(BOLD);
  textSize(min(compact ? 13 : 15, tb.w * 0.038));
  textAlign(LEFT, CENTER);
  text("📖 新手道具圖鑑提示", tb.x + 18, tb.y + tb.h / 2);

  let pillW = compact ? 68 : 76;
  let pillH = compact ? 24 : 28;
  let pillX = tb.x + tb.w - pillW - 12;
  let pillY = tb.y + (tb.h - pillH) / 2;

  fill(showItemGuides ? "#34C759" : "#64748B");
  rect(pillX, pillY, pillW, pillH, 14);

  fill("#FFFFFF");
  textSize(11.5);
  textAlign(CENTER, CENTER);
  if (showItemGuides) {
    text("ON", pillX + pillW * 0.32, pillY + pillH / 2);
    ellipse(pillX + pillW - pillH / 2, pillY + pillH / 2, pillH - 6, pillH - 6);
  } else {
    text("OFF", pillX + pillW * 0.68, pillY + pillH / 2);
    ellipse(pillX + pillH / 2, pillY + pillH / 2, pillH - 6, pillH - 6);
  }
  pop();
}

// =====================================================================
// 手機版多點觸控虛擬按鍵系統 (Mobile Virtual Controls)
// =====================================================================
function getMobileButtonsLayout() {
  let btnR = constrain(min(width, height) * 0.085, 32, 50);
  let padMargin = btnR + 22;
  let bottomY = height - btnR - 18;

  return {
    left:  { x: padMargin, y: bottomY - btnR * 0.35, r: btnR, label: "◀", color: "rgba(255,255,255,0.28)" },
    right: { x: padMargin + btnR * 2.25, y: bottomY - btnR * 0.35, r: btnR, label: "▶", color: "rgba(255,255,255,0.28)" },
    down:  { x: padMargin + btnR * 1.12, y: bottomY + btnR * 0.65, r: btnR * 0.85, label: "▼", color: "rgba(255,255,255,0.24)" },
    jump:  { x: width - padMargin, y: bottomY - btnR * 0.25, r: btnR * 1.12, label: "JUMP", color: "rgba(52, 199, 89, 0.42)" },
    fire:  { x: width - padMargin - btnR * 2.25, y: bottomY + btnR * 0.15, r: btnR * 0.95, label: "FIRE", color: "rgba(255, 59, 48, 0.42)" },
    dash:  { x: width - padMargin - btnR * 1.15, y: bottomY - btnR * 1.75, r: btnR * 0.85, label: mobileDashLocked ? "DASH\nON" : "DASH\nOFF", color: "rgba(50, 173, 230, 0.42)" }
  };
}

function updateMobileTouchState() {
  let activePointers = [];
  if (touches && touches.length > 0) {
    for (let t of touches) activePointers.push({ x: t.x, y: t.y });
  }
  if (mouseIsPressed) {
    activePointers.push({ x: mouseX, y: mouseY });
  }

  let nextState = { left: false, right: false, down: false, jump: false, fire: false };

  if (gameState === "PLAYING" && !showSettingsModal && !showExitMapConfirmModal) {
    let layout = getMobileButtonsLayout();
    for (let pt of activePointers) {
      if (dist(pt.x, pt.y, layout.left.x, layout.left.y) < layout.left.r * 1.28) nextState.left = true;
      if (dist(pt.x, pt.y, layout.right.x, layout.right.y) < layout.right.r * 1.28) nextState.right = true;
      if (dist(pt.x, pt.y, layout.down.x, layout.down.y) < layout.down.r * 1.25) nextState.down = true;
      if (dist(pt.x, pt.y, layout.jump.x, layout.jump.y) < layout.jump.r * 1.25) nextState.jump = true;
      if (dist(pt.x, pt.y, layout.fire.x, layout.fire.y) < layout.fire.r * 1.25) nextState.fire = true;
    }

    if (nextState.jump && !prevTouchJump) {
      triggerJumpAction();
    }
    if (!nextState.jump && prevTouchJump) {
      if (velocityY < 0 && powerType !== "feather") {
        velocityY = 0;
        isShortJump = true;
      }
    }
    if (nextState.fire && !prevTouchFire) {
      triggerFireAction();
    }
  }

  prevTouchJump = nextState.jump;
  prevTouchFire = nextState.fire;
  touchControls = nextState;
}

function drawMobileControls() {
  let layout = getMobileButtonsLayout();
  push();
  textFont("Arial Black, sans-serif");
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  for (let keyName in layout) {
    let b = layout[keyName];
    let isPressed = (keyName === "dash") ? mobileDashLocked : touchControls[keyName];

    stroke(isPressed ? "#FFD166" : "rgba(255, 255, 255, 0.55)");
    strokeWeight(isPressed ? 4 : 2.5);
    fill(isPressed ? (keyName === "dash" ? "rgba(0, 150, 199, 0.78)" : "rgba(255, 215, 0, 0.55)") : b.color);
    ellipse(b.x, b.y, b.r * 2, b.r * 2);

    noStroke();
    fill(255, 255, 255, isPressed ? 255 : 210);
    textSize(keyName === "dash" ? b.r * 0.34 : (b.label.length > 1 ? b.r * 0.42 : b.r * 0.65));
    text(b.label, b.x, b.y + 1);
  }
  pop();
}

function triggerJumpAction() {
  if (isOnGround && !isActionLocked) {
    velocityY = jumpStrength; 
    isShortJump = false; 

    // 偵測腳下是否踩在流沙 ('Q' 或 'V') 裡，若是則改為「掙扎小跳」
    let checkFootR = floor((characterY + prevHitboxH / 2 - 4) / TILE_SIZE);
    let checkFootC = floor(characterX / TILE_SIZE);
    if (levelMap[checkFootR] && (levelMap[checkFootR][checkFootC] === 'Q' || levelMap[checkFootR][checkFootC] === 'V')) {
      velocityY = -5.5;
    }

    playSFX("jump");
  } else if (!isOnGround) {
    if (powerType === "feather") {
      if (featherFlapsLeft > 0) {
        featherFlapsLeft--;
        velocityY = -13;
        isGliding = true;
        isActionLocked = false;
        playSFX("flap");
      } else {
      isGliding = !isGliding;
    }
    } else {
      isGliding = !isGliding;  
      isActionLocked = false; 
      if (isGliding) {
        if (velocityY > 0) velocityY = 0; 
        else velocityY *= 0.5; 
      }
    }
  }
}

function triggerFireAction() {
  if (!isAttacking && !isCrouching) {
    isAttacking = true;
    hasFiredThisAttack = false; 
    currentFrame = 0; 
    lastFrameTime = millis();
  }
}

function triggerDropReservedItem() {
  if (reservedItem && gameState === "PLAYING") {
    let dropType = reservedItem;
    reservedItem = null;
    playSFX("powerup");
    items.push({
      type: dropType,
      x: characterX,
      y: characterY - 3 * TILE_SIZE,
      vx: 2,
      vy: 0,
      size: 32,
      spawnDelay: 500
    });
  }
}

// =====================================================================
// 《New Super Mario Bros. Wii》風格 UI 系統（大地圖 + 過場卡 + 遊戲 HUD）
// =====================================================================

function drawColorfulWorldLogo(worldStr, x, y, size = 38) {
  const palette = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#32ADE6", "#AF52DE"];
  push();
  textFont("Arial Black, Impact, sans-serif");
  textStyle(BOLD);
  textSize(size);
  textAlign(LEFT, CENTER);

  let curX = x;
  for (let i = 0; i < worldStr.length; i++) {
    let ch = worldStr[i];
    if (ch === ' ') {
      curX += size * 0.35;
      continue;
    }
    stroke(0);
    strokeWeight(size * 0.22);
    fill(0);
    text(ch, curX + 2, y + 3);
    fill(palette[i % palette.length]);
    text(ch, curX, y);
    noStroke();
    curX += textWidth(ch) + 2;
  }
  pop();
}

function drawPlayerHeadBadge(cx, cy, radius = 20) {
  push();
  translate(cx, cy);
  stroke(0);
  strokeWeight(3);
  fill("#FFFFFF");
  ellipse(0, 0, radius * 2, radius * 2);

  if (standSpriteSheet && standSpriteSheet.width > 0) {
    let fw = standSpriteSheet.width / STAND_FRAME_COUNT;
    let fh = standSpriteSheet.height;
    let metric = spriteMetrics["stand"] || { contentHeight: fh, minY: 0 };
    let cropY = metric.minY;
    let cropH = metric.contentHeight * 0.58;
    let aspect = fw / cropH;
    let drawH = radius * 1.65;
    let drawW = drawH * aspect;
    imageMode(CENTER);
    image(standSpriteSheet, 0, 1, drawW, drawH, 0, cropY, fw, cropH);
  }
  pop();
}

function drawNSMBHUD() {
  push();
  textFont("Arial Black, sans-serif");
  textStyle(BOLD);

  let compact = (height < 460);
  let badgeR = compact ? 16 : 21;
  let hudFontSize = compact ? 18 : 24;

  // --- 左上角：角色頭像 × 命數 & 金幣圖示 × 金幣數 ---
  drawPlayerHeadBadge(36, compact ? 28 : 42, badgeR);

  stroke(0);
  strokeWeight(4);
  fill("#FFFFFF");
  textSize(hudFontSize);
  textAlign(LEFT, CENTER);
  text(`× ${lives}`, 60, compact ? 29 : 44);

  push();
  translate(36, compact ? 62 : 84);
  stroke(0);
  strokeWeight(2.5);
  fill("#FFD166");
  ellipse(0, 0, compact ? 17 : 22, compact ? 22 : 28);
  noStroke();
  fill("#FFF3B0");
  rect(-2, -6, 4, 12, 2);
  pop();

  stroke(0);
  strokeWeight(4);
  fill("#FFD166");
  textSize(hudFontSize);
  textAlign(LEFT, CENTER);
  text(`× ${nf(coinCount, 2)}`, 60, compact ? 63 : 85);

  // --- 正上方中央：備用道具箱 (按 B 或直接點擊空投) ---
  let boxSize = compact ? 46 : 58;
  let boxX = width / 2 - boxSize / 2;
  let boxY = compact ? 10 : 18;

  fill(15, 25, 45, 210);
  stroke(reservedItem ? "#FFD166" : "#FFFFFF");
  strokeWeight(3);
  rect(boxX, boxY, boxSize, boxSize, 10);
  noStroke();

  if (reservedItem) {
    drawPowerupIcon(reservedItem, width / 2, boxY + boxSize / 2 - 2, compact ? 0.9 : 1.15);
    stroke(0);
    strokeWeight(2.5);
    fill("#FFD166");
    textSize(10);
    textAlign(CENTER, BOTTOM);
    text(controlMode === "MOBILE" ? "TAP" : "[B]", width / 2, boxY + boxSize - 1);
  } else {
    fill(200);
    textSize(10);
    textAlign(CENTER, CENTER);
    text(controlMode === "MOBILE" ? "ITEM" : "ITEM\n[B]", width / 2, boxY + boxSize / 2);
  }

  // --- 2-4 專屬：備用道具箱右邊的「獨立火把道具框 [E]」 ---
if (currentWorld === 2 && currentLevel === 4) {
  let tBoxX = boxX + boxSize + 12;
  fill(15, 25, 45, 210);
  stroke(torchCount > 0 ? "#FF9E00" : "#6C757D");
  strokeWeight(3);
  rect(tBoxX, boxY, boxSize, boxSize, 10);
  noStroke();

  push();
  translate(tBoxX + boxSize / 2, boxY + boxSize / 2 - 4);
  fill("#8D5524");
  rect(-2.5, -2, 5, 14, 2);
  fill(torchCount > 0 ? "#FF5400" : "#6C757D");
  ellipse(0, -6, 10, 14);
  if (torchCount > 0) {
    fill("#FFD166");
    ellipse(0, -5, 5, 8);
  }
  pop();

  stroke(0);
  strokeWeight(2.5);
  fill("#FFD166");
  textSize(10);
  textAlign(CENTER, BOTTOM);
  text(`${torchCount} [E]`, tBoxX + boxSize / 2, boxY + boxSize - 1);
}

  // --- 右上角：8位數分數 + 時鐘倒數 + 快捷觸控圖示按鈕 ---
  stroke(0);
  strokeWeight(4);
  fill("#FFFFFF");
  textSize(compact ? 19 : 24);
  textAlign(RIGHT, CENTER);
  text(nf(score, 8), width - 20, compact ? 24 : 34);

  let timerTextX = width - 20;
  let timerY = compact ? 48 : 66;
  stroke(0);
  strokeWeight(4);
  fill(levelTimer <= 60 ? "#FF3B30" : "#FFD166");
  textSize(compact ? 18 : 22);
  text(nf(levelTimer, 3), timerTextX, timerY);

  push();
  translate(timerTextX - (compact ? 52 : 64), timerY - 1);
  stroke(0);
  strokeWeight(2.5);
  fill("#FFD166");
  ellipse(0, 0, compact ? 16 : 20, compact ? 16 : 20);
  line(0, 0, 0, -4);
  line(0, 0, 4, 0);
  pop();

  // 右上角可點擊小按鈕：[⚙ 設定] / [🗺 地圖]
  let btnY = compact ? 66 : 92;
  let pillH = 26;
  noStroke();
  fill(0, 0, 0, 165);
  rect(width - 166, btnY, 70, pillH, 13);
  rect(width - 90,  btnY, 70, pillH, 13);

  fill(255);
  textFont("sans-serif");
  textSize(12);
  textAlign(CENTER, CENTER);
  text("⚙ 設定", width - 131, btnY + pillH / 2);
  text("🗺 地圖", width - 55, btnY + pillH / 2);

  // 電腦版底部提示膠囊
  if (controlMode === "PC") {
    let stageLabel = is1_2Intro ? "1-2 ENTRANCE" : `1-${currentLevel}`;
    let powerShort = "NORMAL";
    if (powerLevel === 2) powerShort = "SUPER";
    if (powerLevel === 3) {
      let pNames = { fire: "FIRE FLOWER", feather: "FEATHER CAPE", speed: "SPEED BOOST [Ctrl]" };
      powerShort = pNames[powerType] || "SUPER";
    }
    if (starTimer > 0) powerShort += ` ★${(starTimer / 1000).toFixed(1)}s`;

    noStroke();
    fill(0, 0, 0, 120);
    rect(18, height - 38, 520, 26, 13);
    fill(255, 255, 255, 220);
    textStyle(NORMAL);
    textSize(13);
    textAlign(LEFT, CENTER);
    text(`WORLD ${stageLabel}  |  ${powerShort}  |  [M] 大地圖  [O] 設定`, 30, height - 25);
  }

  pop();
}

function getWorldMapNodes() {
  let yBase = height * 0.52;
  if (currentWorld === 1) {
    return [
      { ...mapNodesData["1-1"], x: width * 0.20, y: yBase + 35 },
      { ...mapNodesData["1-2"], x: width * 0.38, y: yBase - 35 },
      { ...mapNodesData["1-3"], x: width * 0.56, y: yBase + 25 },
      { ...mapNodesData["1-4"], x: width * 0.74, y: yBase - 30 }
    ];
  } else {
    // World 2 沙漠大地圖座標（岔路口往右上進補給屋、往右下進 2-1，2-1 分支 2-2->2-3 與 2-4 匯聚到 2-5）
    return [
      { ...mapNodesData["2-0"],    x: width * 0.14, y: yBase + 10 },
      { ...mapNodesData["2-SHOP"], x: width * 0.26, y: yBase - 85 },
      { ...mapNodesData["2-1"],    x: width * 0.32, y: yBase + 45 },
      { ...mapNodesData["2-2"],    x: width * 0.50, y: yBase + 85 },
      { ...mapNodesData["2-3"],    x: width * 0.68, y: yBase + 85 },
      { ...mapNodesData["2-4"],    x: width * 0.56, y: yBase - 35 },
      { ...mapNodesData["2-5"],    x: width * 0.85, y: yBase + 15 }
    ];
  }
}

function drawWorldMap() {
  // === 1. 繪製世界背景 ===
  if (currentWorld === 1) {
    background("#5CC8FF");
    noStroke();
    fill(255, 255, 255, 190);
    ellipse(width * 0.18, height * 0.16, 130, 52);
    ellipse(width * 0.72, height * 0.14, 150, 56);

    fill("#70E000");
    ellipse(width * 0.25, height * 0.78, width * 0.75, height * 0.75);
    fill("#55C200");
    ellipse(width * 0.78, height * 0.80, width * 0.72, height * 0.78);
    fill("#38B000");
    rect(0, height * 0.68, width, height * 0.32);
  } else {
    // World 2 沙漠主題背景（金黃沙丘＋金字塔＋綠洲）
    background("#F4A261");
    noStroke();
    // 烈日
    fill("#FFF3B0");
    ellipse(width * 0.82, height * 0.16, 75, 75);

    // 遠景金字塔
    fill("#E76F51");
    triangle(width * 0.42, height * 0.42, width * 0.54, height * 0.18, width * 0.66, height * 0.42);
    fill("#D65A31");
    triangle(width * 0.54, height * 0.18, width * 0.66, height * 0.42, width * 0.58, height * 0.42);

    // 沙漠沙丘地形
    fill("#E9C46A");
    ellipse(width * 0.25, height * 0.75, width * 0.85, height * 0.80);
    fill("#F4D58D");
    ellipse(width * 0.75, height * 0.78, width * 0.85, height * 0.80);
    rect(0, height * 0.65, width, height * 0.35);

    // 岔路口旁的綠洲水池
    fill("#2EC4B6");
    ellipse(width * 0.12, height * 0.68, 95, 36);
  }

  let nodes = getWorldMapNodes();
  let nodeById = {};
  for (let n of nodes) nodeById[n.id] = n;

  // === 2. 繪製道路連線（未解鎖路線呈暗灰色） ===
  const drawRoadSegment = (a, b, isUnlocked) => {
    if (!a || !b) return;
    stroke(isUnlocked ? "#C9963B" : "#6C757D");
    strokeWeight(16);
    line(a.x, a.y, b.x, b.y);
    stroke(isUnlocked ? "#F4D58D" : "#ADB5BD");
    strokeWeight(10);
    line(a.x, a.y, b.x, b.y);
  };

  if (currentWorld === 1) {
    drawRoadSegment(nodeById["1-1"], nodeById["1-2"], nodeById["1-2"].unlocked);
    drawRoadSegment(nodeById["1-2"], nodeById["1-3"], nodeById["1-3"].unlocked);
    drawRoadSegment(nodeById["1-3"], nodeById["1-4"], nodeById["1-4"].unlocked);

    // 1-4 通關後，右側通往 World 2 沙漠的道路（過場期間嚴格依階段顯示）
    let showW2Road = worldTransition.active
      ? (worldTransition.phase !== "WHITE_FLAG")
      : nodeById["1-4"].cleared;

    if (showW2Road) {
      let c4 = nodeById["1-4"];
      let prog = (worldTransition.active && worldTransition.phase === "EXTEND_ROAD")
        ? worldTransition.roadProgress
        : 1;
      let endX = lerp(c4.x, width + 40, prog);
      stroke("#C9963B");
      strokeWeight(16);
      line(c4.x, c4.y, endX, c4.y);
      stroke("#F4D58D");
      strokeWeight(10);
      line(c4.x, c4.y, endX, c4.y);
    }
  } else {
    // 2-0 岔路口往左延伸返回 World 1 草原的道路
    let j0 = nodeById["2-0"];
    stroke("#C9963B");
    strokeWeight(16);
    line(-40, j0.y, j0.x, j0.y);
    stroke("#F4D58D");
    strokeWeight(10);
    line(-40, j0.y, j0.x, j0.y);

    drawRoadSegment(nodeById["2-0"], nodeById["2-SHOP"], true);
    drawRoadSegment(nodeById["2-0"], nodeById["2-1"],    true);
    drawRoadSegment(nodeById["2-1"], nodeById["2-2"],    nodeById["2-2"].unlocked);
    drawRoadSegment(nodeById["2-2"], nodeById["2-3"],    nodeById["2-3"].unlocked);
    drawRoadSegment(nodeById["2-3"], nodeById["2-5"],    nodeById["2-5"].unlocked);
    // 隱藏路線 2-1 -> 2-4 -> 2-5（僅在 2-4 解鎖後才長出來，且把 Boss 關從 2-4 改名為 2-5！）
    if (mapNodesData["2-4"].unlocked) {
      mapNodesData["2-5"].label = "2-5";
      mapNodesData["2-5"].neighbors.left = "2-4";
      drawRoadSegment(nodeById["2-1"], nodeById["2-4"], true);
      drawRoadSegment(nodeById["2-4"], nodeById["2-5"], true);
    } else {
      mapNodesData["2-5"].label = "2-4";
      mapNodesData["2-5"].neighbors.left = "2-3";
    }
    
  }
  noStroke();

  // === 3. 繪製所有關卡與建築節點 ===
  for (let n of nodes) {
    let isSelected = (selectedMapNode === n.id);
    let isLocked = !n.unlocked;

    // 魔王城堡建築
    if (n.type === "castle") {
      push();
      translate(n.x, n.y - 34);
      stroke(0);
      strokeWeight(3);
      fill(isLocked ? "#6C757D" : (currentWorld === 2 ? "#D97706" : "#6C757D"));
      rect(-32, -26, 64, 48, 4);
      fill(isLocked ? "#495057" : (currentWorld === 2 ? "#B45309" : "#495057"));
      rect(-24, -44, 48, 22);
      fill(isLocked ? "#8D99AE" : "#E63946");
      triangle(-28, -44, 0, -68, 28, -44);
      fill("#1A0505");
      arc(0, 22, 24, 30, PI, TWO_PI);

      // 1-4 通關動畫：城堡頂端升起白旗！
      if (n.id === "1-4" && (n.cleared || worldTransition.active)) {
        let fp = worldTransition.active ? worldTransition.flagProgress : 1;
        let poleH = 38 * fp;
        stroke("#FFFFFF");
        strokeWeight(3);
        line(0, -68, 0, -68 - poleH);
        if (fp > 0.4) {
          noStroke();
          fill("#FFFFFF");
          triangle(0, -68 - poleH, 26, -60 - poleH, 0, -52 - poleH);
        }
      }
      pop();
    }

    // 沙漠補給屋帳篷建築
    if (n.type === "shop") {
      push();
      translate(n.x, n.y - 26);
      stroke(0);
      strokeWeight(3);
      fill(n.isOpen ? "#FFF3B0" : "#6C757D");
      rect(-22, -6, 44, 24, 4);
      fill(n.isOpen ? "#E63946" : "#495057");
      arc(0, -4, 58, 42, PI, TWO_PI);
      if (n.isOpen) {
        noStroke();
        fill("#FFFFFF");
        ellipse(-12, -13, 9, 9);
        ellipse(12, -13, 9, 9);
        ellipse(0, -18, 10, 10);
      } else {
        // 關門掛牌
        fill("#2B2D42");
        rect(-18, -2, 36, 14, 3);
        noStroke();
        fill("#FFD166");
        textSize(9);
        textAlign(CENTER, CENTER);
        text("CLOSED", 0, 5);
      }
      pop();
    }

    // 節點圓盤（未解鎖為灰色、已過關綠色、可挑戰紅色、岔路金色）
    push();
    translate(n.x, n.y);
    stroke(0);
    strokeWeight(4);
    if (isLocked) {
      fill("#6C757D"); // 未解鎖灰色
    } else if (n.type === "junction") {
      fill("#FFD166");
    } else if (n.type === "shop") {
      fill(n.isOpen ? "#32ADE6" : "#6C757D");
    } else {
      fill(n.cleared ? "#38B000" : "#E63946");
    }
    ellipse(0, 0, isSelected ? 46 : 38, isSelected ? 32 : 26);

    noStroke();
    fill(255, 255, 255, isLocked ? 60 : 160);
    ellipse(-5, -4, 14, 7);

    // 節點文字（未解鎖顯示暗灰字）
    stroke(0);
    strokeWeight(4);
    fill(isLocked ? "#ADB5BD" : "#FFFFFF");
    textFont("Arial Black, sans-serif");
    textSize(16);
    textAlign(CENTER, TOP);
    text(n.label, 0, 22);
    pop();
  }

  // === 4. 更新角色位置與 1-4 -> World 2 過場動畫狀態機 ===
  let targetNode = nodeById[selectedMapNode] || nodes[0];
  if (mapAvatarX === 0 && mapAvatarY === 0) {
    mapAvatarX = targetNode.x;
    mapAvatarY = targetNode.y;
  }

  if (worldTransition.active) {
    let elapsed = millis() - worldTransition.timer;
    if (worldTransition.phase === "WHITE_FLAG") {
      mapAvatarX = targetNode.x;
      mapAvatarY = targetNode.y;
      worldTransition.flagProgress = constrain(elapsed / 900, 0, 1);
      if (elapsed > 1000) {
        worldTransition.phase = "EXTEND_ROAD";
        worldTransition.timer = millis();
      }
    } else if (worldTransition.phase === "EXTEND_ROAD") {
      worldTransition.roadProgress = constrain(elapsed / 900, 0, 1);
      if (elapsed > 1000) {
        worldTransition.phase = "WALK_EDGE";
        worldTransition.timer = millis();
        worldTransition.spotlightR = max(width, height) * 0.75;
      }
    } else if (worldTransition.phase === "WALK_EDGE") {
      // 依 dir 往右(1)或往左(-1)走到螢幕邊緣，同時聚光燈縮緊
      mapAvatarX += 4.2 * (worldTransition.dir || 1);
      worldTransition.spotlightR = max(55, worldTransition.spotlightR - 14);

      if (worldTransition.dir === -1 && mapAvatarX < -30) {
        // 往左走回 World 1，停在 1-4
        currentWorld = 1;
        selectedMapNode = "1-4";
        let w1Nodes = getWorldMapNodes();
        let n14 = w1Nodes.find(n => n.id === "1-4");
        mapAvatarX = n14 ? n14.x : width * 0.74;
        mapAvatarY = n14 ? n14.y : height * 0.5;
        worldTransition.phase = "EXPAND_W2";
        worldTransition.spotlightR = 45;
        worldTransition.timer = millis();
      } else if (worldTransition.dir !== -1 && mapAvatarX > width + 30) {
        // 往右走進 World 2，停在 2-0
        currentWorld = 2;
        selectedMapNode = "2-0";
        let w2Nodes = getWorldMapNodes();
        mapAvatarX = w2Nodes[0].x;
        mapAvatarY = w2Nodes[0].y;
        worldTransition.phase = "EXPAND_W2";
        worldTransition.spotlightR = 45;
        worldTransition.timer = millis();
      }
    } else if (worldTransition.phase === "EXPAND_W2") {
      // 圓圈以角色為中心擴大，直到照出整個新地圖
      worldTransition.spotlightR += 18;
      if (worldTransition.spotlightR > max(width, height) * 1.2) {
        worldTransition.active = false;
        worldTransition.phase = "NONE";
      }
    }
  } else {
    mapAvatarX = lerp(mapAvatarX, targetNode.x, 0.22);
    mapAvatarY = lerp(mapAvatarY, targetNode.y, 0.22);
  }

  // 繪製大地圖角色
  if (standSpriteSheet && standSpriteSheet.width > 0) {
    let fw = standSpriteSheet.width / STAND_FRAME_COUNT;
    let fh = standSpriteSheet.height;
    let metric = spriteMetrics["stand"] || { contentHeight: fh, frameBottomPaddings: [0] };
    let targetRealH = 76;
    let s = targetRealH / metric.contentHeight;
    let bottomPad = (metric.frameBottomPaddings[0] || 0) * s;
    let bounce = abs(sin(frameCount * 0.12)) * 5;
    let drawY = mapAvatarY - (fh * s) / 2 + bottomPad - bounce;
    image(standSpriteSheet, mapAvatarX, drawY, fw * s, fh * s, 0, 0, fw, fh);
  }

  // === 5. 圓形聚光燈黑幕遮罩（僅在 WALK_EDGE 與 EXPAND_W2 階段顯示） ===
  if (worldTransition.active && (worldTransition.phase === "WALK_EDGE" || worldTransition.phase === "EXPAND_W2")) {
    push();
    let ctx = drawingContext;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.96)";
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(mapAvatarX, mapAvatarY - 25, worldTransition.spotlightR, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
    pop();
  }

  // === 6. 大地圖頂部與底部 UI ===
  let logoTitle = targetNode.id === "2-0" ? "World 2" : (targetNode.id === "2-SHOP" ? "World 2 Shop" : `World ${targetNode.label}`);
  drawColorfulWorldLogo(logoTitle, 30, 44, min(38, width * 0.05));

  drawPlayerHeadBadge(50, 102, 20);
  stroke(0);
  strokeWeight(5);
  fill("#FFFFFF");
  textFont("Arial Black, sans-serif");
  textSize(24);
  textAlign(LEFT, CENTER);
  text(`× ${lives}`, 80, 104);

  stroke(0);
  strokeWeight(5);
  fill(targetNode.unlocked ? "#FFD166" : "#ADB5BD");
  textSize(min(24, width * 0.035));
  textAlign(RIGHT, CENTER);
  text(targetNode.unlocked ? targetNode.title : "🔒 尚未解鎖", width - 30, 44);

  // 右上角：視角與設定按鈕
  stroke(0);
  strokeWeight(3);
  fill(20, 30, 50, 210);
  rect(width - 156, 74, 126, 34, 17);
  noStroke();
  fill("#FFD166");
  textSize(14);
  textAlign(CENTER, CENTER);
  text("⚙ 視角與設定", width - 93, 91);

  // 右下角 Items 備用道具按鈕
  let itemBtnW = 135;
  let itemBtnH = 44;
  let itemBtnX = width - itemBtnW - 24;
  let itemBtnY = height - itemBtnH - 20;
  stroke(0);
  strokeWeight(3.5);
  fill(20, 30, 50, 210);
  rect(itemBtnX, itemBtnY, itemBtnW, itemBtnH, 22);
  noStroke();
  fill("#FFFFFF");
  textFont("Arial Black, sans-serif");
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Items [I]", itemBtnX + itemBtnW / 2, itemBtnY + itemBtnH / 2);

  // 底部操作提示 / 手機按鈕
  if (controlMode === "MOBILE") {
    let pad = getMobileMapPadRects();
    stroke(0);
    strokeWeight(3);
    textFont("Arial Black, sans-serif");
    textAlign(CENTER, CENTER);

    for (let k of ["up", "down", "left", "right"]) {
      let b = pad[k];
      fill("#1F2E46");
      rect(b.x, b.y, b.w, b.h, 12);
      noStroke();
      fill("#FFFFFF");
      textSize(18);
      text(b.label, b.x + b.w / 2, b.y + b.h / 2);
      stroke(0);
    }

    fill("#34C759");
    rect(pad.go.x, pad.go.y, pad.go.w, pad.go.h, 14);
    noStroke();
    fill("#FFFFFF");
    textSize(20);
    text("GO!", pad.go.x + pad.go.w / 2, pad.go.y + pad.go.h / 2);
  } else {
    stroke(0);
    strokeWeight(4);
    fill("#FFFFFF");
    textSize(16);
    textAlign(LEFT, CENTER);
    text("← → ↑ ↓ 選擇路線  ｜  Enter / 空白鍵 / 點擊進入", 30, height - 42);
  }

  // 備用道具箱彈窗
  if (showMapItemDrawer) {
    fill(0, 0, 0, 170);
    rect(0, 0, width, height);
    let panelW = min(360, width * 0.85);
    let panelH = 210;
    stroke("#FFD166");
    strokeWeight(4);
    fill("#1D2D44");
    rect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 18);
    noStroke();
    fill("#FFD166");
    textSize(22);
    textAlign(CENTER, TOP);
    text("備用道具箱 (ITEM STOCK)", width / 2, height / 2 - panelH / 2 + 20);
    if (reservedItem) {
      drawPowerupIcon(reservedItem, width / 2, height / 2 + 5, 1.6);
      fill(255);
      textSize(15);
      text(controlMode === "MOBILE" ? "進入關卡後點擊上方道具框即可空投！" : "進入關卡後按 [B] 鍵即可呼叫空投！", width / 2, height / 2 + 50);
    } else {
      fill(190);
      textSize(16);
      text("目前備用道具箱是空的", width / 2, height / 2 + 10);
    }
    fill("#8D99AE");
    textSize(13);
    text("點擊視窗或按 [I] 關閉", width / 2, height / 2 + panelH / 2 - 28);
  }

  // 沙漠補給屋彈窗
  if (showShopModal) {
    drawDesertShopModal();
  }
}

// =====================================================================
// 沙漠補給屋系統（兩個不重複 3 階道具 ＋ 中間新增 1UP 蘑菇，出門即打烊）
// =====================================================================
function openDesertShop() {
  if (!mapNodesData["2-SHOP"].isOpen) {
    playSFX("stomp");
    return;
  }
  // 隨機抽出 2 個不重複的 3 階道具（含沙漠新菇種）
  let tier3Pool = ["fire", "feather", "speed", "cactus", "chrono"];
  let idx1 = floor(random(tier3Pool.length));
  let item1 = tier3Pool.splice(idx1, 1)[0];
  let idx2 = floor(random(tier3Pool.length));
  let item2 = tier3Pool[idx2];

  // 左：3階道具A、中：1UP蘑菇、右：3階道具B
  shopItems = [item1, "1up", item2];
  showShopModal = true;
  playSFX("powerup");
}

function drawDesertShopModal() {
  push();
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, width, height);

  let boxW = min(520, width * 0.90);
  let boxH = min(290, height * 0.88);
  let bx = width / 2 - boxW / 2;
  let by = height / 2 - boxH / 2;
  let compact = (boxH < 265);

  stroke("#E63946");
  strokeWeight(6);
  fill("#FFF8E7");
  rect(bx, by, boxW, boxH, 20);

  let headerH = compact ? 32 : 40;
  noStroke();
  fill("#E63946");
  rect(bx + 18, by + 12, boxW - 36, headerH, 12);

  fill("#FFFFFF");
  textFont("sans-serif");
  textStyle(BOLD);
  textSize(min(compact ? 16 : 20, boxW * 0.041));
  textAlign(CENTER, CENTER);
  text("⛺ 沙漠綠洲補給屋（免費選領 1 項）", width / 2, by + 12 + headerH / 2);

  fill("#582F0E");
  textSize(compact ? 11.5 : 13);
  text("領取後帳篷將會打烊，通過任意關卡後再次營業！", width / 2, by + headerH + (compact ? 24 : 32));

  let slotW = (boxW - 72) / 3;
  let slotY = by + headerH + (compact ? 38 : 55);
  let slotH = max(84, boxH - (headerH + (compact ? 68 : 95)));

  const itemLabels = {
    fire: "火焰花",
    feather: "羽翼披風",
    speed: "疾風加速菇",
    cactus: "仙人掌刺甲菇",
    chrono: "時光沙漏菇",
    "1up": "1UP 綠蘑菇"
  };

  for (let i = 0; i < 3; i++) {
    let sx = bx + 20 + i * (slotW + 16);
    let type = shopItems[i];
    let iconY = slotY + slotH * 0.40;
    let iconScale = compact ? 1.05 : 1.3;

    stroke(type === "1up" ? "#38B000" : "#D4A373");
    strokeWeight(3);
    fill("#26160C");
    rect(sx, slotY, slotW, slotH, 14);

    if (type === "1up") {
      push();
      translate(sx + slotW / 2, iconY);
      scale(iconScale);
      noStroke();
      fill("#FFE4B5");
      rect(-8, 0, 16, 14, 3);
      fill("#38B000");
      arc(0, 2, 32, 28, PI, TWO_PI);
      fill(255);
      ellipse(-7, -5, 6, 6);
      ellipse(7, -5, 6, 6);
      ellipse(0, -9, 7, 7);
      pop();
    } else {
      drawPowerupIcon(type, sx + slotW / 2, iconY, iconScale);
    }

    noStroke();
    fill("#FFD166");
    textSize(min(13, slotW * 0.11));
    textAlign(CENTER, CENTER);
    text(itemLabels[type] || type, sx + slotW / 2, slotY + slotH * 0.80);
  }

  fill("#7F4F24");
  textSize(compact ? 11.5 : 13);
  textAlign(CENTER, BOTTOM);
  text("點擊上方任一補給品領取（或點擊視窗外直接離開）", width / 2, by + boxH - 10);
  pop();
}

function drawLevelIntro() {
  background(0);

  drawColorfulWorldLogo(`World ${currentWorld} - ${currentLevel}`, width / 2 - 125, height / 2 - 48, 44);

  drawPlayerHeadBadge(width / 2 - 45, height / 2 + 32, 24);
  stroke(255);
  strokeWeight(1);
  fill("#FFFFFF");
  textFont("Arial Black, sans-serif");
  textSize(28);
  textAlign(LEFT, CENTER);
  text(`× ${lives}`, width / 2 - 8, height / 2 + 34);

  if (millis() - stateTimer > 1500) {
    gameState = "PLAYING";
    lastLevelTimerTick = millis();
  }
}

function getPowerTintColor(type) {
  if (type === "fire") return color(255, 165, 130);
  if (type === "feather") return color(255, 245, 150);
  if (type === "speed") return color(135, 225, 255);
  if (type === "cactus") return color(130, 235, 160);
  if (type === "chrono") return color(255, 220, 120);
  return color(255);
}

function triggerOneUp(x, y) {
  lives++;
  playSFX("1up");
  floatingTexts.push({
    text: "1UP",
    x: x - 18,
    y: y - 20,
    vy: -1.8,
    life: 95,
    isOneUp: true
  });
}

function addCoinAndScore(cx, cy) {
  score += 100;
  coinCount++;
  playSFX("coin");
  coins.push({
    x: cx,
    y: cy,
    vy: -8,
    life: 20
  });
  if (coinCount >= 10) {
    coinCount -= 10;
    triggerOneUp(characterX, characterY - 30);
  }
}

function drawPowerupIcon(type, mx, my, scaleFactor = 1.0) {
  push();
  translate(mx, my);
  scale(scaleFactor);
  noStroke();

  if (type === "mushroom") {
    fill("#FFE4B5");
    rect(-8, 0, 16, 14, 3);
    fill("#E63946");
    arc(0, 2, 32, 28, PI, TWO_PI);
    fill(255);
    ellipse(-7, -5, 6, 6);
    ellipse(7, -5, 6, 6);
    ellipse(0, -9, 7, 7);
  } else if (type === "fire") {
    fill("#2EC4B6");
    rect(-2, 2, 4, 14);
    ellipse(-7, 8, 10, 5);
    ellipse(7, 8, 10, 5);
    fill("#FF2A00");
    ellipse(0, -4, 26, 18);
    fill("#FF9E00");
    ellipse(0, -4, 18, 12);
    fill("#FFF3B0");
    ellipse(0, -4, 9, 6);
  } else if (type === "feather") {
    fill("#FFD166");
    stroke("#E09F3E");
    strokeWeight(1.5);
    ellipse(0, -2, 16, 28);
    noStroke();
    fill("#FFF3B0");
    rect(-1.5, -14, 3, 28);
  } else if (type === "speed") {
    fill("#FFE4B5");
    rect(-8, 0, 16, 14, 3);
    fill("#0096C7");
    arc(0, 2, 32, 28, PI, TWO_PI);
    fill("#FFD166");
    triangle(-2, -13, 5, -5, -1, -5);
    triangle(2, 1, -5, -7, 1, -7);
    } else if (type === "cactus") {
    fill("#FFE4B5");
    rect(-8, 0, 16, 14, 3);
    fill("#2D6A4F");
    arc(0, 2, 32, 28, PI, TWO_PI);
    fill("#FFD166");
    triangle(-10, -4, -15, -8, -8, -8);
    triangle(10, -4, 15, -8, 8, -8);
    triangle(0, -11, -3, -17, 3, -17);
  } else if (type === "chrono") {
    fill("#FFE4B5");
    rect(-8, 0, 16, 14, 3);
    fill("#D97706");
    arc(0, 2, 32, 28, PI, TWO_PI);
    fill("#FFF3B0");
    triangle(-5, -9, 5, -9, 0, -4);
    triangle(-5, 0, 5, 0, 0, -4);
  } else if (type === "star") {
    fill(frameCount % 6 < 3 ? "#FFD700" : "#FFF3B0");
    stroke("#E09F3E");
    strokeWeight(1.5);
    beginShape();
    for (let i = 0; i < 10; i++) {
      let r = (i % 2 === 0) ? 15 : 6;
      let a = -HALF_PI + i * PI / 5;
      vertex(cos(a) * r, sin(a) * r);
    }
    endShape(CLOSE);
    noStroke();
    fill(0);
    rect(-3, -3, 2, 5);
    rect(2, -3, 2, 5);
  }
  pop();
}

function takeDamage() {
  if (gameState !== "PLAYING" || invincibleTimer > 0 || starTimer > 0) return;
  playerStunTimer = 0;
  if (tryChronoTimeRewind()) return;
  if (powerLevel === 3) {
    powerLevel = 2;
    powerType = "mushroom";
    currentSprintBonus = 0;
    playSFX("shrink");
    gameState = "TRANSFORM_FREEZE";
    transformTimer = 500;
    transformIsDamage = true;
    transformFromBig = true;
    transformToBig = true;
    isAttacking = false;
    isCrouching = false;
    isGliding = false;
  } else if (powerLevel === 2) {
    powerLevel = 1;
    powerType = "none";
    currentSprintBonus = 0;
    playSFX("shrink");
    gameState = "TRANSFORM_FREEZE";
    transformTimer = 500;
    transformIsDamage = true;
    transformFromBig = true;
    transformToBig = false;
    isAttacking = false;
    isCrouching = false;
    isGliding = false;
  } else {
    handlePlayerDeath();
  }
}

function handlePlayerDeath() {
  if (tryChronoTimeRewind()) return; // <--- 新增這行（掉進深淵/岩漿也能回溯保命）
  lives--;
  playSFX("death");
  if (lives <= 0) {
    lives = 0;
    gameState = "GAME_OVER";
  } else {
    startLevel(currentLevel, false, false);
  }
}

function drawGameOver() {
  background("#0d0d14");
  textAlign(CENTER, CENTER);
  fill("#E63946");
  textSize(min(56, width * 0.08));
  text("GAME OVER", width / 2, height / 2 - 50);
  fill(255);
  textSize(min(24, width * 0.04));
  text(`FINAL SCORE: ${score}`, width / 2, height / 2 + 15);
  textSize(min(20, width * 0.032));
  fill("#FFD700");
  text(controlMode === "MOBILE" ? "點擊螢幕重新挑戰（恢復 3 條命）" : "按 [R] 重新挑戰（恢復 3 條命）或按 [M] 返回大地圖選單", width / 2, height / 2 + 65);
}

// 退出關卡回大地圖時還原進關前道具快照（避免重複刷道具）
function exitToWorldMapRestoreEntry() {
  lives = levelEntrySnapshot.lives;
  powerLevel = levelEntrySnapshot.powerLevel;
  powerType = levelEntrySnapshot.powerType;
  reservedItem = levelEntrySnapshot.reservedItem;
  coinCount = levelEntrySnapshot.coinCount;
  score = levelEntrySnapshot.score;
  mobileDashLocked = false;
  showSettingsModal = false;
  showExitMapConfirmModal = false;
  gameState = "WORLD_MAP";
  playSFX("mapMove");
}

function handlePointerTap(px, py) {
  initAudioEngine();

  if (showSettingsModal) {
    handleSettingsModalClick(px, py);
    return;
  }

  if (showExitMapConfirmModal) {
    handleExitMapConfirmClick(px, py);
    return;
  }

  if (gameState === "ITEM_GUIDE") {
    if (millis() - guideOpenTime > 300) {
      activeGuideData = null;
      gameState = "PLAYING";
      playSFX("mapMove");
    }
    return;
  }

  if (gameState === "DEVICE_SELECT") {
    let tb = getDeviceGuideToggleRect();
    if (px >= tb.x && px <= tb.x + tb.w && py >= tb.y && py <= tb.y + tb.h) {
      showItemGuides = !showItemGuides;
      playSFX("mapMove");
      return;
    }

    let cards = getDeviceSelectCards();
    for (let c of cards) {
      if (px > c.x - c.w / 2 && px < c.x + c.w / 2 &&
          py > c.y - c.h / 2 && py < c.y + c.h / 2) {
        controlMode = c.mode;
        if (controlMode === "MOBILE") autoFitMobileZoom = true;
        playSFX("powerup");
        gameState = "WORLD_MAP";
        return;
      }
    }
    return;
  }

  if (gameState === "WORLD_MAP") {
    // 隱藏角落彩蛋：連點左上角角色頭像 5 下啟動創作者模式
    if (dist(px, py, 50, 102) < 28) {
      if (millis() - devLastTapTime < 800) {
        devTapCount++;
      } else {
        devTapCount = 1;
      }
      devLastTapTime = millis();
      if (devTapCount >= 5) {
        devTapCount = 0;
        activateCreatorDebugMode();
      }
      return;
    }
    if (worldTransition.active) return; // 過場動畫期間鎖定操作

    // 處理補給屋點擊領取
    if (showShopModal) {
      let boxW = min(520, width * 0.90);
      let boxH = min(290, height * 0.80);
      let bx = width / 2 - boxW / 2;
      let by = height / 2 - boxH / 2;
      let slotW = (boxW - 72) / 3;
      let slotH = 120;
      let slotY = by + 95;

      for (let i = 0; i < 3; i++) {
        let sx = bx + 20 + i * (slotW + 16);
        if (px >= sx && px <= sx + slotW && py >= slotY && py <= slotY + slotH) {
          let chosen = shopItems[i];
          if (chosen === "1up") {
            lives++;
            playSFX("1up");
          } else {
            // 若身上還沒有 3 階能力就直接裝備，否則存入上方備用道具框
            if (powerLevel < 3) {
              powerLevel = 3;
              powerType = chosen;
            } else {
              reservedItem = chosen;
            }
            playSFX("powerup");
          }
          // 出店門即關門打烊，直到通過任意關卡才再開門
          mapNodesData["2-SHOP"].isOpen = false;
          showShopModal = false;
          return;
        }
      }
      // 點擊視窗外離開（不領取也算離開店門）
      if (px < bx || px > bx + boxW || py < by || py > by + boxH) {
        mapNodesData["2-SHOP"].isOpen = false;
        showShopModal = false;
        playSFX("mapMove");
      }
      return;
    }

    if (px >= width - 156 && px <= width - 30 && py >= 74 && py <= 108) {
      showSettingsModal = true;
      playSFX("mapMove");
      return;
    }

    let itemBtnW = 135;
    let itemBtnH = 44;
    let itemBtnX = width - itemBtnW - 24;
    let itemBtnY = height - itemBtnH - 20;
    if (px >= itemBtnX && px <= itemBtnX + itemBtnW && py >= itemBtnY && py <= itemBtnY + itemBtnH) {
      showMapItemDrawer = !showMapItemDrawer;
      playSFX("mapMove");
      return;
    }

    if (showMapItemDrawer) {
      showMapItemDrawer = false;
      return;
    }

    let nodes = getWorldMapNodes();
    if (controlMode === "MOBILE") {
      let pad = getMobileMapPadRects();
      const hit = (b) => (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
      for (let k of ["up", "down", "left", "right"]) {
        if (hit(pad[k])) {
          moveWorldMapCursor(pad[k].dir);
          return;
        }
      }
      if (hit(pad.go)) {
        enterSelectedMapNode();
        return;
      }
    }
  

    for (let n of nodes) {
      if (dist(px, py, n.x, n.y) < 42) {
        if (!n.unlocked) {
          playSFX("stomp"); // 未解鎖灰色關卡不可進入
          return;
        }
        if (selectedMapNode === n.id) {
          enterSelectedMapNode();
        } else {
          selectedMapNode = n.id;
          playSFX("mapMove");
        }
        return;
      }
    }
    return;
  }

  if (gameState === "PLAYING") {
    let compact = (height < 460);
    let boxSize = compact ? 46 : 58;
    let boxX = width / 2 - boxSize / 2;
    let boxY = compact ? 10 : 18;
    if (px >= boxX && px <= boxX + boxSize && py >= boxY && py <= boxY + boxSize) {
      triggerDropReservedItem();
      return;
    }
    let tBoxX = boxX + boxSize + 12;
  if (currentWorld === 2 && currentLevel === 4 && px >= tBoxX && px <= tBoxX + boxSize && py >= boxY && py <= boxY + boxSize) {
    placeTorchAtPlayer();
    return;
  }

    let btnY = compact ? 66 : 92;
    if (py >= btnY && py <= btnY + 28) {
      if (px >= width - 166 && px <= width - 96) {
        showSettingsModal = true;
        playSFX("mapMove");
        return;
      } else if (px >= width - 90 && px <= width - 20) {
        showExitMapConfirmModal = true;
        playSFX("mapMove");
        return;
      }
    }

    if (controlMode === "MOBILE") {
      let layout = getMobileButtonsLayout();
      if (dist(px, py, layout.dash.x, layout.dash.y) < layout.dash.r * 1.25) {
        mobileDashLocked = !mobileDashLocked;
        dashToggleActive = mobileDashLocked;
        if (mobileDashLocked && powerLevel === 3 && powerType === "chrono") {
          triggerChronoShockwave();
        }
        playSFX("mapMove");
        return;
      }
    }
  }

  if (gameState === "GAME_OVER" && controlMode === "MOBILE") {
    startLevel(currentLevel, true, false);
  } else if (gameState === "ALL_CLEAR" && controlMode === "MOBILE") {
    exitToWorldMapRestoreEntry();
  }
}

function mousePressed() {
  handlePointerTap(mouseX, mouseY);
}

function touchStarted() {
  initAudioEngine();
  if (touches && touches.length > 0) {
    let lastTouch = touches[touches.length - 1];
    handlePointerTap(lastTouch.x, lastTouch.y);
  }
  return false;
}

function touchMoved() {
  return false;
}

function touchEnded() {
  initAudioEngine();
  return false;
}

function startLevel(levelNum, resetRunStats, keepPowerup = false) {
  castleFlagRaised = false;
  castleFlagProgress = 0;
  flagDropY = 0;
  dashToggleActive = false;
  mobileDashLocked = false;
  safePositionHistory = [];
  currentLevel = levelNum;
  movingPlatforms = [];
  fireBars = [];
  boss = null;
  bossFireballs = [];
  bridgeCollapsing = false;
  transformTimer = 0;
  invincibleTimer = 0;
  starTimer = 0;
  currentSprintBonus = 0;
  knockbackVX = 0;
  mobileDashLocked = false;
  bumpingTiles = [];
  playerFireballs = [];
  enemies = [];
  levelTimer = 400;

  if (currentWorld === 2) {
    is1_2Intro = false;
    isSecretClear = false;
    is2_1SubSecret = false;
    torchCount = 0;
    placedTorches = [];
    hasMinerHeadlamp = false;
    endClearBonusSmoke = [];
    wormRocks = [];
    playerStunTimer = 0;
    rescueCutscene = null;
    sandwormBoss = null;

   let useCheckpoint = (typeof checkpointState !== "undefined" && checkpointState.active && checkpointState.world === 2 && checkpointState.level === levelNum);
  let w2Data = buildWorld2Level(levelNum);
  levelTimer = w2Data.config.timeLimit;

  if (levelNum === 4 && !useCheckpoint) {
    window.isInMinerSupplyRoom = true;
    saved2_4MainState = {
      mapStrings: w2Data.mapStrings,
      enemySpawns: w2Data.enemySpawns,
      platformSpawns: w2Data.platformSpawns
    };
    let roomData = buildWorld2MinerSupplyRoom();
    loadLevelMap(roomData.mapStrings);
    movingPlatforms = [];
    minerLampPickup = { x: 12.5 * TILE_SIZE + 20, y: 12 * TILE_SIZE + 12, taken: false };
  } else {
    window.isInMinerSupplyRoom = false;
    minerLampPickup = null;
    loadLevelMap(w2Data.mapStrings);
    movingPlatforms = w2Data.platformSpawns;
  }

    if (levelNum === 5) {
      let arenaLeftX = (levelMap[0].length - 58) * TILE_SIZE;
      let arenaRightX = (levelMap[0].length - 10) * TILE_SIZE;
      sandwormBoss = {
        active: false,
        doorLocked: false,
        doorOpened: false,
        arenaLeft: arenaLeftX,
        arenaRight: arenaRightX,
        hp: 150,
        maxHp: 150,
        state: "IDLE",
        timer: 60,
        nextAttack: "",
        lastAttack: "",
        segments: [],
        headX: arenaRightX - 180,
        headY: 9 * TILE_SIZE,
        vx: 0,
        vy: 0,
        dir: -1,
        arcProgress: 0,
        beamAngle: 0,
        hurtFlash: 0
      };
      for (let i = 0; i < 16; i++) {
        sandwormBoss.segments.push({ x: sandwormBoss.headX, y: sandwormBoss.headY });
      }
    }

    enemies = [];
    if (!window.isInMinerSupplyRoom) {
      for (let sp of w2Data.enemySpawns) {
        let h = sp.type === "goomba" ? 30 : 38;
        enemies.push({
          type: sp.type,
          x: sp.col * TILE_SIZE + 20,
          y: sp.row * TILE_SIZE - h / 2 - 12,
          baseY: sp.row * TILE_SIZE - h / 2 - 24,
          w: 30, h: h, vx: -1.4, vy: 0,
          shellMoving: false, dead: false, flyPhase: random(TWO_PI),
          stunTimer: 0, knockbackX: 0
        });
      }
    }
  } 
  else {
    if (levelNum === 1) {
      is1_2Intro = false;
      loadLevelMap(MAP_1_1);
      spawnLevelEnemies(1);
    } else if (levelNum === 2) {
      is1_2Intro = true;
      loadLevelMap(MAP_1_2_INTRO);
    } else if (levelNum === 3) {
      is1_2Intro = false;
      loadLevelMap(MAP_1_3);
      spawnLevelEnemies(3);
      movingPlatforms = [
        { x: 102 * TILE_SIZE, y: 10 * TILE_SIZE, w: 3 * TILE_SIZE, h: 16, minX: 100 * TILE_SIZE, maxX: 112 * TILE_SIZE, speed: 2.2, dx: 0 },
        { x: 122 * TILE_SIZE, y: 8 * TILE_SIZE,  w: 3 * TILE_SIZE, h: 16, minX: 118 * TILE_SIZE, maxX: 132 * TILE_SIZE, speed: -2.5, dx: 0 }
      ];
    } else {
      is1_2Intro = false;
      loadLevelMap(MAP_1_4);
      spawnLevelEnemies(4);

      movingPlatforms = [
        { x: 122 * TILE_SIZE, y: 11 * TILE_SIZE, w: 3 * TILE_SIZE, h: 16, minX: 121 * TILE_SIZE, maxX: 135 * TILE_SIZE, speed: 2.4, dx: 0 }
      ];

      fireBars = [
        { cx: 43 * TILE_SIZE + 20, cy: 12 * TILE_SIZE + 20, angle: 0, speed: 0.032, count: 6, spacing: 20 },
        { cx: 72 * TILE_SIZE + 20, cy: 12 * TILE_SIZE + 20, angle: PI, speed: -0.035, count: 6, spacing: 20 },
        { cx: 105 * TILE_SIZE + 20, cy: 9 * TILE_SIZE + 20, angle: HALF_PI, speed: 0.038, count: 6, spacing: 20 }
      ];

      boss = {
        x: 185 * TILE_SIZE,
        y: 11 * TILE_SIZE - 42,
        w: 64,
        h: 84,
        vx: -1.6,
        vy: 0,
        minX: 173 * TILE_SIZE,
        maxX: 190 * TILE_SIZE,
        hp: 12,
        maxHp: 12,
        alive: true,
        falling: false,
        flashTimer: 0,
        lastFireTime: millis(),
        lastJumpTime: millis()
      };
    }
  }

  gameState = "LEVEL_INTRO";
  stateTimer = millis();

  isExitingPipe = false;
  isExitingCeilingPipe = false;
  characterX = 100;
  characterY = 100;
  if (currentWorld === 2 && levelNum === 4 && window.isInMinerSupplyRoom) {
    characterX = 2.5 * TILE_SIZE;
    characterY = 2.2 * TILE_SIZE; // 先藏在天花板水管內部
    isExitingCeilingPipe = true;
    playSFX("shrink");
  }
  if (typeof checkpointState !== "undefined" && checkpointState.active && checkpointState.world === currentWorld && checkpointState.level === levelNum) {
    characterX = checkpointState.x;
characterY = checkpointState.y;
let cpCol = floor(characterX / TILE_SIZE);
for (let fr = 0; fr < levelMap.length; fr++) {
  if (levelMap[fr][cpCol] === 'R') levelMap[fr][cpCol] = 'r';
}
  }
  velocityY = 0;

  if (resetRunStats) {
    score = 0;
    lives = 3;
    coinCount = 0;
    reservedItem = null;
  }
  if (!keepPowerup) {
    powerLevel = 1;
    powerType = "none";
  }

  if (keepPowerup) {
    levelEntrySnapshot = { lives, powerLevel, powerType, reservedItem, coinCount, score };
  }

  isCrouching = false;
  prevHitboxH = (powerLevel >= 2) ? BIG_HITBOX_H : BASE_HITBOX_H;
  hideCharacter = false;
  isGliding = false;
  isActionLocked = false;
  isShortJump = false;
  featherFlapsLeft = 2;
  isAttacking = false;
  items = [];
  coins = [];
  brickParticles = [];
  activeEffects = [];
  floatingTexts = [];
}

function spawnLevelEnemies(lvl) {
  enemies = [];
  const createEnemy = (type, col, row) => {
    let h = type === "goomba" ? 30 : 38;
    return {
      type: type,
      x: col * TILE_SIZE + 20,
      y: row * TILE_SIZE - h / 2 - 12,
      baseY: row * TILE_SIZE - h / 2 - 24,
      w: 30,
      h: h,
      vx: -1.4,
      vy: 0,
      shellMoving: false,
      dead: false,
      flyPhase: random(TWO_PI),
      stunTimer: 0,
      knockbackX: 0
    };
  };
  if (lvl === 1) {
    enemies.push(createEnemy("goomba", 22, 13));
    enemies.push(createEnemy("goomba", 42, 13));
    enemies.push(createEnemy("koopa", 56, 13));
    enemies.push(createEnemy("goomba", 82, 13));
    enemies.push(createEnemy("goomba", 85, 13));
    enemies.push(createEnemy("koopa", 118, 13));
    enemies.push(createEnemy("goomba", 142, 13));
  } else if (lvl === 2) {
    enemies.push(createEnemy("goomba", 18, 13));
    enemies.push(createEnemy("koopa", 36, 13));
    enemies.push(createEnemy("goomba", 62, 13));
    enemies.push(createEnemy("goomba", 92, 13));
    enemies.push(createEnemy("koopa", 125, 13));
  } else if (lvl === 3) {
    enemies.push(createEnemy("parakoopa", 32, 8));
    enemies.push(createEnemy("goomba", 56, 8));
    enemies.push(createEnemy("parakoopa", 72, 7));
    enemies.push(createEnemy("parakoopa", 112, 7));
    enemies.push(createEnemy("koopa", 155, 13));
  } else if (lvl === 4) {
    enemies.push(createEnemy("goomba", 33, 13));
    enemies.push(createEnemy("koopa", 64, 13));
    enemies.push(createEnemy("goomba", 142, 13));
  }
}

function updateEnemies(playerW, playerH, viewWorldW = width) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    let en = enemies[i];

    if (en.dead) {
      en.vy += gravity * 0.6;
      en.y += en.vy;
      if (en.y > levelMap.length * TILE_SIZE + 100) {
        enemies.splice(i, 1);
      }
      continue;
    }

    if (abs(en.x - characterX) > viewWorldW * 1.15) continue;

    let inChrono = (chronoFieldActive && dist(en.x, en.y, characterX, characterY) < 260);
    let timeScale = inChrono ? 0.25 : 1.0;

    // 處理暈眩倒數與被撞退滑行
    let isStunned = false;
    if (en.stunTimer && en.stunTimer > 0) {
      en.stunTimer -= deltaTime;
      if (en.stunTimer < 0) en.stunTimer = 0;
      isStunned = (en.stunTimer > 0);
    }

    if (en.knockbackX && abs(en.knockbackX) > 0.1) {
      en.x += en.knockbackX;
      if (checkCollision(en.x, en.y - 2, en.w, en.h - 4)) {
        en.x -= en.knockbackX;
        en.knockbackX = 0;
      } else {
        en.knockbackX *= 0.84;
      }
    } else {
      en.knockbackX = 0;
    }

    if (en.type === "parakoopa") {
      if (!isStunned) {
        en.x += en.vx * 0.8 * timeScale;
        if (checkCollision(en.x, en.y, en.w, en.h)) {
          en.x -= en.vx * 0.8 * timeScale;
          en.vx *= -1;
        }

        if (!en.flyDir) en.flyDir = -1;
        let nextY = en.y + en.flyDir * 1.6;
        if (abs(nextY - en.baseY) > 48 || checkCollision(en.x, nextY, en.w, en.h)) {
          en.flyDir *= -1;
        } else {
          en.y = nextY;
        }
      } else {
        // 暈眩時受重力落到地面上
        en.vy += gravity * 0.6;
        en.y += en.vy;
        if (checkCollision(en.x, en.y, en.w, en.h) && en.vy >= 0) {
          let guard = 0;
          while (checkCollision(en.x, en.y, en.w, en.h) && guard < 60) {
            en.y -= 1;
            guard++;
          }
          en.vy = 0;
        }
      }
    } else {
      if (!isStunned) {
        en.x += en.vx * timeScale;
        if (checkCollision(en.x, en.y - 2, en.w, en.h - 4)) {
          en.x -= en.vx * timeScale;
          en.vx *= -1;
          let nudgeDir = en.vx >= 0 ? 1 : -1;
          let safety = 0;
          while (checkCollision(en.x, en.y - 2, en.w, en.h - 4) && safety < 20) {
            en.x += nudgeDir * 2;
            safety++;
          }
          if (en.type === "shell" && en.shellMoving) {
            playSFX("stomp");
          }
        }
      }

      en.vy += gravity * 0.6;
      en.y += en.vy;
      if (checkCollision(en.x, en.y, en.w, en.h)) {
        if (en.vy >= 0) {
          let guard = 0;
          while (checkCollision(en.x, en.y, en.w, en.h) && guard < 60) {
            en.y -= 1;
            guard++;
          }
          en.vy = 0;
        }
      }
    }

    if (en.type === "shell" && en.shellMoving) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (i === j) continue;
        let other = enemies[j];
        if (!other.dead && abs(en.x - other.x) < (en.w + other.w) / 2 && abs(en.y - other.y) < (en.h + other.h) / 2) {
          other.dead = true;
          other.vy = -7;
          score += 400;
          playSFX("kick");
          floatingTexts.push({ text: "+400", x: other.x, y: other.y - 20, vy: -1.5, life: 45 });
        }
      }
    }

    if (en.y > levelMap.length * TILE_SIZE + 100) {
      enemies.splice(i, 1);
      continue;
    }

    let hurtW = (en.type === "parakoopa") ? 18 : (en.w - 6);
    let hurtH = (en.type === "parakoopa") ? 22 : (en.h - 6);

    if (gameState === "PLAYING" &&
        abs(characterX - en.x) < (playerW + hurtW) / 2 &&
        abs(characterY - en.y) < (playerH + hurtH) / 2) {

      let midX = (characterX + en.x) / 2;
      let midY = (characterY + en.y) / 2;
      let midC = floor(midX / TILE_SIZE);
      let midR = floor(midY / TILE_SIZE);
      if (midR >= 0 && midR < levelMap.length && midC >= 0 && midC < levelMap[0].length) {
        let midTile = levelMap[midR][midC];
        if (midTile !== ' ' && midTile !== 'I' && midTile !== 'A' && midTile !== 'L' && midTile !== 'F' && midTile !== '|' && midTile !== 'C' && midTile !== 'O') {
          continue;
        }
      }

      if (starTimer > 0 || inChrono) {
        en.dead = true;
        en.vy = -8;
        score += (starTimer > 0 ? 300 : 250);
        playSFX("kick");
        floatingTexts.push({ text: starTimer > 0 ? "+300" : "CHRONO! +250", x: en.x, y: en.y - 20, vy: -1.5, life: 45 });
        continue;
      }

      let playerBottom = characterY + playerH / 2;
      let isStomp = (velocityY > 0 && playerBottom <= en.y + en.h * 0.45) ||
                    (playerBottom <= en.y + 6 && characterY < en.y);

      if (isStomp) {
        // 已取消踩怪後人物閃爍（不再設 invincibleTimer = 250）
        velocityY = -14;
        isOnGround = false;
        isGliding = false;
        isActionLocked = false;
        isShortJump = false;
        featherFlapsLeft = 2;

        if (en.type === "goomba") {
          en.dead = true;
          en.vy = -3;
          score += 200;
          playSFX("stomp");
          floatingTexts.push({ text: "+200", x: en.x, y: en.y - 20, vy: -1.5, life: 45 });
        } else if (en.type === "parakoopa") {
          en.type = "koopa";
          en.vy = 0;
          score += 200;
          playSFX("stomp");
          floatingTexts.push({ text: "+200", x: en.x, y: en.y - 20, vy: -1.5, life: 45 });
        } else if (en.type === "koopa") {
          en.type = "shell";
          en.y += (en.h - 26) / 2;
          en.h = 26;
          en.vx = 0;
          en.shellMoving = false;
          score += 200;
          playSFX("stomp");
        } else if (en.type === "shell") {
          if (!en.shellMoving) {
            en.shellMoving = true;
            en.vx = (characterX < en.x ? 8 : -8);
            playSFX("kick");
          } else {
            en.shellMoving = false;
            en.vx = 0;
            playSFX("stomp");
          }
        }
      } else if (en.type === "shell" && !en.shellMoving) {
        let isSpeedBoost = (powerType === "speed" && currentSprintBonus > 0.2);
        en.shellMoving = true;
        en.vx = (characterX < en.x ? 1 : -1) * (isSpeedBoost ? 16 : 8);
        score += 100;
        playSFX("kick");
        if (isSpeedBoost) {
          floatingTexts.push({ text: "2X SHELL SPEED!", x: en.x - 45, y: en.y - 25, vy: -1.4, life: 50 });
        }
      } else if (en.type === "shell" && en.shellMoving && powerType === "speed" && currentSprintBonus > 0.2) {
        let dir = (en.vx !== 0) ? Math.sign(en.vx) : (characterX < en.x ? 1 : -1);
        en.vx = dir * 16;
        en.stunTimer = 0;
        score += 100;
        playSFX("kick");
        floatingTexts.push({ text: "2X SHELL SPEED!", x: en.x - 45, y: en.y - 25, vy: -1.4, life: 50 });
      } else if (powerLevel === 3 && powerType === "cactus" && isCrouching) {
        let pushDir = (en.x >= characterX) ? 1 : -1;
        en.dead = true;
        en.vy = -8;
        knockbackVX = -pushDir * 6.5;
        score += 250;
        playSFX("kick");
        floatingTexts.push({ text: "THORN! +250", x: en.x - 20, y: en.y - 25, vy: -1.5, life: 50 });
        continue;
      } else if (en.type !== "shell" && powerType === "speed" && currentSprintBonus >= 0.9) {
        // 加速菇滿速閾值撞擊：撞退並暈眩怪物 3 秒，雙方均向後反彈！
        let pushDir = (en.x >= characterX) ? 1 : -1;
        en.stunTimer = 3000;
        en.knockbackX = pushDir * 9.5;
        en.vy = -4.5;
        knockbackVX = -pushDir * 7.5;
        currentSprintBonus = 0.25;
        score += 150;
        playSFX("kick");
        floatingTexts.push({ text: "STUN! +150", x: en.x - 24, y: en.y - 28, vy: -1.4, life: 50 });
      } else if (isStunned) {
        // 怪物暈眩期間碰撞完全不會受傷
        continue;
      } else {
        takeDamage();
        return;
      }
    }
  }
}

function drawEnemies() {
  for (let en of enemies) {
    let isStunned = (en.stunTimer && en.stunTimer > 0 && !en.dead);

    push();
    translate(en.x, en.y);
    if (en.dead) scale(1, -1);

    // 暈眩時怪物身體微微左右搖晃
    if (isStunned) {
      rotate(sin(frameCount * 0.45) * 0.14);
    }

    if (en.type === "goomba") {
      noStroke();
      fill("#8D5524");
      arc(0, 2, 30, 28, PI, TWO_PI);
      fill("#F1C27D");
      rect(-8, 2, 16, 10, 3);
      fill(255);
      ellipse(-5, -4, 6, 8);
      ellipse(5, -4, 6, 8);
      fill(0);
      ellipse(-4, -4, 3, 5);
      ellipse(4, -4, 3, 5);
      let footShift = isStunned ? 0 : sin(frameCount * 0.25) * 3;
      fill("#3D1E16");
      ellipse(-7 + footShift, 13, 10, 6);
      ellipse(7 - footShift, 13, 10, 6);
    } else if (en.type === "koopa" || en.type === "parakoopa") {
      let dir = en.vx >= 0 ? 1 : -1;
      scale(dir, 1);
      noStroke();
      fill(en.type === "parakoopa" ? "#E63946" : "#2EC4B6");
      arc(-2, 3, 28, 32, PI, TWO_PI);
      stroke(255);
      strokeWeight(1.5);
      arc(-2, 3, 28, 32, PI, TWO_PI);
      noStroke();
      fill("#FFD166");
      ellipse(10, -9, 14, 16);
      fill(255);
      ellipse(12, -11, 5, 7);
      fill(0);
      ellipse(13, -11, 2.5, 4);
      fill("#F4A261");
      let walkShift = isStunned ? 0 : sin(frameCount * 0.25) * 3;
      ellipse(-6 + walkShift, 15, 10, 7);
      ellipse(6 - walkShift, 15, 10, 7);

      if (en.type === "parakoopa") {
        fill(255);
        stroke("#ADB5BD");
        strokeWeight(1.5);
        let flap = isStunned ? 0 : sin(frameCount * 0.35) * 6;
        ellipse(-8, -9 + flap, 14, 22);
      }
    } else if (en.type === "shell") {
      noStroke();
      fill("#2EC4B6");
      arc(0, 6, 28, 24, PI, TWO_PI);
      fill(255);
      rect(-14, 6, 28, 5, 2);
    }
    pop();

    // 暈眩 3 秒期間：在怪物頭頂畫出 3 顆環繞旋轉的「眼冒金星」特效！
    if (isStunned) {
      push();
      translate(en.x, en.y - en.h / 2 - 12);
      noFill();
      stroke(255, 215, 0, 120);
      strokeWeight(1.5);
      ellipse(0, 0, 32, 10);

      for (let s = 0; s < 3; s++) {
        let ang = frameCount * 0.16 + s * (TWO_PI / 3);
        let sx = cos(ang) * 16;
        let sy = sin(ang) * 5;
        push();
        translate(sx, sy);
        rotate(frameCount * 0.1);
        noStroke();
        fill("#FFD700");
        beginShape();
        for (let p = 0; p < 10; p++) {
          let r = (p % 2 === 0) ? 5.5 : 2.3;
          let a = -HALF_PI + p * PI / 5;
          vertex(cos(a) * r, sin(a) * r);
        }
        endShape(CLOSE);
        pop();
      }
      pop();
    }
  }
}

function updatePlayerFireballs() {
  for (let i = playerFireballs.length - 1; i >= 0; i--) {
    let fb = playerFireballs[i];
    fb.x += fb.vx;
    fb.vy += gravity * 0.28;
    fb.y += fb.vy;
    fb.life--;

    let dir = fb.vx >= 0 ? 1 : -1;
    let targetY = null;
    let nearestDist = 420;

    for (let en of enemies) {
      if (en.dead) continue;
      let dx = (en.x - fb.x) * dir;
      if (dx > 0 && dx < nearestDist && abs(en.y - fb.y) < 150) {
        nearestDist = dx;
        targetY = en.y;
      }
    }

    if (targetY === null && currentLevel === 4 && boss && boss.alive && !boss.falling) {
      let dx = (boss.x - fb.x) * dir;
      if (dx > 0 && dx < 500 && abs(boss.y - fb.y) < 180) {
        targetY = boss.y;
      }
    }

    if (targetY !== null) {
      fb.vy += (targetY - fb.y) * 0.018;
      fb.vy = constrain(fb.vy, -7, 7);
    }

    if (checkCollision(fb.x, fb.y + 6, 12, 12) && fb.vy > 0) {
      fb.vy = -7.5;
    }

    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      let en = enemies[ei];
      if (!en.dead && abs(fb.x - en.x) < en.w / 2 + 18 && abs(fb.y - en.y) < en.h / 2 + 18) {
        en.dead = true;
        en.vy = -7;
        score += 300;
        playSFX("kick");
        floatingTexts.push({ text: "+300", x: en.x, y: en.y - 20, vy: -1.5, life: 45 });
        fb.life = 0;
        break;
      }
    }

    if (currentLevel === 4 && boss && boss.alive && !boss.falling) {
      if (abs(fb.x - boss.x) < boss.w / 2 + 14 && abs(fb.y - boss.y) < boss.h / 2 + 14) {
        boss.hp -= 3;
        boss.flashTimer = 8;
        score += 600;
        fb.life = 0;
        if (boss.hp <= 0) {
          boss.falling = true;
          boss.vy = -6;
          score += 15000;
          playSFX("clear");
          floatingTexts.push({ text: "+15000 BOSS DEFEATED!", x: boss.x - 60, y: boss.y - 60, vy: -1.5, life: 120 });
          gameState = "BOSS_DEFEAT_CUTSCENE";
        }
      }
    }

    if (fb.life <= 0 || fb.y > levelMap.length * TILE_SIZE + 50) {
      playerFireballs.splice(i, 1);
    }
  }
}

function drawPlayerFireballs() {
  for (let fb of playerFireballs) {
    push();
    translate(fb.x, fb.y);
    noStroke();
    fill("#FF2A00");
    ellipse(0, 0, 18, 18);
    fill("#FFD166");
    ellipse(0, 0, 10, 10);
    pop();
  }
} // ← 原本這裡多了一個 }，已移除

function updateCactusNeedles() {
  for (let i = cactusNeedles.length - 1; i >= 0; i--) {
    let nd = cactusNeedles[i];
    nd.x += nd.vx;
    nd.life--;

    // 穿透擊殺沿途所有怪物
    for (let en of enemies) {
      if (!en.dead && abs(nd.x - en.x) < en.w / 2 + 14 && abs(nd.y - en.y) < en.h / 2 + 12) {
        en.dead = true;
        en.vy = -7;
        score += 250;
        playSFX("kick");
        floatingTexts.push({ text: "+250", x: en.x, y: en.y - 20, vy: -1.5, life: 45 });
      }
    }

    // 碰到仙人掌刺柱直接擊碎並繼續穿透，碰到硬牆才消失
    let c = floor(nd.x / TILE_SIZE);
    let r = floor(nd.y / TILE_SIZE);
    if (r >= 0 && r < levelMap.length && c >= 0 && c < levelMap[0].length) {
      let t = levelMap[r][c];
      if (t === 'K') {
        levelMap[r][c] = ' ';
        spawnBrickParticles(c * TILE_SIZE + 20, r * TILE_SIZE + 20);
        playSFX("brick");
      } else if (t === 'G' || t === 'B' || t === 'S' || t === 'P' || t === 'E' || t === '?' || t === 'M') {
        nd.life = 0;
      }
    }

    if (nd.life <= 0) cactusNeedles.splice(i, 1);
  }
}

function triggerChronoShockwave() {
  chronoWaveTimer = 450;
  playSFX("powerup");
  for (let en of enemies) {
    if (!en.dead && dist(en.x, en.y, characterX, characterY) < 260) {
      en.stunTimer = 2500; // 領域內敵人定格暈眩 2.5 秒，可直接撞飛！
      en.vx = 0;
    }
  }
}

function tryChronoTimeRewind() {
  if (powerLevel === 3 && powerType === "chrono" && safePositionHistory.length > 0) {
    let rewindPt = safePositionHistory[0];
    characterX = rewindPt.x;
    characterY = rewindPt.y;
    velocityY = 0;
    knockbackVX = 0;
    powerLevel = 2;
    powerType = "mushroom";
    dashToggleActive = false;
    mobileDashLocked = false;
    chronoFieldActive = false;
    invincibleTimer = 1800;
    playSFX("1up");
    floatingTexts.push({
      text: "⏳ TIME REWIND!",
      x: characterX - 55,
      y: characterY - 50,
      vy: -1.5,
      life: 90,
      isOneUp: true
    });
    return true;
  }
  return false;
}

function drawCactusNeedles() {
  for (let nd of cactusNeedles) {
    push();
    translate(nd.x, nd.y);
    noStroke();
    fill("#38B000");
    rect(-12, -3, 24, 6, 3);
    fill("#FFF3B0");
    triangle(nd.vx > 0 ? 12 : -12, -4, nd.vx > 0 ? 18 : -18, 0, nd.vx > 0 ? 12 : -12, 4);
    pop();
  }
}

function addBumpTile(r, c) {
  bumpingTiles.push({ r: r, c: c, offsetY: -10 });
}

function updateBumpingTiles() {
  for (let i = bumpingTiles.length - 1; i >= 0; i--) {
    bumpingTiles[i].offsetY += 1.5;
    if (bumpingTiles[i].offsetY >= 0) {
      bumpingTiles.splice(i, 1);
    }
  }
}

function getTileBumpOffset(r, c) {
  for (let bt of bumpingTiles) {
    if (bt.r === r && bt.c === c) return bt.offsetY;
  }
  return 0;
}

function spawnPowerupFromBlock(tileChar, spawnX, spawnY) {
  playSFX("powerup");
  let spawnedType = "mushroom";

  if (tileChar === '*') {
    spawnedType = "star";
  } else if (powerLevel >= 2) {
    let pool = (currentWorld >= 2)
      ? ["fire", "feather", "speed", "cactus", "chrono"]
      : ["fire", "feather", "speed"];
    spawnedType = pool[nextPowerCycle % pool.length];
    nextPowerCycle++;
  }

  // 確保生成高度貼齊方塊正上方，不會飛進上一排磚塊
  let blockRow = floor((spawnY + TILE_SIZE / 2) / TILE_SIZE);
  let safeSpawnY = blockRow * TILE_SIZE - 16.5;

  items.push({
    type: spawnedType,
    x: spawnX,
    y: safeSpawnY,
    vx: 2.2,
    vy: spawnedType === "star" ? -3.2 : -1.5,
    size: 32,
    spawnDelay: 0
  });
}

function updateAndDrawItems(playerW, playerH) {
  for (let i = items.length - 1; i >= 0; i--) {
    let it = items[i];

    if (it.spawnDelay && it.spawnDelay > 0) {
      it.spawnDelay -= deltaTime;
      if (floor(it.spawnDelay / 100) % 2 === 0) {
        drawPowerupIcon(it.type, it.x, it.y, 1.0);
      }
      continue;
    }

    if (it.type !== "fire") {
      it.x += it.vx;
      if (checkCollision(it.x, it.y, it.size, it.size)) {
        it.x -= it.vx;
        it.vx *= -1;
      }
    }

    it.vy += gravity * 0.6;
    it.y += it.vy;
    if (checkCollision(it.x, it.y, it.size, it.size)) {
      if (it.vy > 0) {
        let bottomRow = floor((it.y + it.size / 2) / TILE_SIZE);
        it.y = bottomRow * TILE_SIZE - it.size / 2 - 0.1;
        it.vy = (it.type === "star") ? -10 : 0;
      }
    }

    drawPowerupIcon(it.type, it.x, it.y, 1.0);

    if (abs(characterX - it.x) < (playerW + it.size) / 2 &&
        abs(characterY - it.y) < (playerH + it.size) / 2) {
      score += 1000;
      items.splice(i, 1);

      if (it.type === "star") {
        starTimer = 8000;
        playSFX("powerup");
        floatingTexts.push({ text: "STAR POWER!", x: characterX - 45, y: characterY - 55, vy: -1.5, life: 70 });
        triggerFirstTimeItemGuide("star");
        continue;
      }

      if (it.type === "mushroom") {
        if (powerLevel === 1) {
          transformFromBig = false;
          transformToBig = true;
          powerLevel = 2;
          powerType = "mushroom";
          playSFX("powerup");
          if (!triggerFirstTimeItemGuide("mushroom")) {
            gameState = "TRANSFORM_FREEZE";
            transformTimer = 500;
            transformIsDamage = false;
          }
        } else {
          reservedItem = "mushroom";
          playSFX("coin");
          floatingTexts.push({ text: "ITEM STORED!", x: characterX - 40, y: characterY - 55, vy: -1.5, life: 60 });
        }
      } else {
        if (powerLevel === 1 || powerLevel === 2) {
          transformFromBig = (powerLevel >= 2);
          transformToBig = true;
          powerLevel = 3;
          powerType = it.type;
          playSFX("powerup");
          if (!triggerFirstTimeItemGuide(it.type)) {
            gameState = "TRANSFORM_FREEZE";
            transformTimer = 500;
            transformIsDamage = false;
          }
        } else {
          if (powerType !== it.type) {
            reservedItem = powerType;
            powerType = it.type;
            playSFX("powerup");
            floatingTexts.push({ text: "POWER SWAP!", x: characterX - 40, y: characterY - 55, vy: -1.5, life: 60 });
            triggerFirstTimeItemGuide(it.type);
          } else {
            reservedItem = it.type;
            playSFX("coin");
            floatingTexts.push({ text: "ITEM STORED!", x: characterX - 40, y: characterY - 55, vy: -1.5, life: 60 });
          }
        }
      }
      continue;
    }

    if (it.y > levelMap.length * TILE_SIZE + 100) {
      items.splice(i, 1);
    }
  }
}

function updateFireBars(playerW, playerH) {
  for (let fb of fireBars) {
    fb.angle += fb.speed;
    if (gameState !== "PLAYING" || invincibleTimer > 0 || starTimer > 0) continue;

    for (let i = 1; i <= fb.count; i++) {
      let fx = fb.cx + cos(fb.angle) * (i * fb.spacing);
      let fy = fb.cy + sin(fb.angle) * (i * fb.spacing);
      if (abs(characterX - fx) < (playerW / 2 + 7) && abs(characterY - fy) < (playerH / 2 + 7)) {
        takeDamage();
        return;
      }
    }
  }
}

function drawFireBars() {
  for (let fb of fireBars) {
    fill("#555555");
    stroke(0);
    strokeWeight(2);
    ellipse(fb.cx, fb.cy, 20, 20);
    noStroke();

    for (let i = 1; i <= fb.count; i++) {
      let fx = fb.cx + cos(fb.angle) * (i * fb.spacing);
      let fy = fb.cy + sin(fb.angle) * (i * fb.spacing);
      fill("#FF4500");
      ellipse(fx, fy, 18, 18);
      fill("#FFD700");
      ellipse(fx, fy, 9, 9);
    }
  }
}

function updateBossAndFireballs(playerW, playerH, viewWorldW = width) {
  if (!boss) return;

  for (let i = bossFireballs.length - 1; i >= 0; i--) {
    let bf = bossFireballs[i];
    bf.x += bf.vx;
    bf.y += (bf.targetY - bf.y) * 0.04;

    if (gameState === "PLAYING" && invincibleTimer <= 0 && starTimer <= 0 &&
        abs(characterX - bf.x) < (playerW / 2 + 12) && abs(characterY - bf.y) < (playerH / 2 + 8)) {
      bossFireballs.splice(i, 1);
      takeDamage();
      return;
    }

    if (bf.x < cameraX - 100 || bf.x > cameraX + viewWorldW + 200) {
      bossFireballs.splice(i, 1);
    }
  }

  if (!boss.alive) return;

  if (boss.flashTimer > 0) boss.flashTimer--;

  if (boss.falling) {
    boss.vy += gravity * 0.7;
    boss.y += boss.vy;
    if (boss.y > 14 * TILE_SIZE) {
      boss.alive = false;
      bossFireballs = [];
    }
    return;
  }

  if (abs(characterX - boss.x) < viewWorldW * 0.85 && gameState === "PLAYING") {
    boss.x += boss.vx;
    if (boss.x <= boss.minX) {
      boss.x = boss.minX;
      boss.vx = abs(boss.vx);
    } else if (boss.x >= boss.maxX) {
      boss.x = boss.maxX;
      boss.vx = -abs(boss.vx);
    }

    if (millis() - boss.lastJumpTime > 2200 && boss.vy === 0) {
      boss.vy = -13;
      boss.lastJumpTime = millis();
    }

    boss.vy += gravity * 0.65;
    boss.y += boss.vy;
    let bridgeTopY = 11 * TILE_SIZE - boss.h / 2;
    if (boss.y >= bridgeTopY) {
      boss.y = bridgeTopY;
      boss.vy = 0;
    }

    if (millis() - boss.lastFireTime > 1900) {
      let aimHigh = random() < 0.5;
      let fireY = aimHigh ? (11 * TILE_SIZE - 68) : (11 * TILE_SIZE - 26);
      bossFireballs.push({
        x: boss.x - boss.w / 2,
        y: boss.y - 10,
        targetY: fireY,
        vx: -5.2
      });
      boss.lastFireTime = millis();
    }

    if (invincibleTimer <= 0 && starTimer <= 0 &&
        abs(characterX - boss.x) < (playerW + boss.w) / 2 - 6 &&
        abs(characterY - boss.y) < (playerH + boss.h) / 2 - 6) {
      takeDamage();
    }
  }
}

function drawBossAndFireballs() {
  for (let bf of bossFireballs) {
    push();
    translate(bf.x, bf.y);
    fill("#FF2A00");
    ellipse(0, 0, 34, 18);
    fill("#FFA500");
    ellipse(-4, 0, 22, 12);
    fill("#FFFF66");
    ellipse(-8, 0, 12, 6);
    pop();
  }

  if (!boss || !boss.alive) return;

  push();
  translate(boss.x, boss.y);

  if (!boss.falling) {
    fill(0);
    rect(-35, -boss.h / 2 - 22, 70, 8, 3);
    fill("#FF3B30");
    rect(-34, -boss.h / 2 - 21, 68 * (boss.hp / boss.maxHp), 6, 2);
  }

  let isFlashing = boss.flashTimer > 0;
  fill(isFlashing ? 255 : "#1B4332");
  arc(10, 5, 62, 68, -HALF_PI, HALF_PI);
  fill(isFlashing ? 255 : "#F8F9FA");
  triangle(36, -15, 48, -10, 38, -2);
  triangle(40, 5, 52, 10, 38, 16);

  fill(isFlashing ? 255 : "#D97706");
  rect(-26, -24, 46, 56, 12);
  fill(isFlashing ? 255 : "#FDE68A");
  rect(-24, -14, 24, 40, 6);

  fill(isFlashing ? 255 : "#15803D");
  rect(-34, -44, 38, 30, 8);
  fill(isFlashing ? 255 : "#DC2626");
  triangle(-22, -44, -10, -56, -4, -44);
  fill(isFlashing ? 255 : "#FFFFFF");
  triangle(-28, -42, -38, -54, -20, -44);

  fill("#FF0000");
  rect(-30, -34, 8, 6);
  fill(255);
  triangle(-32, -20, -28, -14, -24, -20);
  triangle(-22, -20, -18, -14, -14, -20);

  fill(isFlashing ? 255 : "#B45309");
  rect(-22, 28, 18, 14, 4);
  rect(4, 28, 18, 14, 4);
  pop();
}

function checkAxeTrigger(cx, cy, cw, ch) {
  let col = floor(cx / TILE_SIZE);
  let row = floor(cy / TILE_SIZE);
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < levelMap.length && c >= 0 && c < levelMap[0].length) {
        if (levelMap[r][c] === 'A') {
          levelMap[r][c] = ' ';
          bridgeCollapsing = true;
          bridgeCollapseTimer = millis();
          bossFireballs = [];
          score += 15000;
          playSFX("clear");
          floatingTexts.push({ text: "+15000 AXE CLEAR!", x: c * TILE_SIZE - 40, y: r * TILE_SIZE - 30, vy: -1.5, life: 120 });

          characterX = c * TILE_SIZE + TILE_SIZE / 2;
          characterY = (r + 1) * TILE_SIZE - ch / 2 - 0.1;
          velocityY = 0;
          isOnGround = true;

          gameState = "BOSS_DEFEAT_CUTSCENE";
          isAttacking = false;
          isCrouching = false;
          return;
        }
      }
    }
  }
}

function updateBridgeCollapse() {
  if (!bridgeCollapsing) return;
  if (millis() - bridgeCollapseTimer > 65) {
    bridgeCollapseTimer = millis();
    if (bridgeTiles.length > 0) {
      let tilePos = bridgeTiles.shift();
      levelMap[tilePos.r][tilePos.c] = ' ';
      playSFX("brick");
      spawnBrickParticles(tilePos.c * TILE_SIZE + TILE_SIZE / 2, tilePos.r * TILE_SIZE + TILE_SIZE / 2);
    } else {
      bridgeCollapsing = false;
      if (boss && boss.alive) {
        boss.falling = true;
        boss.vy = 2;
      }
    }
  }
}

function checkLavaHazard(cx, cy, cw, ch) {
  let left = cx - cw / 2 + 4;
  let right = cx + cw / 2 - 4;
  let bottom = cy + ch / 2;
  let startCol = floor(left / TILE_SIZE);
  let endCol = floor(right / TILE_SIZE);
  let row = floor(bottom / TILE_SIZE);

  if (row >= 0 && row < levelMap.length) {
    for (let c = startCol; c <= endCol; c++) {
      if (c >= 0 && c < levelMap[0].length && levelMap[row][c] === 'L') {
        return true;
      }
    }
  }
  return false;
}

function updateMovingPlatforms() {
  for (let mp of movingPlatforms) {
    let oldX = mp.x;
    mp.x += mp.speed;
    if (mp.x <= mp.minX) {
      mp.x = mp.minX;
      mp.speed *= -1;
    } else if (mp.x >= mp.maxX) {
      mp.x = mp.maxX;
      mp.speed *= -1;
    }
    mp.dx = mp.x - oldX;
  }
}

function drawMovingPlatforms() {
  for (let mp of movingPlatforms) {
    fill(currentLevel === 4 ? "#8D99AE" : "#E07A5F");
    stroke("#2B2D42");
    strokeWeight(2);
    rect(mp.x, mp.y, mp.w, mp.h, 4);
    fill(currentLevel === 4 ? "#EDF2F4" : "#F2CC8F");
    noStroke();
    rect(mp.x + 4, mp.y + 3, mp.w - 8, 5, 2);
  }
}

function checkEnterPipe(cx, cy, cw, ch) {
  let rightEdge = cx + cw / 2 + 4;
  let col = floor(rightEdge / TILE_SIZE);
  let row = floor(cy / TILE_SIZE);

  if (row >= 0 && row < levelMap.length && col >= 0 && col < levelMap[0].length) {
    if (levelMap[row][col] === 'H') {
      gameState = "ENTERING_PIPE";
      stateTimer = millis();
      isAttacking = false;
      isCrouching = false;
      playSFX("shrink");
    }
  }
}

function checkHiddenBlockHit(hitX, hitY) {
  let col = floor(hitX / TILE_SIZE);
  let row = floor(hitY / TILE_SIZE);

  if (row >= 0 && row < levelMap.length && col >= 0 && col < levelMap[0].length) {
    if (levelMap[row][col] === 'I') {
      levelMap[row][col] = 'E';
      addBumpTile(row, col);
      addCoinAndScore(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE);
      return true;
    }
  }
  return false;
}

function checkHitTile(hitX, hitY) {
  let col = floor(hitX / TILE_SIZE);
  let row = floor(hitY / TILE_SIZE);

  if (row >= 0 && row < levelMap.length && col >= 0 && col < levelMap[0].length) {
    let tile = levelMap[row][col];
    
    if (tile === '?') {
      levelMap[row][col] = 'E'; 
      addBumpTile(row, col);
      addCoinAndScore(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE);
    } else if (tile === 'M' || tile === '*') {
      levelMap[row][col] = 'E';
      addBumpTile(row, col);
      spawnPowerupFromBlock(tile, col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE - TILE_SIZE / 2);
    } else if (tile === 't') {
      levelMap[row][col] = 'E';
      addBumpTile(row, col);
      torchCount += 16;
      playSFX("powerup");
      floatingTexts.push({ text: "獲得 16 根火把！", x: col * TILE_SIZE - 30, y: row * TILE_SIZE - 20, vy: -1.5, life: 70, isOneUp: true });
    } else if (tile === 'B') {
      if (powerLevel >= 2) {
        levelMap[row][col] = ' ';
        score += 50;
        playSFX("brick");
        spawnBrickParticles(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2);
      } else {
        addBumpTile(row, col);
        playSFX("stomp");
      }
    }
  }
}

function spawnBrickParticles(bx, by) {
  let dirs = [[-3, -8], [3, -8], [-2, -5], [2, -5]];
  for (let d of dirs) {
    brickParticles.push({
      x: bx,
      y: by,
      vx: d[0],
      vy: d[1],
      life: 40
    });
  }
}

function updateAndDrawBrickParticles() {
  for (let i = brickParticles.length - 1; i >= 0; i--) {
    let p = brickParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.5;
    p.life--;

    fill((currentLevel === 2 && !is1_2Intro) ? "#3b6e8c" : (currentLevel === 4 ? "#6c757d" : "#A33B20"));
    rect(p.x - 6, p.y - 6, 12, 12);

    if (p.life <= 0) {
      brickParticles.splice(i, 1);
    }
  }
}

function checkFlagpole(cx, cy, cw, ch) {
  // 1. 偵測 World 2 中繼存檔旗 ('R')：首次觸碰啟動存檔點＋紅蘑菇變大效果！
  let pCol = floor(cx / TILE_SIZE);
  let pRow = floor(cy / TILE_SIZE);
  for (let r = pRow - 1; r <= pRow + 1; r++) {
    for (let c = pCol - 1; c <= pCol + 1; c++) {
      if (r >= 0 && r < levelMap.length && c >= 0 && c < levelMap[0].length) {
        if (levelMap[r][c] === 'R') {
          // 把這根存檔旗標記為已啟動（改成 'r' 小寫）
          for (let fr = 0; fr < levelMap.length; fr++) {
            if (levelMap[fr][c] === 'R') levelMap[fr][c] = 'r';
          }
          checkpointState = {
            active: true,
            world: currentWorld,
            level: currentLevel,
            x: c * TILE_SIZE + TILE_SIZE / 2,
            y: (r - 1) * TILE_SIZE
          };
          playSFX("powerup");
          floatingTexts.push({ text: "CHECKPOINT!", x: c * TILE_SIZE - 30, y: r * TILE_SIZE - 45, vy: -1.5, life: 90, isOneUp: true });

          // 首次吃到中繼旗會有紅蘑菇變大效果（若目前是 1 階小隻就升級為 2 階大隻）
          if (powerLevel === 1) {
            transformFromBig = false;
            transformToBig = true;
            powerLevel = 2;
            powerType = "mushroom";
            gameState = "TRANSFORM_FREEZE";
            transformTimer = 500;
            transformIsDamage = false;
          }
        }

        // 2. 偵測 2-1 隱藏高空秘密終點旗杆 ('H'，僅在 currentWorld === 2 時)
        if (currentWorld === 2 && levelMap[r][c] === 'H') {
          isSecretClear = true;
          playSFX("1up");
          score += 10000;
          floatingTexts.push({ text: "SECRET GOAL! +10000", x: c * TILE_SIZE - 50, y: r * TILE_SIZE - 30, vy: -1.5, life: 120, isOneUp: true });

          // 先把主角貼齊旗杆並進入滑旗狀態，而非直接吸向城堡
          characterX = c * TILE_SIZE + TILE_SIZE / 2;
          velocityY = 0;
          isGliding = false;
          isAttacking = false;
          isCrouching = false;
          gameState = "FLAG_SLIDE";

          // 自動尋找右邊城堡 'C' 的正中央，滑到底後再走進去
          let minCastleCol = 9999;
          let maxCastleCol = -1;
          for (let cr = 0; cr < levelMap.length; cr++) {
            for (let cc = c + 1; cc < levelMap[cr].length; cc++) {
              if (levelMap[cr][cc] === 'C') {
                minCastleCol = min(minCastleCol, cc);
                maxCastleCol = max(maxCastleCol, cc);
              }
            }
          }
          if (maxCastleCol !== -1) {
            castleTargetX = ((minCastleCol + maxCastleCol + 1) / 2) * TILE_SIZE;
          } else {
            castleTargetX = (c + 7.5) * TILE_SIZE;
          }
          return;
        }
      }
    }
  }
  if (flagCol === -1 || gameState !== "PLAYING") return;

  let topFlagRow = 3;
  let bottomFlagRow = 11;
  for (let r = 0; r < levelMap.length; r++) {
    if (levelMap[r][flagCol] === '|' || levelMap[r][flagCol] === 'F') {
      topFlagRow = r;
      break;
    }
  }
  for (let r = topFlagRow; r < levelMap.length; r++) {
    if (levelMap[r][flagCol] === '|' || levelMap[r][flagCol] === 'F') {
      bottomFlagRow = r;
    }
  }
  let poleTopY = topFlagRow * TILE_SIZE - 8;
  let poleBottomY = (bottomFlagRow + 1) * TILE_SIZE;
  if (cy + ch / 2 < poleTopY || cy - ch / 2 > poleBottomY) return;

  let flagX = flagCol * TILE_SIZE + TILE_SIZE / 2;
  if (cx + cw / 2 >= flagX - 6) {
    characterX = flagX;
    velocityY = 0;
    isGliding = false;
    isAttacking = false;
    isCrouching = false;
    gameState = "FLAG_SLIDE";
    playSFX("clear");

    let grabRow = floor(cy / TILE_SIZE);
    let earnedPoints = 200;
    if (grabRow <= 3) {
      earnedPoints = 10000; 
      triggerOneUp(flagX + 25, cy - 30);
    } else if (grabRow === 4) {
      earnedPoints = 8000;
    } else if (grabRow === 5) {
      earnedPoints = 4000;
    } else if (grabRow === 6) {
      earnedPoints = 2000;
    } else if (grabRow === 7) {
      earnedPoints = 1000;
    } else if (grabRow === 8) {
      earnedPoints = 800;
    } else if (grabRow === 9 || grabRow === 10) {
      earnedPoints = 400;
    } else {
      earnedPoints = 200;
    }

    score += earnedPoints;

    floatingTexts.push({
      text: "+" + earnedPoints,
      x: flagX + 25,
      y: cy,
      vy: -1.5,
      life: 120 
    });

    let minCastleCol = 9999;
    let maxCastleCol = -1;
    for (let r = 0; r < levelMap.length; r++) {
      for (let c = flagCol + 1; c < levelMap[r].length; c++) {
        if (levelMap[r][c] === 'C') {
          minCastleCol = min(minCastleCol, c);
          maxCastleCol = max(maxCastleCol, c);
        }
      }
    }
    if (maxCastleCol !== -1) {
      castleTargetX = ((minCastleCol + maxCastleCol + 1) / 2) * TILE_SIZE;
    } else {
      castleTargetX = flagX + 8 * TILE_SIZE;
    }
  }
}

function updateAndDrawFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.life--;

    push();
    if (ft.isOneUp) {
      fill("#4CD137");
      stroke(0);
      strokeWeight(5);
      textSize(30);
      textStyle(BOLD);
    } else {
      fill("#FFD700");
      stroke(0);
      strokeWeight(4);
      textSize(24);
      textStyle(NORMAL);
    }
    textAlign(LEFT, CENTER);
    text(ft.text, ft.x, ft.y);
    pop();

    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

function updateAndDrawCoins() {
  for (let i = coins.length - 1; i >= 0; i--) {
    let c = coins[i];
    c.y += c.vy; 
    c.vy += 0.6; 
    c.life--;

    fill("#FFD700");
    stroke("#B8860B");
    strokeWeight(2);
    ellipse(c.x, c.y, 16, 22);
    noStroke();

    if (c.life <= 0) {
      coins.splice(i, 1);
    }
  }
}
function checkCollectOpenCoins(cx_w, cy_h) {
  let startCol = floor((characterX - cx_w / 2) / TILE_SIZE);
  let endCol   = floor((characterX + cx_w / 2) / TILE_SIZE);
  let startRow = floor((characterY - cy_h / 2) / TILE_SIZE);
  let endRow   = floor((characterY + cy_h / 2) / TILE_SIZE);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (r >= 0 && r < levelMap.length && c >= 0 && c < levelMap[0].length) {
        if (levelMap[r][c] === 'O') {
          levelMap[r][c] = ' ';
          addCoinAndScore(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
        }
      }
    }
  }
}

function drawPipesOnly() {
  push();
  imageMode(CORNER);
  for (let row = 0; row < levelMap.length; row++) {
    for (let col = 0; col < levelMap[row].length; col++) {
      let tile = levelMap[row][col];
      if (tile === 'P' || tile === 'p' || tile === 'u' || tile === 'V' ) {
        let isCeilingPipe = (row >= 2 && levelMap[0][col] === 'B' && levelMap[1][col] === 'B' && levelMap[2][col] === tile);
        let isMouth = isCeilingPipe
          ? (row === levelMap.length - 1 || levelMap[row + 1][col] !== tile)
          : (row === 0 || levelMap[row - 1][col] !== tile);
        image(isMouth ? textures["PIPE_TOP"] : textures["PIPE"], col * TILE_SIZE, row * TILE_SIZE);
      } else if (tile === 'H') {
        // 如果上方也是 'H'，代表已經由上一排一起畫成整根大橫管了，跳過避免重複切斷
        if (row > 0 && levelMap[row - 1][col] === 'H') continue;

        let isDoubleH = (row + 1 < levelMap.length && levelMap[row + 1][col] === 'H');
        let pipeHHeight = isDoubleH ? TILE_SIZE * 2 : TILE_SIZE;
        let isLeftMouth = (col === 0 || levelMap[row][col - 1] !== 'H');
        let px = col * TILE_SIZE;
        let py = row * TILE_SIZE - 6; // 往上多包 6px，確保高個子主角頭頂也完全進管不露餡
        let ph = pipeHHeight + 6;

        noStroke();
        // 管身主色（不透明實心綠，徹底封死不漏風）
        fill("#1B7F3A");
        rect(px, py, TILE_SIZE, ph);
        // 高光條紋
        fill("#2EC4B6");
        rect(px, py + 5, TILE_SIZE, 6);
        fill("#80ED99");
        rect(px, py + 15, TILE_SIZE, 14);
        // 底部陰影
        fill("#134E27");
        rect(px, py + ph - 10, TILE_SIZE, 10);

        // 最左側管口加厚凸緣框
        if (isLeftMouth) {
          fill("#0D3B1E");
          rect(px - 2, py - 3, 12, ph + 6, 2);
          fill("#1B7F3A");
          rect(px, py - 1, 8, ph + 2);
          fill("#80ED99");
          rect(px + 2, py + 12, 4, 18);
        }
      }
    }
  }
  pop();
}

function drawMap(viewWorldW = width) {
  let isUnderground = (currentLevel === 2 && !is1_2Intro);
  push();
  imageMode(CORNER);

  for (let row = 0; row < levelMap.length; row++) {
    for (let col = 0; col < levelMap[row].length; col++) {
      let tile = levelMap[row][col];
      let tileX = col * TILE_SIZE;
      let tileY = row * TILE_SIZE + getTileBumpOffset(row, col);

      if (tileX + TILE_SIZE > cameraX && tileX < cameraX + viewWorldW) {
        if (tile === 'V') {
          noStroke();
          fill("#B07D3B"); // 深沙褐色底（與一般流沙呼應但略深，帶神秘感）
          rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
          fill("#8C5A1E"); // 暗沙漩渦波紋
          let wave = sin(frameCount * 0.12 + col) * 6;
          ellipse(tileX + 20 + wave, tileY + 8, 28, 7);
          ellipse(tileX + 20 - wave, tileY + 24, 22, 6);
          continue;
        }
        if (tile === 'Q') {
          noStroke();
          fill("#D4A373");
          rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
          fill("#FAEDCD");
          let wave = sin(frameCount * 0.12 + col) * 4;
          ellipse(tileX + 12 + wave, tileY + 8, 16, 6);
          ellipse(tileX + 28 - wave, tileY + 22, 18, 6);
          continue;
        }
        if (tile === 'K') {
          noStroke();
          fill("#2D6A4F");
          rect(tileX + 10, tileY + 2, 20, TILE_SIZE - 2, 8);
          rect(tileX + 2, tileY + 12, 8, 12, 4);
          rect(tileX + 30, tileY + 8, 8, 12, 4);
          if (row > 0 && levelMap[row - 1][col] !== 'K') {
            fill("#E63946");
            ellipse(tileX + 20, tileY + 2, 10, 8);
          }
          continue;
        }
        if (tile === 'R' || tile === 'r') {
          stroke("#FFFFFF");
          strokeWeight(4);
          line(tileX + 20, tileY, tileX + 20, tileY + TILE_SIZE);
          noStroke();
          if (row > 0 && levelMap[row - 1][col] !== 'R' && levelMap[row - 1][col] !== 'r') {
            fill(tile === 'r' ? "#38B000" : "#F77F00");
            triangle(tileX + 22, tileY + 2, tileX + 46, tileY + 12, tileX + 22, tileY + 22);
          }
          continue;
        }
        if (tile === 'W') {
          noStroke();
          fill("#FFFFFF");
          rect(tileX, tileY + 4, TILE_SIZE, 22, 10);
          ellipse(tileX + 10, tileY + 6, 20, 16);
          ellipse(tileX + 28, tileY + 6, 22, 18);
          continue;
        }
        if (currentWorld === 2 && (tile === 'G' || tile === 'S')) {
          stroke("#9C6644");
          strokeWeight(2);
          fill(tile === 'G' ? "#E6CCB2" : "#DDB892");
          rect(tileX, tileY, TILE_SIZE, TILE_SIZE, 3);
          noStroke();
          fill("#B08968");
          rect(tileX + 6, tileY + 6, 10, 6, 2);
          continue;
        }
        if (tile === 'G') {
          let tex = textures["G_DAY"];
          if (currentLevel === 4) tex = textures["G_CASTLE"];
          else if (currentLevel === 3) tex = textures["G_SKY"];
          else if (isUnderground) tex = textures["G_UNDER"];
          image(tex, tileX, tileY);
        } else if (tile === 'B') {
          image(textures["BRICK"], tileX, tileY);
        } else if (tile === '?' || tile === 'M' || tile === '*' || tile === 't') {
       image(textures["QBOX"], tileX, tileY);
       if (floor(frameCount / 15) % 2 === 0) {
         noStroke();
         fill(255, 255, 220, 75);
         rect(tileX + 3, tileY + 3, TILE_SIZE - 6, TILE_SIZE - 6, 3);
       }
        } else if (tile === 'E') {
          image(textures["EMPTY"], tileX, tileY);
          } else if (tile === 'O') {
          let spinW = max(5, abs(cos(frameCount * 0.08 + col * 0.5)) * 18);
          fill("#FFD166");
          stroke("#B8860B");
          strokeWeight(2);
          ellipse(tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2, spinW, 24);
          noStroke();
        } else if (tile === 'T') {
          fill("#C87D4B");
          rect(tileX, tileY, TILE_SIZE, TILE_SIZE * 0.45);
          fill("#8D5524");
          rect(tileX, tileY + TILE_SIZE * 0.45, TILE_SIZE, TILE_SIZE * 0.55);
        } else if (tile === 'D') {
          fill("#D4A373");
          rect(tileX, tileY, TILE_SIZE, TILE_SIZE * 0.4);
          fill("#6C757D");
          rect(tileX + 6, tileY + TILE_SIZE * 0.4, TILE_SIZE - 12, TILE_SIZE * 0.3);
        } else if (tile === 'L') {
          noStroke();
          fill("#FF2A00");
          rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
          fill("#FF9E00");
          let wave = sin(frameCount * 0.1 + col) * 4;
          rect(tileX, tileY + 4 + wave, TILE_SIZE, 8);
        } else if (tile === 'A') {
          noStroke();
          fill("#ADB5BD");
          rect(tileX + 18, tileY + 6, 4, 28);
          fill("#FFD700");
          arc(tileX + 20, tileY + 14, 24, 18, -HALF_PI, HALF_PI);
       } else if (tile === 'P' || tile === 'p' || tile === 'u') {
          let isCeilingPipe = (row >= 2 && levelMap[0][col] === 'B' && levelMap[1][col] === 'B' && levelMap[2][col] === tile);
          let isMouth = isCeilingPipe
            ? (row === levelMap.length - 1 || levelMap[row + 1][col] !== tile)
            : (row === 0 || levelMap[row - 1][col] !== tile);
          image(isMouth ? textures["PIPE_TOP"] : textures["PIPE"], tileX, tileY);
        } else if (tile === 'H') {
          if (currentWorld === 2) {
            stroke("#FFD166");
            strokeWeight(5);
            line(tileX + 20, tileY, tileX + 20, tileY + TILE_SIZE);
            noStroke();
            if (row > 0 && levelMap[row - 1][col] !== 'H') {
              fill("#E63946");
              let fy = tileY + flagDropY;
              triangle(tileX + 22, fy + 2, tileX + 52, fy + 14, tileX + 22, fy + 26);
            }
            continue;
          }
        if (!(row > 0 && levelMap[row - 1][col] === 'H')) {
          let isDoubleH = (row + 1 < levelMap.length && levelMap[row + 1][col] === 'H');
          let pipeHHeight = isDoubleH ? TILE_SIZE * 2 : TILE_SIZE;
          let isLeftMouth = (col === 0 || levelMap[row][col - 1] !== 'H');
          let px = tileX;
          let py = tileY - 6;
          let ph = pipeHHeight + 6;

          noStroke();
          fill("#1B7F3A");
          rect(px, py, TILE_SIZE, ph);
          fill("#2EC4B6");
          rect(px, py + 5, TILE_SIZE, 6);
          fill("#80ED99");
          rect(px, py + 15, TILE_SIZE, 14);
          fill("#134E27");
          rect(px, py + ph - 10, TILE_SIZE, 10);

          if (isLeftMouth) {
            fill("#0D3B1E");
            rect(px - 2, py - 3, 12, ph + 6, 2);
            fill("#1B7F3A");
            rect(px, py - 1, 8, ph + 2);
            fill("#80ED99");
            rect(px + 2, py + 12, 4, 18);
          }
        }
        } else if (tile === 'S') {
          image(textures["STAIR"], tileX, tileY);
        } else if (tile === 'F') {
          noStroke();
          fill("#FFFFFF");
          rect(tileX + TILE_SIZE / 2 - 4, tileY, 8, TILE_SIZE);
        } else if (tile === '|') {
        noStroke();
        fill("#FFFFFF");
        rect(tileX + TILE_SIZE / 2 - 4, tileY, 8, TILE_SIZE);
        if (row === 0 || (levelMap[row - 1][col] !== '|' && levelMap[row - 1][col] !== 'F')) {
          fill("#2ECC71");
          let fy = tileY + flagDropY;
          triangle(tileX + TILE_SIZE / 2 - 4, fy, tileX + TILE_SIZE / 2 - 36, fy + 15, tileX + TILE_SIZE / 2 - 4, fy + 30);
        }
      } else if (tile === 'C') {
          let isTop = (row === 0 || levelMap[row - 1][col] !== 'C');
          let isBottom = (row === levelMap.length - 1 || levelMap[row + 1][col] !== 'C');
          let isLeftEdge = (col === 0 || levelMap[row][col - 1] !== 'C');
          let isRightEdge = (col === levelMap[row].length - 1 || levelMap[row][col + 1] !== 'C');
          let isCenterDoor = (isBottom && !isLeftEdge && !isRightEdge &&
                              levelMap[row][col - 1] === 'C' && levelMap[row][col + 1] === 'C');


          if (isTop) {
            image(textures["CASTLE_TOP"], tileX, tileY);
          } else if (isCenterDoor) {
            image(textures["CASTLE_DOOR"], tileX, tileY);
          } else {
            image(textures["CASTLE_WALL"], tileX, tileY);
            // 中層左右兩側自動加裝飾小拱窗
            if (!isBottom && (isLeftEdge || isRightEdge)) {
              fill("#1A0505");
              rect(tileX + 13, tileY + 10, 14, 20, 7, 7, 0, 0);
            }
          }
        }
      }
    }
  }
  pop();
}

function checkCollision(cx, cy, cw, ch) {
  let left = cx - cw / 2;
  let right = cx + cw / 2;
  let top = cy - ch / 2;
  let bottom = cy + ch / 2; 

  let startCol = floor(left / TILE_SIZE);
  let endCol = floor(right / TILE_SIZE);
  let startRow = floor(top / TILE_SIZE);
  let endRow = floor(bottom / TILE_SIZE);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      if (r >= 0 && r < levelMap.length && c >= 0 && c < levelMap[0].length) {
        let tile = levelMap[r][c];
        if (tile !== ' ' && tile !== 'I' && tile !== 'A' && tile !== 'L' && tile !== 'F' && tile !== '|' && tile !== 'C' && tile !== 'O'  && tile !== 'Q' && tile !== 'V' && tile !== 'K' && tile !== 'R' && tile !== 'r' && !(currentWorld === 2 && tile === 'H')) { 
          return true; 
        }
      }
    }
  }
  return false;
}

function enterSelectedMapNode() {
  let node = mapNodesData[selectedMapNode];
  if (!node || !node.unlocked) {
    playSFX("stomp");
    return;
  }
  if (node.type === "shop") {
    openDesertShop();
    return;
  }
  if (node.type === "junction") {
    selectedMapNode = "2-1";
    playSFX("mapMove");
    return;
  }
  // 每次從大地圖重新進入關卡，一律清空上一輪的中繼存檔點與秘密通關標記
  checkpointState.active = false;
  isSecretClear = false;

  let parts = node.id.split("-");
  currentWorld = int(parts[0]);
  let lvlNum = int(parts[1]);
  startLevel(lvlNum, false, true);
}

// <--- 新增以下兩個共用函式：大地圖方向移動 + 手機十字鍵座標
function moveWorldMapCursor(moveDir) {
  let curNode = mapNodesData[selectedMapNode];
  if (!moveDir || !curNode || !curNode.neighbors) return;

  let targetId = curNode.neighbors[moveDir];
  if (targetId === "TO_W1") {
    worldTransition = {
      active: true,
      phase: "WALK_EDGE",
      dir: -1,
      timer: millis(),
      flagProgress: 1,
      roadProgress: 1,
      spotlightR: max(width, height) * 0.75
    };
    playSFX("mapMove");
  } else if (targetId === "TO_W2" && curNode.cleared) {
    worldTransition = {
      active: true,
      phase: "WALK_EDGE",
      dir: 1,
      timer: millis(),
      flagProgress: 1,
      roadProgress: 1,
      spotlightR: max(width, height) * 0.75
    };
    playSFX("mapMove");
  } else if (targetId && mapNodesData[targetId] && mapNodesData[targetId].unlocked) {
    selectedMapNode = targetId;
    playSFX("mapMove");
  } else if (targetId) {
    playSFX("stomp");
  }
}

function getMobileMapPadRects() {
  let s = 46;
  let cx = 86;
  let cy = height - 74;
  return {
    up:    { x: cx - s / 2, y: cy - s * 1.35, w: s, h: s, label: "▲", dir: "up" },
    down:  { x: cx - s / 2, y: cy + s * 0.35, w: s, h: s, label: "▼", dir: "down" },
    left:  { x: cx - s * 1.45, y: cy - s / 2, w: s, h: s, label: "◀", dir: "left" },
    right: { x: cx + s * 0.45, y: cy - s / 2, w: s, h: s, label: "▶", dir: "right" },
    go:    { x: cx + s * 1.85, y: cy - s * 0.55, w: 96, h: s * 1.1, label: "GO!" }
  };
}

let devTapCount = 0;
let devLastTapTime = 0;
let devBannerTimer = 0;

function activateCreatorDebugMode() {
  ["1-1", "1-2", "1-3", "1-4", "2-0", "2-SHOP", "2-1"].forEach(id => {
    if (mapNodesData[id]) {
      mapNodesData[id].unlocked = true;
      if (id !== "2-1" && id !== "2-SHOP") mapNodesData[id].cleared = true;
    }
  });

  currentWorld = 2;
  selectedMapNode = "2-1";
  let w2Nodes = getWorldMapNodes();
  let n21 = w2Nodes.find(n => n.id === "2-1");
  if (n21) {
    mapAvatarX = n21.x;
    mapAvatarY = n21.y;
  }

  powerLevel = 3;
  powerType = "speed";
  reservedItem = "speed";
  lives = max(lives, 10);

  devBannerTimer = millis() + 2000;
  playSFX("1up");
}

function keyPressed() { 
  initAudioEngine();

  if (gameState === "ITEM_GUIDE") {
    if (millis() - guideOpenTime > 200) {
      activeGuideData = null;
      gameState = "PLAYING";
      playSFX("mapMove");
    }
    return;
  }

  if (key === 'o' || key === 'O') {
    if (gameState === "WORLD_MAP" || gameState === "PLAYING") {
      showSettingsModal = !showSettingsModal;
      playSFX("mapMove");
    }
    return;
  }

  if (showSettingsModal) {
    if (keyCode === ESCAPE) showSettingsModal = false;
    return;
  }

  if (showExitMapConfirmModal) {
    if (keyCode === ENTER) {
      showExitMapConfirmModal = false;
      exitToWorldMapRestoreEntry();
    } else if (keyCode === ESCAPE || key === 'm' || key === 'M') {
      showExitMapConfirmModal = false;
      playSFX("mapMove");
    }
    return;
  }

  if (gameState === "DEVICE_SELECT") {
    if (key === '1') {
      controlMode = "PC";
      playSFX("powerup");
      gameState = "WORLD_MAP";
    } else if (key === '2') {
      controlMode = "MOBILE";
      autoFitMobileZoom = true;
      playSFX("powerup");
      gameState = "WORLD_MAP";
    }
    return;
  }

  if (key === 'u' || key === 'U') {
    audioMuted = !audioMuted;
    return;
  }

  if (gameState === "WORLD_MAP") {
    if (worldTransition.active) return;
    if (showShopModal) {
      if (keyCode === ESCAPE) {
        mapNodesData["2-SHOP"].isOpen = false;
        showShopModal = false;
      }
      return;
    }
    if (keyCode === 80 || key === 'p' || key === 'P') {
      activateCreatorDebugMode();
      return;
    }
    if (key === 'i' || key === 'I') {
      showMapItemDrawer = !showMapItemDrawer;
      playSFX("mapMove");
      return;
    }
    if (showMapItemDrawer) {
      if (keyCode === ESCAPE || keyCode === 32 || keyCode === ENTER) {
        showMapItemDrawer = false;
      }
      return;
    }

    let curNode = mapNodesData[selectedMapNode];
    let moveDir = null;
    if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') moveDir = "right";
    else if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') moveDir = "left";
    else if (keyCode === UP_ARROW || key === 'w' || key === 'W') moveDir = "up";
    else if (keyCode === DOWN_ARROW || key === 's' || key === 'S') moveDir = "down";

    if (moveDir && curNode && curNode.neighbors) {
      let targetId = curNode.neighbors[moveDir];
      if (targetId === "TO_W1") {
        // 從 2-0 往左走回 World 1：觸發黑色聚光燈轉場
        worldTransition = {
          active: true,
          phase: "WALK_EDGE",
          dir: -1,
          timer: millis(),
          flagProgress: 1,
          roadProgress: 1,
          spotlightR: max(width, height) * 0.75
        };
        playSFX("mapMove");
      } else if (targetId === "TO_W2" && curNode.cleared) {
        // 從 1-4 往右走進 World 2：觸發黑色聚光燈轉場
        worldTransition = {
          active: true,
          phase: "WALK_EDGE",
          dir: 1,
          timer: millis(),
          flagProgress: 1,
          roadProgress: 1,
          spotlightR: max(width, height) * 0.75
        };
        playSFX("mapMove");
      } else if (targetId && mapNodesData[targetId] && mapNodesData[targetId].unlocked) {
        selectedMapNode = targetId;
        playSFX("mapMove");
      } else if (targetId) {
        playSFX("stomp");
      }
      return;
    }

    if (keyCode === ENTER || keyCode === 32) {
      enterSelectedMapNode();
    }
    return;
  }

  if (gameState === "GAME_OVER") {
    if (key === 'r' || key === 'R') {
      startLevel(currentLevel, true, false);
    } else if (key === 'm' || key === 'M') {
      exitToWorldMapRestoreEntry();
    }
    return;
  }

  if (key === 'm' || key === 'M') {
    if (gameState === "PLAYING") {
      showExitMapConfirmModal = true;
      playSFX("mapMove");
    } else if (gameState === "ALL_CLEAR") {
      exitToWorldMapRestoreEntry();
    }
    return;
  }

  if ((key === 'c' || key === 'C') && unlockedNewChar) {
    activeCharacterId = (activeCharacterId === 0) ? 1 : 0;
    playSFX("powerup");
    floatingTexts.push({
      text: activeCharacterId === 1 ? "切換角色：沙漠遊俠！" : "切換角色：原本主角！",
      x: characterX - 55,
      y: characterY - 50,
      vy: -1.4,
      life: 75,
      isOneUp: true
    });
    return;
  }

  if (key === 'r' || key === 'R') {
    startLevel(currentLevel, false, false);
    return;
  }

  if (gameState !== "PLAYING") return;

  // <--- 新增以下 11 行：點按一下 Ctrl 或 Shift 切換衝刺 / 時光領域
  if (keyCode === CONTROL || keyCode === SHIFT) {
    if (powerLevel === 3 && (powerType === "speed" || powerType === "chrono")) {
      dashToggleActive = !dashToggleActive;
      mobileDashLocked = dashToggleActive;
      if (dashToggleActive && powerType === "chrono") {
        triggerChronoShockwave();
      }
      playSFX("mapMove");
    }
    return false;
  }

  if (key === 'b' || key === 'B') {
    triggerDropReservedItem();
    return;
  }

  if (keyCode === 32 || keyCode === 87) { 
  triggerJumpAction();
  return false; 
}

  if (key === 'f' || key === 'F') { 
    triggerFireAction();
  }
  // <--- 新增：2-4 黑暗礦坑按 [E] 或 [T] 在腳下插一根火把
  if ((key === 'e' || key === 'E' || key === 't' || key === 'T') && currentWorld === 2 && currentLevel === 4) {
    placeTorchAtPlayer();
  }
  if ((key === 'c' || key === 'C') && unlockedNewChar) {
    activeCharacterId = (activeCharacterId === 0) ? 1 : 0;
    playSFX("powerup");
    floatingTexts.push({
      text: activeCharacterId === 1 ? "切換角色：沙漠遊俠！" : "切換角色：原本主角！",
      x: characterX - 55,
      y: characterY - 50,
      vy: -1.4,
      life: 75,
      isOneUp: true
    });
  }
} 

function keyReleased() {
  if ((keyCode === 32 || keyCode === 87) && gameState === "PLAYING") {
    if (velocityY < 0 && powerType !== "feather") {
      velocityY = 0;      
      isShortJump = true; 
    }
  }
}

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
}
// =====================================================================
// 2-4 黑暗礦坑火把/頭燈系統
// =====================================================================
function updateMinerLampAndTorches() {
  if (minerLampPickup && !minerLampPickup.taken) {
    if (dist(characterX, characterY, minerLampPickup.x, minerLampPickup.y) < 42) {
      minerLampPickup.taken = true;
      hasMinerHeadlamp = true;
      torchCount += 3;
      playSFX("powerup");
      floatingTexts.push({
        text: "戴上礦工頭燈！獲得 3 根火把（按 E/T 插火把）",
        x: characterX - 90,
        y: characterY - 55,
        vy: -1.1,
        life: 120,
        isOneUp: true
      });
    }
  }
}

function placeTorchAtPlayer() {
  if (torchCount <= 0) {
    playSFX("stomp");
    floatingTexts.push({ text: "沒有火把了！", x: characterX - 30, y: characterY - 40, vy: -1.2, life: 45 });
    return;
  }
  torchCount--;
  placedTorches.push({ x: characterX, y: characterY + 8 });
  playSFX("fireball");
  floatingTexts.push({ text: `放置火把 (剩餘 ${torchCount})`, x: characterX - 45, y: characterY - 40, vy: -1.2, life: 55 });
}

// 2-4 黑暗礦坑：繪製頭燈架、火把、過關白煙與黑暗挖空視野
function drawMinerLampAndTorches(viewWorldW, viewWorldH) {
  // 1. 繪製地上的頭燈裝備架
  if (minerLampPickup && !minerLampPickup.taken) {
    push();
    translate(minerLampPickup.x, minerLampPickup.y);
    noStroke();
    fill("#8D5524");
    rect(-4, -10, 8, 28, 2);
    fill("#FFD166");
    arc(0, -12, 26, 20, PI, TWO_PI);
    fill("#FFF3B0");
    ellipse(6, -15, 10, 10);
    pop();
  }

  // 2. 繪製場上已插好的火把
  for (let t of placedTorches) {
    push();
    translate(t.x, t.y);
    noStroke();
    fill("#6F4E37");
    rect(-3, -6, 6, 22, 2);
    let flicker = sin(frameCount * 0.35 + t.x) * 3;
    fill("#FF5400");
    ellipse(0, -12, 14 + flicker * 0.4, 20 + flicker);
    fill("#FFD166");
    ellipse(0, -10, 7, 11);
    pop();
  }

  // 3. 繪製過關時裝備化為白煙消散特效
  for (let i = endClearBonusSmoke.length - 1; i >= 0; i--) {
    let sm = endClearBonusSmoke[i];
    sm.x += sm.vx;
    sm.y += sm.vy;
    sm.alpha -= 4;
    noStroke();
    fill(255, 255, 255, max(0, sm.alpha));
    ellipse(sm.x, sm.y, sm.r, sm.r);
    if (sm.alpha <= 0) endClearBonusSmoke.splice(i, 1);
  }

  // 4. 使用獨立離屏遮罩層挖洞（僅在黑暗主礦坑顯示，全亮補給室完全不畫黑幕與假光束）
  if (window.isInMinerSupplyRoom) return;

  if (!window.darkMaskBuffer || window.darkMaskBuffer.width !== width || window.darkMaskBuffer.height !== height) {
    window.darkMaskBuffer = createGraphics(width, height);
  }
  let db = window.darkMaskBuffer;
  let dctx = db.drawingContext;
  let z = getEffectiveViewZoom();
  let mapOffsetY = (height / z) - (levelMap.length * TILE_SIZE);

  // 頭燈光源位置對準角色額頭
  let isBigNow = (powerLevel >= 2);
  let lampX = characterX + facingDirection * (isBigNow ? 10 : 8);
  let lampY = characterY - (isBigNow ? 26 : 16);

  dctx.save();
  dctx.globalCompositeOperation = "source-over";
  dctx.clearRect(0, 0, width, height);

  // 深邃礦坑黑幕
  dctx.fillStyle = "rgba(4, 4, 10, 0.95)";
  dctx.fillRect(0, 0, width, height);

  dctx.globalCompositeOperation = "destination-out";
  dctx.scale(z, z);
  dctx.translate(-cameraX, mapOffsetY);

  // (A) 主角周圍柔和微光圈（帶頭燈時保留自然環境微光，不戴時稍大一點）
  let baseR = hasMinerHeadlamp ? 145 : 165;
  let gradP = dctx.createRadialGradient(characterX, characterY - 6, 18, characterX, characterY - 6, baseR);
  gradP.addColorStop(0, "rgba(0,0,0,1)");
  gradP.addColorStop(0.45, "rgba(0,0,0,0.82)");
  gradP.addColorStop(0.78, "rgba(0,0,0,0.32)");
  gradP.addColorStop(1, "rgba(0,0,0,0)");
  dctx.fillStyle = gradP;
  dctx.beginPath();
  dctx.arc(characterX, characterY - 6, baseR, 0, Math.PI * 2);
  dctx.fill();

  // (B) 戴上礦工頭燈：用「多段重疊柔焦光斑 + 模糊濾鏡」取代生硬三角形，徹底消除硬切線！
  if (hasMinerHeadlamp) {
    dctx.save();
    dctx.filter = "blur(18px)";
    let dir = facingDirection;
    let spots = [
      { dist: 55,  r: 58,  a: 0.95 },
      { dist: 125, r: 92,  a: 0.92 },
      { dist: 215, r: 130, a: 0.85 },
      { dist: 315, r: 165, a: 0.68 },
      { dist: 400, r: 190, a: 0.38 }
    ];
    for (let sp of spots) {
      let sx = lampX + dir * sp.dist;
      let sy = lampY + 6;
      let g = dctx.createRadialGradient(sx, sy, sp.r * 0.15, sx, sy, sp.r);
      g.addColorStop(0, `rgba(0,0,0,${sp.a})`);
      g.addColorStop(0.6, `rgba(0,0,0,${sp.a * 0.55})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      dctx.fillStyle = g;
      dctx.beginPath();
      dctx.arc(sx, sy, sp.r, 0, Math.PI * 2);
      dctx.fill();
    }
    dctx.restore();
  }

  // (C) 場上每根火把的柔和光圈
  for (let t of placedTorches) {
    let flicker = sin(frameCount * 0.22 + t.x) * 8;
    let tr = 215 + flicker;
    let gradT = dctx.createRadialGradient(t.x, t.y - 10, 20, t.x, t.y - 10, tr);
    gradT.addColorStop(0, "rgba(0,0,0,1)");
    gradT.addColorStop(0.5, "rgba(0,0,0,0.8)");
    gradT.addColorStop(0.82, "rgba(0,0,0,0.28)");
    gradT.addColorStop(1, "rgba(0,0,0,0)");
    dctx.fillStyle = gradT;
    dctx.beginPath();
    dctx.arc(t.x, t.y - 10, tr, 0, Math.PI * 2);
    dctx.fill();
  }
  dctx.restore();

  // 貼回黑暗遮罩層
  push();
  resetMatrix();
  imageMode(CORNER);
  image(db, 0, 0);

  // 5. 疊加自然暖黃色柔和光暈（同樣使用柔焦光斑，沒有任何生硬幾何邊界）
  let ctx = drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.scale(z, z);
  ctx.translate(-cameraX, mapOffsetY);

  // 主角周圍暖黃環境微光
  let pGlow = ctx.createRadialGradient(characterX, characterY - 6, 12, characterX, characterY - 6, hasMinerHeadlamp ? 140 : 160);
  pGlow.addColorStop(0, "rgba(255, 215, 115, 0.22)");
  pGlow.addColorStop(0.6, "rgba(255, 180, 65, 0.08)");
  pGlow.addColorStop(1, "rgba(255, 160, 40, 0)");
  ctx.fillStyle = pGlow;
  ctx.beginPath();
  ctx.arc(characterX, characterY - 6, hasMinerHeadlamp ? 140 : 160, 0, Math.PI * 2);
  ctx.fill();

  // 頭燈暖金柔焦光束
  if (hasMinerHeadlamp) {
    let dir = facingDirection;
    let glowSpots = [
      { dist: 35,  r: 52,  a: 0.34 },
      { dist: 110, r: 88,  a: 0.26 },
      { dist: 205, r: 128, a: 0.18 },
      { dist: 310, r: 162, a: 0.10 }
    ];
    for (let sp of glowSpots) {
      let sx = lampX + dir * sp.dist;
      let sy = lampY + 6;
      let bGlow = ctx.createRadialGradient(sx, sy, 8, sx, sy, sp.r);
      bGlow.addColorStop(0, `rgba(255, 228, 135, ${sp.a})`);
      bGlow.addColorStop(0.55, `rgba(255, 190, 75, ${sp.a * 0.45})`);
      bGlow.addColorStop(1, "rgba(255, 150, 30, 0)");
      ctx.fillStyle = bGlow;
      ctx.beginPath();
      ctx.arc(sx, sy, sp.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 每根火把的橘黃燭光暈染
  for (let t of placedTorches) {
    let tr = 215 + sin(frameCount * 0.22 + t.x) * 8;
    let tGlow = ctx.createRadialGradient(t.x, t.y - 10, 14, t.x, t.y - 10, tr);
    tGlow.addColorStop(0, "rgba(255, 200, 80, 0.38)");
    tGlow.addColorStop(0.55, "rgba(255, 150, 40, 0.14)");
    tGlow.addColorStop(1, "rgba(255, 120, 20, 0)");
    ctx.fillStyle = tGlow;
    ctx.beginPath();
    ctx.arc(t.x, t.y - 10, tr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  pop();
}
// =====================================================================
// 2-5 沙暴巨蟲 BOSS 系統（5大招式＋巨型體節＋踩後震波反制＋完整過關修復）
// =====================================================================
let wormShockwaves = []; // 招式4落地沙浪衝擊波

function updateSandwormBoss(playerW, playerH) {
  if (!sandwormBoss) return;
  let b = sandwormBoss;
  if (!b.sandDust) b.sandDust = [];

  // 1. 玩家走進 48 格大競技場後自動關門開戰
  if (!b.active && !b.doorOpened && characterX > b.arenaLeft + 90) {
    b.active = true;
    b.doorLocked = true;
    wormShockwaves = [];
    playSFX("brick");
    floatingTexts.push({ text: "⚠ 沙暴巨蟲覺醒！抓準喘息時機攻擊尾部弱點！", x: characterX - 110, y: characterY - 80, vy: -1, life: 130 });
  }

  // 開戰期間把玩家限制在競技場左右石門之間，避免穿牆
  if (b.doorLocked && gameState === "PLAYING") {
    characterX = constrain(characterX, b.arenaLeft + 24, b.arenaRight - 24);
  }

  // 更新掉落巨石（招式1）
  for (let i = wormRocks.length - 1; i >= 0; i--) {
    let rk = wormRocks[i];
    if (rk.warnTimer > 0) {
      rk.warnTimer--;
      continue;
    }
    rk.vy += 0.48;
    rk.y += rk.vy;
    if (gameState === "PLAYING" && invincibleTimer <= 0 && starTimer <= 0 &&
        abs(characterX - rk.x) < (playerW / 2 + rk.r * 0.75) &&
        abs(characterY - rk.y) < (playerH / 2 + rk.r * 0.75)) {
      wormRocks.splice(i, 1);
      takeDamage();
      return;
    }
    if (rk.y > 13.5 * TILE_SIZE) {
      wormRocks.splice(i, 1);
    }
  }

  // 更新落地沙浪衝擊波（招式4）
  for (let i = wormShockwaves.length - 1; i >= 0; i--) {
    let sw = wormShockwaves[i];
    sw.x += sw.vx;
    sw.life--;
    if (gameState === "PLAYING" && invincibleTimer <= 0 && starTimer <= 0 &&
        abs(characterX - sw.x) < (playerW / 2 + 16) &&
        abs(characterY - sw.y) < (playerH / 2 + 24)) {
      wormShockwaves.splice(i, 1);
      takeDamage();
      return;
    }
    if (sw.life <= 0 || sw.x < b.arenaLeft || sw.x > b.arenaRight) {
      wormShockwaves.splice(i, 1);
    }
  }

  if (b.hurtFlash > 0) b.hurtFlash--;
  if (!b.active || b.state === "DEFEATED") {
    // 擊敗後走到神殿右側大門：觸發拯救新角色或直接過關
    if (b.doorOpened && gameState === "PLAYING" && characterX > b.arenaRight - 80) {
      if (!unlockedNewChar && !rescueCutscene) {
        rescueCutscene = {
          timer: 0,
          cageX: b.arenaRight - 36,
          cageY: 13 * TILE_SIZE
        };
      } else if (unlockedNewChar && !rescueCutscene) {
        gameState = "WALK_TO_CASTLE";
        castleTargetX = b.arenaRight + 20;
      }
    }
    return;
  }

  b.timer--;
  let floorY = 12 * TILE_SIZE + 4;
  let undergroundY = 15.5 * TILE_SIZE; // 藏在地底下的高度

  // === 5 種攻擊模組狀態機 ===
  if (b.state === "IDLE") {
    // 平時巨蟲保持「高昂警戒姿態」，尾部弱點半埋進沙地裡，不會輕易露出來給人白踩！
    b.headX += sin(frameCount * 0.06) * 2.2;
    b.headY = lerp(b.headY, 8.5 * TILE_SIZE, 0.08);
    if (b.timer <= 0) {
      let pool = ["ROCKFALL", "TRAIN_CHARGE", "BURROW_AMBUSH", "ARC_LEAP", "HYPER_BEAM"].filter(a => a !== b.lastAttack);
      b.nextAttack = random(pool);
      b.lastAttack = b.nextAttack;
      b.state = "TELEGRAPH";
      b.timer = 50;
      playSFX("stomp");
    }
  } else if (b.state === "TELEGRAPH") {
    // 前搖蓄力震動
    b.headX += sin(frameCount * 0.9) * 4;
    if (b.timer <= 0) {
      b.state = b.nextAttack;
      if (b.state === "ROCKFALL") {
        // 【招式 1：天崩巨石雨】
        b.timer = 120;
        for (let k = 0; k < 8; k++) {
          wormRocks.push({
            x: random(b.arenaLeft + 80, b.arenaRight - 80),
            y: 45, vy: 0, r: 22, warnTimer: 35 + k * 9
          });
        }
      } else if (b.state === "TRAIN_CHARGE") {
        // 【招式 2：裝甲列車雙趟狂衝】
        b.dir = (characterX < b.headX) ? -1 : 1;
        b.headX = (b.dir === -1) ? (b.arenaRight - 50) : (b.arenaLeft + 50);
        b.headY = floorY;
        b.vx = b.dir * 11.5;
        b.chargeBounces = 1;
        b.timer = 140;
      } else if (b.state === "BURROW_AMBUSH") {
        // 【招式 3：地底鑽潛追蹤破土】
        b.subPhase = "DIVE";
        b.timer = 95;
        b.ambushX = characterX;
      } else if (b.state === "ARC_LEAP") {
        // 【招式 4：巨蟲天際飛撲＋落地沙浪】
        b.dir = (characterX < b.headX) ? -1 : 1;
        b.arcStartX = b.headX;
        b.arcEndX = constrain(characterX + b.dir * 80, b.arenaLeft + 100, b.arenaRight - 100);
        b.arcProgress = 0;
        b.timer = 85;
      } else if (b.nextAttack === "HYPER_BEAM") {
        // 【招式 5：中左 / 中右全場擴展光束（持續 3 秒 = 180 幀，需蹲下躲避）】
        let arenaMidX = (b.arenaLeft + b.arenaRight) / 2;
        let onRightSide = (characterX < arenaMidX);
        b.dir = onRightSide ? -1 : 1; // 在中右就往左射，在中左就往右射
        b.headX = onRightSide ? (arenaMidX + 260) : (arenaMidX - 260);
        b.headY = 8.5 * TILE_SIZE;
        b.beamMaxTimer = 180; // 3 秒（60fps * 3）
        b.timer = 180;
      }
    }
  } else if (b.state === "ROCKFALL") {
    b.headY = lerp(b.headY, 9 * TILE_SIZE, 0.08);
    if (b.timer <= 0) {
      b.state = "WEAK_EXPOSE";
      b.timer = 95;
    }
  } else if (b.state === "TRAIN_CHARGE") {
    b.headX += b.vx;
    if ((b.vx > 0 && b.headX >= b.arenaRight - 50) || (b.vx < 0 && b.headX <= b.arenaLeft + 50)) {
      if (b.chargeBounces > 0) {
        b.chargeBounces--;
        b.vx *= -1;
        b.dir *= -1;
        playSFX("brick");
      } else {
        b.state = "WEAK_EXPOSE";
        b.timer = 95;
      }
    }
    if (b.timer <= 0) {
      b.state = "WEAK_EXPOSE";
      b.timer = 95;
    }
  } else if (b.state === "BURROW_AMBUSH") {
    if (b.subPhase === "DIVE") {
      b.headY = lerp(b.headY, undergroundY, 0.16);
      // 地面沙塵追蹤玩家位置
      b.ambushX = lerp(b.ambushX, characterX, 0.09);
      b.ambushX = constrain(b.ambushX, b.arenaLeft + 80, b.arenaRight - 80);
      if (b.timer <= 42) {
        b.subPhase = "ERUPT";
        b.headX = b.ambushX;
        b.vy = -21;
        playSFX("brick");
      }
    } else {
      b.vy += 0.65;
      b.headY += b.vy;
      if (b.vy > 0 && b.headY >= floorY) {
        b.headY = floorY;
        b.vy = 0;
        b.state = "WEAK_EXPOSE";
        b.timer = 95;
      }
    }
  } else if (b.state === "ARC_LEAP") {
    b.arcProgress = min(1, b.arcProgress + 0.017);
    b.headX = lerp(b.arcStartX, b.arcEndX, b.arcProgress);
    b.headY = floorY - sin(b.arcProgress * PI) * 320;
    if (b.arcProgress >= 1) {
      b.headY = floorY;
      playSFX("brick");
      // 落地向左右兩側噴出沙浪衝擊波！
      wormShockwaves.push({ x: b.headX - 30, y: 12.6 * TILE_SIZE, vx: -7.5, life: 95 });
      wormShockwaves.push({ x: b.headX + 30, y: 12.6 * TILE_SIZE, vx: 7.5, life: 95 });
      b.state = "WEAK_EXPOSE";
      b.timer = 95;
    }
  } else if (b.state === "HYPER_BEAM") {
      // 固定在中左/中右穩定蓄力與擴展，不再亂角度插自己腳
      b.headY = lerp(b.headY, 8.5 * TILE_SIZE, 0.15);
      let elapsed = (b.beamMaxTimer || 180) - b.timer; // 0 -> 180
      // 前 30 幀：小小一條預警光線；30 幀後：一路擴大成覆蓋全場的光（持續到 180 幀結束）
      let expandProg = constrain((elapsed - 30) / 75, 0, 1);
      let beamHalfH = lerp(6, 260, expandProg);

      if (expandProg > 0.08 && gameState === "PLAYING" && invincibleTimer <= 0 && starTimer <= 0) {
        let inBeamX = (b.dir === 1)
          ? (characterX >= b.headX - 10 && characterX <= b.arenaRight + 40)
          : (characterX <= b.headX + 10 && characterX >= b.arenaLeft - 40);
        let inBeamY = abs(characterY - b.headY) < beamHalfH;
        // 只有蹲下（isCrouching）才能躲過全場擴展光束
        if (inBeamX && inBeamY && !isCrouching) {
          takeDamage();
          return;
        }
      }
      if (b.timer <= 0) {
        b.state = "WEAK_EXPOSE";
        b.timer = 95;
      }
  } else if (b.state === "WEAK_EXPOSE") {
    // 只有大招結束後的 1.5 秒喘息期，巨蟲才會趴低把發光尾核露在地面高度給玩家踩！
    b.headY = lerp(b.headY, floorY, 0.14);
    if (b.timer <= 0) {
      b.state = "IDLE";
      b.timer = 45;
    }
  } else if (b.state === "COUNTER_SHOCK") {
    // 【被踩中後的震波反制狀態】：原地猛烈甩尾把玩家震走，隨後立刻恢復警戒
    b.headX += sin(frameCount * 1.1) * 7;
    b.headY = lerp(b.headY, 8 * TILE_SIZE, 0.15);
    if (b.timer <= 0) {
      b.state = "IDLE";
      b.timer = 20;
    }
  }

  // === 更新 16 節巨型身體（非喘息期時，後半段自動蜷縮抬高或沉沙保護弱點） ===
  if (b.segments.length < 16) {
    while (b.segments.length < 16) {
      b.segments.push({ x: b.headX, y: b.headY });
    }
  }
  b.segments[0].x = b.headX;
  b.segments[0].y = b.headY;

  let isTailVulnerable = (b.state === "WEAK_EXPOSE");
    let waveAmp = (b.state === "TRAIN_CHARGE") ? 14 : ((b.state === "COUNTER_SHOCK") ? 18 : 9);
    let waveSpeed = (b.state === "TRAIN_CHARGE") ? 0.28 : 0.16;

    for (let i = 1; i < b.segments.length; i++) {
      let prev = b.segments[i - 1];
      let cur = b.segments[i];
      let dx = prev.x - cur.x;
      let dy = prev.y - cur.y;
      let d = max(0.001, sqrt(dx * dx + dy * dy));
      let nx = dx / d;
      let ny = dy / d;
      // 垂直於連線方向的法向量，用來做蛇形軟Q扭動
      let perpX = -ny;
      let perpY = nx;
      let flexRatio = map(i, 1, b.segments.length - 1, 0.55, 1.35);
      let wave = sin(frameCount * waveSpeed - i * 0.55) * waveAmp * flexRatio;

      let spacing = 31;
      let targetX = prev.x - nx * spacing + perpX * wave;
      let targetY = prev.y - ny * spacing + perpY * wave;

      // 非喘息期時，尾巴往上翹起（用柔和的目標高度，不把後面幾節卡死）
      if (!isTailVulnerable && b.state !== "BURROW_AMBUSH" && i >= 10) {
        let lift = (i - 9) * 10;
        targetY -= lift;
      }

      // 軟Q彈性追隨（越往後越有甩鞭感）
      let spring = map(i, 1, b.segments.length - 1, 0.42, 0.28);
      cur.x = lerp(cur.x, targetX, spring);
      cur.y = lerp(cur.y, targetY, spring);
    }

  // 鑽潛階段時整條蟲身沉入沙底
  if (b.state === "BURROW_AMBUSH" && b.subPhase === "DIVE") {
    for (let seg of b.segments) {
      seg.y = lerp(seg.y, undergroundY, 0.2);
    }
  }

  let tail = b.segments[b.segments.length - 1];

  // 統一傷害與「受擊震波彈開反制」邏輯
  const damageSandworm = (dmg, hitX, hitY, triggerRepel = false) => {
    b.hp -= dmg;
    b.hurtFlash = 10;
    score += 300 * dmg;
    playSFX("kick");
    floatingTexts.push({ text: `-${dmg * 10} 弱點重擊！`, x: hitX - 35, y: hitY - 30, vy: -1.5, life: 55 });

    if (b.hp <= 0) {
      b.hp = 0;
      b.state = "DEFEATED";
      b.active = false;
      b.doorLocked = false;
      b.doorOpened = true;
      wormRocks = [];
      wormShockwaves = [];
      score += 25000;
      playSFX("clear");
      floatingTexts.push({ text: "沙暴巨蟲擊破！神殿大門已開啟！", x: characterX - 95, y: characterY - 70, vy: -1.2, life: 140, isOneUp: true });
      return;
    }

    // 只要被玩家近身踩踏或衝刺撞中，巨蟲立刻釋放高壓沙暴震波把玩家強行彈飛，絕不給連踩！
    if (triggerRepel) {
      let pushDir = (characterX < hitX) ? -1 : 1;
      knockbackVX = pushDir * 15.5;
      velocityY = -13.5;
      invincibleTimer = max(invincibleTimer, 600);
      b.state = "COUNTER_SHOCK";
      b.timer = 32;
      b.shockRingR = 20;
      playSFX("brick");
      floatingTexts.push({ text: "💥 沙暴震波反制！", x: hitX - 45, y: hitY - 55, vy: -1.6, life: 55 });
    }
  };

  // 火球命中尾部弱點（僅在弱點未沉入地底時有效）
  for (let i = playerFireballs.length - 1; i >= 0; i--) {
    let fb = playerFireballs[i];
    if (tail.y < 13.5 * TILE_SIZE && dist(fb.x, fb.y, tail.x, tail.y) < 42) {
      playerFireballs.splice(i, 1);
      damageSandworm(10, tail.x, tail.y, false);
      if (b.state === "DEFEATED") return;
    }
  }

  // 仙人掌飛針命中尾部弱點
  for (let i = cactusNeedles.length - 1; i >= 0; i--) {
    let nd = cactusNeedles[i];
    if (tail.y < 13.5 * TILE_SIZE && dist(nd.x, nd.y, tail.x, tail.y) < 42) {
      nd.life = 0;
      damageSandworm(8, tail.x, tail.y, false);
      if (b.state === "DEFEATED") return;
    }
  }

  // 玩家本體與巨蟲碰撞判定
  if (gameState === "PLAYING" && tail.y < 13.5 * TILE_SIZE) {
    // 1. 判定是否命中「發光尾部弱點」
    if (dist(characterX, characterY, tail.x, tail.y) < (playerW / 2 + 30)) {
      if (velocityY > 0 || starTimer > 0 || (powerType === "speed" && currentSprintBonus >= 0.85)) {
        damageSandworm(15, tail.x, tail.y, true); // 觸發震波彈開！
        return;
      }
    }

    // 2. 判定前面 15 節巨型帶刺裝甲身體（半徑加大至 34px）
    for (let i = 0; i < b.segments.length - 1; i++) {
      let seg = b.segments[i];
      if (seg.y > 13.5 * TILE_SIZE) continue;
      if (dist(characterX, characterY, seg.x, seg.y) < (playerW / 2 + 30)) {
        if (starTimer > 0) {
          damageSandworm(5, seg.x, seg.y, true);
          return;
        } else if (powerType === "speed" && currentSprintBonus >= 0.85) {
          let pushDir = (characterX < seg.x) ? -1 : 1;
          knockbackVX = pushDir * 10.5;
          velocityY = -7;
          currentSprintBonus = 0;
          playerStunTimer = 3000;
          playSFX("stomp");
          floatingTexts.push({ text: "撞到巨型刺甲！自暈 3 秒！", x: characterX - 65, y: characterY - 50, vy: -1.2, life: 70 });
          return;
        } else if (invincibleTimer <= 0) {
          takeDamage();
          return;
        }
      }
    }
  }
}

function drawSandwormBoss() {
  if (!sandwormBoss) return;
  let b = sandwormBoss;

  // 1. 繪製競技場左右厚重封印石門
  if (b.doorLocked) {
    fill("#5C4033");
    stroke("#2B190E");
    strokeWeight(4);
    rect(b.arenaLeft - 18, 1 * TILE_SIZE, 28, 12 * TILE_SIZE);
    rect(b.arenaRight - 10, 1 * TILE_SIZE, 28, 12 * TILE_SIZE);
  }

  // 2. 招式 1：掉落巨石與紅線預警
  for (let rk of wormRocks) {
    if (rk.warnTimer > 0) {
      stroke(255, 59, 48, 180);
      strokeWeight(2.5);
      line(rk.x, 40, rk.x, 13 * TILE_SIZE);
      noStroke();
      fill("#FF3B30");
      triangle(rk.x - 10, 54, rk.x + 10, 54, rk.x, 70);
    } else {
      fill("#7F5539");
      stroke("#3D1E16");
      strokeWeight(2.5);
      ellipse(rk.x, rk.y, rk.r * 2.1, rk.r * 1.9);
    }
  }

  // 3. 招式 3：地底鑽潛沙塵追蹤預警
  if (b.active && b.state === "BURROW_AMBUSH" && b.subPhase === "DIVE") {
    noStroke();
    fill("#E9C46A");
    let rumble = sin(frameCount * 0.8) * 6;
    ellipse(b.ambushX + rumble, 13 * TILE_SIZE, 95, 26);
    fill("#FF5400");
    triangle(b.ambushX - 14, 12.2 * TILE_SIZE, b.ambushX + 14, 12.2 * TILE_SIZE, b.ambushX, 11.4 * TILE_SIZE);
  }

  // 4. 招式 4：落地沙浪衝擊波
  for (let sw of wormShockwaves) {
    noStroke();
    fill("#F4A261");
    arc(sw.x, sw.y + 16, 44, 52, PI, TWO_PI);
    fill("#FFF3B0");
    arc(sw.x, sw.y + 16, 26, 32, PI, TWO_PI);
  }

  if (b.state === "DEFEATED") return;

  // 5. 從尾部往頭部繪製 16 節巨型沙暴巨蟲（體型大幅放大！）
  for (let i = b.segments.length - 1; i >= 0; i--) {
    let seg = b.segments[i];
    if (seg.y > 14 * TILE_SIZE) continue;
    let isTail = (i === b.segments.length - 1);
    let isHead = (i === 0);

    push();
    translate(seg.x, seg.y);
    if (isTail) {
      // 巨型發光尾部弱點（喘息期亮起強光）
      let pulse = (b.state === "WEAK_EXPOSE") ? (84 + sin(frameCount * 0.35) * 12) : 64;
      noStroke();
      fill(255, 90, 0, b.state === "WEAK_EXPOSE" ? 130 : 60);
      ellipse(0, 0, pulse, pulse);
      fill(b.hurtFlash > 0 ? "#FFFFFF" : "#FF5400");
      stroke("#FFD166");
      strokeWeight(4);
      ellipse(0, 0, 50, 50);
    } else if (!isHead) {
      // 中間 14 節巨蟲體節（i = 1 ~ 14）
      let segR = map(i, 1, 14, 62, 46);
      let prevSeg = b.segments[i - 1];
      let ang = atan2(prevSeg.y - seg.y, prevSeg.x - seg.x);
      rotate(ang);

      noStroke();
      fill(b.hurtFlash > 0 ? "#FFFFFF" : "#582F0E");
      triangle(-8, -segR * 0.42, 8, -segR * 0.42, 0, -segR * 0.88);

      fill(b.hurtFlash > 0 ? "#FFFFFF" : (i % 2 === 0 ? "#8D5524" : "#7F4F24"));
      stroke("#3D1E16");
      strokeWeight(3.5);
      ellipse(0, 0, segR * 1.18, segR * 0.94);

      noStroke();
      fill("#DDB892");
      arc(0, segR * 0.12, segR * 0.72, segR * 0.44, 0, PI);
    } else if (isHead) {
      // 無眼盲眼巨蟲：厚重角質頭殼＋四向環狀獠牙深淵口器
      fill(b.hurtFlash > 0 ? "#FFFFFF" : "#6F4518");
      stroke("#3D1E16");
      strokeWeight(4);
      ellipse(0, 0, 88, 78);

      // 額頭與側邊幾丁質骨板
      noStroke();
      fill(b.hurtFlash > 0 ? "#FFFFFF" : "#8D5524");
      arc(-b.dir * 6, 0, 74, 68, HALF_PI, PI + HALF_PI);

      // 前端張開的深淵口器（無眼盲蟲核心特徵）
      fill("#1A0505");
      stroke("#3D1E16");
      strokeWeight(3);
      ellipse(b.dir * 24, 0, 34, 52);

      // 上下與內圈環狀鋸齒獠牙
      noStroke();
      fill("#FFF8E7");
      triangle(b.dir * 18, -28, b.dir * 52, -16, b.dir * 26, -10);
      triangle(b.dir * 18, 28,  b.dir * 52, 16,  b.dir * 26, 10);
      triangle(b.dir * 24, -10, b.dir * 46, 0,   b.dir * 24, 10);
    }
    pop();
  }

  // 被踩中後的沙暴震波擴散光環特效
  if (b.state === "COUNTER_SHOCK") {
    let tail = b.segments[b.segments.length - 1];
    b.shockRingR = (b.shockRingR || 20) + 18;
    push();
    translate(tail.x, tail.y);
    noFill();
    stroke(255, 209, 102, 220);
    strokeWeight(6);
    ellipse(0, 0, b.shockRingR, b.shockRingR);
    pop();
  }

  // 招式 5：中左/中右全場擴展光束（持續 3 秒，蹲下躲避）
  if (b.state === "HYPER_BEAM") {
    let elapsed = (b.beamMaxTimer || 180) - b.timer;
    let expandProg = constrain((elapsed - 30) / 75, 0, 1);
    let beamHalfH = lerp(6, 260, expandProg);
    let beamLen = (b.dir === 1)
      ? max(120, (b.arenaRight - b.headX) + 40)
      : max(120, (b.headX - b.arenaLeft) + 40);

    push();
    translate(b.headX, b.headY);
    scale(b.dir, 1);
    noStroke();
    if (expandProg <= 0.05) {
      // 一開始小小一條光線
      fill(255, 225, 120, 210);
      rect(0, -4, beamLen, 8, 4);
      fill("#FFFFFF");
      rect(0, -1.5, beamLen, 3, 2);
    } else {
      // 擴大成覆蓋全場的光
      fill(255, 130, 0, 120 + expandProg * 55);
      rect(0, -beamHalfH, beamLen, beamHalfH * 2, 12);
      fill(255, 210, 90, 150 + expandProg * 50);
      rect(0, -beamHalfH * 0.55, beamLen, beamHalfH * 1.1, 10);
      fill(255, 250, 210, 175);
      rect(0, -beamHalfH * 0.22, beamLen, beamHalfH * 0.44, 8);
    }
    pop();
  }

  // 底部 BOSS 血條
  if (b.active) {
    push();
    resetMatrix();
    let barW = min(440, width * 0.65);
    let bx = width / 2 - barW / 2;
    let by = height - 42;
    fill(0, 0, 0, 200);
    stroke("#FFD166");
    strokeWeight(2.5);
    rect(bx - 6, by - 22, barW + 12, 34, 10);
    noStroke();
    fill("#FFD166");
    textSize(13);
    textAlign(CENTER, TOP);
    text("SANDWORM GUARDIAN（沙暴巨蟲）", width / 2, by - 19);
    fill("#333");
    rect(bx, by - 2, barW, 10, 5);
    fill("#FF5400");
    rect(bx, by - 2, barW * (b.hp / b.maxHp), 10, 5);
    pop();
  }
}

function updateRescueCutscene() {
  if (!rescueCutscene) return;
  rescueCutscene.timer++;
  if (rescueCutscene.timer === 1) playSFX("1up");
  if (rescueCutscene.timer >= 180) {
    unlockedNewChar = true;
    activeCharacterId = 1;
    rescueCutscene = null;
    floatingTexts.push({
      text: "★ 解鎖新角色「沙漠遊俠」！按 [C] 隨時切換！",
      x: characterX - 110, y: characterY - 70, vy: -1.0, life: 160, isOneUp: true
    });
    gameState = "WALK_TO_CASTLE";
    castleTargetX = sandwormBoss ? (sandwormBoss.arenaRight + 20) : (characterX + 40);
  }
}

function drawRescueCutscene() {
  if (!rescueCutscene) return;
  let cx = rescueCutscene.cageX;
  let cy = rescueCutscene.cageY;
  push();
  translate(cx, cy);
  noStroke();
  fill("#2EC4B6");
  rect(-12, -34, 24, 34, 6);
  fill("#FFD166");
  ellipse(0, -44, 24, 24);
  fill("#E63946");
  rect(-15, -52, 30, 7, 3);
  if (rescueCutscene.timer < 80) {
    stroke("#ADB5BD");
    strokeWeight(3);
    noFill();
    rect(-22, -62, 44, 62, 4);
    line(-8, -62, -8, 0);
    line(8, -62, 8, 0);
  }
  pop();

  push();
  resetMatrix();
  fill(0, 0, 0, 170);
  rect(width / 2 - 210, 88, 420, 54, 14);
  fill("#FFD166");
  textSize(18);
  textAlign(CENTER, CENTER);
  text("🎉 成功救出被囚禁的「沙漠遊俠」！", width / 2, 115);
  pop();
}
// =====================================================================
// World 2 (2-1 ~ 2-4) 零文字視覺連貫場景：光影色溫漸變 ＋ 起點來路地標
// =====================================================================
function drawWorld2AtmosphereAndLandmarks() {
  if (currentWorld !== 2) return;

  push();
  noStroke();

  // --- 1. 遠景層（依關卡逐漸變深，呈現從地表走進地底的過程） ---
  if (currentLevel === 1) {
    // 2-1：烈日沙漠遠景金字塔
    fill("#E76F51");
    triangle(cameraX * 0.7 + 320, 420, cameraX * 0.7 + 460, 210, cameraX * 0.7 + 600, 420);
    fill("#FFF3B0");
    circle(cameraX + width * 0.78, 95, 76);
  } else if (currentLevel === 2) {
    // 2-2：沙暴黃昏轉入地下邊緣（遠景半掩埋的遺跡石柱）
    fill(180, 120, 60, 85);
    for (let i = 0; i < 10; i++) {
      let rx = i * 340 + cameraX * 0.45;
      rect(rx, 80, 55, 520);
      rect(rx - 12, 80, 79, 26);
    }
  } else if (currentLevel === 3) {
    // 2-3：太陽神殿深處（暗紅神殿壁柱＋微弱火把壁燈光暈）
    fill("#1E1008");
    for (let i = 0; i < 12; i++) {
      let px = i * 300 + cameraX * 0.35;
      rect(px, 0, 70, 640);
      fill(255, 110, 30, 45);
      circle(px + 35, 190, 110);
      fill("#1E1008");
    }
  } else if (currentLevel === 4 && !window.isInMinerSupplyRoom) {
    // 2-4：幽暗古礦坑（深處礦道木梁支架）
    fill("#121222");
    for (let i = 0; i < 14; i++) {
      let mx = i * 280 + cameraX * 0.3;
      rect(mx, 0, 22, 640);
      rect(mx + 140, 0, 22, 640);
      rect(mx - 10, 40, 182, 20);
    }
  }

  // --- 2. 起點「來路地標」（讓玩家一進關卡往左看就知道自己怎麼來到這裡的） ---
  if (currentLevel === 2) {
    // 【2-2 起點】上方沙穴洞口＋斜射陽光光束＋向下的砂岩石階
    fill("#5C4033");
    for (let s = 0; s < 5; s++) {
      rect(10 + s * 26, 220 + s * 36, 95 - s * 10, 36);
    }
    fill(255, 245, 185, 55);
    quad(0, 0, 130, 0, 270, 520, 40, 520);
  } else if (currentLevel === 3) {
    // 【2-3 起點】上方神殿豎井入口＋垂落的繩梯（表示從上一區垂降進入神殿）
    fill("#3D2314");
    rect(45, 0, 16, 170);
    rect(135, 0, 16, 170);
    stroke("#C9963B");
    strokeWeight(3);
    line(76, 0, 76, 240);
    line(116, 0, 116, 225);
    for (let ry = 24; ry < 220; ry += 26) {
      line(76, ry, 116, ry);
    }
    noStroke();
  } else if (currentLevel === 4 && !window.isInMinerSupplyRoom) {
    // 【2-4 主礦坑起點】左側已升起開啟的厚重黑鐵礦坑閘門
    fill("#2B2D42");
    rect(18, 320, 112, 160, 8, 8, 0, 0);
    fill("#090912");
    rect(34, 340, 80, 140, 4, 4, 0, 0);
    fill("#6C757D");
    rect(34, 340, 80, 22);
    for (let gx = 40; gx < 110; gx += 14) {
      triangle(gx, 362, gx + 8, 362, gx + 4, 374);
    }
  }

  pop();
}