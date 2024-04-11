import { useState, useEffect } from "react";
import axios from 'axios'

function ComicSearch(props) {
    const [zip, setZip] = useState("");
    // const [radius, setRadius] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [showList, setShowList] = useState(false);

    const [statusMsg, setStatusMsg] = useState("")
    const [location, setLocation] = useState("")
    const [loaded, setLoaded] = useState(false)

    // store the comedians
    const [comics, setComics] = useState([])
    const [filteredComics, setFilteredComics] = useState([])
    const [ignoreRadius, setIgnoreRadius] = useState(false)
    const [filter, setFilter] = useState("0")
    

    // First load (useEffect): load stored location & radius
    // if stored, load(false)
    // otherwise, do nothing (renders location entry page)
    useEffect(() => {
        const stored_location = JSON.parse(localStorage.getItem('location'))
        if (stored_location)
        {
            setLocation(stored_location)
            setStatusMsg(`Searching near ${stored_location[2]}`) // [0]: lat, [1]: lon, [2]: 'Farmingville NY 11738'
            setZip(stored_location[3])
            load()
        }
        setLoaded(true)



    }, [])

    // filter comedians by user's choices
    function filterComics(newfilter, newignoredistance, comics_in, loc_in)
    {
        if (!comics_in)
            comics_in = comics

        if (!loc_in)
            loc_in = location

        // calculate distances to each comic
        comics_in.forEach(comedian => {
            const distance = calculateDistance(loc_in[0], loc_in[1], comedian.lat, comedian.lon)
            const max_distance = comedian.radius

            comedian.distance = distance.toFixed(1)
            comedian.nearby = distance <= max_distance
        })

        let matchingComedians = comics_in.slice();

        // do we want to change the ignore radius option
        if (newignoredistance !== null)
        {
            // we are changing the option to respect distance
            setIgnoreRadius(newignoredistance)
            // filter comedians
            if (!newignoredistance)
            {
                matchingComedians = comics_in.filter(comedian => {
                    return comedian.nearby
                })
            }
        }

        if (newfilter !== null)
        {
            setFilter(newfilter)
            // store filter as cookie
        }

        setFilteredComics(matchingComedians)
    }

    function load(newzip)
    {
        // if update is true, use api to get location data
            // set location value in local storage
        if (newzip)
        {
            setStatusMsg("Loading...")
            setButtonDisabled(true)
        
            // convert zip to coordinats
            axios.post(`${props.host}/zip-to-loc`, {zip: newzip})
            .then((loc_res) => {
                setLocation(loc_res.data)
                localStorage.setItem('location', JSON.stringify(loc_res.data)) // store the result as a cookie for next time
                setStatusMsg(`Searching near ${loc_res.data[2]}`)

                axios.get(`${props.host}/find`)
                .then((comic_res) => {
                    setComics(comic_res.data)
                    filterComics(filter, ignoreRadius, comic_res.data, stored_location)
                })
                .catch((e) => {
                    console.log("error",e)
                })
            })
            .catch((e) => {
                console.log("error",e) //shows up in f12 on the web
                
            })
        }
        else
        {
            const stored_location = JSON.parse(localStorage.getItem('location'))
            if (!location)
                setLocation(stored_location)

            axios.post(`${props.host}/zip-to-loc`, {zip: newzip})
            .then((loc_res) => {
                setLocation(loc_res.data)
                localStorage.setItem('location', JSON.stringify(loc_res.data)) // store the result as a cookie for next time
                setStatusMsg(`Searching near ${loc_res.data[2]}`)

                axios.get(`${props.host}/find`)
                .then((comic_res) => {
                    setComics(comic_res.data)
                    filterComics(filter, ignoreRadius, comic_res.data, stored_location)
                })
                .catch((e) => {
                    console.log("error",e)
                })
            })
            .catch((e) => {
                console.log("error",e) //shows up in f12 on the web
                
            })

        }
        
        

        setShowList(true) // show the comedian list, we're ready to display comedians
    }


    // User changes the zip code
    const handleZipChange = (event) => {
        const newZip = event.target.value;
        setZip(newZip);
        validateInputs(newZip);
    };

    // User changes the radius
    // const handleRadiusChange = (event) => {
    //     const newRadius = event.target.value;
    //     setRadius(newRadius);
    //     validateInputs(zip, newRadius);
    // };

    // Ensure the inputs are valid before allowing submission
    const validateInputs = (zipValue) => {
        const isZipValid = /^\d+$/.test(zipValue) && parseInt(zipValue, 10) > 0 && zipValue.length === 5;
        //const isRadiusValid = /^\d+$/.test(radiusValue) && parseInt(radiusValue, 10) > 0;
        setButtonDisabled(!(isZipValid )); // && isRadiusValid
    };

    // Converts degrees for radians, used for distance calculations (helper)
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    
    // Find distance between two coordinate points (venue and comedian)
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




    /**
     * The visuals begin here
     */

    // Wait until the data is loaded before choosing which screen to show (prompt vs list)
    if (loaded)
    {
        // Show comedian list if we specified a location
        if (showList && location)
        {
            
        }
        // We don't have a location stored. Ask for it!
        return (
            // Page asking venue for their zip code ( this div centers everythng within it on the screen )
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
