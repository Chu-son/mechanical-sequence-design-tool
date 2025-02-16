const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const readData = (fileName: string): any[] => {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const writeData = (fileName: string, data: any[]): void => {
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

ipcMain.handle('getAll', (event, fileName) => {
  return readData(fileName);
});

ipcMain.handle('getById', (event, fileName, id) => {
  const data = readData(fileName);
  return data.find((item) => item.id === id) || null;
});

ipcMain.handle('create', (event, fileName, item) => {
  const data = readData(fileName);
  data.push(item);
  writeData(fileName, data);
});

ipcMain.handle('update', (event, fileName, id, updatedItem) => {
  const data = readData(fileName);
  const index = data.findIndex((item) => item.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updatedItem };
    writeData(fileName, data);
  }
});

ipcMain.handle('delete', (event, fileName, id) => {
  let data = readData(fileName);
  data = data.filter((item) => item.id !== id);
  writeData(fileName, data);
});
