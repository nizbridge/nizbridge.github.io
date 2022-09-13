
var typeRoom = ['dbd','nbd','hhbd'];
var typeRoomHan = ['든바다','난바다','허허바다'];
var dateInfo8 = ['2022-11-05','2022-11-12','2022-11-19','2022-11-26'];
var dateInfo9 = ['2022-09-03','2022-09-17','2022-09-24'];
var dateInfo10 = ['2022-10-01','2022-10-02','2022-10-08','2022-10-09','2022-10-15','2022-10-22','2022-10-29'];
var findText = "type=dbd&today=2022-09-06";
var reservTry;


$(function() {
    Notification.requestPermission();

    scrapingData();

    const timer = setInterval(() => {
        scrapingData();
    }, 15000); 
    
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
    var revCounter = 0 ;

    $('.reservList').empty();
    $.get("https://www.campingkorea.or.kr/reservation/06.htm?code=&year=2022&month=11#container", function(data) {

        result = data.match(/{/g);
        
        $.each(dateInfo8, function(index, item) {
            for(var i=0; i <= typeRoom.length-1; i++) {
                findText = 'type='+typeRoom[i]+'&today='+item;
                reservTry = data.lastIndexOf(findText);
                // console.log(findText);
                if(reservTry > 0) {
                    revTitle += typeRoomHan[i]+'('+item.substr(5)+") ";
                }
            }
        });

    }).done(function() {
        revCounter++;
        if(revCounter >= 3) {
            alramNoti(revTitle);
        } 
    });

    $.get("https://www.campingkorea.or.kr/reservation/06.htm?code=&year=2022&month=9#container", function(data) {
        result = data.match(/{/g);

        $.each(dateInfo9, function(index, item) {
            for(var i=0; i <= typeRoom.length-1; i++) {
                findText = 'type='+typeRoom[i]+'&today='+item;
                reservTry = data.lastIndexOf(findText);
                // console.log(findText);
                if(reservTry > 0) {
                    revTitle += typeRoomHan[i]+'('+item.substr(5)+") ";
                }
            }
        });

    }).done(function() {
        revCounter++;
        if(revCounter >= 3) {
            alramNoti(revTitle);
        }
    });

    $.get("https://www.campingkorea.or.kr/reservation/06.htm?code=&year=2022&month=10#container", function(data) {
        result = data.match(/{/g);

        $.each(dateInfo10, function(index, item) {
            for(var i=0; i <= typeRoom.length-1; i++) {
                findText = 'type='+typeRoom[i]+'&today='+item;
                reservTry = data.lastIndexOf(findText);
                // console.log(findText);
                if(reservTry > 0) {
                    revTitle += typeRoomHan[i]+'('+item.substr(5)+") ";
                }
            }
        });
        
    }).done(function() {
        revCounter++;
        if(revCounter >= 3) {
            alramNoti(revTitle);
        }
    });
}
function alramNoti(revTitle) {
    if(revTitle != "") {
        console.log(revTitle);
        document.title = revTitle;
        new Notification("예약가능", {body:revTitle});
        $('.reservList').append('<li>' + revTitle + "</li>");
    }
    else {
        console.log(currentTime());
        document.title = currentTime();
    }
}
