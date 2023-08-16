let flightTimer = null;
let flightStartTime = null;
let totalFlightTimeInSeconds = 0;

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

function saveRecord() {
    // ここに保存処理を実装します
    // 例えば、フォームの内容を取得し、データベースやファイルに保存する処理など
    alert("記録が保存されました");
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
    // フォームのデータを取得
    const flightDate = document.getElementById("flight-date").value;
    const pilotName = document.getElementById("pilot-name").value;
    const takeoffTime = document.getElementById("takeoff-time").textContent;
    const landingTime = document.getElementById("landing-time").textContent;
    const totalFlightTime = document.getElementById("total-flight-time").textContent;
    const takeoffCoordinates = document.getElementById("takeoff-coordinates").textContent;
    const landingCoordinates = document.getElementById("landing-coordinates").textContent;

    // CSVデータを生成
    let csvData = "飛行年月日,操縦者,離陸時間,着陸時間,総飛行時間,離陸地座標,着陸地座標\n";
    csvData += `${flightDate},${pilotName},${takeoffTime},${landingTime},${totalFlightTime},${takeoffCoordinates},${landingCoordinates}\n`;

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
}

function initMap() {
    console.log("initMap is called");
    var centerCoordinates = { lat: -34.397, lng: 150.644 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: centerCoordinates
    });

    // マーカーを作成します。
    const marker = new google.maps.Marker({
        position: { lat: 35.6895, lng: 139.6917 },
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
}
