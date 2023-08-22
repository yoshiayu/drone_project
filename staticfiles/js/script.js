let flightTimer = null;
let flightStartTime = null;
let totalFlightTimeInSeconds = 0;
let pauseStartTime = null;
let pausedTime = 0;
let takeoffMarker = null; // 離陸地点のマーカー
let landingMarker = null; // 着陸地点のマーカー

// 離陸タイマーをスタートする関数
function startFlightTimer() {
    // 現在の時刻を記録
    flightStartTime = Date.now();
    // タイマーを開始
    flightTimer = setInterval(updateFlightTimer, 1000);
    
    // 離陸ボタンを無効にし、着陸ボタンを有効にする
    document.getElementById('start-takeoff').disabled = true;
    document.getElementById('stop-landing').disabled = false;
}
// タイマーを一時停止する関数
function pauseFlightTimer() {
    if (flightTimer !== null) {
        clearInterval(flightTimer);
        
        // 一時停止した時点での経過時間を記録
        pauseStartTime = Date.now();
        pausedTime += pauseStartTime - flightStartTime;
        // // 一時停止した時点での経過時間を記録
        // pauseStartTime = Date.now() - flightStartTime - pausedTime;
        // pausedTime += pauseStartTime;

        // 一時停止ボタンを無効にし、再開ボタンを有効にする
        document.getElementById('pause-takeoff').disabled = true;
        document.getElementById('start-takeoff').disabled = false;
    }
}

// タイマーを再開する関数
function resumeFlightTimer() {
    if (pauseStartTime !== null) {
        // タイマーを再開
        flightStartTime = Date.now() - pauseStartTime - pausedTime;
        flightTimer = setInterval(updateFlightTimer, 1000);
        
        // 再開ボタンを無効にし、一時停止ボタンを有効にする
        document.getElementById('start-takeoff').disabled = true;
        document.getElementById('pause-takeoff').disabled = false;
        // reset pauseStartTime
        pauseStartTime = null;
    }
}

// タイマーを更新する関数
function updateFlightTimer() {
    const elapsedTime = Date.now() - flightStartTime;
    const date = new Date(elapsedTime);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    
    // 時間を表示
    document.getElementById('flight-time').textContent = `${hours}:${min}:${sec}`;
}


// タイマーをストップする関数
function stopFlightTimer() {
    clearInterval(flightTimer);
    
    const elapsedTime = Date.now() - flightStartTime;
    totalFlightTimeInSeconds += elapsedTime / 1000;
    
    const totalHours = Math.floor(totalFlightTimeInSeconds / 3600);
    const totalMinutes = Math.floor((totalFlightTimeInSeconds % 3600) / 60);
    const totalSeconds = Math.floor(totalFlightTimeInSeconds % 60);
    
    // 総飛行時間をHH:MM:SS形式で表示
    document.getElementById('total-flight-time').textContent = `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
    
    // 離陸ボタンを有効にし、着陸ボタンを無効にする
    document.getElementById('start-takeoff').disabled = false;
    document.getElementById('stop-landing').disabled = true;
}


// イベントリスナーの設定
document.getElementById('start-takeoff').addEventListener('click', startFlightTimer);
document.getElementById('stop-landing').addEventListener('click', stopFlightTimer);
document.getElementById('save-record').addEventListener('click', saveRecord);
// document.getElementById('export-csv').addEventListener('click', exportCSV);
document.getElementById("export-csv").addEventListener("click", function() {
    console.log('Export CSV button is clicked');
    window.location.href = '/export_flights_csv/';
});
document.addEventListener('DOMContentLoaded', (event) => {
    const exportExcelButton = document.getElementById('export-excel');
    
    exportExcelButton.addEventListener('click', () => {
        window.location.href = '/export_data_to_excel/'; // サーバのエンドポイントにリクエストを送る
    });
});
document.addEventListener('DOMContentLoaded', (event) => {
    const existingExcelFileInput = document.getElementById("existing-excel-file");
    
    if(existingExcelFileInput) {
        existingExcelFileInput.addEventListener("change", function() {
            appendDataToExcel(this);
        });
    }
});

// adminに保存処理を実装します
function saveRecord() {
    const flightDate = document.getElementById("flight-date").value;
    const pilotName = document.getElementById("pilot-name").value;
    const takeoffTime = document.getElementById("takeoff-time").value;
    const landingTime = document.getElementById("landing-time").value;
    const flightSummaryElement = document.getElementById("flight-summary");
    const flightSummary = flightSummaryElement.options[flightSummaryElement.selectedIndex].text;

    const data = {
        date: flightDate,
        pilot: pilotName,
        summary: flightSummary,
        takeoff_time: takeoffTime,
        landing_time: landingTime,
    };
    
    fetch('/save_record/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.getElementsByName("csrfmiddlewaretoken")[0].value
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(json => {
        if (json.success) {
            document.getElementById('message').textContent = 'Record saved successfully';
        } else {
            document.getElementById('message').textContent = 'There was an error while saving the record. Please try again.';
        }
    })
    .catch(error => {
        document.getElementById('message').textContent = 'There was an error while saving the record. Please try again.';
    });
}



// 総飛行時間を計算して表示する関数
function updateTotalFlightTime() {
    // 離陸時間と着陸時間から総飛行時間を計算します
    // ここでは仮の時間データを使っています。実際の計算ロジックを実装する必要があります
    const totalFlightTime = "00:45:30";
    
    // 総飛行時間を表示する要素を取得
    const totalFlightTimeElement = document.getElementById("total-flight-time");
    
    // 総飛行時間を表示
    totalFlightTimeElement.textContent = totalFlightTime;
}

function stopTimer(type) {
    clearInterval(window[`${type}Timer`]);
}

function exportCSV() {
    try {
        // フォームのデータを取得
        const flightDate = document.getElementById("flight-date").value;
        const pilotName = document.getElementById("pilot-name").value;
        const flightSummaryElement = document.getElementById("flight-summary");
        const flightSummary = flightSummaryElement.options[flightSummaryElement.selectedIndex].text;
        const takeoffTime = document.getElementById("takeoff-time").value; 
        const landingTime = document.getElementById("landing-time").value; 
        const totalFlightTime = document.getElementById("total-flight-time").textContent;
        const takeoffCoordinates = document.getElementById("takeoff-coordinates").textContent;
        const landingCoordinates = document.getElementById("landing-coordinates").textContent;

        // CSVデータを生成
        let csvData = "飛行年月日,操縦者,飛行概要,離陸時間,着陸時間,総飛行時間,離陸地座標,着陸地座標\n";
        csvData += `${flightDate},${pilotName},${flightSummary},${takeoffTime},${landingTime},${totalFlightTime},${takeoffCoordinates},${landingCoordinates}\n`;
        
        // UTF-8 BOMを追加
        const BOM = "\uFEFF";
        csvData = BOM + csvData; 

        // CSVデータをBlobオブジェクトとして保存
        const blob = new Blob([csvData], { type: "text/csv" });

        // Blobオブジェクトをダウンロードリンクとして提供
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", "drone_flight_record.csv");
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

    } catch (error) {
        console.error("Error exporting CSV:", error);
    }
}

// イベントリスナーの設定
document.getElementById("export-csv").addEventListener("click", exportCSV);


function initMap() {
    // 東京の緯度と経度に設定
    var centerCoordinates = { lat: 35.6895, lng: 139.6917 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,  // ズームレベルを10に設定（好みに応じて調整可能）
        center: centerCoordinates
    });

    // マーカーを作成します。
    const marker = new google.maps.Marker({
        position: centerCoordinates, // マーカーの初期位置も東京に設定
        map: map,
        draggable: true // このオプションを設定すると、マーカーをドラッグできます
    });

    // マーカーにクリックイベントを追加します。
    marker.addListener('click', function() {
        const pos = marker.getPosition();
        alert('マーカーの位置: ' + pos.lat() + ', ' + pos.lng());
    });

    // マーカーのドラッグイベントを追加します。
    marker.addListener('dragend', function() {
        const pos = marker.getPosition();
        document.getElementById("takeoff-coordinates").textContent = '緯度: ' + pos.lat() + ', 経度: ' + pos.lng();
    });

    // マップがクリックされた時のイベント
    map.addListener('click', function(event) {
        placeMarker(event.latLng, map);
    });
    function placeMarker(location, map) {
        if (takeoffMarker === null) {
            // 離陸地点のマーカーを設置
            takeoffMarker = new google.maps.Marker({
                position: location,
                map: map,
                draggable: true
            });
            updateCoordinates('takeoff', location);
            attachMarkerListeners(takeoffMarker, 'takeoff');
        } else if (landingMarker === null) {
            // 着陸地点のマーカーを設置
            landingMarker = new google.maps.Marker({
                position: location,
                map: map,
                draggable: true
            });
            updateCoordinates('landing', location);
            attachMarkerListeners(landingMarker, 'landing');
        }
    }
    
    function attachMarkerListeners(marker, type) {
        // マーカーがドラッグされた際に座標を更新
        marker.addListener('dragend', function() {
            updateCoordinates(type, marker.getPosition());
        });
    }
    
    function updateCoordinates(type, location) {
        // 指定されたタイプの座標を更新
        document.getElementById(`${type}-coordinates`).textContent = '緯度: ' + location.lat() + ', 経度: ' + location.lng();
    }
}
function appendDataToExcel(fileInput) {
    const reader = new FileReader();
    const flightSummaryElement = document.getElementById("flight-summary");
    const flightSummary = flightSummaryElement.options[flightSummaryElement.selectedIndex].text;

    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, {type: 'binary'});
        
        // シートの取得
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // 新たに追加するデータ
        const newRow = [
            document.getElementById("flight-date").value,
            document.getElementById("pilot-name").value,
            flightSummary,
            document.getElementById("takeoff-time").textContent,
            document.getElementById("landing-time").textContent,
            document.getElementById("total-flight-time").textContent,
            document.getElementById("takeoff-coordinates").textContent,
            document.getElementById("landing-coordinates").textContent
        ];

        // シートにデータを追加
        const lastRow = XLSX.utils.decode_range(sheet['!ref']).e.r + 1;
        const newRange = XLSX.utils.encode_range({s: {c: 0, r: lastRow}, e: {c: newRow.length - 1, r: lastRow}});
        XLSX.utils.sheet_add_aoa(sheet, [newRow], {origin: newRange});

        // ファイルの保存
        XLSX.writeFile(workbook, "updated_flight_data.xlsx");
    };

    reader.readAsBinaryString(fileInput.files[0]);
}

document.getElementById("existing-excel-file").addEventListener("change", function() {
    appendDataToExcel(this);
});

