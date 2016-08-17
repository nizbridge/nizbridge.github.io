/*  default data */

var data_filter = {
	"monthly" : 8,
	"member" : 7
}
// 월간 차트 데이터
var dataSource = [
     { "date" : "1월", "All Risk" : 16, "All Issue" : 2, "Team1 risk" : 10, "Team2 risk" : 6, "_Team1_가동률" : 50, "_Team2_가동률" : 80, "_All_가동률" : 65 },
	{ "date" : "2월", "All Risk" : 4, "All Issue" : 4, "Team1 risk": 3, "Team2 risk" : 1, "_Team1_가동률" : 98, "_Team2_가동률" : 67, "_All_가동률" : 83 },
	{ "date" : "3월", "All Risk" : 7, "All Issue" : 4, "Team1 risk" : 5, "Team2 risk" : 2, "_Team1_가동률" : 87, "_Team2_가동률" : 56, "_All_가동률" : 72 },
	 { "date" : "4월", "All Risk" : 16, "All Issue" : 2, "Team1 risk" : 10, "Team2 risk" : 6, "_Team1_가동률" : 50, "_Team2_가동률" : 80, "_All_가동률" : 65 },
	{ "date" : "5월", "All Risk" : 4, "All Issue" : 4, "Team1 risk": 3, "Team2 risk" : 1, "_Team1_가동률" : 98, "_Team2_가동률" : 67, "_All_가동률" : 83 },
	{ "date" : "6월", "All Risk" : 7, "All Issue" : 4, "Team1 risk" : 5, "Team2 risk" : 2, "_Team1_가동률" : 87, "_Team2_가동률" : 56, "_All_가동률" : 72 },
	 { "date" : "7월", "All Risk" : 16, "All Issue" : 2, "Team1 risk" : 10, "Team2 risk" : 6, "_Team1_가동률" : 50, "_Team2_가동률" : 80, "_All_가동률" : 65 },
	{ "date" : "8월", "All Risk" : 4, "All Issue" : 4, "Team1 risk": 3, "Team2 risk" : 1, "_Team1_가동률" : 98, "_Team2_가동률" : 67, "_All_가동률" : 83 },
	{ "date" : "9월", "All Risk" : 7, "All Issue" : 4, "Team1 risk" : 5, "Team2 risk" : 2, "_Team1_가동률" : 87, "_Team2_가동률" : 56, "_All_가동률" : 72 },
	 { "date" : "10월", "All Risk" : 16, "All Issue" : 2, "Team1 risk" : 10, "Team2 risk" : 6, "_Team1_가동률" : 50, "_Team2_가동률" : 80, "_All_가동률" : 65 },
	{ "date" : "11월", "All Risk" : 4, "All Issue" : 4, "Team1 risk": 3, "Team2 risk" : 1, "_Team1_가동률" : 98, "_Team2_가동률" : 67, "_All_가동률" : 83 },
	{ "date" : "12월", "All Risk" : 7, "All Issue" : 4, "Team1 risk" : 5, "Team2 risk" : 2, "_Team1_가동률" : 87, "_Team2_가동률" : 56, "_All_가동률" : 72 }
];

// 멤버 차트 데이터
var data_member = [
       {
      "name": "홍길동",
      "position": "선임",
      "risk": "1",
      "issue": "0",
      "ratio": "90",
      "part_year": "3",
      "work_year": "3"
    },
	 {
      "name": "홍길동",
      "position": "선임",
      "risk": "1",
      "issue": "0",
      "ratio": "85",
      "part_year": "3",
      "work_year": "6"
    },
	 {
      "name": "홍길동",
      "position": "선임",
      "risk": "2",
      "issue": "0",
      "ratio": "98",
      "part_year": "3",
      "work_year": "6"
    },
	 {
      "name": "홍길동",
      "position": "선임",
      "risk": "1",
      "issue": "0",
      "ratio": "95",
      "part_year": "3",
      "work_year": "6"
    },
	{
      "name": "홍길동",
      "position": "사원",
      "risk": "2",
      "issue": "0",
      "ratio": "98",
      "part_year": "3",
      "work_year": "6"
    },
];

// 데이터를 기간별로 정렬
var input_data = sortdata(dataSource,3); 

var line_data = [];
var bar_data = [];

/* 엑셀 import */
function loadFile(event, k) {
	alasql('SELECT * FROM FILE(?,{headers:true})',[event],function(data){
		var obj_key_length = Object.keys(data[0]).length;
        dataSource = data;
        var col_target_data = Object.keys(dataSource[0]);
        var col_target_v = col_target_data.slice(1,col_target_data.length);
        line_data = col_target_v.filter(islinegraph);
        bar_data = col_target_v.filter(isbargraph);


        if(k==1 && data_filter.monthly == obj_key_length) { // 월간
			dataSource = data;
			console.log(dataSource);
		}
		else if(k==2 && data_filter.member == obj_key_length) { // 멤버
			data_member = data;
			console.log(data_member);
		}
		else alert("잘못된 양식의 엑셀파일입니다. 엑셀파일을 확인해주세요.");

	});
	
    /*
    alasql('SELECT * FROM XLSX("mothly_report.xlsx", {headers:true})',[],function(data){
        console.log(data)
    });
    */
}


// 3,6,12개월 데이터 구분을 위한 함수, 최근 개월로 정렬하여 반환
function sortdata(origin_data, sort_month) {
	if(origin_data.length<sort_month) { // 데이터의 갯수가 정렬할려는 수치보다 작으면 데이터 최대값으로 설정
		sort_month=origin_data.length;
	}
	origin_data.sort(function (a, b) {
	   return parseFloat(b.date) - parseFloat(a.date);
	});
	var sort_data=[];
	
	for(var i=0;i<sort_month;i++) {
		sort_data[i]=origin_data[i];
	}
	return sort_data.sort(function (a, b) {
	   return parseFloat(a.date)-parseFloat(b.date);
	});
	
}

function islinegraph(value) {
    if(value[0] == '_') {
        return value;
    }
    else false;
}
function isbargraph(value) {
    if(value[0] != '_') {
        return value;
    }
    else false;
}

var col_target = [ "All Risk", "All Issue", "MUI risk", "Team1 risk", "Team2 risk" ];
var col_target_s = [ "All Risk", "All Issue", "MUI risk", "Team1 risk", "_Team2 risk" ];

// JUI 차트
jui.ready([ "chart.builder" ], function(chart) {
	// 탭1의 월간차크
     var col_target_data = Object.keys(dataSource[0]);
    var col_target_v = col_target_data.slice(1,col_target_data.length);
    line_data = col_target_v.filter(islinegraph);
    bar_data = col_target_v.filter(isbargraph);

	var c = chart("#chart-content", {
		height:400,
		axis : [{
			x : {
				type:"block",
				domain : "date",
				color : "#7977c2"
			},
			y : {
				type : "range",
				domain: [ 0, 50 ],
				step : 5,
				color : "#7977c2",
				line:true
			},
			data : input_data
		}, {
			x : {
				hide:true
			},
			y : {
				type : "range",
				domain : [ 0, 120 ],
				step : 5,
				color : "#87BB66",
				orient : "right",
				format : function(d) {
					return d+"%";
				}
			},
		    extend : 0
		}],
		brush : [{
			type : "column",
			target : bar_data,
			
			innerPadding : -20,
			outerPadding : 20,
			animate : true
		}, {
			type : "line",
			target : line_data,
			
			axis : 1,
			symbol : "curve",
			animate : true,
			display:"all"
		}],
		widget : [{
			type : "title",
			text : "이슈 & 리스트",
			align : "start",
			orient : "center",
			dx : -55,
			dy : 0,
			color:"#919191"
		}, {
			type : "title",
			text : "가동률",
			align : "end",
			orient : "center",
			dx : 50,
			dy : 0,
			color:"#919191"
		}, {
			type : "tooltip"
		}, {
			type : "legend",
			brush : [ 0, 1 ],
			filter : true
		}],
		style : {
			gridAxisBorderWidth : 2,
			titleFontSize : "11px",
			titleFontWeight : "bold",
			tooltipBorderColor : "#dcdcdc"
		}
	});
	
	// 탭2의 월간 차트
	var c2 = chart("#chart-content2", {
		height:400,
		axis : [{
			x : {
				type:"block",
				domain : "date",
				color : "#7977c2"
			},
			y : {
				type : "range",
				domain: [ 0, 50 ],
				step : 5,
				color : "#7977c2",
				line:true
			},
			data : input_data
		}, {
			x : {
				hide:true
			},
			y : {
				type : "range",
				domain : [ 0, 100 ],
				step : 5,
				color : "#87BB66",
				orient : "right",
				format : function(d) {
					return d+"%";
				}
			},
		    extend : 0
		}],
		brush : [{
			type : "column",
			target : bar_data,
			innerPadding : -20,
			outerPadding : 20,
			animate : true
		}, {
			type : "line",
			target : line_data,
			axis : 1,
			symbol : "curve",
			animate : true,
			display:"all"
		}],
		widget : [{
			type : "title",
			text : "이슈 & 리스트",
			align : "start",
			orient : "center",
			dx : -55,
			dy : 0,
			color:"#919191"
		}, {
			type : "title",
			text : "가동률",
			align : "end",
			orient : "center",
			dx : 50,
			dy : 0,
			color:"#919191"
		}, {
			type : "tooltip"
		}, {
			type : "legend",
			brush : [ 0, 1 ],
			filter : true
		}],
		style : {
			gridAxisBorderWidth : 2,
			titleFontSize : "11px",
			titleFontWeight : "bold",
			tooltipBorderColor : "#dcdcdc"
		}
	});

	// 멤버차트
	var c3 = chart("#chart-content3", {
		height:600,
		axis : [{
			x : {
				type : "range",
				domain : "ratio",
				step : 10,
				line : true
			},
			y : {
				type : "block",
				domain : "name",
				line : true
			},
			data : data_member
		}],
		brush : [{
			type : "bar",
			target : "ratio",
			display : "all",
			activeEvent : "mouseover",
			animate : true,
			colors : [ "#87BB66" ],
		}],
		widget : [{
			type : "title",
			text : "가동률",
			align : "start"
		}]
	});
	
	// 멤버차트
	var c4 = chart("#chart-content4", {
		height:600,
		axis : [{
			x : {
				type : "range",
				domain : "ratio",
				step : 10,
				line : true
			},
			y : {
				type : "block",
				domain : "name",
				line : true
			},
			data : data_member
		}],
		brush : [{
			type : "bar",
			target : "ratio",
			display : "all",
			activeEvent : "mouseover",
			animate : true,
			colors : [ "#87BB66" ],
		}],
		widget : [{
			type : "title",
			text : "가동률",
			align : "start"
		}]
	});
	
	// 탭1의 개월수 정렬 버튼
	$('#_tab1 #_sort_btn>.btn').click(function(){
		var index_val = $(this).index();
		
		if(index_val == 0) {
			c.axis(0).update(sortdata(dataSource,3));
			c.axis(1).update(sortdata(dataSource,3));
		}
		else if(index_val == 1) {
			c.axis(0).update(sortdata(dataSource,6));
			c.axis(1).update(sortdata(dataSource,6));
		}
		else {
			c.axis(0).update(sortdata(dataSource,12));
			c.axis(1).update(sortdata(dataSource,12));
		}
	});
    
    $('#_tab2 #_sort_btn>.btn').click(function(){
		var index_val = $(this).index();
		
		if(index_val == 0) {
			c2.axis(0).update(sortdata(dataSource,3));
			c2.axis(1).update(sortdata(dataSource,3));
		}
		else if(index_val == 1) {
			c2.axis(0).update(sortdata(dataSource,6));
			c2.axis(1).update(sortdata(dataSource,6));
		}
		else {
			c2.axis(0).update(sortdata(dataSource,12));
			c2.axis(1).update(sortdata(dataSource,12));
		}
	});
    
    $('#member_submit').click(function(){
        c3.axis(0).update(data_member);
		c4.axis(0).update(data_member);
    });
    
    $('#chart_submit').click(function(){
        c2.axis(0).update(sortdata(dataSource,3));
        c2.axis(1).update(sortdata(dataSource,3));
		c.axis(0).update(sortdata(dataSource,3));
        c.axis(1).update(sortdata(dataSource,3));
    });
    
});

$(document).ready(function() {
	console.log($('.comment_bx').height());
    var member_table = $('.member_table').DataTable( {
        data: data_member,
		"dom": '<"top"f>rt<"bottom"ip><"clear">',
        "columns": [
            { "data": "name" },
            { "data": "position" },
            { "data": "risk" },
            { "data": "issue" },
            { "data": "ratio" },
            { "data": "part_year" },
			{ "data": "work_year" }
        ]
    } );

    $('#member_submit').click(function(){
        member_table.clear().draw();
        member_table.rows.add(data_member).draw();
    });
} );