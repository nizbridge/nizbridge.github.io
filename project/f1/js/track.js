$(document).ready(function() {
    

    let allData = [];

    loadCSVFiles(seasonFilePaths);

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
                allData = allData.concat(dataArray);
            });
            populateTables();
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
                continue;
            }

            const obj = {};
            const currentline = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim()] = currentline[j] ? currentline[j].trim() : '';
            }
            obj["Season"] = season;

            if (obj["FastestLap"] && obj["FastestLap"].length > 4) {
                obj["FastestLap"] = obj["FastestLap"].slice(0, -4);
            }

            result.push(obj);
        }
        return result;
    }

    function populateTables() {
        let tracks = new Set();
        
        allData.forEach(record => {
            tracks.add(record.TrackName);
        });

        let container = $('#tables-container');
        container.empty();

        tracks.forEach(track => {
            container.append(`
                <div class="tableBox">
                    <button type="button" class="morebtn">more</button>
                    <h2>${track}</h2>
                    <table id="track-leaderboard-${track.replace(/\s+/g, '-')}" class="display">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Season</th>
                                <th>Driver</th>
                                
                                <th>FastestLap</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `);

            // 각 테이블에 대해 데이터 테이블을 초기화
            updateTable(track);
        });
    }

    function updateTable(track) {
        let filteredData = allData.filter(record => record.TrackName === track);
    
        // 랩타임을 기준으로 정렬
        let sortedData = filteredData.sort((a, b) => {
            let timeA = parseTime(a.FastestLap);
            let timeB = parseTime(b.FastestLap);
            return (isNaN(timeA) ? Infinity : timeA) - (isNaN(timeB) ? Infinity : timeB);
        });
    
        // 중복된 드라이버 이름을 필터링하여 가장 좋은 기록만 남김
        let uniqueDrivers = {};
        sortedData = sortedData.filter(record => {
            if (uniqueDrivers[record.PlayerName]) {
                return false;
            } else {
                uniqueDrivers[record.PlayerName] = true;
                return true;
            }
        });
    
        // 상위 10개만 선택
        let top10Data = sortedData.slice(0, 5).map((record, index) => {
            let fastestLapTime = formatTime(parseTime(record.FastestLap));
            let gap = index === 0 ? '' :
                      ` (+${formatGap(parseTime(record.FastestLap) - parseTime(sortedData[0].FastestLap))})`;
    
            return {
                Rank: index + 1,
                Season: record.Season,
                PlayerName: record.PlayerName,
                ConstructorName: record.ConstructorName,
                FastestLap: `${fastestLapTime}${gap}`
            };
        });
    
        // DataTable 업데이트
        $(`#track-leaderboard-${track.replace(/\s+/g, '-')}`).DataTable({
            paging: false,
            searching: false,
            ordering: false,
            data: top10Data,
            columns: [
                { data: "Rank" },
                { data: "Season" },
                { data: "PlayerName" },
                { data: "FastestLap" }
            ],
            destroy: true // 테이블을 새로 생성하기 위해 이전 테이블을 제거
        });
    }
    

    function parseTime(timeString) {
        if (!timeString || !timeString.match(/^(\d{2}):(\d{2}):(\d{2}\.\d{3})$/)) {
            console.warn(`Invalid time format: ${timeString}`);
            return NaN;
        }

        let [_, hours, minutes, seconds] = timeString.match(/^(\d{2}):(\d{2}):(\d{2}\.\d{3})$/);
        
        let totalSeconds = parseInt(hours, 10) * 3600 + 
                           parseInt(minutes, 10) * 60 + 
                           parseFloat(seconds);

        return totalSeconds;
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "N/A";

        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let secs = (seconds % 60).toFixed(3);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;
    }

    function formatGap(seconds) {
        if (isNaN(seconds)) return "N/A";
        return seconds.toFixed(3); // 초 단위로 포맷 (소수점 3자리)
    }

    function openPopup(track) {
        const dialog = $('.mainDialog');
        const dialogContent = $('.mainDialog__con');
    
        // 팝업 내용을 비우고 새 테이블을 추가
        dialogContent.empty();
        dialogContent.append(`
            <button type="button" class="closePopupBtn">Close</button>
            <h2>${track} - Full Records</h2>
            <table id="popup-leaderboard" class="display">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Season</th>
                        <th>Driver</th>
                        <th>FastestLap</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `);
    
        updatePopupTable(track);
        dialog.show();
        
    }
    
    function updatePopupTable(track) {
        let filteredData = allData.filter(record => record.TrackName === track);

        let sortedData = filteredData.sort((a, b) => {
            let timeA = parseTime(a.FastestLap);
            let timeB = parseTime(b.FastestLap);
            return (isNaN(timeA) ? Infinity : timeA) - (isNaN(timeB) ? Infinity : timeB);
        });

        // 중복된 드라이버 이름을 필터링하여 가장 좋은 기록만 남김
        let uniqueDrivers = {};
        sortedData = sortedData.filter(record => {
            if (uniqueDrivers[record.PlayerName]) {
                return false;
            } else {
                uniqueDrivers[record.PlayerName] = true;
                return true;
            }
        });

        let tableData = sortedData.map((record, index) => {
            let fastestLapTime = formatTime(parseTime(record.FastestLap));
            let gap = index === 0 ? '' :
                      ` (+${formatGap(parseTime(record.FastestLap) - parseTime(sortedData[0].FastestLap))})`;

            return {
                Rank: index + 1,
                Season: record.Season,
                PlayerName: record.PlayerName,
                ConstructorName: record.ConstructorName,
                FastestLap: `${fastestLapTime}${gap}`
            };
        });
        
        

        $('#popup-leaderboard').DataTable({
            paging: false,
            searching: false,
            ordering: false,
            data: tableData,
            columns: [
                { data: "Rank" },
                { data: "Season" },
                { data: "PlayerName" },
                { data: "FastestLap" }
            ],
            destroy: true // 테이블을 새로 생성하기 위해 이전 테이블을 제거
        });
    }

    $(document).on('click', '.morebtn', function() {
        
        let trackName = $(this).closest('.tableBox').find('h2').text().trim();
        openPopup(trackName);
        $('body').css('overflow','hidden');
    });
    $(document).on('click', '.closePopupBtn', function() {
        $('.mainDialog').hide();
        $('body').css('overflow','auto');
    });
    
    
});

