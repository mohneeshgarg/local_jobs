const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user.js');
const Job = require('./models/job.js');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { findByIdAndUpdate, findByIdAndDelete } = require('./models/user.js');
let map = new Map();
let user_name;
mongoose.connect('mongodb://localhost:27017/jobs', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false})
.then(()=>{
    console.log('Database connected!');
})
.catch(()=>{
    console.log('Errror!');
})
const sessionConfig = {
    secret: 'thisismysecret',
    resave: 'true',
    saveUninitialized: 'true',
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
};

app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate)
const isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('Error', 'You should be login first');
        return res.redirect('/login');
    }
    next();
}


app.get('/', async (req, res)=>{
    const jobs = await Job.find({});
    res.render('home', {jobs});
})
app.get('/about', (req, res)=>{
    res.render('about')
})
app.get('/login', (req, res)=>{
    res.render('login');
})
const passportMiddleWare = passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'});
app.post('/login', passportMiddleWare, (req, res)=>{
    req.flash('success', `Welcome back ${req.body.username}`);
    user_name = req.body.username;
    if(req.session.returnTo!==undefined)
        res.redirect(req.session.returnTo);
    else
        res.redirect('/');
})
app.get('/register', (req, res)=>{
    res.render('register');
})
app.post('/register', async (req, res)=>{
    const {username, email, name, address, age, password} = req.body;
    const newUser =  await new User({username:username ,email: email, name:name,address: address, age:age});
    const user = await User.register(newUser, password);
    req.flash('success', 'Welcome!');
    req.user = user;
    req.flash('success', `Welcome ${req.body.username}`);
    res.redirect('/');
})
app.get('/users/:id/jobs', async (req, res)=>{
    const jobs = await Job.find({});
    const allJobs = [];
    let user = await User.findById(req.params.id);
    for(job of jobs){
        if(job.owner===user.username)
            allJobs.push(job);
    }
    res.render('show_userjobs', {allJobs});
})
app.get('/users/:id', (req, res)=>{
    res.render('show_user');
})
app.get('/logout', (req, res)=>{
    req.flash('success', `Will see you later ${req.user.username}`);
    req.logout();
    res.redirect('/');
})
app.get('/jobs/:id/edit', (req, res)=>{
    const id = req.params.id;
    res.render('edit_job', {id});
})
app.put('/jobs/:id', async (req, res)=>{
    const id = req.params.id;
    const {title, address, salary, contact, image} = req.body;
    const job = await Job.findByIdAndUpdate(id, {title:title, address:address, salary:salary, contact:contact, image:image});
    await job.save();
    res.redirect(`/jobs/${id}`);
})
app.get('/users/:id/edit', async (req, res)=>{
    const id = req.params.id;
    res.render('edit_user', {id});
})
app.put('/users/:id', async (req, res)=>{
    const id = req.params.id;
    const {email, name, address, age} = req.body;
    const user = await User.findByIdAndUpdate(id, {name:name, address: address, email: email, age:age});
    await user.save();
    res.redirect(`/users/${id}`);
})
app.delete('/jobs/:id', async (req, res)=>{
    await Job.findByIdAndDelete(req.params.id);
    res.redirect('/');
})
app.get('/add', isLoggedIn, (req, res)=>{
    res.render('newJob');
})
app.get('/jobs/:id', async (req, res)=>{
    const job = await Job.findById(req.params.id);
    res.render('show', {job});
})
app.post('/add', (req, res)=>{
    const {title, address, salary, contact, image} = req.body;
    const newJob = new Job({title:title, address:address, salary:salary, contact:contact, image:image, owner: user_name});
    newJob.save()
    .then(msg=>{
        console.log('Job added successfully!');
    })
    .catch(err=>{
        console.log('There is some error!');
    })
    res.redirect('/');
})
app.listen(3000, ()=>{
    console.log('Jobs Server started!')
})