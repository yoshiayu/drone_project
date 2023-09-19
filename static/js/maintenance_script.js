document.addEventListener("DOMContentLoaded", function() {
    const exportBtn = document.getElementById('export-maintenance-excel');
    const saveBtn = document.getElementById('save-to-server');  // 新しく作成した「記録を保存」ボタン
    const takeoffLocationElement = document.getElementById('takeoffLocation');
    const takeoffLocation = takeoffLocationElement ? takeoffLocationElement.textContent.replace("実施場所: ", "").trim() : null;

    if (takeoffLocation) {
        // 実施場所の欄に座標情報を表示する
        // ここではIDを`takeoffLocationDisplay`と仮定しますが、実際のIDに合わせてください
        document.getElementById('takeoffLocationDisplay').textContent = takeoffLocation;
    }
    
    exportBtn.addEventListener('click', exportToExcel);
    // saveBtn.addEventListener('click', saveToServer);
    saveBtn.addEventListener('click', function() {
        getModifiedWorkbook().then(workbook => {
            saveToServer(workbook);
        }).catch(error => {
            console.error("Error during getModifiedWorkbook or saveToServer:", error);
        });
    });
});
function getModifiedWorkbook() {
    return readExistingXLSXFile('/static/飛行日誌1.xlsx').then(originalWorkbook => {
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

        return originalWorkbook;
    }).catch(error => {
        console.error(error);
    });
}
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
        
        const specialRemarkInput = document.querySelector('.maintenance-table tbody tr td[colspan="3"] input');

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

        // Handle the special remark for "特記事項"
        if (specialRemarkInput && specialRemarkInput.value.trim()) {
            const cellRefSpecialRemark = XLSX.utils.encode_cell({c: 1, r: 18});  // This corresponds to B19 in Excel
            originalSheet[cellRefSpecialRemark] = {v: specialRemarkInput.value.trim(), t: 's', s: (originalSheet[cellRefSpecialRemark] || {}).s};
        }

        XLSX.writeFile(originalWorkbook, "Modified飛行日誌1.xlsx");
        return originalWorkbook;
    }).catch(error => {
        console.error(error);
    });
}

function saveToServer(workbook) {
    // CSRFトークンを取得
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]');
    const tokenValue = csrfToken ? csrfToken.value : "";
    // const csrfToken = document.getElementsByName("csrfmiddlewaretoken");
    if (!csrfToken) {
        console.error('CSRF token not found. Make sure it is present in your HTML.');
        return;
    }    
    // ここでエクセルデータをJSON形式に変換
    const data = {
        workbook: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
    };
    
    fetch('/save_record/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': tokenValue
            // 'X-CSRFToken': csrfToken[0].value
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
            document.getElementById('message').textContent = 'Maintenance record saved successfully';
        } else {
            // document.getElementById('message').textContent = 'There was an error while saving the maintenance record. Please try again.';
        }
    })
    .catch(error => {
        document.getElementById('message').textContent = 'There was an error while saving the maintenance record. Please try again.';
    });
}
