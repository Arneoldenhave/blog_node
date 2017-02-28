const express = require('express');
const app = express();
const dataBase = require(__dirname + '/module/database')
const bodyParser = require('body-parser')


//app.use(bodyParser)
app.use(bodyParser.json());//pakt data en maakt die beschikbaar onder req.body etc.
app.use(bodyParser.urlencoded({extended: true}));


app.set('views',__dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static('static'));

//LANDING PAGE
app.get('/index', (req,res)=> {
	res.render('index');
});

//ADD_USER
app.get('/add_user', (req, res)=> {
  res.render('add_user')
});

//BOARD
app.get('/board', (req, res) => {
  dataBase.Messages.findAll()
    .then(messages => {
      console.log('logging messages @ /board')
      console.log(messages)
       res.render('board', {Messages:messages}) 
    })

})


//LOGIN
app.post('/index', (req,res)=> {

  dataBase.Users.findOne({
  where: {name: req.body.userName} 


    .then((foundUser) => {
      console.log(Users.name)
      if (foundUser.password === req.body.password){
        res.redirect('board')
      } else {
          alert('Oops, password and user name do not match')
            res.render('index')
        }    
    })
  })  
});

//ADD_USER
app.post('/add_user', (req, res) => {
    
    dataBase.Users.create ({
      name: req.body.userName,
      password: req.body.password,
      email: req.body.email
    }).then( f => {
      console.log('nu ook nog')
      res.redirect('board')
    })
});

//BOARD POST MESSAGE
app.post('/message', (req,res)=> {
  dataBase.Messages.create ({
    title: req.body.topic,
    message: req.body.message
  }).then((message)=> {
    res.redirect('board')
  })
});

app.post('/comment', (req, res) => {
  console.log('logging req.body')
  console.log(req.body)
  dataBase.Comments.create ({
    comment: req.body.comment
  }).then((comment)=> {
    console.log('logging comments @ /comment')
    console.log(dataBase.Comments)
  })
  .then((comment)=> {
    res.redirect('board')
  })
});

//LISTEN
dataBase.connect.sync({force:true}).then((db)=> {
	db.authenticate()
  		.then(function(err) {
    		console.log('Connection has been established successfully.');
  		}).then( f => {
        dataBase.Messages.create({
          title: "Title",
          message: "message"
        })
      })
  		.catch(function (err) {
    		console.log('Unable to connect to the database:', err);
  		})
      .then( () => {
			app.listen(3000, ()=> {
				console.log("Ready, set GO")
			});  	
  })
});

