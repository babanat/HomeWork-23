const fs = require('fs');
const path = require('path');
const http = require('http');

// Путь к файлу data.txt
const filePath = path.join(__dirname, 'data.txt');

// Функция для инициализации файла, если его нет
const initializeFile = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8'); // Создаем файл с пустым массивом
  }
};

// Функция для чтения данных из файла
const readItemsFromFile = () => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data); // Возвращаем данные в виде массива
};

// Функция для записи данных в файл
const writeItemsToFile = (items) => {
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
};

// Инициализация файла при запуске
initializeFile();

const server = http.createServer((req, res) => {
  const { method, url } = req;
   // Логируем каждый приходящий запрос в терминал
   console.log(`Received ${method} request for ${url}`);

  // Устанавливаем заголовки для JSON-ответов
  res.setHeader('Content-Type', 'application/json');

  // GET /items - Получение всех items из файла
  if (method === 'GET' && url === '/items') {
    const items = readItemsFromFile();
    res.writeHead(200);
    res.end(JSON.stringify(items));
    console.log(`Sent items: ${JSON.stringify(items)}`);

  // POST /items - Создание нового item и добавление его в файл
  } else if (method === 'POST' && url === '/items') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); // Собираем данные
    });

    req.on('end', () => {
      const { name, age, city } = JSON.parse(body);
      const items = readItemsFromFile();
      const newItem = { id: items.length + 1, name, age, city }; // Создаем новый item с полями name, age, city
      items.push(newItem); // Добавляем новый item в массив
      writeItemsToFile(items); // Записываем обновленные данные в файл
      res.writeHead(201);
      res.end(JSON.stringify(newItem)); // Возвращаем созданный item
      console.log(`Created new item: ${JSON.stringify(newItem)}`);
    });

  // PUT /items/:id - Обновление item по id
  } else if (method === 'PUT' && url.startsWith('/items/')) {
    const id = parseInt(url.split('/')[2], 10); // Получаем id из URL
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { name, age, city } = JSON.parse(body);
      const items = readItemsFromFile();
      const item = items.find(i => i.id === id);

      if (item) {
        item.name = name || item.name; // Обновляем name, если оно передано
        item.age = age || item.age; // Обновляем age, если оно передано
        item.city = city || item.city; // Обновляем city, если оно передано
        writeItemsToFile(items); // Записываем обновленные данные в файл
        res.writeHead(200);
        res.end(JSON.stringify(item));
        console.log(`Updated item with id ${id}: ${JSON.stringify(item)}`);

      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Item not found' }));
        console.log(`Item with id ${id} not found`);

      }
    });

  // DELETE /items/:id - Удаление item по id
  } else if (method === 'DELETE' && url.startsWith('/items/')) {
    const id = parseInt(url.split('/')[2], 10);
    const items = readItemsFromFile();
    const index = items.findIndex(i => i.id === id);

    if (index !== -1) {
      items.splice(index, 1); // Удаляем item из массива
      writeItemsToFile(items); // Записываем обновленные данные в файл
      res.writeHead(204);
      res.end(); // Успешное удаление
      console.log(`Deleted item with id ${id}: ${JSON.stringify(deletedItem)}`);

    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Item not found' }));
      console.log(`Item with id ${id} not found`);
    }

  // Неподдерживаемый маршрут
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Not found' }));
    console.log(`Route not found: ${method} ${url}`);

  }
});

// Запуск сервера на порту 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});





