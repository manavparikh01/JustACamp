const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require('./models/campground')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressErrors = require('./utils/expressErrors')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
//const Review = require('./models/review')
const methodOverride = require("method-override")
const session = require('express-session')
const flash = require('connect-flash')
const { resolveSoa } = require("dns")
//const review = require("./models/review")
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
})
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => {
    console.log("Database Connected")
})
const app = express()

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
//app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisisnotinten',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/review', reviews);

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(msg, 400)
    }
    else {
        next()
    }
    //console.log(result)
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(msg, 400)
    }
    else {
        next()
    }
    //console.log(result)
}

app.get("/", (req, res) => {
    //res.send("Welcome to home page");
    res.render("home")
})



// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'My House', description: 'Nice weather' })
//     await camp.save()
//     res.send(camp)
// })

app.all("*", (req, res, next) => {
    next(new ExpressErrors('Page not found', 404))
})

app.use((err, req, res, next) => {
    const {status = 500} = err;
    if (!err.message) err.message = 'Oh no what is thu'
    res.status(status).render('error', {err});
})

app.listen(3000, () => {
    console.log("YelpCamp Connected")
})