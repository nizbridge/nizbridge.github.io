$(function () {
  const $tabs = $('.tab-btn');
  const $tbody = $('#time-table tbody');
  const $raceClass = $('#race-class');
  const $raceGrade = $('#race-grade');
  const $raceCount = $('#race-count');
  const $currentTime = $('#current-time');

  // 주 시작: 화요일 기준
  const weekOrder = ['Tue','Wed','Thu','Fri','Sat','Sun','Mon'];

  // UTC → KST 변환
  function utcToKst(utcTime) {
    const [h, m] = utcTime.split(':').map(Number);
    const utcDate = new Date(Date.UTC(2025, 0, 1, h, m));
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    const kh = String(kstDate.getUTCHours()).padStart(2, '0');
    const km = String(kstDate.getUTCMinutes()).padStart(2, '0');
    return `${kh}:${km}`;
  }

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function renderTimes(data) {
    $tbody.empty();

    if (data.schedule) {
      // Weekly 레이스
      const html = Object.entries(data.schedule).map(([day, times]) => {
        const timesKst = times.map(utcToKst);
        const rows = chunk(timesKst, 4);
        const dayRows = rows.map(row => {
          const cells = row.concat(Array(4 - row.length).fill(''));
          return '<tr>' + cells.map(t => `<td>${t}</td>`).join('') + '</tr>';
        }).join('');
        return `<tr><td colspan="4" style="text-align:center;font-weight:600;background:rgba(79,163,255,0.1)">${day}</td></tr>` + dayRows;
      }).join('');
      $tbody.html(html);
    } else {
      // Daily 레이스
      const timesUtc = data.times || [];
      const timesKst = timesUtc.map(utcToKst);
      const rows = chunk(timesKst, 4);
      const html = rows.map(row => {
        const cells = row.concat(Array(4 - row.length).fill(''));
        return '<tr>' + cells.map(t => `<td>${t}</td>`).join('') + '</tr>';
      }).join('');
      $tbody.html(html);
    }

    // race info 업데이트
    $('#info-name').text(data.name || '-');
    $('#info-grade').text(data.grade || '-');
    $('#info-class').text(data.class || '-');
    $('#info-car').text(data.car || '-');
    $('#info-time').text(data.time || '-');
    $raceClass.text(data.class || '-');
    $raceGrade.text(data.grade || '-');
    $raceCount.text(data.times ? data.times.length : 0);

    markPastAll();
  }

  // 일반 times past 처리
  function markPastTimes() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentMinutes = kst.getUTCHours() * 60 + kst.getUTCMinutes();

    $('#time-table tbody tr').each(function() {
      const $tr = $(this);
      if ($tr.find('td[colspan="4"]').length) return; // 요일 셀 스킵
      $tr.find('td').each(function() {
        const text = $(this).text().trim();
        if (!text) return;
        const [h,m] = text.split(':').map(Number);
        if(h*60+m < currentMinutes) $(this).addClass('past');
        else $(this).removeClass('past');
      });
    });
  }

  // Weekly schedule past 처리
  function markPastWeekly() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9*60*60*1000);
    const currentMinutes = kst.getUTCHours()*60 + kst.getUTCMinutes();
  
    const weekOrder = ['Tue','Wed','Thu','Fri','Sat','Sun','Mon']; // 화요일 시작
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const todayName = dayNames[kst.getUTCDay()];
    const todayIndex = weekOrder.indexOf(todayName);
  
    let currentDay = null;
    $('#time-table tbody tr').each(function(){
      const $tr = $(this);
      const dayCell = $tr.find('td[colspan="4"]');
      
      if(dayCell.length){
        currentDay = dayCell.text().trim();
      } else {
        if(!currentDay) return;
        const dayIndex = weekOrder.indexOf(currentDay);
  
        if(dayIndex < todayIndex){ 
          // 오늘 기준 이전 요일 → 전체 past
          $tr.find('td').addClass('past');
        } else if(dayIndex === todayIndex){
          // 오늘 → 시간 비교
          $tr.find('td').each(function(){
            const text = $(this).text().trim();
            if(!text) return;
            const [h,m] = text.split(':').map(Number);
            if(h*60+m < currentMinutes) $(this).addClass('past');
            else $(this).removeClass('past');
          });
        } else {
          // 오늘 이후 요일 → future
          $tr.find('td').removeClass('past');
        }
      }
    });
  }
  

  // 모든 past 처리
  function markPastAll() {
    markPastTimes();
    markPastWeekly();
  }

  // 현재 시간 업데이트
  function updateCurrentTime() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const h = String(kst.getUTCHours()).padStart(2,'0');
    const m = String(kst.getUTCMinutes()).padStart(2,'0');
    const s = String(kst.getUTCSeconds()).padStart(2,'0');
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dayName = weekdays[kst.getUTCDay()];
    $currentTime.text(`${h}:${m}:${s} (KST, ${dayName})`);
    markPastAll();
  }

  function loadJson(url){
    $tbody.html('<tr><td colspan="4" style="text-align:center;opacity:0.6;padding:24px">로딩 중…</td></tr>');
    $.getJSON(url)
      .done(data => renderTimes(data))
      .fail(()=>{$tbody.html('<tr><td colspan="4" style="text-align:center;color:#ffb4b4;padding:20px">데이터 로드 실패</td></tr>');});
  }

  $tabs.on('click', function(){
    const $btn = $(this);
    if($btn.hasClass('active')) return;
    $tabs.removeClass('active');
    $btn.addClass('active');
    loadJson($btn.data('src'));
  });

  loadJson($tabs.filter('.active').data('src'));
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});
