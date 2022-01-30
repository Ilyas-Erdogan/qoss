const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const cookies = require('cookie-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { redirect } = require('express/lib/response');
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

app.get('/mybets', (req, res) => {
  let profile_name = req.cookies.fullname;
  console.log(req.cookie.userBets);
  res.render('mybets.ejs', { profile_name : profile_name})
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
  let user_points = req.cookies.points;
  res.render('myprofile.ejs', { profile_name : profile_name, user_email : user_email, user_points : user_points});
});

app.get('/logout', (req, res) => {
  // clear cookies
  res.clearCookie("email");
  res.clearCookie("fullname");
  res.clearCookie("userPoints");
  res.clearCookie("userBets");
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
         res.cookie("points", myDoc.points);
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
          currentBets: [],
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

/*
app.post('/bet', (req, res) => {
  MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    const db = client.db('node-demo');
    const collection = db.collection('users');
    let profile_name = req.cookies.fullname;
    collection.findOne({fullname: profile_name}, {$addToSet: {currentBets: req.body}});
    collection.find().forEach(
    function(myDoc) { 
      let userBets = {
        bet: req.body.bet,
      };
      res.cookie("userBest", myDoc.bet);
      res.redirect('mybets');
    //res.coookie("userBets", collection.find({fullname: profile_name}, {currentBets: 1}));
});
});
});
*/

// Start server
app.listen(process.env.PORT || 3000);