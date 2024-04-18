import { useState, useEffect } from "react";
import axios from 'axios';
import ComedianListing from "./ComedianListing";

function ComicSearch(props) {

    const [zip, setZip] = useState("");                 // only changes once validated
    const [zipField, setZipField] = useState("");       // for visuals

    const [radius, setRadius] = useState(30);           // only changes once validated
    const [radiusField, setRadiusField] = useState(30); // for visuals

    const [userTraveling, setUserTraveling] = useState(true);

    const [location, setLocation] = useState("");
    const [statusMsg, setStatusMsg] = useState("Please enter your zip");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [showList, setShowList] = useState(false);

    const [loaded, setLoaded] = useState(false) // Wait to load the page until we know which page to load, otherwise it will flash

    const [filteredComics, setFilteredComics] = useState([]) //mention why the color is different
    const [comics, setComics] = useState([]) // List of comedian components
    const [ignoreRadius, setIgnoreRadius] = useState(false) // only return comedians in the distance range
    const [sort, setSort] = useState("0")


    // First render: load comics if a location is stored
    useEffect(() => {
        if (!loaded) {
            // load stored filters
            const stored_filters = JSON.parse(localStorage.getItem('filters'))
            if (stored_filters)
            {
                // Can optionally just set a 'filters' object, similar to the location array and keep it all in one package
                // upside is easier storage / retrieval, downside is have to do filters.radius instead of just accessing radius.
                // would be less overhead, and but less intuitive, so i'm going to choose intuition in this case.

                setSort(stored_filters.sort)
                setIgnoreRadius(stored_filters.ignoreRadius)
                setUserTraveling(stored_filters.userTraveling)
                setRadius(stored_filters.radius)
                setRadiusField(stored_filters.radius)
            }

            // load the stored location
            const stored_location = JSON.parse(localStorage.getItem('location'))
            if (stored_location) // if i have a location, show comedians from this location to start.
            {
                setLocation(stored_location)    // load the location from last time
                setStatusMsg(`Searching near ${stored_location[2]}`) // set status message
                setZip(stored_location[3]) // Store the zip locally
                setZipField(stored_location[3])
                load()         // load the comics using prev location
            }
                
            setLoaded(true)
        }
        // eslint-disable-next-line
    }, [])


    // Re-filter the comedians, because a critical property changed (location data changed, or comics reloaded)
    useEffect(() => {
        if (loaded) // dont trigger refreshes for loading values from state, just once we finish loading
        {
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

            // Calculate distances to each comic
            let matchingComedians = comics.slice(); // Create a copy of the comics array
         
            // Store the distances so we can view the distanct to each comic from the new location
            matchingComedians.forEach(comedian => {
                const distance = calculateDistance(location[0], location[1], comedian.lat, comedian.lon);
                const max_distance = userTraveling? radius : comedian.radius; // whose radius to respect?
                comedian.distance = distance.toFixed(1)     // store distance to display it
                comedian.nearby = distance <= max_distance && (userTraveling? comedian.hosting : comedian.traveling); // store whether they're close by (and host-compatible)
            });
            
            // If we are respecting distance, filter out comedians which are now too far
            
            if (!ignoreRadius) {
                // Filter comedians within radius
                matchingComedians = matchingComedians.filter(comedian => {
                    return comedian.nearby;
                });
                
            }

            // Change the comedians to display on the UI
            setFilteredComics(matchingComedians);
        }
    }, [location, comics, ignoreRadius, radius, userTraveling, loaded])

    
    // Changed zip, display current location - will trigger above location change to recalculate and filter
    useEffect(() => {
        // Only refresh location if we entered a different location
        if (zip && zip !== location[3])
        {
            setStatusMsg("Loading...") // update status when they click the search button
            setButtonDisabled(true)
            
            // Try to parse zip code to coordinates
            axios.post(`${props.host}/zip-to-loc`, {zip: zip})
            .then((res) => {
                setLocation(res.data)
                localStorage.setItem('location', JSON.stringify(res.data)) // save this location for next time
                setStatusMsg(`Searching near ${res.data[2]}`)
                
            })
            .catch((e) => {
                setZipField("") // reset zip because it was problematic
                setZip("")
                setStatusMsg("Error locating!") // Display error message
            })
        }
        
    }, [zip, props.host, location])

    

    useEffect(() => {
        // re-arrange the order of comics
        // called when sort option changes, or whenever setting filteredComics (triggered by option changes)
        console.log("re-sorting!")

    }, [sort, filteredComics])


    useEffect(() => {
        // Store preferences whenever they change.
        if (loaded) // ensures we don't modify local storage WHILE reading data from it. We read data in loading stage.
        {
            localStorage.setItem('filters', JSON.stringify({sort: sort, ignoreRadius: ignoreRadius, userTraveling: userTraveling, radius: radius}))
        }
        
        
    }, [ignoreRadius, radius, sort, userTraveling, loaded])
    
    // refresh comedians and filter. Filter is implicit, because it executes through the useEffect on comics
    function load()
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
        })
        .catch((e) => {
            console.log("error", e)
            // internal error: is the server down?
        })

        setShowList(true) // show the comedian list, we're ready to display comedians
    }


    // User changes the zip code. Only update zip if the field is valid.
    const handleZipChange = (event) => {
        const newZip = event.target.value;
        setZipField(newZip); // Show the update in the input boxes
        const isValid = validateInputs(newZip, radius); // Check if its valid

        if (!showList)
            // Allow / disallow go button, if on the landing page
            setButtonDisabled(!(isValid )); 
        else if (isValid)
            // If we're on the search page, and it's valid, refresh (by changing zip)
            {
                setZip(newZip)
            }
    };

    // User changes the radius
    const handleRadiusChange = (event) => {
        const newRad = event.target.value;
        setRadiusField(newRad); // Show the update in the input boxes
        if(validateInputs(zip, newRad)) // Check if its valid
            setRadius(newRad)
    };



    // Ensure the inputs are valid before allowing submission
    const validateInputs = (zipValue, radiusValue) => {
        return (/^\d+$/.test(zipValue) && parseInt(zipValue, 10) > 0 && zipValue.length === 5) && (/^\d+$/.test(radiusValue) && parseInt(radiusValue, 10) > 0);
       
    };





    /**
     * The visuals begin here
     */

    // Wait until the data is loaded before choosing a page to load(prompt or list)
    if (loaded)
    {
        // We specified a location and the comedians have loaded. Show the list!
        if (showList && location)
        {
            // return the page which shows the comedians.
            return (
                <div style = {{display: "flex", paddingLeft: "10px", paddingRight: "10px"}}>
                    {/* Header: shows info, filter options, zip code ... */}
                    <div style = {{backgroundColor: "white", border: "1px solid #e8e8e8", 
                    borderRadius: "8px", height: "85vh", width: "40%"}}>
                        <p style = {{padding: "10px", fontWeight: "100", textAlign: "center"}}>{statusMsg}</p>
                        <hr style = {{marginTop: "-20px"}}></hr>

                        <div style = {{display: "flex", justifyContent: "space-evenly"}}>
                            <div class = "form-floating mb-3" style = {{width: "30%"}}>
                                <input type = "text" class = "form-control" id = "updateZip" value = {zipField}
                                onChange={handleZipChange} maxLength="5"></input>
                                <label for = "updateZip">My zip</label>
                            </div>

                            <div class = "form-floating mb-3" style = {{width: "30%"}}>
                                <input type = "text" class = "form-control" id = "updateRadius" value = {radiusField}
                                onChange={handleRadiusChange} maxLength="4" disabled = {!userTraveling}></input>
                                <label for = "updateRadius">My travel radius</label>
                            </div>

                            <div class = "form-floating" style = {{width: "30%"}}>
                                <select class = "form-select" id="updateSort" onChange={(e) => {
                                    setSort(e.target.value)
                                }} value = {sort}>
                                    <option selected>None</option>
                                    <option value="1">Ratings</option>
                                    <option value="2">Bookmarked</option>
                                    <option value="3">Distance</option>
                                </select>
                                <label for = "updateSort">Sort by</label>

                            </div>

                        </div>

                        {/* pick up here to do switch and comic results */}
                        <div style = {{paddingLeft: "10px", paddingRight: "10px"}}>
                            <div style = {{display: "flex", justifyContent: "space-between"}}>
                                <p>Show incompatible comedians</p>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type = "checkbox" role="switch"
                                    id="flexSwitchCheckDefault"
                                    onChange={() => setIgnoreRadius(!ignoreRadius)} checked={ignoreRadius}></input>
                                </div>

                            </div>

                        </div>

                        {/* Allow user to switch between traveling and hosting */}
                        <div style = {{paddingLeft: "10px", paddingRight: "10px"}}>
                            <div style = {{display: "flex", justifyContent: "space-between"}}>
                                <p>I'm hosting the comedian</p>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type = "checkbox" role="switch"
                                    id="flexSwitchCheckDefault"
                                    onChange={() => setUserTraveling(!userTraveling)} checked={!userTraveling}></input>
                                </div>

                            </div>

                        </div>
                        
                    </div>

                    {/* Comedian Results */}
                    <div style = {{display: "flex", width: "100%", flexDirection: "column"}}>
                        {/* Header with labels */}
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
                            <p style = {{textAlign: 'center', margin: 0}}>Compatible</p>
                            <p style = {{ textAlign: 'right', margin: 0 }}>Bookmark</p>
                        </div>
                        
                        {filteredComics.map((comic, i) => (
                            <ComedianListing comic = {comic} key = {i}></ComedianListing>
                        ))}

                    </div>



                </div>
            )
        }
        return (
            // This div puts everything within it at the center of the screen.
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
                            onClick={() => load()} // Load comedians when we hit go, location-agnostic now.
                        >Go</button>

                    </div>

                    

                </div>
            
            </div>
        )
    }
}

export default ComicSearch;
