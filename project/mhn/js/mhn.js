let testData = JSON.parse(JSON.stringify(TestFile));
console.log(testData);

document.addEventListener("DOMContentLoaded", function () {
    const selectedBodyPart = document.getElementById("selectedBodyPart");
    const selectedBodyPartLabel = document.getElementById("selectedBodyPartLabel");
    const selectedEquipment = document.getElementById("selectedEquipment");
    const skillList = document.getElementById("skillList");
    const equipmentSkills = document.getElementById("equipmentSkills");
    const addBuildButton = document.getElementById("addBuildButton");
    const buildList = document.getElementById("buildList");

    // 부위별 장비 데이터 (예시)
    const bodyPartEquipmentData = {
        head: ["머리 장비 1", "머리 장비 2"],
        torso: ["몸통 장비 1", "몸통 장비 2"],
        chest: ["가슴 장비 1", "가슴 장비 2"],
        // 다른 부위의 장비 목록 추가
    };

    // 부위 선택 변경 시 이벤트 핸들러
    selectedBodyPart.addEventListener("change", function () {
        const selected = selectedBodyPart.value;
        const equipmentList = bodyPartEquipmentData[selected] || [];

        // 선택한 부위에 따라 장비 목록을 업데이트
        updateEquipmentList(equipmentList);
        updateSelectedBodyPartLabel(selected);
    });

    // 장비 목록 업데이트 함수
    function updateEquipmentList(equipmentList) {
        selectedEquipment.innerHTML = "";

        equipmentList.forEach(equipment => {
            const option = document.createElement("option");
            option.value = equipment;
            option.textContent = equipment;
            selectedEquipment.appendChild(option);
        });
    }

    // 선택한 부위 레이블 업데이트 함수
    function updateSelectedBodyPartLabel(selected) {
        selectedBodyPartLabel.textContent = selected !== "" ? selected : "부위 없음";
    }

    // 빌드 목록
    const builds = [];

    // 빌드 추가 버튼 클릭 시
    addBuildButton.addEventListener("click", function () {
        const selectedPart = selectedBodyPart.value;
        const selectedEquip = selectedEquipment.value;

        // 새로운 빌드 객체 생성 및 배열에 추가
        const build = {
            bodyPart: selectedPart,
            equipment: selectedEquip
        };
        builds.push(build);

        // 빌드 목록 업데이트
        updateBuildList();
    });

    // 빌드 목록 업데이트 함수
    function updateBuildList() {
        buildList.innerHTML = "";

        builds.forEach((build, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = `빌드 ${index + 1}: 부위 - ${build.bodyPart}, 장비 - ${build.equipment}`;
            buildList.appendChild(listItem);
        });
    }
});

