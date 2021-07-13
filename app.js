const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require('./models/campground')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressErrors = require('./utils/expressErrors')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require('./models/review')
const methodOverride = require("method-override")
const { resolveSoa } = require("dns")
const review = require("./models/review")
mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useUnifiedTopology: true 
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

app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
    // if (!req.body.campground) throw new ExpressErrors('OLya so,e dffse', 404)
    
        const campground = new Campground(req.body.campground)
        await campground.save()
        res.redirect(`/campgrounds/${campground._id}`)
}
)
)

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {camp})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {camp})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/review', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/review/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

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