$(function () {
  const $tabs = $('.tab-btn');
  const $tbody = $('#time-table tbody');
  const $raceClass = $('#race-class');
  const $raceGrade = $('#race-grade');
  const $raceCount = $('#race-count');
  const $currentTime = $('#current-time');

  function updateCurrentTime() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const h = String(kst.getUTCHours()).padStart(2, '0');
    const m = String(kst.getUTCMinutes()).padStart(2, '0');
    const s = String(kst.getUTCSeconds()).padStart(2, '0');
    $currentTime.text(`${h}:${m}:${s} (KST)`);
    markPastTimes(`${h}:${m}`);
  }

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
    const $tbody = $('#time-table tbody');
  
    // schedule 존재 여부 확인
    if (data.schedule) {
      const html = Object.entries(data.schedule).map(([day, times]) => {
        // 각 시간 UTC → KST 변환
        const timesKst = times.map(utcToKst);
        
        // 1행에 4개씩 나누기
        const rows = chunk(timesKst, 4);
        
        const dayRows = rows.map(row => {
          const cells = row.concat(Array(4 - row.length).fill(''));
          return '<tr>' + cells.map(t => `<td>${t}</td>`).join('') + '</tr>';
        }).join('');
        
        // 요일 표시
        return `<tr><td colspan="4" style="text-align:center;font-weight:600;background:rgba(79,163,255,0.1)">${day}</td></tr>` + dayRows;
      }).join('');
    
      $tbody.html(html);
    } else {
      // 기존 times 배열 처리
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
  }
  
  

  // 🕒 이미 지난 시간 마킹
  function markPastTimes(currentHHMM) {
    const [ch, cm] = currentHHMM.split(':').map(Number);
    const currentMinutes = ch * 60 + cm;

    $('#time-table td').each(function () {
      const text = $(this).text().trim();
      if (!text) return;
      const [h, m] = text.split(':').map(Number);
      const timeMinutes = h * 60 + m;
      if (timeMinutes < currentMinutes) {
        $(this).addClass('past');
      } else {
        $(this).removeClass('past');
      }
    });
  }

  function loadJson(url) {
    $tbody.html('<tr><td colspan="4" style="text-align:center;opacity:0.6;padding:24px">로딩 중…</td></tr>');
    $.getJSON(url)
      .done(data => renderTimes(data))
      .fail(() => {
        $tbody.html('<tr><td colspan="4" style="text-align:center;color:#ffb4b4;padding:20px">데이터 로드 실패</td></tr>');
      });
  }

  $tabs.on('click', function () {
    const $btn = $(this);
    if ($btn.hasClass('active')) return;
    $tabs.removeClass('active');
    $btn.addClass('active');
    loadJson($btn.data('src'));
  });

  loadJson($tabs.filter('.active').data('src'));
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});
