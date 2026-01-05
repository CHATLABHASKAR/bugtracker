import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (data, fileName) => {
    console.log(`Exporting ${fileName}...`);

    // 1. Convert JSON to Sheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create Workbook and add Sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 3. Generate Buffer (ArrayBuffer)
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 4. Create Blob with correct Excel MIME type
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    // 5. Save using file-saver
    saveAs(dataBlob, `${fileName}.xlsx`);
};
