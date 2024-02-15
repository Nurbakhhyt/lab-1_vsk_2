const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dbConfig = require('./db');
const Task = require('./models/Task');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(dbConfig.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Подключение к MongoDB Atlas успешно'))
    .catch(err => console.error('Ошибка подключения к MongoDB Atlas:', err));

app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        console.error('Ошибка при получении задач:', err);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { title, description } = req.body;
    try {
        const task = new Task({ title, description, status: false });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error('Ошибка при создании задачи:', err);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Задача не найдена' });
        }
        task.status = true;
        await task.save();
        res.json(task);
    } catch (err) {
        console.error('Ошибка при обновлении задачи:', err);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Задача не найдена' });
        }
        res.json({ message: 'Задача удалена' });
    } catch (err) {
        console.error('Ошибка при удалении задачи:', err);
        res.status(500).json({ message: 'Произошла ошибка на сервере' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
