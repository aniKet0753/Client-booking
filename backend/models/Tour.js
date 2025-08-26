const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    time: { type: String } 
});

const itineraryDaySchema = new mongoose.Schema({
    dayNumber: { type: Number, required: true }, 
    title: { type: String, required: true },
    description: { type: String },
    activities: [activitySchema]
});

const tourSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    categoryType: { type: String, required: true },
    country: { type: String, required: true },
    tourType: { type: String, required: true },
    pricePerHead: { type: Number, required: true },
    packageRates: {
        adultRate: { type: Number, required: true },
        childRate: { type: Number, required: true },
    },
    GST: { type: Number, required: true },
    duration: { type: Number, required: true },
    occupancy: { type: Number, required: true },
    remainingOccupancy: { type: Number, required: true },
    startDate: { type: Date, required: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    thingsToPack: [{ type: String }],
    itinerary: [itineraryDaySchema],
    gallery: [{ type: String }],
    canCreateNewTour: { type: Boolean, default: false }
});

module.exports = mongoose.model("Tour", tourSchema);


// const mongoose = require('mongoose');

// const tourSchema = new mongoose.Schema({ 
//     categoryType: { type: String, required: true },
//     packages: [
//       {
//         name: { type: String, required: true },
//         country: { type: String, required: true },
//         pricePerHead: { type: Number, required: true },
//         duration: { type: String, required: true },
//         startDate: { type: Date, required: true },
//         occupancy: { type: Number, required: true },
//         remainingOccupancy: { type: Number, required: true },
//         tourType: { type: String, required: true },
//         description: { type: String, required: true },
//         image: { type: Buffer, required: true }, 
//       },
//     ]
//   });
  

// module.exports = mongoose.model("Tour", tourSchema);

