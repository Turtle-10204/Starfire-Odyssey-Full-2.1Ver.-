# Starfire Odyssey

使用 **p5.js** 製作的 2D
橫向捲軸平台跳躍網頁遊戲，支援電腦鍵盤與手機／平板觸控。

## 專案狀態

-   目前基準版本：**2.1**；下一個開發目標：**2.2**。
-   2.1
    玩家測試回報：第一關、死亡／復活、手機操作均正常。此為使用者回報，不代表所有關卡與裝置都已測試。
-   **GitHub 目前是單檔版**：主要邏輯在 `sketch.js`（新版 README 記載約
    6,916 行），另有 `world_maps.js`。
-   另有一份拆檔版備份（將 `sketch.js` 依功能拆成 19
    個檔案，邏輯未改），尚未上傳
    GitHub、不是目前基準。未經使用者確認前，2.2 開發以 GitHub
    單檔版為準，忽略拆檔版檔名。
-   未經最新程式碼或實機驗證的資訊，一律標示「待確認」。

## 技術概況

-   使用 p5.js；純前端，沒有 npm、打包工具或 ES Modules。
-   JavaScript 透過 `index.html` 的 `<script>`
    依序載入，共用全域作用域。
-   可直接用瀏覽器開啟 `index.html`；若圖片載入失敗，改用本機伺服器。
-   文字與註解以繁體中文為主。

## 遊戲內容

  --------------------------------------------------------------------------------------------------
  世界                    關卡                          說明
  ----------------------- ----------------------------- --------------------------------------------
  World 1 草原            1-1 草原起點、1-2             1-4 為魔王關，通關後轉場前往世界 2
                          地下洞穴（含水管入口）、1-3   
                          黃昏浮島、1-4 熔岩魔王城      

  World 2 沙漠            2-0 岔路、2-SHOP 補給屋、2-1  2-4
                          黃沙綠洲、2-2 無盡流沙海、2-3 解鎖後，魔王關節點會由「2-4」改名為「2-5」
                          太陽神殿、2-4                 
                          幽暗古礦坑（隱藏路線）、2-5   
                          沙暴巨蟲巢穴                  
  --------------------------------------------------------------------------------------------------

道具：超級蘑菇、火焰花、羽翼披風、疾風加速菇、仙人掌刺甲菇、時光沙漏菇、無敵星星、1UP。擊敗沙暴巨蟲可解鎖第二位角色「沙漠遊俠」。

## 操作

  功能                 電腦           手機
  -------------------- -------------- --------------------
  移動                 方向鍵／A、D   虛擬方向鍵
  跳躍                 空白鍵／W／↑   JUMP
  蹲下                 ↓／S           ▼
  射擊                 F              FIRE
  加速／時間領域開關   Ctrl／Shift    DASH（點一下鎖定）
  空投備用道具         B              點上方道具框
  插火把（僅 2-4）     E 或 T         點火把框
  切換角色（解鎖後）   C              ---
  返回大地圖           M              右上角「地圖」
  設定                 O              右上角「設定」
  大地圖道具箱         I              Items 按鈕

其他按鍵（如 1、2、U、P、R）請查看 `keyPressed()`；用途待確認。

## 檔案結構（目前 GitHub：單檔版）

``` text
index.html       依序載入 libraries/p5.min.js、p5.sound.min.js、world_maps.js、sketch.js
style.css
jsconfig.json
libraries/       p5.js、p5.sound
action/  new/    角色精靈圖與特效素材（PNG 橫向影格條）
world_maps.js    世界 2 關卡地圖生成器
sketch.js        其餘全部遊戲邏輯（新版 README 記載約 6,916 行）
```

載入順序：`world_maps.js` 在前，`sketch.js` 在後。

## sketch.js 功能地圖

以下行號是 2.1 單檔版快照（約 6,916
行）；修改後行號會偏移，應以函式名稱為準。

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  區塊                   函式／內容                                                                                                                                 約略行號
  ---------------------- ---------------------------------------------------------------------------------------------------------------------- ----------------------------
  全域狀態與常數         主角物理、遊戲流程、實體陣列、`POWERUP_GUIDE_DB`、影格數、`TILE_SIZE`、碰撞盒常數                                             1--290、421、537--540

  音效                   `initAudioEngine`、`playTone`、`playSFX`、`updateBGM`                                                                                      292--419

  世界 1 地圖            `MAP_1_1`～`MAP_1_4`、`loadLevelMap`                                                                                                       424--535

  素材                   `preload`、`measureSpriteMetrics`、`buildTexturePack`                                                                                      542--807

  主迴圈                 `getEffectiveViewZoom`、`setup`、`draw`                                                                                                   809--2104

  彈窗                   道具圖鑑、離開確認、設定視窗                                                                                                             2105--2412

  開始畫面               `drawDeviceSelect` 等                                                                                                                    2413--2565

  手機控制與動作         虛擬按鍵、`triggerJumpAction`、`triggerFireAction`、`triggerDropReservedItem`                                                            2566--2709

  HUD                    `drawNSMBHUD`、`drawPlayerHeadBadge`                                                                                                     2710--2916

  大地圖                 `getWorldMapNodes`、`drawWorldMap`                                                                                                       2917--3354

  沙漠補給屋             `openDesertShop`、`drawDesertShopModal`                                                                                                  3355--3461

  關卡雜項               `drawLevelIntro`、`takeDamage`、`handlePlayerDeath`、`drawGameOver`、`exitToWorldMapRestoreEntry`、`drawPowerupIcon`                     3462--3673

  點擊與開始關卡         `handlePointerTap`、`mousePressed` 等、`startLevel`                                                                                      3674--4112

  敵人                   `spawnLevelEnemies`、`updateEnemies`、`drawEnemies`                                                                                      4113--4492

  主角武器與能力         火球、仙人掌飛針、時光震波與倒流                                                                                                         4493--4664

  磚塊與道具             磚塊彈跳、`spawnPowerupFromBlock`、`updateAndDrawItems`                                                                                  4665--4810

  1-4 魔王城             火棒、`updateBossAndFireballs`、`drawBossAndFireballs`、`checkAxeTrigger`、`updateBridgeCollapse`、`checkLavaHazard`                     4811--5045

  地形與機關             移動平台、`checkEnterPipe`、`checkHiddenBlockHit`、`checkHitTile`、`checkFlagpole`                                                       5046--5316

  特效、金幣、地圖繪製   浮動文字、金幣、`drawPipesOnly`、`drawMap`                                                                                               5317--5642

  碰撞                   `checkCollision`                                                                                                                         5643--5666

  大地圖操作與輸入       `enterSelectedMapNode`、`moveWorldMapCursor`、`keyPressed`、`keyReleased`、`windowResized`                                               5667--5997

  2-4 礦坑               `updateMinerLampAndTorches`、`placeTorchAtPlayer`、`drawMinerLampAndTorches`                                                             5998--6221

  2-5 沙暴巨蟲           `updateSandwormBoss`、`drawSandwormBoss`、救出新角色過場                                                                                 6222--6838

  世界 2 氣氛            `drawWorld2AtmosphereAndLandmarks`                                                                                                       6839--結尾
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 架構重點

-   共用全域作用域，沒有類別或模組封裝。
-   關卡識別用 `currentWorld`（1／2）與 `currentLevel`（1～5）。不可只用
    `currentLevel === 4` 判斷世界 1 魔王城或世界 2 礦坑，兩邊都是 4。
-   地圖是字串陣列，每個字元代表一種磚塊或物件，字元意義要查 `drawMap()`
    與 `checkCollision()`。
-   精靈圖是每個動作一張橫向影格條，影格數定義在檔案開頭的
    `*_FRAME_COUNT`，換圖時要同步確認。
-   大地圖節點資料在 `mapNodesData`，節點含
    `unlocked`、`cleared`、`nextNormal`、`nextSecret`、`neighbors`。
-   解鎖的新角色「沙漠遊俠」目前是程式繪製（非精靈圖），由
    `activeCharacterId` 切換。

### gameState 狀態機

目前出現的狀態：

`DEVICE_SELECT`、`WORLD_MAP`、`LEVEL_INTRO`、`PLAYING`、`ITEM_GUIDE`、`TRANSFORM_FREEZE`、`FLAG_SLIDE`、`WALK_TO_CASTLE`、`ENTERING_PIPE`、`ENTERING_SUPPLY_PIPE`、`EXITING_SUPPLY_PIPE`、`ENTERING_QUICKSAND`、`BOSS_DEFEAT_CUTSCENE`、`ALL_CLEAR`、`GAME_OVER`。

新增或修改狀態時，必須檢查 `draw()` 內所有相關判斷，以及
`keyPressed()`、`handlePointerTap()` 的按鍵與點擊分派。

## 已知問題（靜態檢查，尚未實機重現）

以下項目來自新版 README
的靜態檢查描述，修改前必須重新檢查最新程式碼並嘗試重現：

1.  **補給室返回可能當機**：2-4 中途水管進入補給室時，`draw()` 內
    `ENTERING_SUPPLY_PIPE` 處理約第 1302 行把 `saved2_4MainState` 存成
    `{map, x, y}`；離開時 `EXITING_SUPPLY_PIPE` 約第 1326--1330 行卻讀
    `.mapStrings`、`.platformSpawns`、`.enemySpawns`。`startLevel` 約第
    3947 行存的才是完整格式。可能導致 `loadLevelMap(undefined)`。
2.  **BGM 與部分地磚顏色只看
    `currentLevel === 4`**：`updateBGM`、`drawMap` 等可能使世界 2 的 2-4
    套用世界 1 魔王城設定。
3.  `draw()` 內 `isExitingPipe` 的處理可能重複；另有一段使用
    `"PIPE_ENTER"`／`"PIPE_EXIT"`，而實際狀態是
    `ENTERING_PIPE`，該段可能不會執行。
4.  `FLAG_SLIDE` 區塊中 `let flagCol` 可能遮蔽全域 `flagCol`。
5.  HUD 底部文字可能寫死 `1-${currentLevel}`，使世界 2 顯示錯誤。

## 開發與測試守則

-   不要改成 `import`／`export`
    或加入打包工具，除非整個專案明確決定遷移。
-   不要隨意重新命名全域函式或變數；改名前先全檔搜尋。
-   `preload()`、`setup()`、`draw()` 只能各定義一次。
-   單檔版修改時，實作者交付「整個函式的替換版本」並寫明函式名稱，不要貼整份
    `sketch.js`。貼進 GitHub 前先建立分支或備份。
-   同一時間只有一個 AI 修改同一個檔案。
-   修改後依範圍做回歸測試；至少保留開始畫面、大地圖、1-1、道具、通關、1-2
    水管、手機虛擬按鍵、世界 2 補給屋與 2-4 水管。
-   iOS Safari 音訊需要使用者互動後才能啟動（見 `initAudioEngine`）。
-   每次修改需記錄修改檔案、函式、行為變更、風險與測試結果，並更新
    `CHANGELOG.md`、`BUG_TRACKER.md`。
