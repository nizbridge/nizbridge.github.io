
var bingoSize = 5; // 빙고 사이즈
var gameStat = false; // 게임 시작상태    
var curNum = 1; // 현재 입력하고 있는 숫자
var MaxNum = bingoSize * bingoSize; // 빙고 최고사이즈
const bingoArr = Array.from(Array(bingoSize), () => new Array(bingoSize).fill(0));


$(function() {

    createBingoTbl(bingoSize); // 5x5 빙고판 생성
    
    $('.item').click(function() {
        if(gameStat) { // 시작
            var daraRow = $(this).attr('dataRow');
            var daraCol = $(this).attr('dataCol');
            $(this).addClass('check');
            bingoArr[daraRow][daraCol] = 1;
            console.log(bingoArr);

            checkLine();

        }
        else { // 시작상태가 아닐때
            if($(this).hasClass('used')) { // 번호가 입력된 곳을 클릭하면 에러
                if(curNum >= MaxNum) {
                    showAlert('번호가 모두 입력되었어요.<br>시작 버튼을 누르세요.'); 
                }
                else {
                    showAlert('이미 번호가 있어요.<br>다른 곳을 클릭하세요');
                }
            }
            else { // 빈곳을 클릭하면 번호 입력
                $(this).html(curNum);
                $(this).addClass('used');
                curNum++;
    
                if(curNum > MaxNum) { // 번호를 다 입력하면 게임 시작
                    gameStat = gameStart();
                    // $('.btnStart').removeAttr('disabled');
                }
            }   
        }
    });    
});

// 빙고판 생성
function createBingoTbl(bingoRow) {
    var checkPer = 100 / bingoRow;
    var tblWidth, tblHeight;

    for(var i = 0; i< bingoRow; i++){
        $('.tblbox').append('<div class="row"></div>');
        for(var j = 0; j< bingoRow; j++) {
            $('.tblbox .row').eq(i).append('<button type="button" class="item" dataRow="'+ i +'" dataCol="'+ j +'"></button>');
        }   
    }
    $('.tblbox .row').css('height',checkPer + '%');
    $('.tblbox .item').css('width',checkPer + '%');

    tblWidth = $('.tblbox').width();
    tblHeight = $('.tblbox').height();

    if(tblWidth > tblHeight) tblWidth = tblHeight;
    else {
        tblHeight = tblWidth;
    }
    $('.tblbox').css({
        'width' : tblWidth,
        'height' : tblHeight,
        'left': '50%',
        'margin-left': -tblWidth/2,
    });
}

// 경고 팝업
function showAlert(msg) {
    $('body').append(
        '<div class="alert_popup"><div class="dimmed"></div><div class="popupbox"><p>'+msg+'</p><button type="button" class="confirmbtn">확인</button></div></div>'
    )
    $('.confirmbtn').on('click', function() {
        $('.alert_popup').remove();
    });
}

// 게임 시작
function gameStart() { 
    $('body').addClass('beginGame');

    $('body').append('<div class="alert_popup startbox"><div class="dimmed"></div><strong class="center_text">Start</strong></div>');  
    $('.startbox').click(function() {
        $(this).remove();
    });

    return true;
}

function endGame() {
    $('body').append('<div class="alert_popup startbox"><div class="dimmed"></div><div style="z-index:10"><strong class="center_text">게임 끝</strong><button type="button" class="refbtn">다시하기</button></div></div>');  
    $('.refbtn').click(function() {
        location.href = location.href;
    })
}

function checkLine() {
    
    var lineCount = 0;
    var checkRow = new Array(bingoSize).fill(0);
    var checkCol = new Array(bingoSize).fill(0);
    var checkDiag = new Array(2).fill(0);

    for(var i = 0 ;i < bingoSize; i++) {
        if(bingoArr[i][i] == 1) { // 상좌하우 대각선 체크
            checkDiag[0]++;
            if(checkDiag[0] >= bingoSize) lineCount++;
        }
        if(bingoArr[i][bingoSize-i-1] == 1) { // 하좌상우 대각선 체크
            checkDiag[1]++;
            if(checkDiag[1] >= bingoSize) lineCount++;
        }
        for(var j = 0 ;j < bingoSize; j++) { // row 체크
            if(bingoArr[i][j] == 1) {
                checkRow[i]++;
                if(checkRow[i] >= bingoSize) lineCount++;
            }
            if(bingoArr[j][i] == 1) { // col 체크
                checkCol[i]++;
                if(checkCol[i] >= bingoSize) lineCount++;
            }
        }
    }

    $('#_lineCount').html(lineCount);
    if(lineCount >= bingoSize) {
        endGame();
    }
}