$.fn.dataTable.ext.search.push(
    // function( settings, data, dataIndex ) {
    //     var this_grade = $("#dropdown3 option:selected").val();
    //     var grade = parseFloat( data[2] ) || 0; // use data for the age column
    //     console.log(this_grade+','+grade);
        
    //     if ( this_grade >= 10 )  {
    //       return true;
    //     }
    //     else if ( this_grade >= 4 && grade >= this_grade )  {
    //       console.log('ok');
    //       return true;
    //     }
    //     else if ( this_grade <= 3 && grade <= this_grade )  {
    //       console.log('ok');
    //       return true;
    //     }
    //     return false;
    // }
);

$(document).ready(function() {
  loadJSON();

    var table = $('#kindom-data').DataTable( {
      paging: false,  
      "ajax": "data/test.json",
        "columns": [
          { "data": "Season" },
          { "data": "TrackName" },
          { "data": "Position" },
          { "data": "PlayerName" },
          { "data": "ConstructorName" },
          { "data": "Time" },
          { "data": "FastestLap" },
          { "data": "Points" },
          { "data": "Penalty" }
        ]
    } );
    
    table.on( 'draw', function () {
        var body = $( table.table().body() );
        body.unhighlight();
        body.highlight( table.search() );  
    } );
    
    // filter option
    $('#dropdown1').on('change', function () { // 나라
      table.columns(0).search( this.value ).draw();
    } );
    $('#dropdown2').on('change', function () { // 직업
      table.columns(1).search( this.value ).draw();
    } );
    $('.xi-info-o').hover(function() {
      var offset = $(this).offset();
      var layer_name = $(this).attr('data-layer');
      $('.'+layer_name).toggleClass('on');
      $('.'+layer_name).offset({top:offset.top,left:offset.left+30});
    });
    $('.btn_comment').click(function() {
      $('.comment-box').toggleClass('on');
      $(this).toggleClass('on');
    });
} );




 // JSON 데이터
 const jsonFilePath = './data/test.json';

 // JSON 데이터
 let jsonData;

// 트랙별 드라이버별 합계 포인트 계산 함수
function calculateDriverPoints(data) {
  const pointsSummary = {};

  // 각 트랙의 데이터에 대해 순회
  data.forEach(record => {

      // 추가된 조건: Season이 "F3_S5"인 경우에만 처리
      if (record.Season === 'F3_S5') {
        const playerName = record.PlayerName;
        const points = record.Points;

        // playerName을 key로 사용하여 포인트 누적
        if (pointsSummary[playerName]) {
            pointsSummary[playerName] += points;
        } else {
            pointsSummary[playerName] = points;
        }
    }
  });

  // 포인트가 높은 순서로 정렬
  const sortedPointsSummary = Object.entries(pointsSummary)
  .sort((a, b) => b[1] - a[1])
  .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
  }, {});


  // 테이블에 결과를 추가
  const tableBody = $('#pointsTableBody');
  tableBody.empty(); // 기존 데이터 삭제

  // 누적된 드라이버별 합계 포인트를 테이블에 추가
    Object.entries(sortedPointsSummary).forEach(([playerName, totalPoints]) => {
        const row = `<tr>
                        <td>${playerName}</td>
                        <td>${totalPoints}</td>
                    </tr>`;

        tableBody.append(row);
    });
}


// JSON 파일을 읽어오는 함수
function loadJSON() {
  $.ajax({
      url: jsonFilePath,
      dataType: 'json',
      success: function(data) {
        jsonData = data;
        // 페이지 로드 시 한 번 실행하고, 이후에는 필요에 따라 호출
        loadDropdownOptions(null);
          calculateDriverPoints(data.data);
      },
      error: function(xhr, status, error) {
          console.error('Error loading JSON file:', error);
      }
  });
}