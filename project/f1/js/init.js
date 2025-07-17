var startSeason = 'F25_career_S2';

$(document).ready(function() {
    
    loadCSVFiles(seasonFilePaths);

    var table = $('#kindom-data').DataTable({
        paging: false,
        searching: false,
        ordering:  false,
        columns: [
            { data: "Season" },
            { data: "Rank" },
            { data: "Points" },
            { data: "PlayerName" },
            { data: "ConstructorName" },
            { data: "Wins" }, // 1등 횟수
            { data: "Podiums" } // 3등 안에 들었던 횟수
        ]
    });

    var trackTable = $('#track-data').DataTable({
        paging: false,
        searching: false,
        ordering:  false,
        columns: [
            { data: "TrackName" },
            { data: "Position" },
            { data: "Points" },
            { data: "PlayerName" },
            { data: "ConstructorName" },
            { data: "Time" },
            { data: "FastestLap" },
        ]
    });
    
    var constructorTable = $('#constructor-data').DataTable({
        paging: false,
        searching: false,
        ordering: false,
        columns: [
            { data: "Season" },
            { data: "Position" },
            { data: "Points" },
            { data: "ConstructorName" }
        ]
    });

    table.on('draw', function() {
        var body = $(table.table().body());
        body.unhighlight();
        body.highlight(table.search());
    });

    $('#dropdown1').on('change', function() {
        var selectedSeason = this.value;
        filterDataBySeason(selectedSeason);
        generateTrackButtons(selectedSeason);
        filterDataByConstructor(selectedSeason);
        showFullTable(selectedSeason); // 전체 테이블 표시 함수 호출
    });

    $('.trackTag').on('click', '.trackTag__btn', function() {
        $('.trackTag__btn').removeClass('selected'); // 모든 버튼에서 selected 클래스 제거
        $(this).addClass('selected'); // 클릭된 버튼에 selected 클래스 추가

        var selectedTrack = $(this).text();
        filterDataByTrack(selectedTrack);
    });

    $('.xi-info-o').hover(function() {
        var offset = $(this).offset();
        var layer_name = $(this).attr('data-layer');
        $('.' + layer_name).toggleClass('on');
        $('.' + layer_name).offset({ top: offset.top, left: offset.left + 30 });
    });

    $('.btn_comment').click(function() {
        $('.comment-box').toggleClass('on');
        $(this).toggleClass('on');
    });
});

let allData = {};
let currentSeason = '';

// 전체 테이블 표시 함수
function showFullTable(season) {
    if (season === '') {
        season = startSeason; // 기본 시즌 설정 (임의로 F3_S1 선택)
    }
    $('.trackTag__btn').eq(0).addClass('selected');

    filterDataBySeason(season); // 선택한 시즌 데이터 필터링
    $('#track-data').addClass('off'); // 트랙 데이터 숨기기
    $('#kindom-data').removeClass('off'); // 기본 데이터 표시
    $('#constructor-data').removeClass('off'); // Constructor 데이터 표시
}
function loadCSVFiles(seasonFilePaths) {
    let loadPromises = [];

    for (let season in seasonFilePaths) {
        let filePaths = seasonFilePaths[season];
        let seasonPromises = filePaths.map(filePath => $.ajax({
            url: filePath,
            dataType: 'text'
        }).then(data => {
            return csvToJson(data, season);
        }));

        loadPromises = loadPromises.concat(seasonPromises);
    }

    Promise.all(loadPromises).then(results => {
        results.forEach(dataArray => {
            dataArray.forEach(data => {
                if (!allData[data.Season]) {
                    allData[data.Season] = [];
                }
                allData[data.Season].push(data);
            });
        });
        filterDataBySeason(startSeason); // 초기 로드시 F3_S1 데이터 로드
        filterDataByConstructor(startSeason);
        generateTrackButtons(startSeason); // 초기 트랙 버튼 생성
        $('.trackTag__btn').eq(0).addClass('selected');
    }).catch(error => {
        console.error('Error loading CSV files:', error);
    });
}

function csvToJson(csv, season) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') {
            continue; // 빈 줄 무시
        }

        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j] ? currentline[j].trim() : ''; // 빈 필드 처리
        }
        obj["Season"] = season; // 시즌 정보 추가

        // Time과 FastestLap 필드에서 마지막 4자리 제거
        if (obj["Time"] && obj["Time"].length > 4) {
            obj["Time"] = obj["Time"].slice(0, -4);
        }
        if (obj["FastestLap"] && obj["FastestLap"].length > 4) {
            obj["FastestLap"] = obj["FastestLap"].slice(0, -4);
        }

        // ConstructorName이 'World Car'인 경우 'AlphaTauri'로 변경
        if (obj["ConstructorName"] === 'World Car') {
            obj["ConstructorName"] = 'AlphaTauri';
        }

        result.push(obj);
    }
    return result;
}



function filterDataBySeason(season) {
    let filteredData = [];

    if (season === '') {
        for (let key in allData) {
            filteredData = filteredData.concat(allData[key]);
        }
    } else {
        filteredData = allData[season] || [];
    }

    currentSeason = season;
    highlightFastestLap(filteredData); // highlightFastestLap 함수 호출
    calculateDriverPoints(filteredData);
}


function filterDataByTrack(track) {
    if (track === '전체') {
        filterDataBySeason(currentSeason);
        $('#track-data').addClass('off');
        $('#kindom-data').removeClass('off');
        $('#constructor-data').removeClass('off');
    } else {
        let filteredData = allData[currentSeason].filter(record => record.TrackName === track);
        displayTrackData(filteredData);
        $('#track-data').removeClass('off');
        $('#kindom-data').addClass('off');
        $('#constructor-data').addClass('off');
    }
}

function filterDataByConstructor(season) {
    var constructorPoints = {};
    var seasonData = allData[season] || [];

    seasonData.forEach(record => {
        var constructorName = record['ConstructorName'];
        var points = parseFloat(record['Points']) || 0;

        // World Car를 AlphaTauri로 변환
        if (constructorName === 'World Car') {
            constructorName = 'AlphaTauri';
        }

        if (!constructorPoints[constructorName]) {
            constructorPoints[constructorName] = {
                Points: 0
            };
        }

        constructorPoints[constructorName].Points += points;
    });

    var constructorData = Object.keys(constructorPoints).map(function(key) {
        return {
            Points: constructorPoints[key].Points,
            ConstructorName: key
        };
    }).sort(function(a, b) {
        return b.Points - a.Points;
    });

    constructorData.forEach(function(data, index) {
        data.Position = index + 1;
        data.Season = season;

        // World Car를 AlphaTauri로 변환
        if (data.ConstructorName === 'World Car') {
            data.ConstructorName = 'AlphaTauri';
        }
    });

    // DataTable 객체를 가져옵니다.
    var constructorTable = $('#constructor-data').DataTable();

    // DataTable이 초기화되었는지 확인합니다.
    if ($.fn.DataTable.isDataTable('#constructor-data')) {
        // DataTable이 이미 초기화된 경우, 기존 DataTable을 업데이트합니다.
        constructorTable.clear().rows.add(constructorData).draw();
    } else {
        // DataTable이 초기화되지 않은 경우, DataTable을 초기화하고 데이터를 추가합니다.
        constructorTable = $('#constructor-data').DataTable({
            paging: false,
            searching: false,
            ordering: false,
            columns: [
                { data: "Season" },
                { data: "Position" },
                { data: "Points" },
                { data: "ConstructorName" }
            ]
        });

        constructorTable.rows.add(constructorData).draw();
    }
    calculateDriverPoints(seasonData);
}


function calculateDriverPoints(data) {
    const pointsSummary = {};

    data.forEach(record => {
        const playerName = record.PlayerName;
        const constructorName = record.ConstructorName;
        const points = parseFloat(record.Points) || 0;
        const position = parseInt(record.Position);

        if (!pointsSummary[playerName]) {
            pointsSummary[playerName] = {
                points: 0,
                constructorName: constructorName,
                wins: 0,
                podiums: 0,
                Season: record.Season // 시즌 정보 추가
            };
        }

        pointsSummary[playerName].points += points;

        if (position === 1) {
            pointsSummary[playerName].wins += 1;
        }

        if (position <= 3) {
            pointsSummary[playerName].podiums += 1;
        }
    });

    const sortedPointsSummary = Object.entries(pointsSummary)
        .sort((a, b) => b[1].points - a[1].points)
        .reduce((acc, [key, value], index) => {
            acc[key] = { ...value, rank: index + 1 };
            return acc;
        }, {});

    const tableData = Object.entries(sortedPointsSummary).map(([playerName, data]) => {
        return {
            "Season": data.Season, // 시즌 정보 추가
            "Rank": data.rank,
            "PlayerName": playerName,
            "ConstructorName": data.constructorName,
            "Points": data.points,
            "Wins": data.wins,
            "Podiums": data.podiums
        };
    });

    $('#kindom-data').DataTable().clear().rows.add(tableData).draw();
    highlightFastestLap(data);
}

function highlightFastestLap(data) {
    data.forEach(record => {
        const hasFastestLap = record.HasFastestLap === 'True';
        const teamName = record.ConstructorName;
        const driverName = record.PlayerName;

        if (hasFastestLap) {
            // FastestLap을 변경할 HTML 요소를 선택하여 색상을 변경
            $(`td:contains(${record.FastestLap})`).addClass('fastlap');
        }
        if (teamName == 'Alpine') $(`td:contains(${record.ConstructorName})`).addClass('alpine');
        else if (teamName == 'McLaren') $(`td:contains(${record.ConstructorName})`).addClass('mcLaren');
        else if (teamName == 'Red Bull') $(`td:contains(${record.ConstructorName})`).addClass('redbull');
        else if (teamName == 'Mercedes-AMG Petronas') $(`td:contains(${record.ConstructorName})`).addClass('mer');
        else if (teamName == 'AlphaTauri') $(`td:contains(${record.ConstructorName})`).addClass('tauri');
        else if (teamName == 'World Car') $(`td:contains(${record.ConstructorName})`).addClass('tauri');
        else if (teamName == 'Aston Martin') $(`td:contains(${record.ConstructorName})`).addClass('aston');
        else if (teamName == 'Ferrari') $(`td:contains(${record.ConstructorName})`).addClass('ferrari');
        else if (teamName == 'Alfa Romeo') $(`td:contains(${record.ConstructorName})`).addClass('romeo');
        else if (teamName == 'Haas') $(`td:contains(${record.ConstructorName})`).addClass('hass');
        else if (teamName == 'Williams') $(`td:contains(${record.ConstructorName})`).addClass('williams');
        else if (teamName == 'Sauber') $(`td:contains(${record.ConstructorName})`).addClass('sauber');
        else if (teamName == 'APXGP') $(`td:contains(${record.ConstructorName})`).addClass('apxgp');
        else if (teamName == 'RB') $(`td:contains(${record.ConstructorName})`).addClass('rb');

        if (driverName == '0x5e0x5e' || driverName == 'kkulkkule' || driverName == 'dev-Tobby' || driverName == 'dayofsoul' || driverName == 'Naaz82' || driverName == 'jjk') {
            $(`td:contains(${record.PlayerName})`).addClass('textBold');
        } 
        
        
    });
}

function displayTrackData(data) {
    $('#track-data').DataTable().clear().rows.add(data).draw();
    // 테이블 데이터 갱신 후에 FastestLap을 처리하는 함수 호출
    highlightFastestLap(data);
}

function generateTrackButtons(season) {
    const trackSet = new Set(allData[season].map(record => record.TrackName));
    let buttonsHtml = '<button type="button" class="trackTag__btn">전체</button>';

    trackSet.forEach(track => {
        buttonsHtml += `<button type="button" class="trackTag__btn">${track}</button>`;
    });

    $('.trackTag').html(buttonsHtml);
}