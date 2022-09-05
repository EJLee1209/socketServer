const mysql = require('mysql2');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig);
var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');    // 1
router.use(bodyParser.urlencoded({ extended: true }));    // 2

router.post('/position', (request, response)=>{
	response.json(request.body); // or response.send(request.body);
});



router.get('/', function(req, res, next) {
  res.status(200).json(
    {
      "success" : true
    }
  );
});

router.get('/users_info', (req, res) => {
  connection.query('SELECT * FROM User', (error, rows) => {
    if(error) throw error;
    console.log('user info is : ', rows);
    
    res.status(200).send(rows)
    
  });
});

router.post('/getUserId', (req, res)=>{
  const uid = req.body.UID

  connection.query('select id from User where UID=?',[uid], (err,rows)=>{
    if(err) throw err
    console.log('user info is : ', rows)
    res.status(200).send(rows)
  })
})

router.post('/login', (req, res)=>{
  const body = req.body;
  const id = body.id;
  const pw = body.pw;

  connection.query('select * from User where id=? and password=?', [id,pw], (err, data)=>{
    if(data.length == 0){ // 로그인 실패
      console.log('로그인 실패');
      res.status(200).json(
        {
          "UID" : -1
        }
      )
    }
    else{
      // 로그인 성공
      console.log('로그인 성공');
      connection.query('select UID from User where id=?',[id],(err,data)=>{
        res.status(200).send(data[0]); 
      });
      
    }
  });

});


router.post('/register', (req, res) =>{
  const body = req.body;
  const id = body.id;
  const pw = body.pw;

  connection.query('select * from User where id=?',[id],(err,data)=>{
    if(data.length == 0){
        console.log('회원가입 성공');
        connection.query('insert into User(id, password) values(?,?)',[id,pw]);
        res.status(200).json(
          {
            "message" : true
          }
        );
    }else{
        console.log('회원가입 실패');
        res.status(200).json(
          {
            "message" : false
          }
        );
        
    }
    
  });
});

router.post('/room', (req,res)=>{
  const body = req.body;
  const sender_id = body.sender_id;
  const receiver_id = body.receiver_id;

  connection.query('select * from Room where (sender_id=? and receiver_id=?) or (sender_id=? and receiver_id=?)',[sender_id,receiver_id,receiver_id,sender_id],(err,data)=>{
    if(data.length==0){
      // 만들어진 채팅방이 없으므로 생성
      connection.query('insert into Room(sender_id, receiver_id) values(?,?)',[sender_id,receiver_id]);
      res.status(200).json(
        {
          "message" : true
        }
      )

    }else{
      // 이미 채팅방이 존재함
      res.status(200).json({
        "message" : false
      })
    }
  });
});

router.post('/message', (req,res)=>{
  const body = req.body;
  const sender_id = body.sender_id;
  const receiver_id = body.receiver_id;
  const text = body.text;
  const time = body.time;

  connection.query('insert into message(sender_id, receiver_id, text, time) values(?,?,?,?)',[sender_id,receiver_id,text,time]);
  console.log(text);
  res.send(req.body);

});

router.post('/getMessage', (req,res)=>{
  const body = req.body;
  const sender_id = body.sender_id;
  const receiver_id = body.receiver_id;

  connection.query('select sender_id, receiver_id, text, time from message where (sender_id = ? and receiver_id = ?) or (sender_id = ? and receiver_id = ?)',[sender_id,receiver_id,receiver_id,sender_id],(error,rows)=>{
    if(error) throw error;
    console.log('user info is : ', rows);
    
    res.status(200).send(rows)
  });
});

router.post('/getAllRoom', (req,res)=>{
  const sender_id = req.body.sender_id;

  connection.query('select * from Room where sender_id=?',[sender_id],(error,rows)=>{
    if(error) throw error;
    console.log('user info is : ', rows);
    
    res.status(200).send(rows)
  });
})

router.post('/getRoom', (req,res)=>{
  const body = req.body;
  const sender_id = body.sender_id;
  const receiver_id = body.receiver_id;
  
  connection.query('select number from Room where (sender_id=? and receiver_id=?) or (sender_id=? and receiver_id=?) ',[sender_id,receiver_id,receiver_id,sender_id],(error,rows)=>{
    if(error) throw error;
    console.log('user info is : ', rows);
    
    res.status(200).send(rows)
  });
})


module.exports = router;