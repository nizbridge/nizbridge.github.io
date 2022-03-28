const trackList = [
    'BAHRAIN',
    'IMOLA',
    'PORTUGAL',
    'SPAIN',
    'MONACO',
    'AZERBAIJAN',
    'CANADA',
    'FRANCE',
    'AUSTRIA',
    'BRITAIN',
    'HUNGARY',
    'BELGIUM',
    'NETHERLANDS',
    'ITALY',
    'RUSSIA',
    'SINGAPORE',
    'JAPAN',
    'USA',
    'MEXICO',
    'BRAZIL',
    'AUSTRALIA',
    'SAUDI ARABIA',    
    'ABUDABHI'
];

$(function() {
    $('button').click(function() {
        var randNum = $('.inpNum').val();
        if(randNum > trackList.length) {
            randNum = trackList.length;
            $('.inpNum').val(trackList.length);
        }
        $('.list').empty();
        selectTrack(randNum);
    });

});

function selectTrack(randNum) {
    var trackNum;
    var choiceTrack = [];

    for(var i = 0;i<randNum;i++) {
        trackNum = Math.floor( Math.random() * trackList.length );
        if (choiceTrack.indexOf(trackNum) === -1) {
            choiceTrack.push(trackNum)
          } else {
            i--;
          }
    }
    choiceTrack.sort(function(a, b) { // 오름차순
        return a - b;
    });
    console.log(choiceTrack);
    for(var i=0;i<choiceTrack.length;i++) {
        $('.list').append('<li>' + (i+1) + '. ' + trackList[choiceTrack[i]] + '</li>');
    }
}
$(function(){
    for(var i=0;i<trackList.length;i++) {
        $('.list').append('<li>' + (i+1) + '. ' + trackList[i] + '</li>');
    }
});
