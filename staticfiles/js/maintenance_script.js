document.addEventListener("DOMContentLoaded", function() {
    const exportBtn = document.getElementById('export-maintenance-excel');
    exportBtn.addEventListener('click', exportToExcel);
});

function readExistingXLSXFile(filePath) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', filePath, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = new Uint8Array(xhr.response);
                const workbook = XLSX.read(data, {type: 'array', cellStyles: true, cellDates: true});
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
    readExistingXLSXFile('/static/飛行日誌1.xlsx').then(originalWorkbook => {
        const originalSheet = originalWorkbook.Sheets[originalWorkbook.SheetNames[0]];

        // ○印を入れる部分のみを更新
        for (let row = 1; row <= 9; row++) {
            const checkbox = document.querySelector(`.maintenance-table tbody tr:nth-child(${row}) td:nth-child(3) input`);
            if (checkbox && checkbox.checked) {
                const cellRef = XLSX.utils.encode_cell({c: 2, r: row});
                originalSheet[cellRef] = {v: "○", t: 's', s: (originalSheet[cellRef] || {}).s };
            }
        }

        // 既存のデータやスタイルを変更しないため、これ以降のrows.forEachの部分は削除

        XLSX.writeFile(originalWorkbook, "Modified飛行日誌1.xlsx");
    }).catch(error => {
        console.error(error);
    });
}

// document.addEventListener("DOMContentLoaded", function() {
//     const exportBtn = document.getElementById('export-maintenance-excel');
//     exportBtn.addEventListener('click', exportToExcel);
// });

// function readExistingXLSXFile(filePath) {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open('GET', filePath, true);
//         xhr.responseType = 'arraybuffer';
//         xhr.onload = function () {
//             if (xhr.status === 200) {
//                 const data = new Uint8Array(xhr.response);
//                 const workbook = XLSX.read(data, {type: 'array', cellStyles: true, cellDates: true});
//                 resolve(workbook);
//             } else {
//                 reject(`Failed to load the file. Status: ${xhr.status}`);
//             }
//         };
//         xhr.onerror = function() {
//             reject('An error occurred while reading the file.');
//         };
//         xhr.send();
//     });
// }

// function exportToExcel() {
//     readExistingXLSXFile('/static/飛行日誌1.xlsx').then(originalWorkbook => {
//         const originalSheet = originalWorkbook.Sheets[originalWorkbook.SheetNames[0]];
//         const table = document.querySelector('.maintenance-table');
//         const rows = table.querySelectorAll('tbody tr');
        
//         // ○印を入れる
//         for (let row = 1; row <= 9; row++) {
//             const checkbox = document.querySelector(`.maintenance-table tbody tr:nth-child(${row}) td:nth-child(3) input`);
//             if (checkbox && checkbox.checked) {
//                 const cellRef = XLSX.utils.encode_cell({c: 2, r: row});
//                 originalSheet[cellRef] = {v: "○", t: 's'};
//             }
//         }

//         rows.forEach((row, rowIndex) => {
//             const cells = row.querySelectorAll('td');
//             cells.forEach((cell, cellIndex) => {
//                 const cellValue = cell.textContent || cell.innerText;
//                 if (cellValue) {
//                     const cellRef = XLSX.utils.encode_cell({c: cellIndex, r: rowIndex + 1});
//                     originalSheet[cellRef] = {
//                         v: cellValue,
//                         t: 's',
//                         s: (originalSheet[XLSX.utils.encode_cell({c: cellIndex, r: rowIndex})] || {}).s
//                     };
//                 }
//             });
//         });

//         XLSX.writeFile(originalWorkbook, "Modified飛行日誌1.xlsx");
//     }).catch(error => {
//         console.error(error);
//     });
// }
