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

        // Select checkboxes from the HTML table
        const checkboxes = document.querySelectorAll('.maintenance-table tbody tr td:nth-child(3) input');
        const remarks = document.querySelectorAll('.maintenance-table tbody tr td:nth-child(4) input');

        // Ensure only the first 9 checkboxes are considered, corresponding to the specified fields
        for (let i = 0; i < 9; i++) {
            if (checkboxes[i] && checkboxes[i].checked) {
                const cellRef = XLSX.utils.encode_cell({c: 2, r: 5 + i}); // "結果" starts from C6 in Excel
                originalSheet[cellRef] = {v: "○", t: 's', s: (originalSheet[cellRef] || {}).s};
            }
            if (remarks[i]) {
                const remarkText = remarks[i].value.trim();
                if (remarkText) {
                    const cellRefRemark = XLSX.utils.encode_cell({c: 3, r: 5 + i}); // "備考" starts from D6 in Excel
                    originalSheet[cellRefRemark] = {v: remarkText, t: 's', s: (originalSheet[cellRefRemark] || {}).s};
                }
            }
        }

        XLSX.writeFile(originalWorkbook, "Modified飛行日誌1.xlsx");
    }).catch(error => {
        console.error(error);
    });
}
