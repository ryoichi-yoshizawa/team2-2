//==============
// アイテム関係
//==============
// アイテム情報
var item_data = {
	"pinchHitterA"	:{"item_name":word_item_pinch_hitter_a	,	"price":5,	"caption":word_item_caption_pinch_hitter_a	},
	"pinchHitterB"	:{"item_name":word_item_pinch_hitter_b	,	"price":10,	"caption":word_item_caption_pinch_hitter_b	},
	"steal"			:{"item_name":word_item_steal			,	"price":5,	"caption":word_item_caption_steal			},
	"bunt"			:{"item_name":word_item_bunt			,	"price":3,	"caption":word_item_caption_bunt			},
	"squeeze"		:{"item_name":word_item_squeeze			,	"price":3,	"caption":word_item_caption_squeeze			},
	"swingHard"		:{"item_name":word_item_swing_hard		,	"price":3,	"caption":word_item_caption_swing_hard		},
	"pickoff"		:{"item_name":word_item_pickoff			,	"price":1,	"caption":word_item_caption_pickoff			},
	"walk"			:{"item_name":word_item_walk			,	"price":3,	"caption":word_item_caption_walk			},
	"double"		:{"item_name":word_item_double			,	"price":7,	"caption":word_item_caption_double			},
	"relief"		:{"item_name":word_item_relief			,	"price":15,	"caption":word_item_caption_relief			}
};

// インベントリ拡張費用
var expand_inventory_data = {
	5:{"next_max":10, "price":50},
	10:{"next_max":15, "price":100},
	15:{"next_max":20, "price":200},
	20:{"next_max":30, "price":1000}
};

//---------------------------
// インベントリ表示切り替え
//---------------------------
function showInventory(){
	
	// インベントリアイテムリスト生成
	updateInventory();
	
	$("#inventory").show();
	$("#detail_message_list").hide();
}
function hideInventory(){
	$("#inventory").hide();
	$("#detail_message_list").show();
}
function toggleInventory(){
	if($("#inventory").css("display") == "block"){
		hideInventory();
	}else{
		showInventory();
	}
}

//--------------------
// インベントリ描画
//--------------------
function updateInventory(){
	
	// ソート
	game_inventory.sort();
	
	// 一旦消去
	var inventory = $("#inventory");
	inventory.empty();
	
	// 描画
	for(var i=0; i<game_inventory.length; i++){
		var itemId = game_inventory[i];
		var button = $("<button>", {class:"item_button", text:item_data[itemId]["item_name"], title:item_data[itemId]["caption"]});
		button.on("click", {"itemName":game_inventory[i]}, function(e){
			useItem(e.data.itemName);
		});
		inventory.append(button);
	}
}

//--------------------
// アイテム効果を解除
//--------------------
function resetItemEffect(){
	$("#game_button").trigger("click.pinch");
	$("#game_button").trigger("click.swingHard");
}

//----------------
// アイテムを使う
//----------------
function useItem(inItemName){
	
	//------------------------
	// 使用できるかチェック
	//------------------------
	// 攻守のチェック
	switch(inItemName){
		
		// プレイヤー攻撃時のみ
		case "pinchHitterA":
		case "pinchHitterB":
		case "steal":
		case "bunt":
		case "squeeze":
		case "swingHard":
			if(attackTeam.flg_player == false){
				alert(word_item_alert_attack);
				return;
			}
			break;
			
		// プレイヤー守備時のみ
		case "walk":
		case "pickoff":
		case "double":
		case "relief":
			if(attackTeam.flg_player){
				alert(word_item_alert_defense);
				return;
			}
			break;
	}
	
	// 送りバントチェック
	if(inItemName == "bunt"){
		if(outCount == 2){
			alert(word_item_alert_bunt_out);
			return;
		}
		
		if(		baseState != "001"
			&&	baseState != "010"
			&&	baseState != "011"
			&&	baseState != "101"
		){
			alert(word_item_alert_bunt_runner);
			return;
		}
	}
	
	// 盗塁チェック
	if(inItemName == "steal"){
		if(baseState != "001" && baseState != "101"){
			alert(word_item_alert_steal);
			return;
		}
	}
	
	// スクイズチェック
	if(inItemName == "squeeze"){
		if(outCount == 2){
			alert(word_item_alert_squeeze_out);
			return;
		}
		if(baseState.charAt(0) != "1"){
			alert(word_item_alert_squeeze_runner);
			return;
		}
	}
	
	// 牽制チェック
	if(inItemName == "pickoff"){
		if(		baseState != "001"
			&&	baseState != "010"
			&&	baseState != "011"
			&&	baseState != "101"
		){
			alert(word_item_alert_pickoff);
			return;
		}
	}
	
	// 併殺狙いチェック
	if(inItemName == "double"){
		if(outCount == 2){
			alert(word_item_alert_double_out);
			return;
		}
		if(		baseState != "001"
			&&	baseState != "011"
			&&	baseState != "101"
			&&	baseState != "111"
		){
			alert(word_item_alert_double_runner);
			return;
		}
	}
	
	// メッセージの方に切り替え
	hideInventory();
	
	//------------
	// 効果発揮
	//------------
	switch(inItemName){
		
		// 代打A
		case "pinchHitterA":
			setPinchHitter("A");
			break;
			
		// 代打B
		case "pinchHitterB":
			setPinchHitter("B");
			break;
			
		//-------------
		// 送りバント
		//-------------
		case "bunt":
			
			// 送りバント成功時
			if(Math.random() < 0.8){
				if(		baseState == "001")baseState = "010";
				else if(baseState == "010")baseState = "100";
				else if(baseState == "011")baseState = "110";
				else if(baseState == "101")baseState = "110";
				updateBaseState();
				addInGameWithNameMessage(word_item_bunt_success);
				incrementOut(true);
				
			// 送りバント失敗時
			}else{
				addInGameWithNameMessage(word_item_bunt_fail);
				incrementOut(true);
			}
			break;
			
		//---------
		// 盗塁
		//---------
		case "steal":
			
			// 盗塁成功時
			if(Math.random() < 0.8){
				if(		baseState == "001")baseState = "010";
				else if(baseState == "101")baseState = "110";
				updateBaseState();
				addInGameMessage(word_item_steal_success);
				
			// 盗塁失敗時
			}else{
				if(		baseState == "001")baseState = "000";
				else if(baseState == "101")baseState = "100";
				updateBaseState();
				addInGameMessage(word_item_steal_fail);
				incrementOut(false);
			}
			break;
			
		//-----------
		// スクイズ
		//-----------
		case "squeeze":
			
			// スクイズ成功時（犠牲で進塁）
			if(Math.random() < 0.5){
				if(		baseState == "100")baseState = "000";
				else if(baseState == "110")baseState = "100";
				else if(baseState == "101")baseState = "010";
				else if(baseState == "111")baseState = "110";
				updateBaseState();
				addScore(1);
				playerTeam.members[attackBatterIndex].addTotalRbi(1);	// 打点記録
				addInGameMessage(word_item_squeeze_success);
				incrementOut(true);
				
			// スクイズ失敗時（3塁走者がアウト。他の走者は進塁）
			}else{
				if(		baseState == "100")baseState = "001";
				else if(baseState == "110")baseState = "101";
				else if(baseState == "101")baseState = "011";
				else if(baseState == "111")baseState = "111";
				updateBaseState();
				addInGameWithNameMessage(word_item_squeeze_fail);
				incrementOut(true);
			}
			break;
			
		//---------
		// 強振
		//---------
		case "swingHard":
			setSwingHard();
			break;
			
		//---------
		// 敬遠
		//---------
		case "walk":
			var wkMessage = word_message_walk;
			if(		baseState == "000")baseState = "001";
			else if(baseState == "001")baseState = "011";
			else if(baseState == "010")baseState = "011";
			else if(baseState == "100")baseState = "101";
			else if(baseState == "011")baseState = "111";
			else if(baseState == "101")baseState = "111";
			else if(baseState == "110")baseState = "111";
			else if(baseState == "111"){
				// 押し出し
				addScore(1);
				wkMessage = wkMessage + " " + word_message_merry_go_round;
			}
			addInGameWithNameMessage(wkMessage);
			updateBaseState();
			updateBatterResult(5);
			// 次のバッター
			nextBatter();
			break;
			
		//---------
		// 牽制
		//---------
		case "pickoff":
			
			// 牽制成功
			if(Math.random() < 0.1){
				if(		baseState == "001")baseState = "000";
				else if(baseState == "010")baseState = "000";
				else if(baseState == "011")baseState = "001";
				else if(baseState == "101")baseState = "100";
				updateBaseState();
				addInGameMessage(word_item_pickoff_success);
				incrementOut(false);
				
			// 牽制失敗
			}else{
				addInGameMessage(word_item_pickoff_fail);
			}
			break;
			
		//-------------
		// 併殺狙い
		//-------------
		case "double":
			setDouble();
			break;
			
		//-----------
		// 投手交代
		//-----------
		case "relief":
			setRelief();
			break;
	}
	
	//------------------
	// アイテムを消去
	//------------------
	for(var i=0; i<game_inventory.length; i++){
		if(game_inventory[i] == inItemName){
			game_inventory.splice(i, 1);
			break;
		}
	}
	
	// インベントリ再描画
	updateInventory();
}

//---------
// 代打
//---------
var beforeMember;		// 代打する前のバッター
var beforeBatterIndex;	// 代打した打席順
function setPinchHitter(inRank){
	
	// 二重掛け防止のため一旦戻す
	$("#game_button").trigger("click.pinch");
	
	// 代打のランク
	var pinchAvg;
	var pinchRisp;
	var pinchName;
	if(inRank == "A"){
		pinchAvg = 0.5;
		pinchRisp = 0.5;
		pinchName = word_item_pinch_hitter_a;
		
	}else if(inRank == "B"){
		pinchAvg = 0.75;
		pinchRisp = 0.75;
		pinchName = word_item_pinch_hitter_b;
	}
	
	// 代打メッセージ
	addInGameWithNameMessage(" -> " + pinchName);
	
	// 代打選手
	var pinchMember = new Member();
	pinchMember.avg = getDecimal(pinchAvg, 1000);
	pinchMember.risp = getDecimal(pinchRisp, 1000);
	pinchMember.member_name = pinchName;
	
	// バッターを入れ替え
	beforeMember = attackTeam.members.splice(attackBatterIndex, 1, pinchMember)[0];
	beforeBatterIndex = attackBatterIndex;
	
	// チーム再表示
	if(topBottom == 0){
		updateTeamMembers(attackTeam, "first");
	}else{
		updateTeamMembers(attackTeam, "last");
	}
	
	// 打席終了後に元に戻す
	$("#game_button").on("click.pinch contextmenu.pinch", function(){
		attackTeam.members.splice(beforeBatterIndex, 1, beforeMember);
		$(this).off("click.pinch contextmenu.pinch");
		updateTeamMembers(firstTeam, "first");
		updateTeamMembers(lastTeam, "last");
	});
}

//---------
// 強振
//---------
var beforeAvg;		// 強振する前の打率
var beforeRisp;		// 強振する前の得点圏打率
function setSwingHard(){
	
	// 二重掛け防止のため一旦戻す
	$("#game_button").trigger("click.swingHard");
	
	// 強振アイコン
	$("#batter_icon").attr("src", "./img/bat_swing_hard.png");
	
	// 対象選手の変更前を記憶
	var targetMember = attackTeam.members[attackBatterIndex];
	beforeAvg = targetMember.avg;
	beforeRisp = targetMember.risp;
	
	// 打率を下げる
	var adjust = 0.666;
	targetMember.avg = getDecimal(targetMember.avg * adjust, 1000);
	targetMember.risp = getDecimal(targetMember.risp * adjust, 1000);
	
	// 安打判定を強振用にする
	hitRatio = longHitRatio;
	
	// チーム再表示
	if(topBottom == 0){
		updateTeamMembers(attackTeam, "first");
	}else{
		updateTeamMembers(attackTeam, "last");
	}
	
	// 打席終了後に元に戻す
	$("#game_button").on("click.swingHard contextmenu.swingHard", function(){
		
		// 打席アイコン
		$("#batter_icon").attr("src", "./img/batter.png");
		
		// 打率を戻す
		targetMember.avg = beforeAvg;
		targetMember.risp = beforeRisp;
		
		// 安打判定
		hitRatio = normalHitRatio;
		
		// チーム再表示
		updateTeamMembers(firstTeam, "first");
		updateTeamMembers(lastTeam, "last");
		
		// イベント削除
		$(this).off("click.swingHard contextmenu.swingHard");
	});
}

//---------------------
// 併殺狙いセット
//---------------------
function setDouble(){
	
	// 併殺狙いアイコン
	$("#batter_icon").attr("src", "./img/bat_double.png");
	
	// 安打判定を強振用にする
	hitRatio = longHitRatio;
	
	// 併殺狙いフラグを立てる
	flgDouble = true;
}

//---------------------
// 併殺狙い解除
//---------------------
function cancelDouble(){
	
	// バッターアイコン
	$("#batter_icon").attr("src", "./img/batter.png");
	
	// 安打判定を戻す
	hitRatio = normalHitRatio;
	
	// 併殺狙いフラグを解除
	flgDouble = false;
}

//-----------
// 投手交代
//-----------
function setRelief(){
	
	// 二重掛け防止のため一旦戻す
	
	// 投手交代後の打率低下後チームを生成
	var weakOpponentTeam = opponentTeam.deepCopy();
	
	// 打率を下げる
	var adjust = 0.5;
	for(var i=0; i<weakOpponentTeam.members.length; i++){
		weakOpponentTeam.members[i].avg = getDecimal(weakOpponentTeam.members[i].avg * adjust, 1000);
		weakOpponentTeam.members[i].risp = getDecimal(weakOpponentTeam.members[i].risp * adjust, 1000);
	}
	
	// メッセージ
	addInGameMessage(word_message_relief);
	
	// フラグ立て
	flgRelief = true;
	
	// チーム入れ替えて再表示
	attackTeam = weakOpponentTeam;
	if(topBottom == 0){
		updateTeamMembers(attackTeam, "first");
	}else{
		updateTeamMembers(attackTeam, "last");
	}
}

//----------------------
// ショップボタン押下時
//----------------------
function pushShop(){
	
	var shopWindow = $("#shop_window");
	
	// ショップウィンドウ消去
	if(shopWindow.css("display") == "block"){
		hideShop();
		return;
	}
	
	// インベントリソート
	game_inventory.sort();
	
	// 売りアイテムリスト生成
	updateShopSellList();
	
	// インベントリリスト表示
	updateShopInventory();
	
	// インベントリアイテム数更新
	$("#inventory_count").html(game_inventory.length);
	$("#inventory_max").html(game_inventory_max);
	
	// ショップウィンドウ表示
	shopWindow.show();
	shopWindow.css({"margin-top":"-20px", "opacity":0});
	shopWindow.animate({"margin-top":"0px", "opacity":1}, "fast");
}

//------------------
// ショップ非表示
//------------------
function hideShop(){
	
	var shopWindow = $("#shop_window");
	
	// 開いていたらやる
	if(shopWindow.css("display") == "block"){
		shopWindow.css({"margin-top":"0px", "opacity":1});
		shopWindow.animate({"margin-top":"-20px", "opacity":0, "display":"none"}, "fast", function(){$(this).hide();});
		
		// ゲーム保存
		saveGame();
	}
}

//-----------------------------
// ショップ売りアイテム表示
//-----------------------------
function updateShopSellList(){
	
	// 再表示
	var shopSellList = $("#shop_sell_list");
	shopSellList.empty();
	for(var itemId in item_data){
		var buttonHtml = item_data[itemId]["item_name"] + "<br>" + item_data[itemId]["price"] + " coin";
		var buyButton = $("<button>", {class:"item_button", html:buttonHtml, title:item_data[itemId]["caption"]});
		
		//-------------------------------------------
		// コインが足りないかMAX数だったらdisabled
		//-------------------------------------------
		if(item_data[itemId]["price"] > game_coin || game_inventory.length >= game_inventory_max){
			buyButton.attr("disabled", true);
			
		//-----------
		// 買う処理
		//-----------
		}else{
			buyButton.on("click", {"itemId":itemId}, function(e){
					
				// インベントリに追加
				game_inventory.push(e.data.itemId);
				
				// コイン支払い
				addCoin(-item_data[e.data.itemId]["price"]);
				
				// アイテム数
				$("#inventory_count").html(game_inventory.length);
				
				// 再描画
				updateShopSellList();
				updateShopInventory();
				
				// スクロール下
				$("#shop_inventory").scrollTop($("#shop_inventory")[0].scrollHeight);
			});
		}
		
		shopSellList.append(buyButton);
	}
	
	//------------------
	// インベントリ拡張
	//------------------
	var btnExpandInventory = $("#btn_expand_inventory");
	var priceExpandInventory = $("#price_expand_inventory");
	
	// もうない場合
	if(expand_inventory_data[game_inventory_max] == undefined){
		priceExpandInventory.html("-");
		btnExpandInventory.attr("disabled", true);
		
	// ボタン情報更新
	}else{
		var expandPrice = expand_inventory_data[game_inventory_max]["price"];
		
		// 価格更新
		priceExpandInventory.html(expandPrice);
		
		// coin足りない場合
		if(expandPrice > game_coin){
			btnExpandInventory.attr("disabled", true);
			
		// coin足りる場合
		}else{
			btnExpandInventory.attr("disabled", false);
		}
	}
}

//-----------------------------
// ショップインベントリ表示
//-----------------------------
function updateShopInventory(){
	
	// 再表示
	var shopInventory = $("#shop_inventory");
	shopInventory.empty();
	for(var i=0; i<game_inventory.length; i++){
		var itemId = game_inventory[i];
		
		// ボタン生成
		var dumpButton = $("<button>", {class:"item_button", text:item_data[itemId]["item_name"], title:item_data[itemId]["caption"]});
		
		//--------------
		// 捨てる処理
		//--------------
		dumpButton.on("click", {"itemId":game_inventory[i], "itemIndex":i}, function(e){
			if(e.ctrlKey || confirm(item_data[e.data.itemId]["item_name"] + word_shop_dump_confirm)){
				
				// 捨てる前のスクロール位置
				var befScroll = $("#shop_inventory")[0].scrollTop;
				
				// インベントリから消去
				game_inventory.splice(e.data.itemIndex, 1);
				
				// アイテム数
				$("#inventory_count").html(game_inventory.length);
				
				// 再描画
				updateShopSellList();
				updateShopInventory();
				
				// スクロール位置戻す
				$("#shop_inventory").scrollTop(befScroll);
			}
		});
		
		// リストに追加
		shopInventory.append(dumpButton);
	}
}

//-------------------
// インベントリ拡張
//-------------------
function pushExpandInventory(){
	
	// 価格
	var expandPrice = expand_inventory_data[game_inventory_max]["price"];
	
	// coin支払い
	addCoin(- expandPrice);
	
	// 拡張
	var newInventoryMax = expand_inventory_data[game_inventory_max]["next_max"];
	game_inventory_max = newInventoryMax;
	
	// MAX表示更新
	$("#inventory_max").html(game_inventory_max);
	
	// ショップ表示更新
	updateShopSellList();
	updateShopInventory();
}


