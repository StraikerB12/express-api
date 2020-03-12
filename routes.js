const auth = require('./controllers/authController');
const file = require('./controllers/fileController');
const authMiddleware = require('./middlewares/authMiddleware');

const multer = require('multer');
const upload = multer({dest:"files"});

module.exports = (app) => {

    app.get('/', (req, res) => { res.send('start'); });

    app.post('/signup', auth.signup);// Регистрация
    app.post('/signin', auth.signin);// Аутификация
    app.post('/signin/new_token', auth.new_token); // обновление токена
    app.get('/logout', authMiddleware, auth.logout);// Выход
    app.get('/info', authMiddleware, (req, res) => { res.send({email: req.userKey}); }); // Инфо

    app.post('/file/upload', upload.single("file"), authMiddleware, file.upload);// Загрузка фаила
    app.get('/file/list', authMiddleware, file.list);// Список фаилов
    app.get('/file/download/:id([0-9]+)', authMiddleware, file.download);// скачать фаил
    app.get('/file/:id([0-9]+)', authMiddleware, file.file);// один фаил
    app.delete('/file/delete/:id([0-9]+)', authMiddleware, file.deletes);// Удалить фаил
    app.put('/file/update/:id([0-9]+)', upload.single("file"), authMiddleware, file.update);// Обновление фаила
    
}