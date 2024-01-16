//=============
// メイン
//=============
var playerTeam = new Team();				// プレイヤーチーム
var opponentTeam = new Team();				// 対戦相手チーム
var devTeam = new Team();					// 育成チーム
var gameCount;								// 試合数カウント
var gameScene;								// ゲームの場面
var game_dh = false;						// DH制かどうか
var devOrderIds = [];						// 育成選手の打順記憶

// ゲーム全般データ
var new_dev_member_id = 1;					// 育成選手の新ID
var game_history = [];						// ゲームデータ：履歴
var game_top10 = [];						// ゲームデータ：トップ10
var game_records_try_count = 0;				// ゲームデータ：記録ゲーム数
var game_records_game_count = 0;			// ゲームデータ：記録試合数
var game_records_win_count = 0;				// ゲームデータ：記録勝利数
var game_records_pt_inning = 0;				// ゲームデータ：1イニング得点
var game_records_pt_game = 0;				// ゲームデータ：1試合得点
var game_records_hit_try = [0,""];			// ゲームデータ：1ゲーム安打
var game_records_rbi_try = [0,""];			// ゲームデータ：1ゲーム打点
var game_inventory = [];					// ゲームデータ：アイテム
var game_coin = 0;							// ゲームデータ：コイン
var game_inventory_max = 5;					// ゲームデータ：アイテム数MAX

// 実績
achievement = {
	"3win_try"		: false,	// 1ゲームに3勝
	"6win_try"		: false,	// 1ゲームに6勝
	"10win_try"		: false,	// 1ゲームに10勝
	"100win_total"	: false,	// 合計で100勝
	"20hit_try"		: false,	// 1ゲームに20安打
	"20rbi_try"		: false,	// 1ゲームに20打点
	"10pt_game"		: false,	// 1試合に10点
	"5pt_inning"	: false,	// 1イニングに5点
	"12sayonara"	: false,	// 延長でサヨナラ勝ち
	"hr_pitcher"	: false,	// 投手がHR
	"dev_success"	: false,	// 育成選手の打率が0.3オーバー
	"complete"		: false		// すべての実績を解除
}

function cheat(){
	for(var key in achievement){
		achievement[key] = true;
	}
	updateAchievement();
	saveGame();
}

//---------------
// 画面ロード時
//---------------
$(function(){
	
	// 設定ロード
	loadConfig();
	
	// ゲームデータロード
	loadGame();
	
	//------------------------------
	// プレイヤーチーム並べ替え機能
	//------------------------------
	$("#first_team_list").sortable({
		
		// ポインターの位置で並べ替え
		tolerance:"pointer",
		
		// ドラッグしたアイテムの番号
		dragStartIndex:0,
		
		// ドラッグ開始時アイテム番号を記憶
		start:function(ev, ui){
			dragStartIndex = $("#first_team_list .team_list_record").index(ui.item);
		},
		
		// 並べ替え時
		update:function(ev, ui){
			
			// ドラッグ終了時の位置
			var dragEndIndex = $("#first_team_list .team_list_record").index(ui.item);
			
			// 打順入れ替え
			replacePlayerTeamOrder(dragStartIndex, dragEndIndex);
		}
	});
	
	//----------------------------------------------------------
	// エンターキーかスペースキーでゲームボタンクリックの処理
	//----------------------------------------------------------
	$("body").on("keypress", function(e){
		if(e.which == 13 || e.which == 32){
			$("#game_button").trigger("click");
		}
		return false;
	});
	
	// 並べ替え機能OFF
	teamSortable(false);
	
	// 場面チェンジ
	changeScene(0);
});

//--------------------------------
// プレイヤーチーム打順入れ替え
//--------------------------------
function replacePlayerTeamOrder(inFrom, inTo){
	
	// 打順番号振り直し
	var firstOrders = $("#first_team_list .team_list_record").find(".cell_order");
	for(var i=0; i<firstOrders.length; i++){
		var newNumber = (i < 9) ? i + Number(1) : "X";
		firstOrders.eq(i).html(newNumber);
	}
	
	// 実際のデータ並べ替え
	var member = playerTeam.members[inFrom];
	playerTeam.members.splice(inFrom, 1);
	playerTeam.members.splice(inTo, 0, member);
}

//-----------------------
// ウィンドウリサイズ時
//-----------------------
$(window).resize(function(){
	
	// バッターアイコンと打席結果アイコンの移動
	if(gameCount > 0){
			
		var firstLeft = $("#first_team_list .team_list_record").eq(0).position().left - 22;
		var lastLeft = $("#last_team_list .team_list_record").eq(0).position().left - 22;
		
		// バッターアイコン
		if(topBottom == 0){
			$("#batter_icon").css("left", firstLeft);
		}else{
			$("#batter_icon").css("left", lastLeft);
		}
		
		// 打席結果
		$(".batter_result_icon0").css("left", firstLeft);
		$(".batter_result_icon1").css("left", lastLeft);
	}
});

//---------------
// 設定セーブ
//---------------
function saveConfig(){
	
	// セーブするデータ
	var configSaveData = {};
	configSaveData.skip_timing		= skip_timing;			// 設定：スキップ
	configSaveData.interval_wait	= interval_wait;		// 設定：ウェイト
	configSaveData.stop_base		= stop_base;			// 設定：ストップ
	configSaveData.stop_lead		= stop_lead;			// 設定：リード時スルー
	configSaveData.game_dh			= game_dh;				// 設定：DH制
	
	// Stringにして保存
	var strdata = JSON.stringify(configSaveData);
	window.localStorage.setItem("bob_config", strdata);
}

//---------------
// 設定ロード
//---------------
function loadConfig(){
	
	var strdata = window.localStorage.getItem("bob_config");
	
	// ロードするデータ（成功時）
	if(strdata != null){
		var configLoadData = JSON.parse(strdata);
		skip_timing			= configLoadData.skip_timing;			// 設定：スキップ
		interval_wait		= configLoadData.interval_wait;			// 設定：ウェイト
		stop_base			= configLoadData.stop_base;				// 設定：ストップ
		stop_lead			= configLoadData.stop_lead;				// 設定：リード時スルー
		game_dh				= configLoadData.game_dh;				// 設定：DH制
	}
	
	// 画面に反映
	$("input:radio[name='rad_skip']").val([skip_timing]);		// 設定：スキップ
	$("#sel_wait").val(interval_wait);							// 設定：ウェイト
	$("input:radio[name='rad_stop']").val([stop_base]);			// 設定：ストップ
	$("#chk_lead").val([stop_lead]);							// 設定：リード時スルー
	$("#chk_dh").val([game_dh]);								// 設定：DH制
}

//----------------------
// ゲームデータセーブ
//----------------------
function saveGame(){
	
	// セーブするデータ
	var saveGameData = {};
	saveGameData.achievement					= achievement;					// 実績
	saveGameData.devTeam						= devTeam;						// 育成選手
	saveGameData.new_dev_member_id				= new_dev_member_id;			// 育成選手の新ID
	saveGameData.game_history					= game_history;					// ゲームデータ：履歴
	saveGameData.game_top10						= game_top10;					// ゲームデータ：トップ10
	saveGameData.game_records_try_count			= game_records_try_count;		// ゲームデータ：記録ゲーム数
	saveGameData.game_records_game_count		= game_records_game_count;		// ゲームデータ：記録試合数
	saveGameData.game_records_win_count			= game_records_win_count;		// ゲームデータ：記録勝利数
	saveGameData.game_records_pt_inning			= game_records_pt_inning;		// ゲームデータ：1イニング得点
	saveGameData.game_records_pt_game			= game_records_pt_game;			// ゲームデータ：1試合得点
	saveGameData.game_records_hit_try			= game_records_hit_try;			// ゲームデータ：1試合安打
	saveGameData.game_records_rbi_try			= game_records_rbi_try;			// ゲームデータ：1試合打点
	saveGameData.game_inventory					= game_inventory;				// ゲームデータ：インベントリ
	saveGameData.game_coin						= game_coin;					// ゲームデータ：コイン
	saveGameData.game_inventory_max				= game_inventory_max;			// ゲームデータ：アイテム数MAX
	
	// Stringにして保存
	var strdata = JSON.stringify(saveGameData);
	window.localStorage.setItem("bob_data", strdata);
}

//----------------------
// ゲームデータロード
//----------------------
function loadGame(){
	
	var strdata = window.localStorage.getItem("bob_data");
	
	// ロードするデータ（成功時）
	if(strdata != null){
		var loadGameData = JSON.parse(strdata);
		if(loadGameData.achievement				)achievement					= loadGameData.achievement;					// 実績
		if(loadGameData.devTeam					)devTeam.copyPropertiesFromObject(loadGameData.devTeam);					// 育成選手
		if(loadGameData.new_dev_member_id		)new_dev_member_id				= loadGameData.new_dev_member_id;			// 育成選手の新ID
		if(loadGameData.game_history			)game_history					= loadGameData.game_history;				// ゲームデータ：履歴
		if(loadGameData.game_top10				)game_top10						= loadGameData.game_top10;					// ゲームデータ：トップ10
		if(loadGameData.game_records_try_count	)game_records_try_count			= loadGameData.game_records_try_count;		// ゲームデータ：記録ゲーム数
		if(loadGameData.game_records_game_count	)game_records_game_count		= loadGameData.game_records_game_count;		// ゲームデータ：記録試合数
		if(loadGameData.game_records_win_count	)game_records_win_count			= loadGameData.game_records_win_count;		// ゲームデータ：記録勝利数
		if(loadGameData.game_records_pt_inning	)game_records_pt_inning			= loadGameData.game_records_pt_inning;		// ゲームデータ：1イニング得点
		if(loadGameData.game_records_pt_game	)game_records_pt_game			= loadGameData.game_records_pt_game;		// ゲームデータ：1試合得点
		if(loadGameData.game_records_hit_try	)game_records_hit_try			= loadGameData.game_records_hit_try;		// ゲームデータ：1試合安打
		if(loadGameData.game_records_rbi_try	)game_records_rbi_try			= loadGameData.game_records_rbi_try;		// ゲームデータ：1試合打点
		if(loadGameData.game_inventory			)game_inventory					= loadGameData.game_inventory;				// ゲームデータ：インベントリ
		if(loadGameData.game_coin				)game_coin						= loadGameData.game_coin;					// ゲームデータ：コイン
		if(loadGameData.game_inventory_max		)game_inventory_max				= loadGameData.game_inventory_max;			// ゲームデータ：アイテム数MAX
	}
	
	// ロード後、画面に反映
	updateStatistics();
	updateAchievement();
}

//-----------
// 中断する
//-----------
function saveContinue(){
	
	// 確認する
	if(confirm(word_confirm_outofplay) == false){
		return;
	}
	
	// アイテム効果を戻す
	resetItemEffect();
	
	// 統計等のデータセーブ
	saveGame();
	
	// 中断セーブするデータ
	var continueSaveData = {};
	
	// 全般データ
	continueSaveData.achievement			= achievement;				// 実績
	continueSaveData.game_dh				= game_dh;					// 設定：DH制
	continueSaveData.playerTeam				= playerTeam;				// プレイヤーチーム
	continueSaveData.opponentTeam			= opponentTeam;				// 対戦相手チーム
	continueSaveData.devTeam				= devTeam;					// 育成チーム
	continueSaveData.gameCount				= gameCount;				// 試合数カウント
	continueSaveData.gameScene				= gameScene;				// ゲームの場面
	
	// 試合データ
	continueSaveData.attackTeam				= attackTeam;				// 攻撃中のチーム
	continueSaveData.firstTeam				= firstTeam;				// 先攻のチーム
	continueSaveData.lastTeam				= lastTeam;					// 後攻のチーム
	continueSaveData.attackBatterIndex		= attackBatterIndex;		// 攻撃中の打者の順番
	continueSaveData.firstBatterIndex		= firstBatterIndex;			// 先攻の打者の順番
	continueSaveData.lastBatterIndex		= lastBatterIndex;			// 後攻の打者の順番
	continueSaveData.inning					= inning;					// イニング
	continueSaveData.topBottom				= topBottom;				// 表裏（0:表、1:裏）
	continueSaveData.outCount				= outCount;					// アウトカウント
	continueSaveData.baseState				= baseState;				// ベース状況（0:ランナー無し、1:ランナー有り）
	continueSaveData.firstScore				= firstScore;				// 先攻の得点
	continueSaveData.lastScore				= lastScore;				// 後攻の得点
	continueSaveData.inningScore			= inningScore;				// イニング得点
	continueSaveData.firstTotalHit			= firstTotalHit;			// 先攻の安打数
	continueSaveData.lastTotalHit			= lastTotalHit;				// 後攻の安打数
	continueSaveData.flgGameFinish			= flgGameFinish;			// 試合が終了してるかどうか
	
	// Stringにして保存
	var strdata = JSON.stringify(continueSaveData);
	window.localStorage.setItem("bob_continue", strdata);
	
	// 現在のデータを破棄してリロード
	window.location.reload();
}

//-----------
// 再開する
//-----------
function loadContinue(){
	
	// 注意する
	alert(word_confirm_continue);
	
	// ロード
	var strdata = window.localStorage.getItem("bob_continue");
	
	// 中断ロードするデータ（成功時）
	if(strdata != null){
		var continueLoadData = JSON.parse(strdata);
		
		// 全般データ
		achievement				= continueLoadData.achievement;					// 実績
		game_dh					= continueLoadData.game_dh;						// 設定：DH制
		playerTeam.copyPropertiesFromObject(continueLoadData.playerTeam);		// プレイヤーチーム
		opponentTeam.copyPropertiesFromObject(continueLoadData.opponentTeam);	// 対戦相手チーム
		devTeam.copyPropertiesFromObject(continueLoadData.devTeam);				// 育成チーム
		gameCount				= continueLoadData.gameCount;					// 試合数カウント
		gameScene				= continueLoadData.gameScene;					// ゲームの場面
		
		// 試合データ
		attackTeam.copyPropertiesFromObject(continueLoadData.attackTeam);	// 攻撃中のチーム
		firstTeam.copyPropertiesFromObject(continueLoadData.firstTeam);     // 先攻のチーム
		lastTeam.copyPropertiesFromObject(continueLoadData.lastTeam);       // 後攻のチーム
		attackBatterIndex		= continueLoadData.attackBatterIndex;		// 攻撃中の打者の順番
		firstBatterIndex		= continueLoadData.firstBatterIndex;		// 先攻の打者の順番
		lastBatterIndex			= continueLoadData.lastBatterIndex;			// 後攻の打者の順番
		inning					= continueLoadData.inning;					// イニング
		topBottom				= continueLoadData.topBottom;				// 表裏（0:表、1:裏）
		outCount				= continueLoadData.outCount;				// アウトカウント
		baseState				= continueLoadData.baseState;				// ベース状況（0:ランナー無し、1:ランナー有り）
		firstScore				= continueLoadData.firstScore;				// 先攻の得点
		lastScore				= continueLoadData.lastScore;				// 後攻の得点
		inningScore				= continueLoadData.inningScore;				// イニング得点
		firstTotalHit			= continueLoadData.firstTotalHit;			// 先攻の安打数
		lastTotalHit			= continueLoadData.lastTotalHit;			// 後攻の安打数
		flgGameFinish			= continueLoadData.flgGameFinish;			// 試合が終了してるかどうか
				
		// 先攻後攻チームとプレイヤー対戦チームを紐付ける
		if(firstTeam.flg_player){
			playerTeam = firstTeam;
			opponentTeam = lastTeam;
		}else{
			playerTeam = lastTeam;
			opponentTeam = firstTeam;
		}
		
		// 中断ロード後、場面チェンジ
		changeScene(gameScene);
		
		// DH制を画面に反映
		$("#chk_dh").val([game_dh]);
	}
	
	// 中断ロードしたらローカルストレージ削除
	window.localStorage.removeItem("bob_continue");
}

//------------------
// 新規ゲーム押下時
//------------------
function pushNewGame(){
	
	// ゲームの途中の場合、確認する
	if(gameCount > 0){
		if(confirm(word_confirm_new_game) == false){
			return;
		}
		
		// ゲームオーバーにする
		pushLose();
		return;
	}
	
	// 前回の続きが存在する場合、確認する
	if(window.localStorage.getItem("bob_continue")){
		if(confirm(word_confirm_no_load_game) == false){
			return;
		}
		
		// 前回のデータを削除
		window.localStorage.removeItem("bob_continue");
	}
	
	// 育成打順保存
	saveDevOrder();
	
	// ゲーム結果隠す
	pushResultOk();
	
	// 試合カウント初期化
	gameCount = 0;
	
	// 試合情報をクリア
	clearGameInfo();
	
	// プレイヤーチーム編成
	playerTeam = new Team();
	playerTeam.flg_player = true;
	playerTeam.team_name = word_player_team_name;
	for(var i=0; i<9; i++){
		var newMember = new Member();
		
		// 能力値
		newMember.avg = getDecimal(getBiasRandom() * 0.5 + 0.15, 1000);
		newMember.risp = getDecimal(getBiasRandom() * 0.5 + 0.15, 1000);
		
		// ピッチャー
		if(game_dh == false && i==8){
			newMember.avg = getDecimal(getBiasRandom() * 0.2 + 0.05, 1000);
			newMember.risp = getDecimal(getBiasRandom() * 0.2 + 0.05, 1000);
			newMember.flg_pitcher = true;
		}
		playerTeam.addMember(newMember);
	}
	
	// 育成選手を追加
	for(var i=0; i<devTeam.members.length; i++){
		playerTeam.addMember(devTeam.members[i]);
	}
	
	// 場面チェンジ
	changeScene(1);
	
	//----------------------
	// 新規ゲームの特殊処理
	//----------------------
	
	// 育成選手の打順再現
	loadDevOrder();
	
	// 投手を9番に持ってくる
	var pitcherIdx = -1;
	for(var i=0; i<playerTeam.members.length; i++){
		if(playerTeam.members[i].flg_pitcher){
			pitcherIdx = i;
			break;
		}
	}
	// DOMとデータ入れ替え
	if(pitcherIdx >= 0){
		$("#first_team_list .team_list_record").eq(pitcherIdx).insertBefore($("#first_team_list .team_list_record").eq(8));
		replacePlayerTeamOrder(pitcherIdx, 8);
	}
	
	// DH制変更可
	$("#chk_dh").attr("disabled", false);
	$("#label_dh").css("color", "#FFF");
	
	// 中断ボタン不可
	var continueButton = $("#continue_button");
	continueButton.html(word_button_continue);
	continueButton.attr("disabled", true);
	
	// ショップボタン可
	var shopButton = $("#shop_button");
	shopButton.attr("disabled", false);
	
	// チームの個人成績初期化
	playerTeam.initializeMembersScore();
	opponentTeam.initializeMembersScore();
	
	// ゲームボタン
	updateGameButton(function(){
		pushOrderComplete();
		saveDevOrder();
		game_records_try_count ++;
	}, null, true, word_button_order_complete, 0);
}

//----------------------------------
// 並べ替え完了後、対戦相手確認
//----------------------------------
function pushOrderComplete(){
	
	// ショップウィンドウを閉じる
	hideShop();
	
	// 投手は外せない
	for(var i=9; i<playerTeam.members.length; i++){
		if(playerTeam.members[i].flg_pitcher){
			alert(word_confirm_forbit_pitcher_trade);
			return;
		}
	}
	
	// 試合数カウントアップ
	gameCount ++;
	
	// プレイヤーチームを9人にする
	while(playerTeam.members.length > 9){
		playerTeam.members.pop();
	}
	
	// 対戦相手チーム編成
	opponentTeam = new Team();
	opponentTeam.team_name = word_opponent_team_name;
	
	// ボスかどうか
	var bossAdjust = 1;
	if(getEncountBoss()){
		bossAdjust = 1.3;
	}
	
	for(var i=0; i<9; i++){
		var newMember = new Member();
		
		// 能力値決定
		newMember.avg = getCPUStatus(bossAdjust);
		newMember.risp = getCPUStatus(bossAdjust);
		
		// ピッチャー
		if(game_dh == false && i==8){
			newMember.avg = getCPUStatus(0.5 * bossAdjust);
			newMember.risp = getCPUStatus(0.5 * bossAdjust);
			newMember.flg_pitcher = true;
		}
		opponentTeam.addMember(newMember);
	}
	
	// 対戦相手打順シャッフル
	opponentTeam.members.shuffle();
	
	// ボス
	if(getEncountBoss()){
		
		// チーム名
		opponentTeam.team_name = word_boss_opponent_team_name;
		
		// 打順を強い順に並べる
		opponentTeam.sortMember();
	}
	
	// 場面チェンジ
	changeScene(2);
}


//------------------
// CPUの打率取得
//------------------
function getCPUStatus(inAdjust){
	
	// 試合数に比例して強くなる
	var bottomValue = (gameCount * 0.005) + 0.1;
	var powerValue = (gameCount * 0.025) + 0.3;
	var rtnValue = getDecimal((getBiasRandom() * powerValue + bottomValue) * inAdjust, 1000);
	
	// 最大値
	if(rtnValue > 0.98){
		rtnValue = 0.98;
	}
	return rtnValue;
}

//-----------------------
// 先攻・後攻決定へ
//-----------------------
function pushFirstLastFix(){
	
	// 先攻・後攻決定
	if(Math.random() < 0.5){
		firstTeam = playerTeam;
		lastTeam = opponentTeam;
	}else{
		firstTeam = opponentTeam;
		lastTeam = playerTeam;
	}
	
	// 場面チェンジ
	changeScene(3);
}

//--------------
// 試合勝利時
//--------------
function pushWin(){
	
	// 勝利数カウント
	game_records_win_count ++;
	
	// 実績解除（合計100勝）
	if(game_records_win_count == 100){
		unlockAchievement("100win_total");
	}
	
	// ゲーム数記録等更新
	updateRecords();
	
	// 場面チェンジ
	changeScene(6);
}

//--------------
// 試合勝利時
//--------------
function pushRematch(){
	
	// ゲーム数記録等更新
	updateRecords();
	
	// 試合情報クリア
	clearGameInfo();
	
	// 場面チェンジ
	startGame();
}

//--------------
// 試合敗北時
//--------------
function pushLose(){
	
	// 試合情報をクリア
	clearGameInfo();
	
	// ゲーム結果表示
	$("#game_result_score").html((gameCount - 1) + " WIN");
	var gameResult = $("#game_result");
	gameResult.show();
	gameResult.css({"margin-top":"-20px", "opacity":0});
	gameResult.animate({"margin-top":"0px", "opacity":1}, "fast");
	
	//---------------
	// 統計情報更新
	//---------------
	// 日付
	var now = new Date();
	
	// 履歴
	game_history.splice(0, 0, [dateFormat(now, "MM/DD HH:MI"), gameCount - 1]);
	if(game_history.length >= 10){
		game_history.pop();
	}
	
	// TOP10
	game_top10.splice(0, 0, [dateFormat(now, "YY/MM/DD"), gameCount - 1]);
	game_top10.sort(function(a,b){
		if(a[1] < b[1])return 1;
		if(a[1] > b[1])return -1;
		if(a[0] < b[0])return -1;
		if(a[0] > b[0])return 1;
		return 0;
	});
	if(game_top10.length >= 10){
		game_top10.pop();
	}
	
	// 一番打ったor打点選手取得
	var exciteHitMember = new Member();
	var exciteRbiMember = new Member();
	for(var i=0; i<playerTeam.members.length; i++){
		if(playerTeam.members[i].total_hit > exciteHitMember.total_hit){
			exciteHitMember = playerTeam.members[i];
		}
		if(playerTeam.members[i].total_rbi > exciteRbiMember.total_rbi){
			exciteRbiMember = playerTeam.members[i];
		}
	}
	
	// 1ゲーム最高安打更新
	if(exciteHitMember.total_hit > game_records_hit_try[0]){
		game_records_hit_try[0] = exciteHitMember.total_hit;
		game_records_hit_try[1] = exciteHitMember.member_name;
		$("#records_hit_try").css("color", "red");
	}
	
	// 1ゲーム最高打点更新
	if(exciteRbiMember.total_rbi > game_records_rbi_try[0]){
		game_records_rbi_try[0] = exciteRbiMember.total_rbi;
		game_records_rbi_try[1] = exciteRbiMember.member_name;
		$("#records_rbi_try").css("color", "red");
	}
	
	//-----------
	// 実績解除
	//-----------
	// 3勝
	if(gameCount > 3){
		unlockAchievement("3win_try");
	}
	// 6勝
	if(gameCount > 6){
		unlockAchievement("6win_try");
	}
	// 10勝
	if(gameCount > 10){
		unlockAchievement("10win_try");
	}
	// 20安打
	if(game_records_hit_try[0] >= 20){
		unlockAchievement("20hit_try");
	}
	// 20打点
	if(game_records_rbi_try[0] >= 20){
		unlockAchievement("20rbi_try");
	}
	
	// データ保存
	saveGame();
	
	// 再表示
	updateStatistics();
	
	// 場面チェンジ
	changeScene(0);
}

//--------------
// 勝利ボーナス
//--------------
function pushBonus(){
	
	// コイン追加
	var getCoin = 0;
	if(firstTeam.flg_player){
		getCoin = firstScore;
	}else{
		getCoin = lastScore;
	}
	addCoin(getCoin);
	
	// 1～3番のランダムな選手の能力向上
	var memberIdx = Math.floor(Math.random()*3);
	var addStatus = Math.random() > 0.5 ? "avg" : "risp";
	var increase = getDecimal(Math.random() * 0.1 + 0.05, 1000);
	
	// 成長調整
	increase = increase * Math.pow(Math.cos(1.571 * playerTeam.members[memberIdx][addStatus]), 2) / 0.98;
	if(increase < 0){
		increase = 0;
	}
	
	// 向上実行
	if(addStatus == "avg"){
		playerTeam.members[memberIdx].addAvg(increase);
	}else{
		playerTeam.members[memberIdx].addRisp(increase);
	}
	
	// 実績解除（育成選手の打率0.3オーバー）
	if(playerTeam.members[memberIdx].flg_dev && playerTeam.members[memberIdx].avg >= 0.3){
		unlockAchievement("dev_success");
	}
	
	// 能力向上のエフェクト
	var targetStatus = $("#first_team_list .cell_" + addStatus).eq(memberIdx);
	var effectIncrease = $("<div>", {class:"effect_increase", text:"+" + getDispRatio(increase), width:100});
	var centerLeft = targetStatus.position().left + (targetStatus.width()/2) - (effectIncrease.width()/2);
	effectIncrease.css({left:centerLeft, top:targetStatus.position().top});
	effectIncrease.animate({"margin-top":"-10px", "opacity":0}, 5000, "linear");
	effectIncrease.queue(function(){$(this).remove();});
	$("body").append(effectIncrease);
	
	// 対戦相手の中からランダムにトレード選手選択（上位5名の誰か）
	opponentTeam.sortMember();
	var tradeMember = opponentTeam.members[Math.floor(Math.random()*5)];
	tradeMember.flg_pitcher = false;
	playerTeam.addMember(tradeMember);
	
	// プレイヤーチーム描画
	updateTeamMembers(playerTeam, "first");
	
	// 並べ替えON
	teamSortable(true);
	
	// 場面
	changeScene(1);
}

//------------------------------------------------------
// 場面チェンジ
// 0:ロード時、ゲームオーバー時
// 1:打順替え
// 2:対戦相手確認
// 3:先攻後攻確認
// 4:試合中
// 5:試合結果
// 6:ボーナス取得前
//------------------------------------------------------
function changeScene(inScene){
	
	// 場面を記憶
	gameScene = inScene;
	
	// 中断or続きボタン
	var continueButton = $("#continue_button");
	if(inScene == 0){
		
		// 前回の続きボタン
		continueButton.html(word_button_continue);
		continueButton.off("click");
		continueButton.on("click", loadContinue);
		continueButton.attr("disabled", Boolean(window.localStorage.getItem("bob_continue")) == false);
		
	}else{
		// ゲーム中断ボタン
		continueButton.html(word_button_outofplay);
		continueButton.off("click");
		continueButton.on("click", saveContinue);
		continueButton.attr("disabled", false);
	}
	
	// ショップボタン
	var shopButton = $("#shop_button");
	if(inScene == 0){
		shopButton.attr("disabled", Boolean(window.localStorage.getItem("bob_continue"))); // 前回の続きがある場合は不可
	}else{
		shopButton.attr("disabled", true);
	}
	
	// DH制
	var chkDh = $("#chk_dh");
	var labelDh = $("#label_dh");
	if(inScene == 0){
		
		// DH制変更可
		chkDh.attr("disabled", false);
		labelDh.css("color", "#FFF");
	}else{
		// DH制変更不可
		chkDh.attr("disabled", true);
		labelDh.css("color", "#666");
	}
	
	// 場面で分岐
	switch(inScene){
		
		//----------------------------
		// ロード時、ゲームオーバー時
		//----------------------------
		case 0:
			// 画面表示
			changeScreen(0);
			
			// ゲームボタン更新
			updateGameButton(null, null, false, word_button_empty, 0);
			break;
			
		//----------
		// 打順替え
		//----------
		case 1:
			// 画面表示
			changeScreen(1);
			
			// プレイヤーチーム描画
			updateTeamMembers(playerTeam, "first");
			
			// ゲームボタン更新
			updateGameButton(pushOrderComplete, null, true, word_button_order_trade_complete, 1000);
			
			// 並べ替えON
			teamSortable(true);
			
			break;
			
		//--------------
		// 対戦相手確認
		//--------------
		case 2:
			// 画面表示
			changeScreen(2);
			
			// 両チーム描画
			updateTeamMembers(playerTeam, "first");
			updateTeamMembers(opponentTeam, "last");
			
			// 試合数表示
			$("#game_count").html(gameCount);
			
			// ゲームボタン更新
			updateGameButton(pushFirstLastFix, null, true, word_button_first_last_fix, 0);
			
			// 並べ替えOFF
			teamSortable(false);
			
			break;
			
		//--------------
		// 先攻後攻確認
		//--------------
		case 3:
			// 画面表示
			changeScreen(3);
			
			// 両チーム描画
			updateTeamMembers(firstTeam, "first");
			updateTeamMembers(lastTeam, "last");
			
			// 試合数表示
			$("#game_count").html(gameCount);
			
			// スコアボードチーム名描画
			$("#score_first_team_name").html(firstTeam.team_name);
			$("#score_last_team_name").html(lastTeam.team_name);
			
			// ゲームボタン更新
			updateGameButton(startGame, null, true, word_button_game_start, 0);
			
			break;
			
		//--------------
		// 試合中
		//--------------
		case 4:
			// 画面表示
			changeScreen(4);
			
			// 両チーム描画
			updateTeamMembers(firstTeam, "first");
			updateTeamMembers(lastTeam, "last");
			
			// 試合数表示
			$("#game_count").html(gameCount);
			
			// スコアボードチーム名描画
			$("#score_first_team_name").html(firstTeam.team_name);
			$("#score_last_team_name").html(lastTeam.team_name);
			
			// 進塁状態を表示
			$("#base_state_img").attr("src", "./img/base" + baseState + ".png");
			
			// アウトカウント表示
			$("#out_img").attr("src", "./img/out" + outCount + ".png");
			
			// バッターアイコン更新
			$("#batter_icon").css("visibility", "visible");
			updateBatterIcon();
			
			// 得点表示更新
			updateScore();
			if(topBottom == 0){
				$(".score_first").eq(inning).html("");
			}else{
				$(".score_last").eq(inning).html("");
			}
			
			// イニングと表裏表示更新
			updateInningTopBottom();
			
			// 試合開始
			addMessage(word_game_start, "detail_message_record");
			
			// ボタン準備
			stopTurnInterval();
			
			break;
			
		//--------------
		// 試合結果
		//--------------
		case 5:
			// 画面表示
			changeScreen(3);
			
			// 両チーム描画
			updateTeamMembers(firstTeam, "first");
			updateTeamMembers(lastTeam, "last");
			
			// 合計得点表示
			$("#first_score").html(firstScore);
			$("#total_score_first").html(firstScore);
			$("#last_score").html(lastScore);
			$("#total_score_last").html(lastScore);
			
			// 合計安打表示
			$("#total_hit_first").html(firstTotalHit);
			$("#total_hit_last").html(lastTotalHit);
			
			// バッターアイコン消す
			$("#batter_icon").css("visibility", "hidden");
			
			// 試合終了表示
			$("#inning_count").html(word_game_finish);
			
			// 試合終了メッセージ表示
			addMessage(word_game_finish + " [" + firstScore + "-" + lastScore + "]", "detail_message_record");
			
			// プレイヤーが勝ったかどうか
			var playerWin = (firstScore > lastScore && firstTeam.flg_player) || (lastScore > firstScore && lastTeam.flg_player);
			
			// 引き分け時
			if(firstScore == lastScore){
				updateGameButton(pushRematch, null,  true, word_button_rematch, 1000);
				
			// プレイヤー勝利時
			}else if(playerWin){
				updateGameButton(pushWin, null, true, word_button_win, 1000);
				
			// プレイヤー敗北時
			}else{
				updateGameButton(pushLose, null,  true, word_button_lose, 1000);
			}
			
			break;
			
		//-----------------
		// ボーナス取得前
		//-----------------
		case 6:
			// 試合情報をクリア
			clearGameInfo();
			
			// プレイヤーチーム描画
			updateTeamMembers(playerTeam, "first");
			
			// ゲームボタン更新
			updateGameButton(pushBonus, null, true, word_button_bonus, 0);
			
			// 画面表示
			changeScreen(1);
			
			break;
	}
}

//------------------------------------------------------
// 画面表示切り替え
// 0:まっさら（ロード時）
// 1:プレイヤーチームとボタンのみ（打順変更等）
// 2:両チームとボタンのみ（対戦相手確認等）
// 3:アイテムボタン以外全部（試合直前）
// 4:フル（試合中）
//------------------------------------------------------
function changeScreen(inType){
	
	var firstTeamInfo		= $("#first_team_info");
	var lastTeamInfo		= $("#last_team_info");
	var gameCountCaption	= $("#game_count_caption");
	var gameButton			= $("#game_button");
	var gameInfo			= $("#game_info");
	var itemButton			= $("#item_button");
	
	switch(inType){
		case 0:
			firstTeamInfo.css("visibility", "hidden");
			lastTeamInfo.css("visibility", "hidden");
			gameCountCaption.css("visibility", "hidden");
			gameButton.css("visibility", "hidden");
			gameInfo.css("visibility", "hidden");
			itemButton.css("visibility", "hidden");
			break;
			
		case 1:
			firstTeamInfo.css("visibility", "visible");
			lastTeamInfo.css("visibility", "hidden");
			gameCountCaption.css("visibility", "hidden");
			gameButton.css("visibility", "visible");
			gameInfo.css("visibility", "hidden");
			itemButton.css("visibility", "hidden");
			break;
			
		case 2:
			firstTeamInfo.css("visibility", "visible");
			lastTeamInfo.css("visibility", "visible");
			gameCountCaption.css("visibility", "visible");
			gameButton.css("visibility", "visible");
			gameInfo.css("visibility", "hidden");
			itemButton.css("visibility", "hidden");
			break;
			
		case 3:
			firstTeamInfo.css("visibility", "visible");
			lastTeamInfo.css("visibility", "visible");
			gameCountCaption.css("visibility", "visible");
			gameButton.css("visibility", "visible");
			gameInfo.css("visibility", "visible");
			itemButton.css("visibility", "hidden");
			hideInventory();
			break;
			
		case 4:
			firstTeamInfo.css("visibility", "visible");
			lastTeamInfo.css("visibility", "visible");
			gameCountCaption.css("visibility", "visible");
			gameButton.css("visibility", "visible");
			gameInfo.css("visibility", "visible");
			itemButton.css("visibility", "visible");
			break;
	}
}

//----------------------------------------------------------------------------------
// ゲームボタン更新
// （左クリックfunc, 右クリックfunc, 有効無効, ボタン名, 反映時間）
//----------------------------------------------------------------------------------
var buttonTimeoutFunc;
function updateGameButton(inLeftClickFunc, inRightClickFunc, inEnable, inValue, inWait){
	
	// ゲームボタンエレメント
	var gameButton = $("#game_button");
	
	// ウェイト有りの場合、一旦無効化
	if(inWait > 0){
		gameButton.html(word_button_empty);
		gameButton.attr("disabled", true);
		gameButton.off("click");
		gameButton.off("contextmenu");
	}
	
	// 一定時間後に有効
	clearTimeout(buttonTimeoutFunc);
	buttonTimeoutFunc = setTimeout(function(){
		gameButton.html(inValue);
		gameButton.off("click");
		gameButton.off("contextmenu");
		gameButton.on("click", inLeftClickFunc);
		gameButton.on("contextmenu", inRightClickFunc);
		gameButton.attr("disabled", !inEnable);
	}, inWait);
}

//------------------
// チーム選手描画
//------------------
function updateTeamMembers(inTeam, inFirstOrLast){
	
	// 対象の方のリスト
	var teamList = $("#" + inFirstOrLast + "_team_list");
	
	// 一旦クリア
	teamList.empty();
	
	// 打順をキーとした打率、得点圏打率の配列
	var aryAvg = [];
	var aryRisp = [];
	
	// チーム名
	$("#" + inFirstOrLast + "_team_name").html(inTeam.team_name);
	
	// 描画
	for(var i=0; i<inTeam.members.length; i++){
		
		// 名前
		var spanName = $("<span>", {class:"name_text", text:inTeam.members[i].member_name});
		var divName = $("<div>", {class:"team_list_td cell_name"});
		if(inTeam.members[i].flg_pitcher){
			divName.append($("<span>", {text:word_pitcher}));
		}
		if(inTeam.members[i].flg_dev){
			divName.append($("<span>", {text:word_development}));
		}
		divName.append(spanName);
		
		// レコード内容編集
		var record = $("<div>",{class:"team_list_record"});
		record.append($("<div>",{text:String(i+1),									class:"team_list_td cell_order"}));
		record.append(divName);
		record.append($("<div>",{text:getDispRatio(inTeam.members[i].avg),			class:"team_list_td cell_avg"}));
		record.append($("<div>",{text:getDispRatio(inTeam.members[i].risp),			class:"team_list_td cell_risp"}));
		
		// トレード枠
		if(i>8){
			record.find(".cell_order").html("X");
			record.find("div").addClass("trade");
		}
		
		// 対戦相手
		if(inTeam.flg_player == false){
			
			// ボスの場合
			if(getEncountBoss()){
				record.find("div").addClass("boss_opponent");
				
			// それ以外
			}else{
				record.find("div").addClass("opponent");
			}
		}
		
		// 画面に追加
		teamList.append(record);
		
		// リストに追加
		aryAvg.push({"order":i, "value":inTeam.members[i].avg});
		aryRisp.push({"order":i, "value":inTeam.members[i].risp});
	}
	
	// リストを降順でソート
	aryAvg.sort(function(a,b){
		if(a["value"] < b["value"])return 1;
		if(a["value"] > b["value"])return -1;
		return 0;
	});
	aryRisp.sort(function(a,b){
		if(a["value"] < b["value"])return 1;
		if(a["value"] > b["value"])return -1;
		return 0;
	});
	
	// 上位3名分の値を赤くする
	var color1 = "#F00";
	var color2 = "#D00";
	var color3 = "#B00";
	if(inTeam.flg_player == false){
		color1 = "#F88";
		color2 = "#FAA";
		color3 = "#FCC";
	}
	
	var avgList = teamList.find(".cell_avg");
	var rispList = teamList.find(".cell_risp");
	if(aryAvg.length >= 3){
		avgList.eq(aryAvg[0]["order"]).css("color", color1);
		avgList.eq(aryAvg[1]["order"]).css("color", color2);
		avgList.eq(aryAvg[2]["order"]).css("color", color3);
	}
	if(rispList.length >= 3){
		rispList.eq(aryRisp[0]["order"]).css("color", color1);
		rispList.eq(aryRisp[1]["order"]).css("color", color2);
		rispList.eq(aryRisp[2]["order"]).css("color", color3);
	}
	
	//-----------------------------------------
	// プレイヤーチームの個人成績ポップアップ
	// 打順操作時はやらない
	//-----------------------------------------
	if(inTeam.flg_player && gameScene != 1){
		
		var teamListRecords = teamList.find(".team_list_record");
		var memberInfoPopup = $("#member_info_popup");
		
		teamListRecords.on({
			
			// カーソル合わせ時、情報を表示
			mouseenter : function(e){
				var memberIdx = teamListRecords.index(this);
				setMemberInfoText(inTeam.members[memberIdx]);
			},
			// カーソル外し時、ポップアップを消す
			mouseleave : function(e){
				memberInfoPopup.css({left:-1000 , top:-1000});
			},
			// マウスムーブ時、ポップアップ追従
			mousemove : function(e){
				memberInfoPopup.css({left:e.clientX + 20 , top:e.clientY});
			}
		});
	}
}

//--------------------------
// 個人成績のテキストセット
//--------------------------
function setMemberInfoText(inMember){
	var memberInfoName			= $("#member_info_name");
	var memberInfoAvg			= $("#member_info_avg");
	var memberInfoRisp			= $("#member_info_risp");
	var memberInfoTotalHit		= $("#member_info_total_hit");
	var memberInfoTotalRbi		= $("#member_info_total_rbi");
	var memberInfoTotalHr		= $("#member_info_total_hr");
	var memberInfoTotalGame		= $("#member_info_total_game");
	memberInfoName.html(inMember["member_name"]);
	memberInfoAvg.html(getDispRatio(inMember["avg"]));
	memberInfoRisp.html(getDispRatio(inMember["risp"]));
	memberInfoTotalHit.html(inMember["total_hit"]);
	memberInfoTotalRbi.html(inMember["total_rbi"]);
	memberInfoTotalHr.html(inMember["total_hr"]);
	memberInfoTotalGame.html(inMember["total_game"]);
}

//--------------------------
// ボスエンカウントチェック
//--------------------------
function getEncountBoss(){
	
	if(gameCount >= 10){
		if(gameCount%5 == 0){
			return true;
		}
	}
	
	return false;
}

//------------------
// 並べ替えON/OFF
//------------------
function teamSortable(inBoolean){
	
	var firstTeamList = $("#first_team_list");
	var nameTextList = firstTeamList.find(".name_text");
	
	// 一旦OFFにする
	// 並べ替えOFF
	firstTeamList.sortable("disable");
	firstTeamList.css("cursor", "default");
	firstTeamList.find(".team_list_record").off("mouseenter.sortable");
	firstTeamList.find(".team_list_record").off("mouseleave.sortable");
	
	// 名称変更OFF
	nameTextList.css("cursor", "default");
	nameTextList.off("mouseenter");
	nameTextList.off("mouseleave");
	nameTextList.off("click");
		
	// ON
	if(inBoolean){
		
		// 並べ替えON
		firstTeamList.sortable("enable");
		firstTeamList.css("cursor", "move");
		firstTeamList.find(".team_list_record").on("mouseenter.sortable", function(){
			$(this).find("div").addClass("ondrag");
		});
		firstTeamList.find(".team_list_record").on("mouseleave.sortable", function(){
			$(this).find("div").removeClass("ondrag");
		});
		
		// 名称変更ON
		nameTextList.css("cursor", "pointer");
		nameTextList.on("mouseenter", function(){
			$(this).css("background-color", "#0CF");
		});
		nameTextList.on("mouseleave", function(){
			$(this).css("background-color", "");
		});
		nameTextList.on("click", function(){
			
			// 要素再取得
			firstTeamList = $("#first_team_list");
			nameTextList = firstTeamList.find(".name_text");
			
			var memberIdx = nameTextList.index(this);
			var newName = prompt(word_confirm_member_name, playerTeam.members[memberIdx]["member_name"]);
			if(newName){
				newName = newName.replace("　", " ").replace(/(^\s+)|(\s+$)/g, "");
				if(newName){
					playerTeam.members[memberIdx]["member_name"] = newName;
					nameTextList.eq(memberIdx).html(newName);
				}
			}
		});
	}
}

//--------------------
// 育成選手の打順記憶
//--------------------
function saveDevOrder(){
	
	// 初期化
	devOrderIds = [];
	for(var i=0; i<20; i++){
		devOrderIds.push(0);
	}
	
	// 育成選手のIDを打順に記録
	for(var i=0; i<playerTeam.members.length; i++){
		if(playerTeam.members[i].flg_dev){
			devOrderIds[i] = playerTeam.members[i].id;
		}
	}
}

//--------------------
// 育成選手の打順再現
//--------------------
function loadDevOrder(){
	
	for(var orderIdx=0; orderIdx<devOrderIds.length; orderIdx++){
		if(devOrderIds[orderIdx] == 0){
			continue;
		}
		
		// IDが設定されてたら該当育成選手と入替
		for(var devMemberIdx=0; playerTeam.members.length; devMemberIdx++){
			if(devOrderIds[orderIdx] == playerTeam.members[devMemberIdx].id){
				
				// DOMとデータ入れ替え
				$("#first_team_list .team_list_record").eq(devMemberIdx).insertBefore($("#first_team_list .team_list_record").eq(orderIdx));
				replacePlayerTeamOrder(devMemberIdx, orderIdx);
				break;
			}
		}
	}
}

//-----------------------
// ゲーム全般データ表示
//-----------------------
function updateStatistics(){
	
	// コイン
	addCoin(0);
	
	// 履歴
	var historyList = $("#history_list");
	historyList.empty();
	for(var i=0; i<game_history.length; i++){
		var div = $("<div>", {class:"result_record", text:game_history[i][0] + " " + game_history[i][1] + "WIN"});
		historyList.append(div);
	}
	
	// トップ10
	var top10List = $("#top10_list");
	top10List.empty();
	for(var i=0; i<game_top10.length; i++){
		var div = $("<div>", {class:"result_record", text:game_top10[i][0] + " " + game_top10[i][1] + "WIN"});
		top10List.append(div);
	}
	
	// ゲーム数記録等更新
	updateRecords();
}

//----------
// 実績解除
//----------
function unlockAchievement(inKey){
	
	// 解除済みの場合は何もしない
	if(achievement[inKey]){
		return;
	}
	
	// 解除
	achievement[inKey] = true;
	
	// 全実績解除時、最後の実績解除
	var existLock = false;
	for(var itemKey in achievement){
		if(itemKey == "complete"){
			continue;
		}
		if(achievement[itemKey] == false){
			existLock = true;
			break;
		}
	}
	if(existLock == false){
		achievement["complete"] = true;
	}
	
	// 再表示
	updateAchievement();
}

//---------------------
// 実績状況表示
//---------------------
function updateAchievement(){
	
	var achievementList = $("#achievement_list");
	achievementList.empty();
	var itemCount = 0;
	var befKey = "";
	for(var itemKey in achievement){
		
		// アイコン表示
		var div_ac = $("<div>", {class:"result_achievement"});
		
		// 解除済みの場合
		if(achievement[itemKey]){
			div_ac.addClass("unlock");
			div_ac.css("background-image", "url('./img/achievement_" + itemKey + ".png')");
			div_ac.attr("title", "[" + word_achievement_hash[itemKey][0] + "] \n" + word_achievement_hash[itemKey][1]);
			
		// ロックの場合
		}else{
			
			// 前の実績が解除されてたら説明ON
			if(befKey == "" || achievement[befKey] == true){
				div_ac.attr("title", word_achievement_hash[itemKey][1]);
			}else{
				div_ac.attr("title", "???");
			}
		}
		
		// 前のキー
		befKey = itemKey;
		
		// 実績に追加
		achievementList.append(div_ac);
		
		// 改行
		itemCount ++;
		if(itemCount%4 == 0){
			achievementList.append("<br>");
		}
	}
	
	//-------------------
	// 機能ロックと解除
	//-------------------
	// 試合スキップ
	if(achievement["3win_try"]){
		$("#rad_skip3").attr("disabled", false);
		$("#label_skip3").css("color", "#FFF");
	}else{
		$("#rad_skip3").attr("disabled", true);
		$("#label_skip3").css("color", "#666");
	}
	
	// 育成
	var devNum = 0;
	if(achievement["6win_try"]){
		devNum ++;
	}
	if(achievement["100win_total"]){
		devNum ++;
	}
	if(achievement["dev_success"]){
		devNum ++;
	}
	for(var i=devTeam.members.length; i<devNum; i++){
		var newDevMember = new Member();
		newDevMember.id = new_dev_member_id++;
		newDevMember.avg = 0;
		newDevMember.risp = 0;
		newDevMember.flg_dev = true;
		devTeam.addMember(newDevMember);
	}
}

//-----------------------
// ゲーム全般データ表示
//-----------------------
function updateRecords(){
	$("#records_try_count").html(game_records_try_count);
	$("#records_game_count").html(game_records_game_count);
	$("#records_win_count").html(game_records_win_count);
	$("#records_pt_inning").html(game_records_pt_inning);
	$("#records_pt_game").html(game_records_pt_game);
	$("#records_hit_try").html(game_records_hit_try[0] + "(" + game_records_hit_try[1] + ")");
	$("#records_rbi_try").html(game_records_rbi_try[0] + "(" + game_records_rbi_try[1] + ")");
}

//-----------------
// 統計の色を戻す
//-----------------
function resetRecordsColor(){
	$("#records_pt_inning").css("color", "#000");
	$("#records_pt_game").css("color", "#000");
	$("#records_hit_try").css("color", "#000");
	$("#records_rbi_try").css("color", "#000");
}

//------------------
// 設定ボタン押下時
//------------------
function pushConfig(){
	$("#config").slideToggle("normal");
}

//------------------------------
// ゲーム結果OKボタン押下時
//------------------------------
function pushResultOk(){
	var gameResult = $("#game_result");
	gameResult.css({"margin-top":"0px", "opacity":1});
	gameResult.animate({"margin-top":"-20px", "opacity":0, "display":"none"}, "fast", function(){$(this).hide();});
	
	// 試合カウント初期化
	gameCount = 0;
	
	// 統計の色を戻す
	resetRecordsColor();
}

//------------------------------
// フッタ非表示ボタン押下時
//------------------------------
function pushHideFooter(){
	$("#footer_show_button").show();
	$("#footer").slideUp("normal", function(){
		$("#main").css("padding-bottom" , 0);
	});
}

//------------------------------
// フッタ表示ボタン押下時
//------------------------------
function pushShowFooter(){
	$("#main").css("padding-bottom" , 260);
	$("#footer").slideDown("normal", function(){
		$("#footer_show_button").hide();
	});
}

//-------------------
// 説明ボタン押下時
//-------------------
function pushAbout(){
	
	var gameAbout = $("#game_about");
	
	// 説明ウィンドウ消去
	if(gameAbout.css("display") == "block"){
		gameAbout.css({"margin-top":"0px", "opacity":1});
		gameAbout.animate({"margin-top":"-20px", "opacity":0, "display":"none"}, "fast", function(){$(this).hide();});
		
	// 説明ウィンドウ表示
	}else{
		gameAbout.show();
		gameAbout.css({"margin-top":"-20px", "opacity":0});
		gameAbout.animate({"margin-top":"0px", "opacity":1}, "fast");
	}
}

//-------------------------
// つぶやきボタン押下時
//-------------------------
function pushTweet(){
	var strScore = gameCount - 1 + "WIN : ";
	window.open("http://twitter.com/intent/tweet?original_referer=" + word_game_url + "&url=" + word_game_url + "&text=" + strScore + word_game_title, "a", "width=550,height=480,left=200,top=200,scrollbars=1,resizable=1");
}

//----------------------
// コイン追加と表示
//----------------------
function addCoin(inNum){
	
	// 追加
	game_coin += Number(inNum);
	
	// 表示
	var coinElement = $("#coin");
	coinElement.html(game_coin + " coin");
	
	// 追加時エフェクト
	if(inNum > 0){
		var effectIncrease = $("<div>", {class:"effect_coin", text:"+" + inNum + " coin", width:100});
		effectIncrease.css({left:coinElement.position().left, top:coinElement.position().top - 5});
		effectIncrease.animate({"margin-top":"-10px", "opacity":0}, 5000, "linear");
		effectIncrease.queue(function(){$(this).remove();});
		$("body").append(effectIncrease);
	}
}
