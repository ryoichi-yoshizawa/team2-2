//===========
// 言語関係
//===========
var word_game_title						= "%e6%89%93%e9%a0%86%e3%83%90%e3%83%88%e3%83%ab";
var word_game_url						= "http://shimage.net/batting-order-battle/";
var word_player_team_name				= "プレイヤー";
var word_opponent_team_name				= "対戦相手";
var word_boss_opponent_team_name		= "対戦相手（ボス）";
var word_round							= "回";
var word_top							= "表";
var word_bottom							= "裏";
var word_game_start						= "試合開始";
var word_game_finish					= "試合終了";
var word_pitcher						= "(投) ";
var word_development					= "(育成) ";

var word_button_empty					= "&nbsp;";
var word_button_order_complete			= "打順確定";
var word_button_order_trade_complete	= "打順＆トレード確定";
var word_button_first_last_fix			= "先攻・後攻決めへ";
var word_button_game_start				= "試合開始";
var word_button_next					= "次へ";
var word_button_stop					= "停止";
var word_button_win						= "勝利！";
var word_button_lose					= "敗北...";
var word_button_rematch					= "再試合";
var word_button_bonus					= "勝利ボーナス";
var word_button_continue				= "前回の続き";
var word_button_outofplay				= "ゲーム中断";

var word_confirm_new_game				= "ゲームの途中ですが、破棄してもよろしいですか？";
var word_confirm_no_load_game			= "前回のデータは破棄されますが、よろしいですか？";
var word_confirm_continue				= "ロードしたデータは破棄されます。ご注意下さい";
var word_confirm_member_name			= "名前を入力して下さい";
var word_confirm_forbit_pitcher_trade	= "投手を外すことはできません";
var word_confirm_delete_data			= "ゲームデータを全て削除します。よろしいですか？";
var word_confirm_outofplay				= "ゲームを中断します。よろしいですか？";

var word_message_000_1	= "ヒット";
var word_message_000_2	= "ツーベースヒット";
var word_message_000_3	= "スリーベースヒット！";
var word_message_000_4	= "ホームラン！ ##score##";
var word_message_001_1	= "ヒット";
var word_message_001_2	= "ツーベースヒット";
var word_message_001_3	= "タイムリースリーベース！ ##score##";
var word_message_001_4	= "2ランホームラン！ ##score##";
var word_message_010_1	= "ヒット";
var word_message_010_2	= "タイムリーツーベース！ ##score##";
var word_message_010_3	= "タイムリースリーベース！ ##score##";
var word_message_010_4	= "2ランホームラン！ ##score##";
var word_message_100_1	= "タイムリーヒット！ ##score##";
var word_message_100_2	= "タイムリーツーベース！ ##score##";
var word_message_100_3	= "タイムリースリーベース！ ##score##";
var word_message_100_4	= "2ランホームラン！ ##score##";
var word_message_011_1	= "ヒット";
var word_message_011_2	= "タイムリーツーベース！ ##score##";
var word_message_011_3	= "2点タイムリースリーベース！ ##score##";
var word_message_011_4	= "3ランホームラン！ ##score##";
var word_message_101_1	= "タイムリーヒット！ ##score##";
var word_message_101_2	= "タイムリーツーベース！ ##score##";
var word_message_101_3	= "2点タイムリースリーベース！ ##score##";
var word_message_101_4	= "3ランホームラン！ ##score##";
var word_message_110_1	= "タイムリーヒット！ ##score##";
var word_message_110_2	= "2点タイムリーツーベース！ ##score##";
var word_message_110_3	= "2点タイムリースリーベース！ ##score##";
var word_message_110_4	= "3ランホームラン！ ##score##";
var word_message_111_1	= "タイムリーヒット！ ##score##";
var word_message_111_2	= "2点タイムリーツーベース！ ##score##";
var word_message_111_3	= "3点タイムリースリーベース！ ##score##";
var word_message_111_4	= "満塁ホームラン！ ##score##";

var word_achievement_hash ={
	"3win_try"		: ["打順バトル入門",		"1ゲームで3連勝する（設定の試合スキップ機能開放）"],
	"6win_try"		: ["止められない！",		"1ゲームで6連勝する（育成選手開放）"],
	"10win_try"		: ["胴上待ったなし",		"1ゲームで10連勝する"],
	"100win_total"	: ["こつこつ勝つ",			"合計で100勝する（育成選手開放）"],
	"20hit_try"		: ["安打製造機",			"1ゲームで1人20安打"],
	"20rbi_try"		: ["スラッガー",			"1ゲームで1人20打点"],
	"10pt_game"		: ["大量得点！",			"1試合10点取る"],
	"5pt_inning"	: ["投手炎上！",			"1イニング5点取る"],
	"12sayonara"	: ["劇的サヨナラ",			"延長にサヨナラホームランを打つ"],
	"hr_pitcher"	: ["夢の二刀流",			"投手がHRを打つ"],
	"dev_success"	: ["育成成功！",			"育成選手の打率を0.3にする（育成選手開放）"],
	"complete"		: ["打順バトルマスター！",	"すべての実績を解除する"]
};

var word_shop_dump_confirm				= "を捨てます。よろしいですか？\n（Ctrl+クリックで確認せずに捨てます）";

var word_message_sacrifice_fly			= "犠牲フライ ##score##";
var word_message_walk					= "四球";
var word_message_merry_go_round			= "押し出し ##score##";
var word_message_double_play			= "併殺";
var word_message_relief					= "投手交代";

var word_item_pinch_hitter_a			= "代打A";
var word_item_pinch_hitter_b			= "代打B";
var word_item_steal						= "盗塁";
var word_item_bunt						= "送りバント";
var word_item_squeeze					= "スクイズ";
var word_item_swing_hard				= "強振";
var word_item_walk						= "敬遠";
var word_item_pickoff					= "牽制球";
var word_item_double					= "ゲッツー態勢";
var word_item_relief					= "投手交代";

var word_item_caption_pinch_hitter_a	= "代打を送ります。打席終了すると元に戻ります";
var word_item_caption_pinch_hitter_b	= "代打を送ります。Aよりも期待できます";
var word_item_caption_steal				= "2塁への盗塁を行います（成功率80%）";
var word_item_caption_bunt				= "送りバントします（成功率80%）";
var word_item_caption_squeeze			= "スクイズをします（成功率50%）";
var word_item_caption_swing_hard		= "打率は低下しますが、長打の可能性が上がります。3塁ランナーがいる場合、犠牲フライになることもあります";
var word_item_caption_walk				= "四球を与えます";
var word_item_caption_pickoff			= "ランナーをアウトにします（成功率10%）";
var word_item_caption_double			= "併殺を狙います。その代わり、長打、犠牲フライになる危険があります";
var word_item_caption_relief			= "使用した回のみ打率を低下させます";

var word_item_bunt_success				= "バント成功！";
var word_item_bunt_fail					= "バント失敗";
var word_item_steal_success				= "盗塁成功！";
var word_item_steal_fail				= "盗塁失敗";
var word_item_squeeze_success			= "スクイズ成功！##score##";
var word_item_squeeze_fail				= "スクイズ失敗";
var word_item_pickoff_success			= "牽制成功！";
var word_item_pickoff_fail				= "牽制失敗";

var word_item_alert_attack				= "プレイヤーの攻撃時に使用できます";
var word_item_alert_defense				= "プレイヤーの守備時に使用できます";
var word_item_alert_bunt_runner			= "1塁、2塁、1-2塁、1-3塁にランナーがいる場合に使用できます";
var word_item_alert_bunt_out			= "ノーアウトか1アウトの時使用できます";
var word_item_alert_steal				= "1塁にランナーがおり、2塁が空いている場合に使用できます";
var word_item_alert_squeeze_runner		= "3塁にランナーがいる場合に使用できます";
var word_item_alert_squeeze_out			= "ノーアウトか1アウトの時使用できます";
var word_item_alert_pickoff				= "1塁か2塁にランナーがおり、次の塁が空いてる場合に使用できます";
var word_item_alert_double_runner		= "1塁にランナーがいる場合に使用できます";
var word_item_alert_double_out			= "ノーアウトか1アウトの時使用できます";
