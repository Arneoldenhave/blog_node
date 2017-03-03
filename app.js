const express = require('express');
const app = express();
const dataBase = require(__dirname + '/module/database')
const bodyParser = require('body-parser')
const session = require('express-session')

//app.use(bodyParser)
app.use(bodyParser.json());//pakt data en maakt die beschikbaar onder req.body etc.
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'oh wow very secret much security',
    resave: true,
    saveUninitialized: false
}));

app.set('views',__dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static('static'));

//LANDING PAGE
app.get('/index', (req,res)=>{
	res.render('index');
});

//ADD_USER
app.get('/add_user', (req, res)=> {
  res.render('add_user')
});

//BOARD
app.get('/board', (req, res) => {
  const user = req.session.user
  if (user) {
    dataBase.Messages.findAll()
      .then(messages => {
        console.log('logging messages @ /board')
        console.log(messages)
        res.render('board', {Messages:messages}) 
    })
  }
    else{
      res.redirect('board')

    }
});

//Profile
app.get('/profile', (req, res)=>{
  const user = req.session.user
  if(user){
    res.render('profile', {user: user})
  }
  else {
    res.redirect('/posts')
  }
});


//SINGLE POST
app.get('/posts', (req, res) => {
  console.log(req.query.id)
  var postId= req.query.id
  console.log(postId)

  dataBase.Messages.findOne({where: {id:postId},
  include: [
     { model: dataBase.Users},
     { model: dataBase.Comments}
  ]
})
  .then((message)=> {
    console.log(message)
    res.render('single_post', {message:message})
  })
});

//LOGIN
app.post('/index', (req,res)=> {
  if(req.body.userName.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Plese fill type in your user name"));
    return;
  }
  if(req.body.password.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Please fill out your password"));
    return;
  }
 
 dataBase.Users.findOne({
  where: {
    name: req.body.userName
  }
 }).then(function(user) {
  if (user !== null && req.body.password === user.password) {
    req.session.user = user;
    res.redirect('/profile');
  } else {
    res.redirect('/?message=' + encodeURIComponent("Invalid user name and/or password"));
  }
 }, (err) => {
  res.redirect('/?message=' + encodeURIComponent("Invalid user name and/or password"));
 })
});

//ADD_USER
app.post('/add_user', (req, res) => {
    console.log(user.id)
    dataBase.Users.create ({
      name: req.body.userName,
      password: req.body.password,
      email: req.body.email,
    }).then( () => {
      console.log('nu ook nog')
      res.redirect('board')
    })
});

//BOARD POST MESSAGE
app.post('/message', (req,res)=> {
  console.log(req.session)
  if(req.session.user !== undefined){
    dataBase.Messages.create ({
    title: req.body.topic,
    message: req.body.message,
    userId: req.session.user.id

    }).then((message)=> {
      res.redirect('/board')
    })  
  }
  else {
    res.redirect('/index')
  }
  
});

app.post('/comment', (req, res) => {
 //  console.log('///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////')
  dataBase.Comments.create ({
    comment: req.body.comment_body,
    userId: req.session.user.id,
    messageId : req.body.message_id
  })
  .then((comment)=> {
    console.log('logging comment')
    console.log(comment)
    res.redirect('/posts?id=' + encodeURIComponent(comment.messageId))
  })
});

//LISTEN
dataBase.connect.sync({force:true}).then((db)=> {
	db.authenticate()
  		.then(function(err) {
    		console.log('Connection has been established successfully.');
  		}).then((DEFAULT_USER) => {
        dataBase.Users.create({
          name: "DEFAULT_USER",
          password: "DEFAULT_PASSWORD",
          email: "DEAFAULT_EMAIL"
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


//Find one, Post.findOne{
//   where messageid === usersid.
//   include module comment.(pakt autmatisch alle comments die hetzelfde message id hebben
//     )
//   wanneer je dit doet met een prmies krijg jee groot object waarin de post staat en oo de comments als values van keys.

// }
