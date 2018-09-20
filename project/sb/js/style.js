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
    var resultVal = [], check=0, dmstr;

    for (i = 0; i < inputArr.length; i++) {
        resultVal.push(dmstr = inputArr[i].join(''));
    }
    resultVal2 = resultVal;
    for (i = 0; i < resultVal.length; i++) {
        for (j = i+1; j < resultVal.length; j++) {
            if(resultVal[i] == resultVal[j]) {
                resultVal2.splice(i,1);
            }
        }
    }

    for(i=0; i<resultVal2.length; i++) {
        $('.result').append(i+1 + ' : ' + resultVal[i] + "<br>");
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