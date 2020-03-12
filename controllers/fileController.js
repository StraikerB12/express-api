const fs = require('fs');
const connection = require('../sqlserver');



const upload = (req, res) => {
    const filedata = req.file;
    const name =  filedata.originalname.slice(0 ,filedata.originalname.lastIndexOf('.')) ;
    const fileExt = filedata.originalname.split('.').pop();

    connection.query(
        "INSERT INTO files (id_parent, name, extension, type, size, date, path) VALUES (?,?,?,?,?, NOW(),?)", 
        [req.userId, name, fileExt, filedata.mimetype, filedata.size, filedata.path ], 
        function(err, data) {
            if(err) return console.log(err);
        }
    );

    res.sendStatus(200);
}


const list = (req, res) => {
    let offset = 0;
    let limit = 10;
    let {list_size, page} = req.query;
  
    if(list_size && isNaN(Number(list_size)) ) {
      return res.sendStatus(400);
    }else{
      limit = +list_size;
    };
  
    if(page && isNaN(Number(page)) ) {
      return res.sendStatus(400);
    }else{
      offset = (page - 1) * limit;
    };
  
    connection.query(
        'SELECT * FROM files WHERE id_parent=? LIMIT ?, ?', 
        [req.userId, offset, limit], 
        function(err, data) {
        if(err) return console.log(err);
            res.send(data);
        }
    );
}


const download = (req, res) => {
    connection.query(
        'SELECT * FROM files WHERE id=? AND id_parent=?', 
        [req.params.id, req.userId], 
        function(err, data) {
        if(err) return console.log(err);
            const {path, name, extension} = data[0];
            res.download(`./${path}`, `${name}.${extension}`);
        }
    );
}


const file = (req, res) => {
    connection.query(
        'SELECT * FROM files WHERE id=? AND id_parent=?', 
        [req.params.id, req.userId], 
        function(err, data) {
        if(err) return console.log(err);
            res.send(data[0]);
        }
    );
}


const deletes = (req, res) => {
    connection.query(
        'SELECT * FROM files WHERE id=? AND id_parent=?', 
        [req.params.id, req.userId], 
        function(err, data) {
            if(err) return console.log(err);
            if(data.length == 0) return res.sendStatus(400);
        
            const {path} = data[0];
            fs.unlinkSync(`./${path}`);
        
            connection.query(
                'DELETE FROM files WHERE id=? AND id_parent=?', 
                [req.params.id, req.userId], 
                function(err, data) {
                if(err) return console.log(err);
                    res.sendStatus(200);
                }
            );
        }
    );
}


const update = (req, res) => {
    connection.query(
        'SELECT * FROM files WHERE id=? AND id_parent=?', 
        [req.params.id, req.userId], 
        function(err, data) {
            fs.unlinkSync(`./${data[0].path}`);
        
            const {originalname, mimetype, size, path} = req.file;
            const name =  originalname.slice(0 ,originalname.lastIndexOf('.')) ;
            const fileExt = originalname.split('.').pop();
        
            connection.query(
                "UPDATE files SET name=?, extension=?, type=?, size=?, date=NOW(), path=? WHERE id=? AND id_parent=?", 
                [name, fileExt, mimetype, size, path, req.params.id, req.userId], 
                function(err, data) {
                if(err) return console.log(err);
                res.sendStatus(200);
                }
            );
        }
    );
}


module.exports = {
    upload,
    list,
    download,
    file,
    deletes,
    update
};