var express = require('express');
var cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios')
var app = express();
app.use(cors());
require('dotenv').config();


const Comedian = require('./db/Comedian.js');
const mongoURI = process.env.MONGO_URI;


app.listen(4242, () => {
  
  console.log(`Server running on 4242`);

});


app.use(express.json());

// Connect to the database

mongoose.connect(mongoURI)
.then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('Error connecting to MongoDB Atlas:', err);
  process.exit(1);
});



/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Comedy Backend' });
});

// Get all comedians or users in range
app.post('/find', async (req, res) => {
  
  try {
    // Search for comedians, or for users
    let comics = await Comedian.find({ broadcast: true }, 'name lat lon radius town rating hosting traveling'); 

    
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3958.8; // Earth's radius in miles
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in miles
        return distance;
    }


    // Store the distances so we can view the distanct to each comic from the new location
    comics = comics.filter(comedian => {
        const distance = calculateDistance(req.body.lat, req.body.lon, comedian.lat, comedian.lon);
        return distance <= req.body.radius
        
    });

    res.json(comics);

  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Convert zip to lat/long
app.post('/zip-to-loc', async (req, res) => {
  axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${req.body.zip}&key=${process.env.GEO_API}`)
      .then(response => {
        const results  = response.data.results;
        if (results.length > 0) {
          // Predict the town name
          let hamlet = results[0].components.hamlet
          if (!hamlet)
          {
            let parts = results[0].formatted.split(", ")
            if (parts[0] === "Brookhaven")
              hamlet = parts[1]
            else hamlet = parts[0]
          }
          res.send([results[0].geometry.lat, results[0].geometry.lng, results[0].formatted.replace(", United States of America", ""), req.body.zip, hamlet])
        } else {
          console.error('No results found');
          res.status(400).send('No results')
        }
      })
      .catch(error => {
        console.error('Error:', error);
        res.status(500).send(error)
      });
})



module.exports = app;
