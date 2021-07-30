const campground = require('../models/campground');
const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {
    // if (!req.body.campground) throw new ExpressErrors('OLya so,e dffse', 404)
    
        const campground = new Campground(req.body.campground)
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
        campground.author = req.user._id;
        await campground.save()
        console.log(campground);
        req.flash('success', 'Successfully made a new campground')
        res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate({path: 'reviews', populate: {path: 'author'}}).populate('author');
    console.log(camp);
    if (!camp) {
         req.flash('error', 'Cannot find that' )
         return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {camp})
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(req.params.id)
    if (!camp) {
        req.flash('error', 'Cannot find that' )
        return res.redirect('/campgrounds')
   }
   
    res.render('campgrounds/edit', {camp})
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params
    
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully edited')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params
    
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}