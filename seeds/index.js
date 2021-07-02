const mongoose = require("mongoose")
const Campground = require('../models/campground')
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")
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

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async() => {
    await Campground.deleteMany()
    // const c = new Campground({title: 'Purple', description: 'Nor my best yet'})
    // await c.save()
    for(let i = 0; i < 50; i++) {
        const rand = Math.floor((Math.random() * 1000) + 1)
        const camp = new Campground({
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
    })
    await camp.save()
    };
}

seedDb().then(() => {
    mongoose.connection.close();
})