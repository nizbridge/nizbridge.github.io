
var level = 1;
var itemCount = 1;
var wordArr = new Array( // 단어 리스트
    '우비','우산','자동차','태풍','자전거'
)

$(function() {
    start(0); 
});

function createItem(word, level) {
    var checkCount = itemCount; // 단어 생성시 고유ID값 부여
    var topPos = 0; // 최초 생성 top 위치
    var leftPos = Math.floor(Math.random() * 80)+5; // 최초생성 left 위치

    // 단어요소생성
    $('.treeBox').append('<div class="treeBox__item lv'+level+' count'+ itemCount +'" style="left:'+ leftPos +'%">'+word+'</div>');
    itemCount++;

    var intervalId = setInterval(function() { // level에 따라 속도를 다르게하여 아래로 이동시킴
        posText = (topPos++) + '%';
        countLv = '.count' + checkCount;
        $(countLv).css('top',posText);
        
        if(topPos > 95) {
            clearInterval(intervalId);
            console.log('delete : ' + countLv);
            $(countLv).remove();
        }
    }, level*100);
    
}

// 게임시작
function start(counter){
    var wordRand = Math.floor(Math.random() * 5); // 단어 랜덤
    var wordLv = Math.floor(Math.random() * 5)+1; // 떨어지는 속도
    var wordDelay = Math.floor(Math.random() * 10)+5; // 단어 생성 주기

    if(counter < 10){
        setTimeout(function(){
            counter++;
            console.log(wordArr[wordRand],wordLv,wordDelay);
            createItem(wordArr[wordRand],wordLv); // 단어 생성
            start(counter);
        }, wordDelay*200);
    }
}
    