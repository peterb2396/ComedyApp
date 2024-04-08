// Get all comedians or users in range
app.post('/find', async (req, res) => {

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
  
    const my_lat = req.body.lat
    const my_lon = req.body.lon
    const my_rad = req.body.rad
    const my_loc = req.body.loc // true if event will be at my venue. Otherwise, I am traveling
  
    const comedian_target = req.body.comedian_target // target: targeting comedians? or users?
  
    try {
      // Search for comedians, or for users
      const allTargets = await User.find({});
  
      // Filter comedians within radius
      const targetsWithinRadius = allTargets.filter(target => {
          // return false if this is not our target audience (comedian vs user)
          if (target.comedian != comedian_target) 
            return false
  
          // This is our target audience! Check if they're in range.
          // If we're traveling, use our radius constraint. Otherwise use theirs
          const distance = calculateDistance(my_lat, my_lon, target.lat, target.lon);
          const max_distance = my_loc? target.radius : my_rad
  
          return distance <= max_distance;
      });
        
  
        res.json(targetsWithinRadius);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Radius entry
<input 
    id="radius"
    class="form-control"
    type="number"
    maxLength="3"
    style={{ width: "150px", margin: "5px" }}
    placeholder="Mile radius" 
    onChange={handleRadiusChange}
/> 