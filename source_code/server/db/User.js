const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lon: Number,
    radius: Number,
    broadcast: Boolean,
    comedian: Boolean,
});

module.exports = mongoose.model('User', userSchema);
