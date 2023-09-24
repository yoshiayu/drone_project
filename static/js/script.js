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
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('stop-landing').addEventListener('click', stopFlightTimer);
});

function extractCoordinates(id) {
    const coordinatesText = document.getElementById(id).textContent;
    const match = coordinatesText.match(/緯度: ([\d.]+), 経度: ([\d.]+)/);
    if (match) {
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
        };
    }
    return null;
}

// adminに保存処理を実装します
function saveRecord() {
    
    const flightDate = document.getElementById("flight-date").value;
    const pilotName = document.getElementById("pilot-name").value;
    const takeoffTime = document.getElementById("takeoff-time").value;
    const landingTime = document.getElementById("landing-time").value;
    const flightSummaryElement = document.getElementById("flight-summary");
    const flightSummary = flightSummaryElement.options[flightSummaryElement.selectedIndex].text;
    const takeoffLocationObj = extractCoordinates("takeoff-coordinates");
    const landingLocationObj = extractCoordinates("landing-coordinates");

    const data = {
        date: flightDate,
        pilot: pilotName,
        summary: flightSummary,
        takeoff_time: takeoffTime,
        landing_time: landingTime,
        takeoff_location: takeoffLocationObj,
        landing_location: landingLocationObj,
    };
    
    console.log(data);
    console.log('Takeoff:', takeoffLocationObj);
    console.log('Landing:', landingLocationObj);
   
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
            document.getElementById('message').textContent = 'Error: ' + json.error;
        }
    })    
    
    .catch(error => {
        document.getElementById('message').textContent = 'There was an error while saving the record. Please try again.';
    });
    
}

// 総飛行時間を計算して表示する関数
function updateTotalFlightTime() {
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
    console.log('initMap function is called');
    let takeoffMarker = null;
    let landingMarker = null;
    
    if (window.map) {
        google.maps.event.clearInstanceListeners(window.map);
    }    
    var centerCoordinates = { lat: 35.6895, lng: 139.6917 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: centerCoordinates
    });
    
    updateLocationName(35.6895, 139.6917, 'takeoff-location-name'); // Tokyo
    const marker = new google.maps.Marker({
        position: centerCoordinates,
        map: map,
        draggable: true
    });

    function updateLocationName(lat, lng, elementId) {
        console.log(`updateLocationName called with lat: ${lat}, lng: ${lng}, elementId: ${elementId}`);
        console.log('updateLocationName is called'); // この行を追加
        const geocoder = new google.maps.Geocoder;
        const latlng = {lat: lat, lng: lng};
        
        geocoder.geocode({'location': latlng}, function(results, status) {
            console.log("Geocode callback executed with status: ", status);
            console.log('geocoder.geocode is called');
            console.log(results);
            if (status === 'OK') {
                if (results[0]) {
                    console.log('地名が見つかりました: ' + results[0].formatted_address); // この行を追加
                    document.getElementById(elementId).textContent = results[0].formatted_address;
                } else {
                    console.error('No results found');
                }
            } else {
                console.error('Geocoder failed due to: ' + status);
            }
        });
    }    

    function attachMarkerListeners(marker, type, elementId) {
        console.log('attachMarkerListeners is called for ' + type); // ここでログを出力
        marker.addListener('dragend', function() {
            console.log(type + ' marker dragged'); 
            const pos = marker.getPosition();
            updateCoordinates(type, pos);
            updateLocationName(pos.lat(), pos.lng(), elementId);
        });
    }   

    function updateCoordinates(type, location) {
        document.getElementById(`${type}-coordinates`).textContent = '緯度: ' + location.lat() + ', 経度: ' + location.lng();
    }

    attachMarkerListeners(marker, 'takeoff', 'takeoff-location-name');
    console.log('attachMarkerListeners called for takeoff'); // この行を追加
    marker.addListener('dragend', function() {
        const pos = marker.getPosition();
        localStorage.setItem('takeoff_coordinates', '緯度: ' + pos.lat() + ', 経度: ' + pos.lng());
    });

    map.addListener('click', function(event) {
        placeMarker(event.latLng, map);
    });

    function placeMarker(location, map) {
        let newMarker;
        let type;
        let elementId;
        if (!takeoffMarker) {
            type = 'takeoff';
            elementId = 'takeoff-location-name';
            takeoffMarker = new google.maps.Marker({
                position: location,
                map: map,
                draggable: true
            });
            newMarker = takeoffMarker;
        } else if (!landingMarker) {
            type = 'landing';
            elementId = 'landing-location-name';
            landingMarker = new google.maps.Marker({
                position: location,
                map: map,
                draggable: true
            });
            newMarker = landingMarker;
        }
        if (newMarker) {
            console.log('attachMarkerListeners is going to be called for ' + type); // ここでログを出力
            updateCoordinates(type, location);
            attachMarkerListeners(newMarker, type, elementId);
        }
    }    
}

function appendDataToExcel(fileInput) {
    const reader = new FileReader();
    const flightSummaryElement = document.getElementById("flight-summary");
    const flightSummary = flightSummaryElement.options[flightSummaryElement.selectedIndex].text;

    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, {type: 'binary', cellStyles: true});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const newRow = [
            [   // 2次元配列に変更
                document.getElementById("flight-date").value,
                document.getElementById("pilot-name").value,
                flightSummary,
                document.getElementById("takeoff-time").value,
                document.getElementById("landing-time").value,
                document.getElementById("total-flight-time").textContent,
                document.getElementById("takeoff-coordinates").textContent,
                document.getElementById("landing-coordinates").textContent
            ]
        ];

        // 新しい行をシートに追加
        XLSX.utils.sheet_add_aoa(sheet, newRow, {origin: -1});

        const lastRow = XLSX.utils.decode_range(sheet['!ref']).e.r;

        for(let i = 0; i < newRow[0].length; i++) {
            const cellRef = XLSX.utils.encode_cell({r: lastRow, c: i});
            const prevCellRef = XLSX.utils.encode_cell({r: lastRow - 1, c: i});
            const originalCell = sheet[prevCellRef];
            if (originalCell && originalCell.s) {
                sheet[cellRef].s = originalCell.s;
            }
        }

        XLSX.writeFile(workbook, "updated_flight_data.xlsx", {cellStyles: true});
    };

    reader.readAsBinaryString(fileInput.files[0]);
}

document.getElementById("existing-excel-file").addEventListener("change", function() {
    appendDataToExcel(this);
});

document.getElementById('export-excel').addEventListener('click', function(e) {
    e.preventDefault();
    var 飛行年月日 = document.getElementById('flight-date').value;
    var 操縦者 = document.getElementById('pilot-name').value;
    var 飛行概要 = document.getElementById("flight-summary").value;
    var 離陸時刻 = document.getElementById("takeoff-time").value;
    var 着陸時刻 = document.getElementById("landing-time").value;
    var 総飛行時間 = document.getElementById("total-flight-time").textContent;
    var 離陸座標 = document.getElementById("takeoff-coordinates").textContent;
    var 着陸座標 = document.getElementById("landing-coordinates").textContent;

    const oReq = new XMLHttpRequest();
    oReq.open("GET", "/get_excel/", true);
    // oReq.open("GET", "/static/飛行日誌.xlsx", true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function(e) {
        const arraybuffer = oReq.response;
        const data = new Uint8Array(arraybuffer);
        const workbook = XLSX.read(data, {type: "array", cellStyles: true});
        // const workbook = XLSX.read(data, {type: "array"});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // 既存のセルの列の幅を保持
        const originalCols = worksheet['!cols'];
        const updateCell = (r, c, value) => {
            const originalCell = worksheet[XLSX.utils.encode_cell({r: r, c: c})];
            worksheet[XLSX.utils.encode_cell({r: r, c: c})] = { t: "s", v: value, s: originalCell ? originalCell.s : {} };
        };
        updateCell(5, 1, 飛行年月日);
        updateCell(5, 2, 操縦者);
        updateCell(5, 3, 飛行概要);
        updateCell(5, 4, 離陸座標);
        updateCell(5, 5, 着陸座標);
        updateCell(5, 6, 離陸時刻);
        updateCell(5, 7, 着陸時刻);
        updateCell(5, 9, 総飛行時間);

        if (originalCols) {
            worksheet['!cols'] = originalCols;
        }
        XLSX.writeFile(workbook, '飛行日誌_新.xlsx', {cellStyles: true});
        // XLSX.writeFile(workbook, '飛行日誌_新.xlsx');
    }

    oReq.send();
});
