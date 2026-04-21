import dotenv from 'dotenv';
import { createPool } from './server/db.js';
import fs from 'fs';

dotenv.config();

async function dump() {
  const pool = createPool();
  console.log('Đang kết nối tới database...');
  
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const dbName = process.env.DATABASE_URL?.split('/').pop() || 'database';
    let output = `-- DATABASE LOG DUMP --\n-- Date: ${new Date().toLocaleString()}\n\n`;

    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`Đang truy xuất cấu trúc bảng: ${tableName}`);
      
      const [createTable] = await pool.query(`SHOW CREATE TABLE ${tableName}`);
      output += `\n-- Structure for table: ${tableName}\n`;
      output += createTable[0]['Create Table'] + ';\n\n';

      const [rows] = await pool.query(`SELECT * FROM ${tableName} LIMIT 10`);
      if (rows.length > 0) {
        output += `-- Sample data for ${tableName} (limited to 10 rows)\n`;
        rows.forEach(row => {
          output += `-- ${JSON.stringify(row)}\n`;
        });
      }
    }

    fs.writeFileSync('database_structure.sql', output);
    console.log('\n✅ Đã tạo file database_structure.sql thành công!');
    console.log('Bạn có thể mở file này để chụp ảnh code gửi lên.');
  } catch (err) {
    console.error('Lỗi khi truy xuất dữ liệu:', err.message);
    console.log('\nLƯU Ý: Đảm bảo MySQL đang chạy và thông tin trong .env là chính xác.');
  } finally {
    await pool.end();
  }
}

dump();
