
var typeRoom = ['dbd','nbd','hhbd'];
var dateInfo8 = ['2022-08-14','2022-08-20','2022-08-27'];
var dateInfo9 = ['2022-09-03','2022-09-09','2022-09-17','2022-09-24'];
var findText = "type=dbd&today=2022-09-06";
var reservTry;


$(function() {
    Notification.requestPermission();

    scrapingData();

    const timer = setInterval(() => {
        scrapingData();
        console.log(11);
    }, 60000); 
    
});

function currentTime() {
    var today = new Date();   

    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2); 

    var timeString = hours + ':' + minutes  + ':' + seconds;

    return timeString;
}
function scrapingData() {
    var revTitle = "";
    $.get("https://www.campingkorea.or.kr/reservation/06.htm?code=&year=2022&month=8#container", function(data) {
        result = data.match(/{/g);
        

        $.each(dateInfo8, function(index, item) {
            for(var i=0; i <= typeRoom.length-1; i++) {
                findText = 'type='+typeRoom[i]+'&today='+item;
                reservTry = data.lastIndexOf(findText);
                console.log(findText);
                if(reservTry > 0) {
                    $('.reservList').append('<li>' + findText + "</li>");
                    revTitle += typeRoom[i]+item.substr(5)+" ";
                }
            }
        });
        
    });

    $.get("https://www.campingkorea.or.kr/reservation/06.htm?code=&year=2022&month=9#container", function(data) {
        result = data.match(/{/g);

        $.each(dateInfo9, function(index, item) {
            for(var i=0; i <= typeRoom.length-1; i++) {
                findText = 'type='+typeRoom[i]+'&today='+item;
                reservTry = data.lastIndexOf(findText);
                console.log(findText);
                if(reservTry > 0) {
                    $('.reservList').append('<li>' + findText + "</li>");
                    revTitle += typeRoom[i]+item.substr(5)+" ";
                }
            }
        });
        if(revTitle != "") {
            document.title = revTitle;
            new Notification("예약가능", {body:revTitle});
        }
        else {
            document.title = currentTime();
        }
        
    });
    
}
