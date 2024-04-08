import { useState, useEffect } from "react";
import axios from 'axios';
import ComedianListing from "./ComedianListing";

function ComicSearch(props) {
    const [zip, setZip] = useState("");
    const [location, setLocation] = useState("");
    const [statusMsg, setStatusMsg] = useState("Please enter your zip");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [showList, setShowList] = useState(false);

    const [loaded, setLoaded] = useState(false) // Wait to load the page until we know which page to load, otherwise it will flash

    const [filteredComics, setFilteredComics] = useState([])
    const [comics, setComics] = useState([]) // List of comedian components
    const [ignoreRadius, setIgnoreRadius] = useState(false) // only return comedians in the distance range
    const [filter, setFilter] = useState("0")


    // First render: load comics if a location is stored
    useEffect(() => {
        const stored_location = JSON.parse(localStorage.getItem('location'))
        if (stored_location)
        {
            setLocation(stored_location)    // load the location from last time
            setStatusMsg(`Searching near ${stored_location[2]}`) // set status message
            setZip(stored_location[3]) // Store the zip locally
            load()         // load the comics using prev location
        }
            
        setLoaded(true)
        // eslint-disable-next-line
    }, [])

    // Load helpers for calculating distance to comics
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

    function filterComics(newfilter, newignoredistance, comics_in, loc_in) {

        if (!comics_in)
            comics_in = comics // if not specified, use state value

        if (!loc_in)
            loc_in = location  // if not specified, use state value

        // Calculate distances to each comic
        comics_in.forEach(comedian => {
            const distance = calculateDistance(loc_in[0], loc_in[1], comedian.lat, comedian.lon);
            const max_distance = comedian.radius;

            comedian.distance = distance.toFixed(1)     // store distance to display it
            comedian.nearby = distance <= max_distance; // store whether they're close by
        });

        let matchingComedians = comics_in.slice(); // Create a copy of the comics array
        
    
        // Want to change the radius option
        if (newignoredistance !== null) {
            
            setIgnoreRadius(newignoredistance); // Update the state value (to change the button)
            
            // Filter out comedians who don't match the travel distance
            if (!newignoredistance) {
                
                // Filter comedians within radius
                matchingComedians = comics_in.filter(comedian => {
                    return comedian.nearby;
                });
                
            }
            
        }
    
        // Change the filter (use matchingComedians)
        if (newfilter !== null) {
            // Add logic to handle filter change
            setFilter(newfilter)
        }
    
        setFilteredComics(matchingComedians);
    }
    
    // refresh comedians and filter. Optionally, provide a new search origin
    function load(newzip)
    {// if update is true, use api to get location data
            // set location value in local storage
        if (newzip)
        {
            setStatusMsg("Loading...") // update status when they click the search button
            setButtonDisabled(true)
            
            // Try to parse zip code to coordinates
            axios.post(`${props.host}/zip-to-loc`, {zip: newzip})
            .then((res1) => {
                setLocation(res1.data)
                localStorage.setItem('location', JSON.stringify(res1.data)) // save this location for next time
                setStatusMsg(`Searching near ${res1.data[2]}`)
                
                // Find and sort comedians once we know where our location is
                axios.get(`${props.host}/find`)
                .then((res2) => {
                    // Store the comedian documents in an array: Projected server side to hide password, uid, etc
                    setComics(res2.data) 
                    // Apply the stored filters
                    filterComics(filter, ignoreRadius, res2.data, res1.data)
                })
                .catch((e) => {
                    console.log("error", e)
                    // internal error: is the server down?
                })
            })
            .catch((e) => {
                setZip("") // reset zip because it was problematic
                setStatusMsg("Error locating!") // Display error message
            })
        }
        else
        {
            const stored_location = JSON.parse(localStorage.getItem('location'))
            // else, load it from local storage
            if (!location)
                setLocation(stored_location)

            // reach api/find , providing the coordinates
            axios.get(`${props.host}/find`)
            .then((res) => {
                // Store the comedian documents in an array: Projected server side to hide password, uid, etc
                setComics(res.data) 
                // Apply the stored filters
                filterComics(filter, ignoreRadius, res.data, stored_location)
            })
            .catch((e) => {
                console.log("error", e)
                // internal error: is the server down?
            })
        }
        

        setShowList(true) // show the comedian list, we're ready to display comedians
    }


    // User changes the zip code
    const handleZipChange = (event) => {
        const newZip = event.target.value;
        setZip(newZip); // Show the update in the input boxes
        const isZipValid = validateInputs(newZip); // Check if its valid
        if (!showList)
            // Allow / disallow go button, if on the landing page
            setButtonDisabled(!(isZipValid )); 
        else if (isZipValid)
            // If we're on the search page, and it's valid, refresh
            load(newZip)
    };



    // Ensure the inputs are valid before allowing submission
    const validateInputs = (zipValue) => {
        return /^\d+$/.test(zipValue) && parseInt(zipValue, 10) > 0 && zipValue.length === 5;
        //const isRadiusValid = /^\d+$/.test(radiusValue) && parseInt(radiusValue, 10) > 0;
    };





    /**
     * The visuals begin here
     */

    // Wait until the data is loaded 
    if (loaded)
    {
        // Show comedian list if we specified a location
        if (showList && location)
        {
            return (
                // The main container
                <div style = {{display: "flex", paddingLeft: "10px", paddingRight: "10px"}}>

                    {/* Info header, with location and filters. Will also display selected comic*/}
                    <div style = {{backgroundColor: "white",  border:"1px solid #e8e8e8", borderRadius: "8px", height: "85vh", width: "40%"}}>
                        <p style = {{padding: "10px", fontWeight: "100", textAlign: "center"}}>{statusMsg}</p>
                        <hr style = {{marginTop: "-20px"}}></hr>

                        {/* Side by side container */}
                        <div style = {{display: "flex", justifyContent: "space-evenly"}}>

                            <div class="form-floating mb-3" style = {{width: "40%"}}>
                                <input type="text" class="form-control" id="updateZip" value={zip} onChange={handleZipChange} maxLength="5"/>
                                <label for="updateZip">Update zip</label>
                            </div>

                            <div class="form-floating" style = {{width: "40%"}}>
                                <select class="form-select" id="updateFilters" onChange={(e) => filterComics(e.target.value)} value={filter}>
                                    <option selected>None</option>
                                    <option value="1">Ratings</option>
                                    <option value="2">Bookmarked</option>
                                    <option value="3">Distance</option>
                                </select>
                                <label for="updateFilters">Sort by</label>
                            </div>

                        </div>
                        
                        <div style = {{paddingLeft: "10px", paddingRight: "10px"}}>
                            {/* Switch for respecting distance */}
                            <div style = {{display: "flex", justifyContent: "space-between"}}>
                                <p>Show comedians out of range</p>

                                <div class="form-check form-switch" >
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" onChange={() => filterComics(null, !ignoreRadius)} value={ignoreRadius}/>
                                </div>

                                
                                
                            </div>
                        </div>

                    </div>

                    {/* Comedian Results */}
                    <div style={{ display: "flex", width: "100%", flexDirection: "column"}}>
                        {/* Header (with labels) */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: '27% 17% 20% 12% 13% 10%',
                            alignContent: "center",
                    
                            backgroundColor: "white",  
                            border:"1px solid #e8e8e8", 
                            borderRadius: "8px", 
                            marginLeft: "10px",
                            marginBottom: "5px",
                            padding: "10px",
                            height: "30px",
                            width: "100%",
                            }}>
                            <p style = {{textAlign: 'left', margin: 0}}>Comedian</p>
                            <p style = {{textAlign: 'left', margin: 0}}>Rating</p>
                            <p style = {{textAlign: 'left', margin: 0}}>Town</p>
                            <p style = {{textAlign: 'left', margin: 0}}>Distance</p>
                            <p style = {{textAlign: 'center', margin: 0}}>Will Travel</p>
                            <p style = {{ textAlign: 'right', margin: 0 }}>Bookmark</p>
                        </div>

                        {filteredComics.map((comic, i) => ( // Map each comedian to a comedian component
                            <ComedianListing key={i} comic={comic} />
                        ))}
                    </div>
            </div>)
        }
        return (
            // Main centered content
            <div style = {{display: "flex", marginTop: "25vh", alignItems: "center", flexDirection: "column"}}>

                <div style = {{backgroundColor: "white",  border:"1px solid #e8e8e8", borderRadius: "8px", padding: "3px"}}>
                    <p style = {{padding: "10px"}}>{statusMsg}</p>
                    <hr style = {{marginTop: "-20px", marginBottom: 0}}></hr>

                    {/* Side by side container */}
                    <div style = {{display: "flex", flexDirection: "row"}}>
                        <input 
                            id="zip"
                            class="form-control"
                            type="text"
                            maxLength="5"
                            style={{ width: "150px", margin: "5px" }}
                            placeholder="Zip code" 
                            onChange={handleZipChange}
                        />
                        
                        <button 
                            type="button" 
                            class="btn btn-outline-primary" 
                            style = {{margin:"5px", width: "50px"}}
                            disabled={buttonDisabled}
                            onClick={() => load(zip)}
                        >Go</button>

                    </div>

                    

                </div>
            
            </div>
        )
    }
}

export default ComicSearch;
