var game = {
	playing : true,
	score : 0,  // 점수
	bonus : 0,  // 보너스 점수(코인)
	jumping : false, // 점프 체크
	jump_cnt : 0, // 점수횟수
	max_jump : 0, // 점수가능 횟수(2단점프)
	jump_delay : 0, // 점프시간
	wall_delay : 0, // 장애물 생성속도
	clv : 0, // 장애물 레벨
	typ : 0, // 장애물 타입
	id : 0,
	cr_wall : 0, // 장애물 생성 확율
	start : false,
	play_time : null,
	reset : function() {
		var aud = document.getElementById("bg_sd"); 
		var audover = document.getElementById("bg_gameover");
		this.playing = true,
		this.score = 0,  // 점수
		this.bonus = 0,  // 보너스 점수(코인)
		this.jumping = false, // 점프 체크
		this.jump_cnt = 0, // 점프횟수
		this.max_jump = 2, // 점프가능 횟수(2단 점프)
		this.jump_delay = 400, // 점프시간
		this.wall_delay = 9, // 장애물 생성속도
		this.clv = 0, // 장애물 레벨
		this.typ = 0, // 장애물 타입
		this.id = 0,
		this.start = false,
		this.cr_wall = 80; // 장애물 생성 확율
		this.play_time = setInterval(d_check, 100),
		$('#player').removeClass('over');
		$('#player').css('bottom','-35px');
		$('#gameover').css('display','none');
		$('.ani').css('animation-play-state','running');
		$('.dt').css('animation-play-state','running');
		$('.wall').remove();
		$('.hsc em').text(localdata.get('hsc'));
		audover.pause();
		aud.load();
	},
	stop_motion : function() { // 화면내 애니메이션 모션 stop
		var aud = document.getElementById("bg_sd");
		var audover = document.getElementById("bg_gameover");
		$('#player').stop();
		$('#player').addClass('over');
		$('.ani').css('animation-play-state','paused');
		$('.wall').css('animation-play-state','paused');
		$('.dt').css('animation-play-state','paused');
		if(localdata.get('hsc') < game.score+game.bonus) localdata.set('hsc',game.score+game.bonus);
		aud.pause();
		audover.load();
		$('.number-wrapper').remove();
	}
}

var localdata = { // 로컬스토리지 저장/불러오기 객체
	get : function(data_name) {
		var ndata = localStorage.getItem(data_name);
		if(ndata != null) return localStorage.getItem(data_name);
		else return 0;
	},
	set : function(data_name,data) {
		localStorage.setItem(data_name,data);
	}		
}

function npc_object(obj_name, type) { // 오브젝트 객체
	var nt,nl,nr,nb;
	switch(type) {
		case 't0' :  
		case 't1' :
			nt=-5;
			nl=5;
			nr=-25;
			nb=0;
			break;
		case 99 :
			nt=0;
			nl=0;
			nr=-80;
			nb=-120;
			break;
		default:
			nt=0;
			nl=0;
			nr=0;
			nb=0;
			break;
	}
	this.obj_name=obj_name;
	this.type = type; // t0 : small tree , t1: small tree2, t2: big tree, 99:pc
	this.left = $(obj_name).position().left+nl;
	this.top = $(obj_name).position().top+nt;
	this.right = this.left+$(obj_name).width()+nr;
	this.bottom = this.top+$(obj_name).height()+nb;
}

function rnd_type(lv) { // 장애물 type 설정
	var type;
	switch(Math.ceil(Math.random()*100)%lv) {
		case 1 : 
			type="t1"; // small tree2
			break;
		case 2 : 
			type="t2"; // big tree
			break;
		default : type="t0"; // small tree
	}
	if(Math.ceil(Math.random()*100) <= 10) type="t9";
	return type;
}

function rnd_speedlv(lv) { // 장애물 type 설정
	var slv;
	switch(Math.ceil(Math.random()*100)%lv) {
		case 1 : 
			slv="lv1"; // small tree2
			break;
		case 2 : 
			slv="lv2"; // big tree
			break;
		case 3 : 
			slv="lv3"; // big tree
			break;	
		case 4 : 
			slv="lv4"; // big tree
			break;				
		default : slv="lv0"; // small tree
	}
	return slv;
}

function create_wall() { // 장애물 랜덤 생성
	var type;
	
	if(game.score >= 515) {
		game.cr_wall=90;
	}
	else if(game.score >= 500) {
		game.clv='lv4',game.wall_delay=9,game.cr_wall=0;
		$('#bgimg').addClass('dark');
		$('.lawn_box').css('animation-duration','1.5s');
	}
	else if(game.score >= 400) {
		game.clv='lv3',game.typ=3;
		$('.lawn_box').css('animation-duration','1.8s');
	}
	else if(game.score >= 300) {
		game.clv='lv2';
		$('.lawn_box').css('animation-duration','2.2s');
	}
	else if (game.score >= 200) {
		game.clv='lv1',game.typ=2;
		$('.lawn_box').css('animation-duration','2.6s');
	}
	else {
		game.clv='lv0',game.typ=1;
		$('.lawn_box').css('animation-duration','3s');
	}	
	if(Math.ceil(Math.random()*100) <= game.cr_wall) {
		type = rnd_type(game.typ);
		if(type == "t9") $('#npc').append('<div class="wall n'+game.id+' '+type+' lv9"><div class="coin"><div class="txt">C</div></div></div>');
		else if(game.typ <= 3) $('#npc').append('<div class="wall n'+game.id+' '+type+' '+game.clv+'"><div class="tree"></div><div class="branch"></div></div>');
		else $('#npc').append('<div class="wall n'+game.id+' '+type+' '+game.clv+'"><div class="tree"></div><div class="branch"></div></div>');
		game.id++;
	}
}

function npc_crash_check(pc, npc) { // PC와 NPC 객체의 충돌여부 체크 및 장애물 삭제
	var chk_collision;
	
	if(game.score%40 == 0) { // 4초에 한번씩 지나간 장애물 삭제
		npc.forEach(function(item) { 
			if(item.left >= $('.stage').width()) {
				$(item.obj_name).remove();
			}
		});
	}

	for(var i=0;i<npc.length;i++) {
		if((npc[i].left >= pc.left && npc[i].left <= pc.right) || (npc[i].right <= pc.right && npc[i].right >= pc.left))
			if((npc[i].top >= pc.top && npc[i].top <= pc.bottom) || (npc[i].bottom <= pc.bottom && npc[i].bottom >= pc.top)) {
				if(npc[i].type == 't9') {
					$(npc[i].obj_name).remove();
					game.bonus+=50;
					chk_collision=false;
				}
				else {
					chk_collision=true;
					game.stop_motion();
				}
				break;
			}
		else if(pc.left < 0 || pc.right > $('.stage').width() || pc.top < 110 || pc.top > 278) {
			chk_collision=true;
			break;
		}
		else chk_collision=false;
	}
	return chk_collision;
}


function d_check() { // 장애물과 충돌 체크
	var n_wall = document.getElementsByClassName("wall"); // wall 클래스 엘리먼트 검색
	var pc = new npc_object('#player', 99);
	var npc = new Array;

	if(game.score > 20 && !game.start) {
		$('.stage').append('<div class="number-wrapper" style="display:block"><span class="number-three">3</span><span class="number-two">2</span><span class="number-one">1</span><span class="number-st">START</span></div>');
		game.start = true;
	}
	if(game.score%game.wall_delay == 0 && game.playing && game.score > 50) create_wall();  
	for(var i=0;i<n_wall.length;i++) { // 장애물 갯수 확인하여 객체 생성
		npc[i] = new npc_object('.'+n_wall[i].className.match(/[n][0-9]+/g),""+n_wall[i].className.match(/[t][0-9]+/g));
	}

	if(!game.playing) game.stop_motion(); // 게임오버이면 모션 stop
	else if(game.playing && npc_crash_check(pc, npc)) { // 플레이어와 장애물 충돌여부 확인
		$('.fanal_sc em').text(game.score+game.bonus+' (bonus+ '+game.bonus+')');
		$('#gameover').css('display','block');
		game.playing=false;
		// $.ajax({
		// 	type: "POST",
		// 	url: "php/test_demo.php",
		// 	data: {sc:game.score+game.bonus},
		// 	success: function(msg){
		// 		console.log(msg);
		// 	},
		// 	error : function(){
		// 	}
		// });
		clearInterval(game.play_time);
	}
	else $('.sc em').text(++game.score); // 장애물과 충돌이 없으면 스코어++
}

function jump() {
	var jumph=85;
	var aud = document.getElementById("jump_sd");
	var pc_bpos= $('.stage').height()-($('#player').position().top+$('#player').height())
	
	if ( game.start && game.playing && game.jump_cnt<game.max_jump) {
		game.jump_cnt++;
		game.jumping=true;
		aud.play();

		$('#player').addClass((game.jump_cnt == 2 ? 'djump' : 'jump'));
		$('#player').stop().animate({
			bottom:"+="+(game.jump_cnt == 2 ? jumph/2 : jumph)+"px",
		}, game.jump_delay, function() {
			// aud.currentTime=0;
			aud.load();
			$(this).animate({
				bottom:"-35px",
			}, 215, function() {
				$('#player').removeClass('jump');
				$('#player').removeClass('djump');
				if(game.jump_cnt >= game.max_jump || pc_bpos <= 20) {
					game.jump_cnt=0;
					game.jumping=false;
				}
			});
		});
	}	
}

// 클릭시 점프 모션
$(document).keydown(function(e) {
	if ( e.which == 32 && game.jump_cnt<game.max_jump) jump();
});	

$(document).on('touchstart',function(e) {
	if ( game.jump_cnt<game.max_jump) jump();
});	

function is_mobile() { // 모바일 유무 체크
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function score_board() { // 스코어보드
	$.get("php/test_demo_result.php", function(data){
        $('.stage').after(data);
    });
}

function ly_remove() {
	$('.ly_score').remove();
}

$(document).ready(function(){
	if(is_mobile()) { // 모바일 분기처리
		$('body').addClass('m');
		game.jump_delay = 350;
	}
	game.reset();
});
