document.addEventListener("DOMContentLoaded", function() {
    const exportBtn = document.getElementById('export-maintenance-excel');
    const saveBtn = document.getElementById('save-to-server');
    const takeoffLocationElement = document.getElementById('takeoffLocation');
    const takeoffLocation = takeoffLocationElement ? takeoffLocationElement.textContent.replace("実施場所: ", "").trim() : null;

    if (takeoffLocation) {
        document.getElementById('takeoffLocationDisplay').textContent = takeoffLocation;
    }

    exportBtn.addEventListener('click', exportToExcel);

    saveBtn.addEventListener('click', function() {
        getModifiedWorkbook().then(workbook => {
            const formattedData = formatData(workbook);
            if(formattedData.length === 0) {
                document.getElementById('message').textContent = 'No valid data to save.';
                return;
            }
            saveToServer(formattedData);
        }).catch(error => {
            console.error("Error during getModifiedWorkbook or saveToServer:", error);
        });
    });
});
function formatData(workbook) {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);
    let result = false;
    return rawData
        .filter(row => row['_1'] && row['_1'].trim()) // filter out rows with empty or missing inspection_item
        .map(row => {
            return {
                inspection_item: row['_1'].trim(), // trim removes whitespace from both ends of a string
                inspection_content: row['_2'] ? row['_2'].trim() : '', // use a blank string if the key is missing or empty
                result: row['_3'] ? row['_3'].trim() : '',
                remarks: row['_4'] ? row['_4'].trim() : ''
            };
        });
}
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

function saveToServer(formattedData) {
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (!csrfToken) {
        console.error('CSRF token not found. Make sure it is present in your HTML.');
        return;
    }
    const tokenValue = csrfToken.value;

    const data = {
        workbook: formattedData.map(record => ({
            inspection_item: record['_1'] || record.inspection_item, 
            inspection_content: record.inspection_content,
            result: record.result,
            remark: record.remark,
        }))
    };
    console.log('Sending data:', data); // dataToSendをdataに修正
    fetch('/save_maintenance_record/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': tokenValue
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(json => {
        if (json.status === 'success') {
            document.getElementById('message').textContent = 'Maintenance record saved successfully';
        } else {
            document.getElementById('message').textContent = 'There was an error while saving the maintenance record. Please try again.';
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('message').textContent = 'There was an error while saving the maintenance record. Please try again.';
    });
}

document.getElementById('export-maintenance-excel').addEventListener('click', function() {
    let table = document.querySelector('.maintenance-table');
    let workbook = XLSX.utils.book_new(); // 新しいワークブックを作成
    let worksheet = XLSX.utils.table_to_sheet(table); // テーブルからワークシートを作成
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // ワークブックにワークシートを追加

    // B21セルに値をセットする
    let cell = worksheet['B21'];
    if (cell) {
        cell.v = '新しい値';
    } else {
        // セルが存在しない場合は新しいセルを作成
        worksheet['B21'] = { t: 's', v: '新しい値' };
    }

    // Blobを作成し、ダウンロードリンクを作成
    XLSX.writeFile(workbook, 'maintenance_record.xlsx');
});
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('save-to-server').addEventListener('click', function () {
        let records = Array.from(document.querySelectorAll('.maintenance-table tbody tr')).map(tr => { // <tbody>内の<tr>のみを選択
            let tds = tr.querySelectorAll('td');
            return {
                inspection_item: tds[0] ? tds[0].textContent.trim() : '',
                // '_1': tds[0] ? tds[0].textContent.trim() : '',
                inspection_content: tds[1] ? tds[1].textContent.trim() : '',
                result: tds[2] ? tds[2].querySelector('input') ? tds[2].querySelector('input').checked : false : false,
                remark: tds[3] ? tds[3].querySelector('input') ? tds[3].querySelector('input').value.trim() : '' : ''
            };
        });
        
        let dateInput = document.querySelector('input[type="date"]');
        let date = dateInput ? dateInput.value : '';

        let data = {
            workbook: records,
            date: date,
            location: document.getElementById('takeoffLocation').value.trim(),
            inspector: document.getElementById('pilot').value.trim()
            // location: document.getElementById('takeoffLocation').textContent.trim(),
            // inspector: document.querySelector('p#pilot').textContent.trim()
        };
        console.log(data); // data は送信する JSON オブジェクト

        fetch('/save_maintenance_record/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});
