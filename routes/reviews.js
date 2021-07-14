const express = require('express')
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync')
const ExpressErrors = require('../utils/expressErrors')
const Review = require('../models/review')
const { reviewSchema } = require('../schemas.js')
const Campground = require('../models/campground')

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

router.post('/', validateReview, catchAsync(async (req, res, next) => {
    console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully made a review')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('Success', 'Succeffuly deleted')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;