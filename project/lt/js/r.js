
// https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1000

var numWeight = { // 색상별 가중치 적용.. 
        n1 : 1.4,
        n10 : 1.2,
        n20 : 1.4,
        n30 : 1.2,
        n40 : 1
};
var weightNewArr;

$(function() {
    weightNewArr = weightRand(numWeight);
    console.log('weight:',weightNewArr);

    $('.retry').click(function() {
        var rolnum = $('.rollNum').val();
        $('.lt_list').empty();
        for(var i=0; i<rolnum; i++) {
            createItem(6,i);
        }
    })
});

// 가중치 랜덤
function weightRand(w) {
    const weightArr = Object.values(w);
    var weightNewArr = [];
    var weightSum=0;

    // 가중치값 계산하여 범위정하기
    for(let index in weightArr) {
        weightSum += weightArr[index];
    }
    for(let index in weightArr) {
        if(index > 0) {
            weightNewArr.push( weightNewArr[index-1] + Math.round((weightArr[index]/weightSum)*100));
        }
        else {
            weightNewArr.push(Math.round((weightArr[index]/weightSum)*100));
        }
        
    }
    
    $('.info').append('<p>=가중치=<br>1~9 : '+Math.round((weightArr[0]/weightSum)*100)+'%<br>10~19 : '+Math.round((weightArr[1]/weightSum)*100)+'%<br>20~29 : '+Math.round((weightArr[2]/weightSum)*100)+'%<br>30~39 : '+Math.round((weightArr[3]/weightSum)*100)+'%<br>40~45 : '+Math.round((weightArr[4]/weightSum)*100)+'%</p>');
    return weightNewArr;
}

// 번호생성기 - 생성숫자 갯수, 고유 키값
function createItem(count_num, listCount) {
    var rndNum;
    var numArr = new Array();
    var countClass = 'count'+listCount;
    // 지정된 숫자(5)만큼 반복하여 랜덤한 숫자 생성
    for(var i =0; i<count_num; i++) {
        weightRndNum = Math.floor(Math.random()*100)+1; // 가중치 적용을 위해 1~100까지 난수 발생
        // rndNum = Math.floor(Math.random() * end_num)+start_num;
        
        // 가중치 맞는 난수적용
        if(weightRndNum <= weightNewArr[0]) {
            rndNum = Math.floor(Math.random() * 9)+1;
        }
        else if(weightRndNum <= weightNewArr[1]) {
            rndNum = Math.floor(Math.random() * 9)+10;
        }
        else if(weightRndNum <= weightNewArr[2]) {
            rndNum = Math.floor(Math.random() * 9)+20;
        }
        else if(weightRndNum <= weightNewArr[3]) {
            rndNum = Math.floor(Math.random() * 9)+30;
        }
        else {
            rndNum = Math.floor(Math.random() * 6)+40;
        }
        // 생성된 숫자가 이미 나왔던 숫자라면 다시 돌리기
        if(numArr.indexOf(rndNum) !== -1) {
            i--;
        }
        else { // 배열에 없는 숫자라면 추가
             numArr.push(rndNum);
        }
    }
    // 배열을 오름차순으로 정렬
    numArr.sort(function(a, b)  {
        return a - b;
    });
    
    // 배열을 리스트내에 출력
    $('.lt_list').append('<li class="'+ countClass +'">');
    for(let index in numArr) {
        var checkColor = Math.floor(numArr[index]/10)*10; // 번호 자릿수에 따라서 색상값 다르게 적용
        
        $('.'+countClass).append('<span class="n'+ checkColor +'">'+numArr[index]+'</span>');
    }
    $('.lt_list').append('</li>');
}
