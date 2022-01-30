const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const cookies = require('cookie-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
const dbUrl = process.env.MONGOLAB_URI;
const port = 3000;
const app = express();

// App configuration
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// let app know were using ejs
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  let profile_name = req.cookies.fullname;
  let user_email = req.cookies.email;

  return res.render("index.ejs", { profile_name, user_email });
});

app.get('/games', (req, res) => {
  let profile_name = req.cookies.fullname;
  res.render('games.ejs', { profile_name : profile_name,});
});

app.get('/signup', (req, res) => {
  let profile_name = req.cookies.fullname;
  res.render('signup.ejs', { profile_name : profile_name});
});

app.get('/login', (req, res) => {
  let profile_name = req.cookies.fullname;
  res.render('login.ejs', { profile_name : profile_name});
});

app.get('/myprofile', (req, res) => {
  let profile_name = req.cookies.fullname;
  let user_email = req.cookies.email;
  res.render('myprofile.ejs', { profile_name : profile_name, user_email : user_email});
});

app.get('/logout', (req, res) => {
  // clear cookies
  res.clearCookie("email");
  res.clearCookie("fullname");
  return res.redirect('/')
})

app.post('/login-confirm', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    collection.find().forEach( 
      function(myDoc) { 
        let userLogin = {
          email: req.body.email,
          password: req.body.password,
        };
       if (userLogin["email"] === myDoc.email && userLogin["password"] === myDoc.password) {
         console.log('emails and passowrds match!');
         res.cookie("email", userLogin["email"]);
         res.cookie("fullname", myDoc.fullname);
         res.redirect('myprofile');
       } else {
         console.log('wrong password');
       }
      });
  });
});

// calls post for submit button after making account
app.post('/signup-confirm', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    collection
      .insertMany([
        { points: 100,
          email: req.body.email,
          password: req.body.password,
          fullname: req.body.fullname
        }
      ])
      .then(() => {
        res.redirect('/');
      })
      .catch(() => {
        res.redirect('/');
      });
  });
});

// Start server
app.listen(process.env.PORT || 3000);