const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const User = require('./models/user');
const DeliveryAgent = require('./models/deliveryAgent');
const Product = require('./models/product');
const bcrypt = require('bcrypt');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/demologin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch(err => {
        console.log("CONNECTION ERROR!!!");
        console.log(err);
    })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({ secret: 'goodsecret' }))
app.use(flash())

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
}

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    const currentUser = req.session.user_id;
    res.render('home', { currentUser });
})

app.get('/register', (req, res) => {
    const currentUser = req.session.user_id;
    res.render('register', { currentUser });
})

app.post('/register', async (req, res) => {
    const { customername, email, password, username } = req.body;
    const hash = await bcrypt.hash(password, 12);
    if (req.body.isUser === "on") {
        const deliveryAgent = new DeliveryAgent({
            customername,
            email,
            username,
            password: hash
        });
        await deliveryAgent.save();
        req.session.user_id = deliveryAgent._id;
        req.flash('success', "Sucessfully Registered!")
        res.redirect('/secret');
    }
    else {
        const user = new User({
            username,
            password: hash
        });
        await user.save();
        req.session.user_id = user._id;
        req.flash('success', "Sucessfully Registered!")
        res.redirect('/topsecret');
    }

})

app.get('/login', (req, res) => {
    const currentUser = req.session.user_id;
    res.render('login', { currentUser });
})

app.post('/login', async (req, res) => {
    const { password, username } = req.body;
    const currentUser = req.session.user_id;
    if (req.body.isUser === "on") {
        try {
            const deliveryAgent = await DeliveryAgent.findOne({ username });
            const validPw = await bcrypt.compare(password, deliveryAgent.password);
            if (validPw) {
                req.session.user_id = deliveryAgent._id;
                req.flash('success', "Sucessfully Logged In!")
                res.redirect('/secret');
            }
            else {
                req.flash('error', "Wrong Credentials or Unregistered User")
                res.redirect('/login');
            }
        }
        catch (err) {
            req.flash('error', "Wrong Credentials or Unregistered User")
            res.redirect('/login');
        }
    }
    else {
        const user = await User.findOne({ username });
        try {
            const validPw = await bcrypt.compare(password, user.password);
            if (validPw) {
                req.session.user_id = user._id;
                req.flash('success', "Sucessfully Logged In!")
                res.redirect('/topsecret');
            }
            else {
                req.flash('error', "Wrong Credentials or Unregistered User")
                res.redirect('/login');
            }
        }
        catch (err) {
            req.flash('error', "Wrong Credentials or Unregistered User")
            res.redirect('/login');
        }
    }

})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/');
})

app.get('/secret', requireLogin, (req, res) => {
    const currentUser = req.session.user_id;
    res.render('secret', { currentUser });
})

app.post('/secret', requireLogin, async (req, res) => {
    const { productname, producttype, location } = req.body;
    const product = new Product({
        productname,
        producttype,
        location,
        date: Date()
    });
    await product.save();
    req.flash('success', "Sucessfully Added the Product!")
    res.redirect('/secret');
})

app.get('/topsecret', requireLogin, (req, res) => {
    const currentUser = req.session.user_id;
    res.render('topsecret', { currentUser });
})

app.post('/topsecret', requireLogin, async (req, res) => {
    const { productname } = req.body;
    try {
        const product = await Product.findOne({ productname });
        req.flash('success', "Your item has reached " + product.location + "." + "Last Updated at " + product.date);
        req.redirect('/topsecret');
    }
    catch (err) {
        //req.flash('error', "Product Not Found")
        res.redirect('/topsecret');
    }

})

app.get('/update', requireLogin, (req, res) => {
    res.render('update');
})

app.post('/update', requireLogin, async (req, res) => {
    const { productname, location } = req.body;
    try {
        const product = await Product.findOne({ productname });
        await Product.updateOne(product, { $set: { location: location, date: Date() } });
        req.flash('success', "Sucessfully Updated!")
        res.redirect('/update');
    }
    catch (err) {
        req.flash('error', "Product Not Found")
        res.redirect('/update');
    }
})

app.get('/info', (req, res) => {
    const currentUser = req.session.user_id;
    res.render('info', { currentUser });
})

app.listen(3000, () => {
    console.log("Serving the App!!!");
})