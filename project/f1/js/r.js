const trackList = [
    'AUSTRALIA',
    'BAHRAIN',
    'VIETNAM',
    'CHINA',
    'NETHERLANDS',
    'SPAIN',
    'MONACO',
    'AZERBAIJAN',
    'CANADA',
    'FRANCE',
    'AUSTRIA',
    'GREATBRITAIN',
    'HUNGARY',
    'BELGIUM',
    'ITALY',
    'SINGAPORE',
    'RUSSIA',
    'JAPAN',
    'USA',
    'MEXICO',
    'BRAZIL',
    'ABUDABHI'
];

$(function() {
    $('button').click(function() {
        var randNum = $('.inpNum').val();
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
    
    for(var i=0;i<choiceTrack.length;i++) {
        $('.list').append('<li>' + trackList[choiceTrack[i]] + '</li>');
    }
    // 
}