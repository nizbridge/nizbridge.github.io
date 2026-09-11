const $ = (selector, parent = document) => parent.querySelector(selector);
const filters = ["class", "track", "vehicle"];
let catalog, rawData;

function populate(name, values, placeholder) {
  const select = $(`#${name}-filter`); select.replaceChildren(new Option(placeholder, ""));
  values.forEach((value) => select.add(new Option(value, value)));
}
function syncVehicles() {
  const selected = $("#class-filter").value;
  const vehicles = [...new Set(catalog.setups.filter((item) => !selected || item.class === selected).map((item) => item.vehicle))].sort();
  populate("vehicle", vehicles, selected ? "전체 차량" : "클래스를 먼저 선택하세요");
  $("#vehicle-filter").disabled = !selected;
}
function renderSetups() {
  const active = Object.fromEntries(filters.map((name) => [name, $(`#${name}-filter`).value]));
  const visible = catalog.setups.filter((setup) => filters.every((name) => !active[name] || setup[name] === active[name]));
  const grid = $("#setup-grid"); grid.replaceChildren();
  visible.forEach((setup) => { const card = $("#setup-card").content.cloneNode(true); $(".class-badge", card).textContent = setup.class; $(".confidence", card).textContent = `신뢰도 ${setup.confidence}`; $("h2", card).textContent = setup.vehicle; $(".track", card).textContent = setup.track; $(".template", card).textContent = setup.template_vehicle; $(".status", card).textContent = setup.validation_status === "REVIEW_V141" ? "V1.4.1 재검증" : (setup.template_status === "EXACT" ? "차량 일치" : "검증 필요"); const link = $(".download", card); const releaseDirectory = setup.release === "1.4.1" ? "2026-08-v1.4.1" : "2026-07"; link.href = `../data/reference-setups/${releaseDirectory}/${encodeURI(setup.file)}`; link.download = setup.file.split("/").pop(); grid.append(card); });
  $("#empty").hidden = visible.length > 0; $("#result-summary").textContent = `${visible.length}개의 셋업`;
}
function renderRaw(kind) {
  const rows = kind === "tracks" ? rawData.trackProfiles : rawData.carTraits; const table = $("#raw-table"); table.replaceChildren(); if (!rows.length) return;
  const head = document.createElement("thead"), headerRow = document.createElement("tr"); Object.keys(rows[0]).forEach((key) => { const cell = document.createElement("th"); cell.textContent = key; headerRow.append(cell); }); head.append(headerRow); const body = document.createElement("tbody"); rows.forEach((row) => { const rowEl = document.createElement("tr"); Object.values(row).forEach((value) => { const cell = document.createElement("td"); cell.textContent = value; rowEl.append(cell); }); body.append(rowEl); }); table.append(head, body);
}
function selectView(view) { document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.id === view)); document.querySelectorAll(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.view === view)); }
Promise.all([fetch("../data/derived/catalog.json"), fetch("../data/derived/raw-data.json")]).then(async ([catalogResponse, rawResponse]) => [await catalogResponse.json(), await rawResponse.json()]).then(([data, raw]) => { catalog = data; rawData = raw; const compactDate = catalog.release.releasedOn.replaceAll("-", "").slice(2); $("#release").textContent = `RELEASE V${catalog.release.version} (${compactDate})`; $("#setup-note").textContent = `선택한 차량과 서킷에 맞는 안정형 기준 셋업을 보여줍니다. 현재 상태: ${catalog.release.setupValidation}.`; populate("class", catalog.classes, "전체 클래스"); populate("track", catalog.tracks, "전체 서킷"); syncVehicles(); $("#class-filter").addEventListener("change", syncVehicles); $("#search-button").addEventListener("click", renderSetups); $("#reset").addEventListener("click", () => { $("#class-filter").value = ""; $("#track-filter").value = ""; syncVehicles(); renderSetups(); }); document.querySelectorAll(".nav-link").forEach((button) => button.addEventListener("click", () => selectView(button.dataset.view))); document.querySelectorAll(".tab").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab === button)); renderRaw(button.dataset.table); })); renderSetups(); renderRaw("tracks"); }).catch(() => { $("#result-summary").textContent = "데이터를 불러오지 못했습니다."; });
