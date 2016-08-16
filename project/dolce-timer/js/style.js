var timer_run = false; // 타이머 시작 체크
var id, id2; // 진행율과 남은시간을 계산하는 interval 변수
  
function move(timer) {
    var width = 0;
    var cnt = timer;
    id = setInterval(frame, timer*10); // 진행율
    function frame() {
        if (width >= 100) {
            timer_run = false;
            clearInterval(id);
            clearInterval(id2);
            $('#myCircle').addClass('complete');
            $('button').text('Start');
        } else {
            // elem.style.width = width + '%'; 
            $('#myCircle').removeClass('p'+width);
            width++; 
            $('#myCircle').addClass('p'+width);
            $('#per-text').text(width * 1 + '%');
        }
    }
    id2 = setInterval(function(){
      $('#countdown-text em').text(--cnt);
    }, 1000);


}

$(document).ready(function() {
  var timer = 0;
  $('#dropdown1 a').click(function(){
    if(!timer_run) {
      $('#dropdown1 a').removeClass('on');
      $(this).addClass('on');
      timer = $(this).attr('data-value');
      $('#countdown-text em').text(timer);
    }
  });
  $('button').click(function(){
    if(timer == 0) {
      alert("Please set the level.");
    }
    else if(timer_run) {
      $(this).text('Start');
      timer_run = false;
      clearInterval(id);
      clearInterval(id2);
      $('#myCircle').attr('class','c100 p0 big');
      $('#per-text').text('0%');
      $('#countdown-text em').text(timer);
      // alert("The timer is operating.");
    }
    else {
      if($('#myCircle').hasClass('p100')) {
        $('#myCircle').removeClass('p100').addClass('p0');
        $('#myCircle').removeClass('complete');
      }
      timer_run = true;      
      $(this).text('Cancle');
      move(timer);  
    }
    
  });
});
