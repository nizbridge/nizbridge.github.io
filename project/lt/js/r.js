
$(function() {
    $('.retry').click(function() {
        var rolnum = $('.rollNum').val();
        $('.lt_list').empty();
        for(var i=0; i<rolnum; i++) {
            createItem(1,45,6,i);    
        }
    })
});

function createItem(start_num, end_num, count_num, listCount) {
    var rndNum;
    var numArr = new Array();
    var numText = "";
    var countClass = 'count'+listCount;
    // 지정된 숫자(5)만큼 반복하여 랜덤한 숫자 생성
    for(var i =0; i<count_num; i++) {
        rndNum = Math.floor(Math.random() * end_num)+start_num;
        
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
