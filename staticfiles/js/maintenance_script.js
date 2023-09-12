console.log(document.getElementById('save-maintenance'));
console.log(document.getElementById('export-maintenance-excel'));

document.addEventListener("DOMContentLoaded", function() {
    const saveBtn = document.getElementById('save-maintenance');
    const exportBtn = document.getElementById('export-maintenance-excel');
    const dateInput = document.querySelector('input[type="date"]');

    // 日付のフォーマットを修正
    if (dateInput && dateInput.value) {
        const matches = dateInput.value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (matches) {
            dateInput.value = `${matches[1]}-${String(matches[2]).padStart(2, '0')}-${String(matches[3]).padStart(2, '0')}`;
        }
    }

    saveBtn.addEventListener('click', function() {
        // 保存処理を実装する
    });

    exportBtn.addEventListener('click', function() {
        console.log("Export button clicked!");
        exportToExcel();
    });
});

// 既存のxlsxファイルを読み込む関数
function readExistingXLSXFile(filePath) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', filePath, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = new Uint8Array(xhr.response);
                const workbook = XLSX.read(data, {type: 'array'});
                resolve(workbook);
            } else {
                reject(`Failed to load the file. Status: ${xhr.status}`);
            }
        };

        xhr.onerror = function() {
            reject('An error occurred while reading the file.');
        };

        xhr.send();
    });
}

function exportToExcel() {
    // 既存のExcelファイルを読み込む
    readExistingXLSXFile('/static/飛行日誌1.xlsx').then(workbook => {
        // 既存のWorkbookをベースとして、新しいSheetを追加する
        const ws = XLSX.utils.table_to_sheet(document.querySelector('.maintenance-table'));
        XLSX.utils.book_append_sheet(workbook, ws, "MaintenanceRecord");

        // ○印を入れる
        for (let row = 1; row <= 9; row++) {
            const checkbox = document.querySelector(`.maintenance-table tbody tr:nth-child(${row}) td:nth-child(3) input`);
            if (checkbox && checkbox.checked) {
                ws[XLSX.utils.encode_cell({c: 2, r: row})].v = "○";
            }
        }

        // 新しいExcelファイルとして保存
        XLSX.writeFile(workbook, "Modified飛行日誌1.xlsx");
    }).catch(error => {
        console.error(error);
    });
}
