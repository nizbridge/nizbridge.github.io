// 순열 알고리즘
var permArr = [], usedChars = [];

function permute(input) {
    var i, ch;
    

    for (i = 0; i < input.length; i++) {
        ch = input.splice(i, 1)[0];
        usedChars.push(ch);

        if (input.length == 0) {
            permArr.push(usedChars.slice());
        }
        permute(input);
        input.splice(i, 0, ch);
        usedChars.pop();
    } 
    return permArr;
};

// 배열 합치기
function disArr(inputArr) {

    for (i = 0; i < inputArr.length; i++) {
        $('.result').append(i+1 + ' : ' + inputArr[i].join('') + "<br>");
    }
}

$('.codesubmit').click(function() {
    var codeVal = $('.codeinput').val();
    var sumArr = [];

    $('.result').empty();

    sumArr = codeVal.split('');
    disArr(permute(sumArr));

    permArr = [], usedChars = [];
});