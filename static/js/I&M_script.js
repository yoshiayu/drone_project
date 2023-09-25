document.addEventListener("DOMContentLoaded", function() {
    const saveRecordBtn = document.getElementById('save-record');
    const exportExcelBtn = document.getElementById('export-excel');
    const existingExcelFileInput = document.getElementById('existing-excel-file');
    
    
    // '記録を保存'ボタンがクリックされたら、以下の関数を実行
    saveRecordBtn.addEventListener('click', function () {
    // 各入力要素からデータを取得
    const maintenanceDate = document.getElementById('maintenance-date').value;
    const totalFlightTime = document.getElementById('total-flight-time').textContent;
    const maintenanceDetails = document.getElementById('maintenance-details').value;
    const reason = document.getElementById('reason').value;
    const location = document.getElementById('location').value;
    const executor = document.getElementById('executor').value;
    const notes = document.getElementById('notes').value;
    const data = gatherData();
        saveToServer(data);

    // 取得したデータをコンソールに表示（デバッグ用）
    console.log(maintenanceDate, totalFlightTime, maintenanceDetails, reason, location, executor, notes);
    // もし、後続の処理がある場合は、ここで記述してください。
  });
  exportExcelBtn.addEventListener('click', exportToExcel);
  // 'Excelに出力'ボタンがクリックされたら、以下の関数を実行
  exportExcelBtn.addEventListener('click', function () {
    // Excelに出力するロジックをここに記述
    const wb = XLSX.utils.book_new(); // 新しいワークブックを作成
    const ws_data = [
      ["実施年月日", "総飛行時間", "点検・修理・改造及び整備の内容", "実施理由", "実施場所", "実施者", "備考"], // ヘッダー行
      [
        document.getElementById('maintenance-date').value,
        document.getElementById('total-flight-time').textContent,
        document.getElementById('maintenance-details').value,
        document.getElementById('reason').value,
        document.getElementById('location').value,
        document.getElementById('executor').value,
        document.getElementById('notes').value
      ] // データ行
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data); // ワークシートを作成
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); // ワークシートをワークブックに追加
    XLSX.writeFile(wb, "maintenance_record.xlsx"); // ファイルを出力
  });

    existingExcelFileInput.addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      // Excelファイルの内容を読み込み、処理
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      
      // ここで、Excelファイルのデータを取得・処理するロジックを記述してください。
      console.log(workbook);
    };

    reader.readAsBinaryString(file);
  });
});

function getModifiedWorkbook() {
    return readExistingXLSXFile('/static/飛行日誌2.xlsx').then(originalWorkbook => { // Change file name appropriately
        // Same logic as maintenance_script.js, update cell references if necessary
        // ...
        return originalWorkbook;
    }).catch(error => {
        console.error(error);
    });
}

function readExistingXLSXFile(filePath) {
    return fetch(filePath)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, {type: 'buffer'});
            return workbook;
        });
}

function exportToExcel() {
    try {
        const filePath = '/static/飛行日誌2.xlsx';
        readExistingXLSXFile(filePath).then(originalWorkbook => {
            const worksheetName = originalWorkbook.SheetNames[0]; // Assuming data is in the first sheet
            const worksheet = originalWorkbook.Sheets[worksheetName];

            // Gather the data
            const data = gatherData();

            // Update specific cells
            worksheet['A5'] = { v: data.maintenanceDate, t: 's' };
            worksheet['B5'] = { v: data.totalFlightTime, t: 's' };
            worksheet['C5'] = { v: data.maintenanceDetails, t: 's' };
            worksheet['D5'] = { v: data.reason, t: 's' };
            worksheet['E5'] = { v: data.location, t: 's' };
            worksheet['F5'] = { v: data.executor, t: 's' };
            worksheet['G5'] = { v: data.notes, t: 's' };
            
            XLSX.writeFile(originalWorkbook, "Modified飛行日誌2.xlsx");
        }).catch(error => {
            console.error(error);
        });
    } catch (error) {
        console.error('Error during Excel export:', error);
    }
}
function gatherData() {
    return {
        maintenanceDate: document.getElementById('maintenance-date').value,
        totalFlightTime: document.getElementById('total-flight-time').textContent,
        maintenanceDetails: document.getElementById('maintenance-details').value,
        reason: document.getElementById('reason').value,
        location: document.getElementById('location').value,
        executor: document.getElementById('executor').value,
        notes: document.getElementById('notes').value,
    };
}
function saveToServer(formattedData) {
    const url = '/path-to-your-api'; // EndPointのURLを正しく設定してください
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData) // 変更箇所：data -> formattedData
    });
}

function exportToExcel() {
    try {
        // Excelファイルを作成し出力
        const wb = XLSX.utils.book_new();
        const data = gatherDataForExcel(); // 配列を期待
        const ws = XLSX.utils.json_to_sheet(data); // ここでエラーが発生している可能性が高い
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "output.xlsx");
    } catch (error) {
        console.error('Error during Excel export:', error);
    }
}
function gatherDataForExcel() {
    // Excel出力用のデータを取得して整形
    const data = []; // 実際には、適切にデータを取得し整形する
    return data;
}
