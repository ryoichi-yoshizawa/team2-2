//===========
// 便利
//===========

//---------------
// 小数切り捨て
//---------------
function getDecimal(inNum, inPlace){
	return Math.floor(inNum * inPlace) / inPlace;
}

//----------------------
// 小数第３位まで0詰め
//----------------------
function getDispRatio(inNum){
	if(inNum == 0){
		return ".000";
	}
	var str = String(inNum);
	var rtnValue = str.substr(str.indexOf("."), 4);
	while(rtnValue.length < 4){
		rtnValue += "0";
	}
	return rtnValue;
}

//----------------
// 配列シャッフル
//----------------
Array.prototype.shuffle = function() {
    var i = this.length;
    while(i){
        var j = Math.floor(Math.random()*i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}

//-----------------------------------------
// 日付フォーマット(YY MM DD HH MI SS)
//-----------------------------------------
function dateFormat(inDate, inStr){
	
	// 年月日　時秒
	var year = inDate.getFullYear();
	var month = inDate.getMonth() + 1;
	var day = inDate.getDate();
	var hours = inDate.getHours();
	var minutes = inDate.getMinutes();
	var seconds = inDate.getSeconds();
	
	// 年を短縮
	year = String(year).substr(2,2);
	
	// 0付け
	if (month < 10) {
	  month = "0" + month;
	}
	if (day < 10) {
	  day = "0" + day;
	}
	if (hours < 10) {
	  hours = "0" + hours;
	}
	if (minutes < 10) {
	  minutes = "0" + minutes;
	}
	if (seconds < 10) {
	  seconds = "0" + seconds;
	}
	
	// フォーマット
	var rtnStr = inStr.replace("YY", year).replace("MM", month).replace("DD", day).replace("HH", hours).replace("MI", minutes).replace("SS", seconds);
	
	return rtnStr;
}

//---------------
// 偏り乱数
//---------------
function getBiasRandom(inBias){
	var rtnRand = Math.random() * Math.sin(Math.random());
	return rtnRand;
}
