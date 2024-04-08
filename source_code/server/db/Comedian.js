const mongoose = require('mongoose');

const comedianSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lon: Number,
    radius: Number,
    broadcast: Boolean,
});

module.exports = mongoose.model('Comedian', comedianSchema);
