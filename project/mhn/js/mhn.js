let testData = JSON.parse(JSON.stringify(TestFile));
console.log(testData);

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResult = document.getElementById("searchResult");

// 스킬 및 장비 데이터 (예시)
const skills = ["스킬 1", "스킬 2", "스킬 3"];
const equipment = ["장비 1", "장비 2", "장비 3"];


document.addEventListener("DOMContentLoaded", function () {
    const simulationForm = document.getElementById("simulationForm");
    const simulationResult = document.getElementById("simulationResult");

    simulationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedSkill = document.getElementById("skill").value;
        const selectedEquipment = document.getElementById("equipment").value;

        // 여기에서 스킬 시뮬레이션 로직을 작성하고 결과를 계산합니다.
        // 예를 들어, 선택된 스킬과 장비의 조합에 따른 시뮬레이션 결과를 계산할 수 있습니다.

        // 결과를 출력
        const resultHTML = `
            <h2>스킬 시뮬레이션 결과</h2>
            <p>선택된 스킬: ${selectedSkill}</p>
            <p>선택된 장비: ${selectedEquipment}</p>
            <!-- 시뮬레이션 결과를 여기에 추가 -->
        `;

        simulationResult.innerHTML = resultHTML;
    });



    // 검색 버튼 클릭 시
    searchButton.addEventListener("click", function () {
        const searchTerm = searchInput.value.toLowerCase(); // 검색어를 소문자로 변환

        // 스킬 및 장비 배열에서 검색어와 일치하는 요소 찾기
        const matchingSkills = skills.filter(skill => skill.toLowerCase().includes(searchTerm));
        const matchingEquipment = equipment.filter(equip => equip.toLowerCase().includes(searchTerm));

        // 검색 결과 출력
        displaySearchResults(matchingSkills, matchingEquipment);
    });

    // 검색 결과 출력 함수
    function displaySearchResults(skills, equipment) {
        let resultHTML = "";

        if (skills.length > 0) {
            resultHTML += "<h2>일치하는 스킬:</h2>";
            resultHTML += "<ul>";
            skills.forEach(skill => {
                resultHTML += `<li>${skill}</li>`;
            });
            resultHTML += "</ul>";
        }

        if (equipment.length > 0) {
            resultHTML += "<h2>일치하는 장비:</h2>";
            resultHTML += "<ul>";
            equipment.forEach(equip => {
                resultHTML += `<li>${equip}</li>`;
            });
            resultHTML += "</ul>";
        }
        else {
            resultHTML += "<h2>일치하는 장비:</h2>";
            resultHTML += "없습니다.";
        }
        
        // 검색 결과를 화면에 표시
        searchResult.innerHTML = resultHTML;
    }
});