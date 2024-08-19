$(document).ready(function() {
    const seasonFilePaths = {
        'F3_S1': [
            'data/f3_s1/event_200977_tier_1_results.csv', // Bahrain
            'data/f3_s1/event_201216_tier_1_results.csv', // Saudi
            'data/f3_s1/event_201215_tier_1_results.csv', // Australia
            'data/f3_s1/event_201201_tier_1_results.csv', // Japan
            'data/f3_s1/event_201213_tier_1_results.csv', // Miami
            'data/f3_s1/event_201212_tier_1_results.csv', // Imola
            'data/f3_s1/event_201209_tier_1_results.csv', // Canada
            'data/f3_s1/event_201210_tier_1_results.csv', // Spain
            'data/f3_s1/event_201208_tier_1_results.csv', // Autria
            'data/f3_s1/event_201207_tier_1_results.csv', // Britain
            'data/f3_s1/event_201206_tier_1_results.csv', // Hungary
            'data/f3_s1/event_201205_tier_1_results.csv', // Belgium
            'data/f3_s1/event_201204_tier_1_results.csv', // Netherlands
            'data/f3_s1/event_201203_tier_1_results.csv', // Monza
            'data/f3_s1/event_201214_tier_1_results.csv', // Azerbaijan
            'data/f3_s1/event_201202_tier_1_results.csv', // Singapore
            'data/f3_s1/event_201199_tier_1_results.csv', // Texax
            'data/f3_s1/event_201127_tier_1_results.csv', // Mexico
            'data/f3_s1/event_201126_tier_1_results.csv', // Brazil
            'data/f3_s1/event_201125_tier_1_results.csv', // LasVegas
            'data/f3_s1/event_201200_tier_1_results.csv', // Lusail
            'data/f3_s1/event_201124_tier_1_results.csv', // AbuDhabi
        ],
        'F3_S2': [
            'data/f3_s2/event_252300_tier_1_results.csv',
            'data/f3_s2/event_252301_tier_1_results.csv',
            'data/f3_s2/event_252302_tier_1_results.csv',
            'data/f3_s2/event_252303_tier_1_results.csv',
            'data/f3_s2/event_252304_tier_1_results.csv',
            'data/f3_s2/event_252305_tier_1_results.csv',
            'data/f3_s2/event_252306_tier_1_results.csv',
            'data/f3_s2/event_252307_tier_1_results.csv',
            'data/f3_s2/event_252308_tier_1_results.csv',
            'data/f3_s2/event_252309_tier_1_results.csv',
            'data/f3_s2/event_252310_tier_1_results.csv',
            'data/f3_s2/event_252311_tier_1_results.csv',
            'data/f3_s2/event_252312_tier_1_results.csv',
            'data/f3_s2/event_252313_tier_1_results.csv',
            'data/f3_s2/event_252314_tier_1_results.csv',
            'data/f3_s2/event_252315_tier_1_results.csv',
        ],
        'F3_S3': [
            'data/f3_s3/event_467172_tier_1_results.csv',
            'data/f3_s3/event_467173_tier_1_results.csv',
        ],
        'F4_S1': [
            'data/f4_s1/event_177632_tier_1_results.csv',
            'data/f4_s1/event_177635_tier_1_results.csv',
            'data/f4_s1/event_177636_tier_1_results.csv',
            'data/f4_s1/event_177637_tier_1_results.csv',
            'data/f4_s1/event_177638_tier_1_results.csv',
            'data/f4_s1/event_177639_tier_1_results.csv',
            'data/f4_s1/event_177640_tier_1_results.csv',
            'data/f4_s1/event_177651_tier_1_results.csv',
            'data/f4_s1/event_179913_tier_1_results.csv',
        ],
        'F4_S2': [
            'data/f4_s2/event_199644_tier_1_results.csv',
            'data/f4_s2/event_199645_tier_1_results.csv',
        ],
        'JJ_S1': [
            'data/jj_s1/event_623042_tier_1_results.csv',
            'data/jj_s1/event_623043_tier_1_results.csv',
        ]
    };

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

