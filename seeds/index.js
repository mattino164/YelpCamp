const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () =>
{
    await Campground.deleteMany({});
    for(let i = 0; i < 300; i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '67883b5e2fb4b5b555d59fce',//id for username: "thannor"
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed bibendum, mauris vel consectetur aliquet, felis mauris fermentum lectus, in bibendum dolor massa a nunc. Integer et justo vel lectus faucibus molestie. Sed in dignissim mauris. Integer vel nisi et metus consectetur consectetur. Sed vel justo ac justo scelerisque facilisis. Sed in ipsum vel neque semper fermentum. In non enim vel velit rutrum lobort",
            price,
            geometry: { 
                type: "Point",
                 coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dulxuyia4/image/upload/v1738700234/YelpCamp/r5k6ra2qkxa7bbmnfnrw.jpg',
                  filename: 'YelpCamp/r5k6ra2qkxa7bbmnfnrw'
                },
                {
                  url: 'https://res.cloudinary.com/dulxuyia4/image/upload/v1738700235/YelpCamp/exvhnlzbjfij07lreofc.jpg',
                  filename: 'YelpCamp/exvhnlzbjfij07lreofc'
                }
              ],
        })
        await camp.save();
    }
}

seedDB().then(() =>
{
    mongoose.connection.close();
    console.log("------------DATABASE SEEDED------------");
});
