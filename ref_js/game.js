//========================
// 試合処理
//========================
// 安打内訳
var normalHitRatio	= [0.66, 0.82, 0.84, 1, "normal"];			// 通常時。打席数歴代上位10名の平均値
var longHitRatio	= [0.16, 0.56, 0.6, 1, "long"];				// 長打期待の場合
var hitRatio		= normalHitRatio;							// ゲーム内で使用するもの

// 試合変数
var attackTeam = new Team();	// 攻撃中のチーム
var firstTeam = new Team();		// 先攻のチーム
var lastTeam = new Team();		// 後攻のチーム
var attackBatterIndex = 0;		// 攻撃中の打者の順番
var firstBatterIndex = 0;		// 先攻の打者の順番
var lastBatterIndex = 0;		// 後攻の打者の順番
var inning = 0;					// イニング
var topBottom = 0;				// 表裏（0:表、1:裏）
var outCount = 0;				// アウトカウント
var baseState = "000";			// ベース状況（0:ランナー無し、1:ランナー有り）
var firstScore = 0;				// 先攻の得点
var lastScore = 0;				// 後攻の得点
var inningScore = 0;			// イニング得点
var firstTotalHit = 0;			// 先攻の安打数
var lastTotalHit = 0;			// 後攻の安打数
var flgGameFinish = false;		// 試合が終了してるかどうか

// インターバル
var turnInterval;
var skip_timing = "turn";		// スキップするタイミング（turn:打席、team:攻撃、game:試合）
var stop_base = 2;				// 停止するベース状況（1,2,3,0）
var stop_lead = 3;				// 停止する点差
var flg_stop_next = false;		// 次の打席を見守るかどうか
var interval_wait = 50;			// インターバル間隔

// アイテム用変数
var flgDouble = false;			// 併殺狙いフラグ
var flgRelief = false;			// 投手交代フラグ

//-------------
// 試合開始
//-------------
function startGame(){
	
	// 初期化
	attackBatterIndex = 0;
	firstBatterIndex = 0;
	lastBatterIndex = 0;
	inning = 0;	
	topBottom = 0;
	outCount = 0;
	baseState = "000"
	firstScore = 0;
	lastScore = 0;
	inningScore = 0;
	firstTotalHit = 0;
	lastTotalHit = 0;
	flgGameFinish = false;
	flg_stop_next = false;
	
	// プレイヤーチーム選手の試合出場数をカウント
	for(var i=0; i<playerTeam.members.length; i++){
		playerTeam.members[i].incrementTotalGame();
	}
	
	// 先攻の攻撃
	attackTeam = firstTeam;
	
	// 試合数カウント
	game_records_game_count ++;
	
	// 記録の色を戻す
	resetRecordsColor();
	
	// 場面
	changeScene(4);
}

//-----------------
// 試合情報をクリア
//-----------------
function clearGameInfo(){
	
	// ベースクリア
	clearBase();
	
	// バッターアイコン
	$("#batter_icon").css("visibility", "hidden");
	
	// バッター打席結果アイコン削除
	$(".batter_result_icon0").remove();
	$(".batter_result_icon1").remove();
	
	// アウトカウント表示
	$("#out_img").attr("src", "./img/out0.png");
	
	// チーム名の攻撃表示解除
	$("#first_team_name").css("border-left", "0px");
	$("#last_team_name").css("border-left", "0px");
	
	// 得点表示
	$("#first_score").html("");
	$("#total_score_first").html("");
	$("#last_score").html("");
	$("#total_score_last").html("");
	
	// イニング表示
	$("#inning_count").html("");
	
	// スコアボードのイニングの色戻す
	$(".score_first").css("background-color", "#EEE");
	$(".score_last").css("background-color", "#EEE");
	
	// スコアボード点数クリア
	$(".score_first").html("");
	$("#total_score_first").html("");
	$("#total_hit_first").html("");
	$(".score_last").html("");
	$("#total_score_last").html("");
	$("#total_hit_last").html("");
	
	// 延長スコア表示隠す
	$(".extension_th").hide();
	$(".extension_first_td").hide();
	$(".extension_last_td").hide();
	
	// メッセージクリア
	$("#detail_message_list").empty();
}

//----------------------
// 打席インターバル開始
//----------------------
function startTurnInterval(){
	
	// 打席ごとの場合はウェイトなし
	if(skip_timing == "turn"){
		turn();
		
	// インターバル開始
	}else{
		turnInterval = setInterval(turn, interval_wait);
		
		// ボタン
		updateGameButton(stopTurnInterval, null, true, word_button_stop, 0);
	}
}


//-----------------------
// 打席インターバル中断
//-----------------------
function stopTurnInterval(){
	
	// インターバル解除
	clearInterval(turnInterval);
	
	// ボタン
	updateGameButton(startTurnInterval, turn, true, word_button_next, 0);
}

//------------
// 打席処理
//------------
function turn(){
	
	//----------------
	// ヒットかどうか
	//----------------
	var hitResult = false;
	
	// 得点圏内のランナーがいる場合、得点圏打率で計算
	if(baseState.charAt(0) == "1" || baseState.charAt(1) == "1"){
		if(Math.random() < attackTeam.members[attackBatterIndex].risp){
			hitResult = true;
		}
		
	// 得点圏内にランナーがいない場合、打率で計算
	}else{
		if(Math.random() < attackTeam.members[attackBatterIndex].avg){
			hitResult = true;
		}
	}
	
	//---------------
	// ヒットの場合
	//---------------
	var hitBase = 0;
	if(hitResult){
		
		// 何ベースヒットか
		var rand = Math.random();
		if(rand < hitRatio[0]){
			hitBase = 1;
		}else if(rand < hitRatio[1]){
			hitBase = 2;
		}else if(rand < hitRatio[2]){
			hitBase = 3;
		}else if(rand < hitRatio[3]){
			hitBase = 4;
			
			// 実績解除（ピッチャーがHR）
			if(attackTeam.flg_player && attackTeam.members[attackBatterIndex].flg_pitcher){
				unlockAchievement("hr_pitcher");
			}
			
			// HR数記録
			if(attackTeam.flg_player){
				playerTeam.members[attackBatterIndex].incrementTotalHr();
			}
		}
		
		// 打席結果をアイコンで表示
		updateBatterResult(hitBase);
		
		// ヒット前のベース状態
		var beforeBaseState = baseState;
		
		// 進塁
		var getPoint = advanceBase(hitBase);
		
		// 安打記録
		if(attackTeam.flg_player){
			playerTeam.members[attackBatterIndex].incrementTotalHit();
		}
		
		// 打点記録
		if(attackTeam.flg_player){
			playerTeam.members[attackBatterIndex].addTotalRbi(getPoint);
		}
		
		// 得点追加
		if(getPoint > 0){
			addScore(getPoint);
		}
		
		// 安打メッセージ
		var wkDetailMessage = eval("word_message_" + beforeBaseState + "_" + hitBase);
		addInGameWithNameMessage(wkDetailMessage);
		
		// 実績解除（延長回にサヨナラホームラン）
		if(inning >= 9 && hitBase == 4 && firstScore < lastScore && lastTeam.flg_player){
			unlockAchievement("12sayonara");
		}
		
		// 併殺狙いの場合解除
		if(flgDouble){
			cancelDouble();
		}
		
		// 次の打者へ
		nextBatter();
		
	//---------------
	// アウトの場合
	//---------------
	}else{
		
		// 長打期待の場合、犠牲フライの可能性
		if(hitRatio[4] == "long"){
			// 3塁ランナー有り
			if(baseState.charAt(0) == "1"){
				// アウトカウント0か1
				if(outCount < 2){
					// 一定確率で犠牲フライ成立
					if(Math.random() < 0.3){
						baseState = "0" + baseState.substr(1,2);
						updateBaseState();
						addScore(1);
						playerTeam.members[attackBatterIndex].addTotalRbi(1);	// 打点記録
						addInGameWithNameMessage(word_message_sacrifice_fly);
						
						// 併殺狙いの場合は解除
						if(flgDouble){
							cancelDouble();
						}
					}
				}
			}
		}
		
		// 併殺狙いの場合
		if(flgDouble){
			
			// 0か1アウトならランナーアウト
			if(outCount < 2){
				if(		baseState == "001")baseState = "000";
				else if(baseState == "011")baseState = "010";
				else if(baseState == "101")baseState = "100";
				else if(baseState == "111")baseState = "110";
				updateBaseState();
				addInGameWithNameMessage(word_message_double_play);
				incrementOut(false);
			}
			
			// 併殺狙い解除
			cancelDouble();
		}
		
		// バッターアウト
		incrementOut(true);
	}
	
	// 試合続行なら実行
	if(flgGameFinish == false){
		
		//-------------------
		// インターバル解除
		//-------------------
		// 打席を見守る場合
		if(flg_stop_next){
			stopTurnInterval();
			flg_stop_next = false;
		}
		
		// ベース状況で解除
		if((firstScore - lastScore < stop_lead && firstTeam.flg_player) || (lastScore - firstScore < stop_lead && lastTeam.flg_player)){
			switch(stop_base){
				case 1:
					if(baseState.indexOf("1") != -1){
						stopTurnInterval();
						flg_stop_next = true;
					}
					break;
				case 2:
					if(baseState.substr(0,2).indexOf("1") != -1){
						stopTurnInterval();
						flg_stop_next = true;
					}
					break;
				case 3:
					if(baseState.substr(0,1).indexOf("1") != -1){
						stopTurnInterval();
						flg_stop_next = true;
					}
					break;
			}
			
			// HRの時止める
			if(stop_base > 0 && hitBase == 4){
				stopTurnInterval();
			}
		}
	}
	
	// サヨナラ勝ち
	if(inning >= 8 && topBottom == 1 && lastScore > firstScore){
		changeAttack();
	}
	
	return false;
}

//------------
// 得点追加
//------------
function addScore(inGetPoint){
	
	// 得点
	inningScore += Number(inGetPoint);
	if(topBottom == 0){
		firstScore += Number(inGetPoint);
	}else{
		lastScore += Number(inGetPoint);
	}
	
	// 得点表示更新
	updateScore();
}

//------------
// 次の打者へ
//------------
function nextBatter(){
	
	// 順番を回す
	attackBatterIndex ++;
	if(attackBatterIndex > 8){
		attackBatterIndex = 0;
	}
	
	// 現在の打者を表示
	updateBatterIcon();
}

//------------
// 1アウト
//------------
function incrementOut(inBatterOut){
	
	// バッターアウトの場合、打席結果をアイコンで表示して次のバッターへ
	if(inBatterOut){
		updateBatterResult(0);
		nextBatter();
	}
	
	// アウトカウント
	outCount ++;
	
	// 3アウトチェンジ
	if(outCount >= 3){
		changeAttack();
	}
	
	// 画面に表示
	$("#out_img").attr("src", "./img/out" + outCount + ".png");
}

//-----------------
// 3アウトチェンジ
//-----------------
function changeAttack(){
	
	// インターバル解除
	if(skip_timing == "team"){
		stopTurnInterval();
	}
	
	// イニング得点記録更新
	if(attackTeam.flg_player && inningScore > game_records_pt_inning){
		game_records_pt_inning = inningScore;
		$("#records_pt_inning").html(game_records_pt_inning);
		$("#records_pt_inning").css("color", "red");
		
		// 実績解除（イニング5得点）
		if(game_records_pt_inning >= 5){
			unlockAchievement("5pt_inning");
		}
	}
	
	// イニング得点表示更新、イニングの色を戻す
	if(topBottom == 0){
		$(".score_first").eq(inning).html(inningScore);
		$(".score_first").eq(inning).css("background-color", "#EEE");
	}else{
		$(".score_last").eq(inning).html(inningScore);
		$(".score_last").eq(inning).css("background-color", "#EEE");
	}
	
	// 投手交代してたら元に戻す
	if(flgRelief){
		updateTeamMembers(firstTeam, "first");
		updateTeamMembers(lastTeam, "last");
		flgRelief = false;
	}
	
	//-----------------
	// 9回表以降の場合
	//-----------------
	if(inning >= 8){
		
		// 表終了時点で後攻が優勢だったら、試合終了
		if(topBottom == 0 && lastScore > firstScore){
			$(".score_last").eq(inning).html("X");
			flgGameFinish = true;
			
		// 裏終了時点で点差がある場合、試合終了
		}else if(topBottom == 1 && firstScore != lastScore){
			if(lastScore > firstScore){
				$(".score_last").eq(inning).append("X");
			}
			flgGameFinish = true;
			
		// 12回裏が終了したら、試合終了
		}else if(inning >= 11 && topBottom == 1){
			flgGameFinish = true;
		}
		
		// 試合終了処理
		if(flgGameFinish){
			gameFinish();
			return;
		}
		
		// 延長の場合、スコアボード追加
		if(inning == 8 && topBottom == 1){
			$(".extension_th").eq(0).show();
			$(".extension_first_td").eq(0).show();
			$(".extension_last_td").eq(0).show();
		}else if(inning == 9 && topBottom == 1){
			$(".extension_th").eq(1).show();
			$(".extension_first_td").eq(1).show();
			$(".extension_last_td").eq(1).show();
		}else if(inning == 10 && topBottom == 1){
			$(".extension_th").eq(2).show();
			$(".extension_first_td").eq(2).show();
			$(".extension_last_td").eq(2).show();
		}
	}
	
	//----------
	// 表の場合
	//----------
	if(topBottom == 0){
		
		// 先攻の打順を記憶
		firstBatterIndex = attackBatterIndex;
		
		// 後攻の攻撃に交代
		attackBatterIndex = lastBatterIndex;
		attackTeam = lastTeam;
		
		// 裏へ
		topBottom = 1;
		
	//----------
	// 裏の場合
	//----------
	}else{
		
		// 後攻の打順を記憶
		lastBatterIndex = attackBatterIndex;
		
		// 先攻の攻撃に交代
		attackBatterIndex = firstBatterIndex;
		attackTeam = firstTeam;
		
		// 次イニングの表へ
		inning ++;
		topBottom = 0;
	}
	
	// 初期化
	outCount = 0;
	inningScore = 0;
	clearBase();
	
	// イニングと表裏表示更新
	updateInningTopBottom();
	
	// 現在の打者を表示
	updateBatterIcon();
	
	// 自軍の方のバッター打席結果アイコン削除
	$(".batter_result_icon" + topBottom).remove();
}

//-----------
// 試合終了
//-----------
function gameFinish(){
	
	// インターバル中断
	stopTurnInterval();
	
	// アイテム効果解除
	resetItemEffect();
	
	// 1試合最高得点更新
	var playerScore = 0;
	if(firstTeam.flg_player){
		playerScore = firstScore;
	}else{
		playerScore = lastScore;
	}
	if(playerScore > game_records_pt_game){
		game_records_pt_game = playerScore;
		$("#records_pt_game").html(game_records_pt_game);
		$("#records_pt_game").css("color", "red");
		
		// 実績解除（1試合10点）
		if(game_records_pt_game >= 10){
			unlockAchievement("10pt_game");
		}
	}
	
	// 個人成績をプレイヤーチームに反映
	if(firstTeam.flg_player){
		playerTeam = firstTeam;
	}else{
		playerTeam = lastTeam;
	}
	
	// ゲーム数記録等更新
	updateRecords();
	
	// 場面チェンジ
	changeScene(5);
}

//---------------------------
// イニングと表裏表示更新
//---------------------------
function updateInningTopBottom(){
	
	// 表の場合
	if(topBottom == 0){
		
		// スコアボードのイニングの色
		$(".score_first").eq(inning).css("background-color", "#cee0e5");
		
		// 何回か
		$("#inning_count").html((inning + Number(1)) + word_round + word_top);
		
		// 攻撃中のチーム名にしるし
		$("#first_team_name").css("border-left", "6px solid red");
		$("#last_team_name").css("border-left", "0px");
		
	// 裏の場合
	}else{
		
		// スコアボードのイニングの色
		$(".score_last").eq(inning).css("background-color", "#cee0e5");
		
		// 何回か
		$("#inning_count").html((inning + Number(1)) + word_round + word_bottom);
		
		// 攻撃中のチーム名にしるし
		$("#first_team_name").css("border-left", "0px");
		$("#last_team_name").css("border-left", "6px solid red");
	}
}

//---------------------------------------
// バッターアイコンを現在の打者の位置へ
//---------------------------------------
function updateBatterIcon(){
	
	var batterLeft = 0;
	var batterTop = 0;
	if(topBottom == 0){
		var targetRecord =  $("#first_team_list .team_list_record").eq(attackBatterIndex);
		batterLeft = targetRecord.position().left;
		batterTop = targetRecord.position().top;
	}else{
		var targetRecord =  $("#last_team_list .team_list_record").eq(attackBatterIndex);
		batterLeft = targetRecord.position().left;
		batterTop = targetRecord.position().top;
	}
	$("#batter_icon").css({left:batterLeft - 22, top:batterTop + Number(12)});
}

//---------------------------
// 打席結果のアイコンを表示
//---------------------------
var maxResultIcon = 8;
function updateBatterResult(inHit){
	
	// 画像用意
	var batterIcon = $("#batter_icon");
	var imgElement = $("<img>", {src:"./img/hit" + inHit + ".png", style:"position:absolute", class:"batter_result_icon" + topBottom});
	imgElement.css({left:batterIcon.position().left, top:batterIcon.position().top});
	
	// 最大個数に達したら最初のを削除
	var batterResultIcons = $(".batter_result_icon" + topBottom);
	if(batterResultIcons.length >= maxResultIcon){
		batterResultIcons.eq(0).remove();
	}
	
	// 画面に追加
	$("body").append(imgElement);
}

//---------------------------
// ベース状態をクリア
//---------------------------
function clearBase(){
	baseState = "000";
	$("#base_state_img").attr("src", "./img/base" + baseState + ".png");
}

//---------------------------
// 進塁（何ベースヒットか）
// 得点を返却
//---------------------------
function advanceBase(inLength){
	
	// 返却する得点
	var rtnPoint = 0;
	
	// 安打数増加
	if(topBottom == 0){
		firstTotalHit ++;
		$("#total_hit_first").html(firstTotalHit);
	}else{
		lastTotalHit ++;
		$("#total_hit_last").html(lastTotalHit);
	}
	
	// とりあえず1塁に
	baseState += "1";
	
	// 得点した場合
	if(baseState.charAt(0) == "1"){
		rtnPoint ++;
	}
	
	// 3桁に
	baseState = baseState.substr(1,3);
	
	// ２ベース以上の場合
	for(var i=1; i<inLength; i++){
		
		// 進塁
		baseState += "0";
		
		// 得点した場合
		if(baseState.charAt(0) == "1"){
			rtnPoint ++;
		}
		
		// 3桁に
		baseState = baseState.substr(1,3);
	}
	
	// 進塁状態を表示
	updateBaseState();
	
	// 得点を返却
	return rtnPoint;
}

//---------------------
// ベース状況を描画
//---------------------
function updateBaseState(){
	if(attackTeam.flg_player){
		$("#base_state_img").attr("src", "./img/base" + baseState + ".png");
	}else{
		$("#base_state_img").attr("src", "./img/o_base" + baseState + ".png");
	}
}

//----------------
// スコア表示更新
//----------------
function updateScore(){
	
	// 合計得点
	$("#first_score").html(firstScore);
	$("#total_score_first").html(firstScore);
	$("#last_score").html(lastScore);
	$("#total_score_last").html(lastScore);
	
	// 合計安打
	$("#total_hit_first").html(firstTotalHit);
	$("#total_hit_last").html(lastTotalHit);
	
	// イニング得点
	if(topBottom == 0){
		$(".score_first").eq(inning).html(inningScore);
	}else{
		$(".score_last").eq(inning).html(inningScore);
	}
}

//-----------------
// メッセージ追加
//-----------------
function addMessage(inMessage, inClass){
	
	// div
	var divMsg = $("<div>", {class : inClass, text:inMessage});
	
	// メッセージ追加
	var detailMessageList = $("#detail_message_list");
	detailMessageList.append(divMsg);
	
	// スクロール下
	detailMessageList.scrollTop(detailMessageList[0].scrollHeight);
}

//------------------------------------------------
// 試合中のメッセージ追加（n回表裏 打者氏名付き）
//------------------------------------------------
function addInGameWithNameMessage(inMessage){
	
	// メッセージ編集
	var wkRoundTopBottom	= (inning + Number(1)) + word_round + (topBottom == 0 ? word_top : word_bottom);
	var wkName				= attackTeam.members[attackBatterIndex].member_name;
	var indexOfSpace = wkName.indexOf(" ");
	if(indexOfSpace > 0){
		wkName = wkName.substr(0, indexOfSpace);
	}
	var wkMessage			= wkRoundTopBottom + " " + wkName + " " + inMessage;
	wkMessage = wkMessage.replace("##score##", "[" + firstScore + "-" + lastScore + "]");
	
	// メッセージ追加（プレイヤーチームの場合目立たせる）
	if(attackTeam.flg_player){
		addMessage(wkMessage, "detail_message_record player_message");
	}else{
		addMessage(wkMessage, "detail_message_record");
	}
}

//----------------------------------
// 試合中のメッセージ追加（n回表裏）
//----------------------------------
function addInGameMessage(inMessage){
	
	// メッセージ編集
	var wkRoundTopBottom	= (inning + Number(1)) + word_round + (topBottom == 0 ? word_top : word_bottom);
	var wkMessage			= wkRoundTopBottom + " " + inMessage;
	wkMessage = wkMessage.replace("##score##", "[" + firstScore + "-" + lastScore + "]");
	
	// メッセージ追加（プレイヤーチームの場合目立たせる）
	if(attackTeam.flg_player){
		addMessage(wkMessage, "detail_message_record player_message");
	}else{
		addMessage(wkMessage, "detail_message_record");
	}
}

//---------------------------------------
// 設定のスキップ（ラジオボタン）押下時
//---------------------------------------
function pushRadioSkip(){
	skip_timing = $("input:radio[name='rad_skip']:checked").val();
	saveConfig();
}

//------------------------
// 設定のウェイト選択時
//------------------------
function selectWait(){
	interval_wait = Number($("#sel_wait").val());
	saveConfig();
}

//---------------------------------------
// 設定のストップ（ラジオボタン）押下時
//---------------------------------------
function pushRadioStop(){
	stop_base = Number($("input:radio[name='rad_stop']:checked").val());
	saveConfig();
}

//-------------------------------------------
// 設定の「3点リードの場合止めない」押下時
//-------------------------------------------
function pushCheckUnstopLead(){
	
	if($("#chk_lead").get(0).checked){
		stop_lead = $("#chk_lead").val();
	}else{
		stop_lead = 99999;
	}
	saveConfig();
}

//---------------------
// 設定のDH制押下時
//---------------------
function pushCheckDh(){
	game_dh = $("#chk_dh").get(0).checked;
	changeScene(0);
	saveConfig();
}


//--------------------------
// 設定のデータ削除押下時
//--------------------------
function pushDeleteData(){
	if(confirm(word_confirm_delete_data)){
		window.localStorage.removeItem("bob_data");
		window.localStorage.removeItem("bob_config");
		window.localStorage.removeItem("bob_continue");
		window.location.reload();
	}
	$("#chk_del").attr("checked", false);
}
