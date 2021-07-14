const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressErrors = require('../utils/expressErrors')
const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas.js')

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

router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async(req, res, next) => {
    // if (!req.body.campground) throw new ExpressErrors('OLya so,e dffse', 404)
    
        const campground = new Campground(req.body.campground)
        await campground.save()
        req.flash('success', 'Successfully made a new campground')
        res.redirect(`/campgrounds/${campground._id}`)
}
)
)

router.get('/:id', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate('reviews');
    if (!camp) {
         req.flash('error', 'Cannot find that' )
         return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {camp})
}))

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    if (!camp) {
        req.flash('error', 'Cannot find that' )
        return res.redirect('/campgrounds')
   }
    res.render('campgrounds/edit', {camp})
}))

router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully edited')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

module.exports = router;