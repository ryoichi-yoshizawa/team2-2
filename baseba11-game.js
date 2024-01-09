// baseball-game.js

// ゲーム状態を管理する変数
let inning = 1;
let scoreDeNA = 0;
let scoreGiants = 0;

// 次のイニングへ進む関数
function playInning() {
  // ここにイニングのプレイロジックを書く
  updateGameLog(`イニング ${inning} が始まります。`);

  // イニングやスコアの更新
  inning++;
  document.getElementById('inningNumber').textContent = inning;

  // ...打撃結果の更新など

  // ゲーム終了条件のチェック
  if (inning > 9) {
    finishGame();
  }
}

// 試合終了処理
function finishGame() {
  updateGameLog("試合終了");
  // ...勝敗の決定と表示など
}

// 試合ログを更新する関数
function updateGameLog(message) {
  const logList = document.getElementById('logList');
  const newLogItem = document.createElement('li');
  newLogItem.textContent = message;
  logList.appendChild(newLogItem);
}

// ページ読み込み時の初期化処理
document.addEventListener('DOMContentLoaded', () => {
  updateGameLog("試合開始");
});

// アットバットのシミュレーション
function simulateAtBat(batter) {
    const hitProbability = batter.average; // 打率をヒットの確率として使用
    const event = Math.random();
    
    if (event < hitProbability) {
      // ヒットと判断
      score[batter.team]++;
      logAtBat(batter.name, "ヒット！");
    } else {
      // アウトと判断
      outs++;
      logAtBat(batter.name, "アウト");
    }
  }
  
  // 結果をロギング
  function logAtBat(batterName, result) {
    const inningElement = document.getElementById('inningNumber');
    inningElement.textContent = currentInning.toString();
  
    const scoreDeNAElement = document.getElementById('scoreDeNA');
    scoreDeNAElement.textContent = score.DeNA.toString();
  
    const scoreGiantsElement = document.getElementById('scoreGiants');
    scoreGiantsElement.textContent = score.Giants.toString();
  
    const gameLog = document.getElementById('gameLog');
    const newLog = document.createElement('div');
    newLog.textContent = `【${currentInning}回】${batterName}: ${result}`;
    gameLog.appendChild(newLog);
  
    // スクロールして最新のログが見えるようにする
    gameLog.scrollTop = gameLog.scrollHeight;
  }
  
  // ページ読み込み時の初期化処理
  document.addEventListener('DOMContentLoaded', () => {
    simulateGame(); // シミュレーションを開始する
  });