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
        const price = Math.floor((Math.random() * 30) + 10)
        const camp = new Campground({
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil obcaecati delectus qui eveniet adipisci numquam, quos commodi quibusdam quod voluptas, laboriosam ad dolore magni nostrum atque a eum? Quos, nemo.',
            price
    })
    await camp.save()
    };
}

seedDb().then(() => {
    mongoose.connection.close();
})