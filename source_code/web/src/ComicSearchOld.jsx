import { useState } from "react";

function ComicSearch(props) {
    const [zip, setZip] = useState("");
    // const [radius, setRadius] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [showList, setShowList] = useState(false);

    // First load (useEffect): load stored location & radius
    // if stored, load(false)
    // otherwise, do nothing (renders location entry page)

    function load(update)
    {
        // if update is true, use api to get location data
            // set location value in local storage
        
        // else, load it from local storage

        // reach api/find , providing the coordinates and radius
        // render comedian components
        

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



    /**
     * The visuals begin here
     */

    // Show comedian list if we specified a location
    if (showList)
    {
        return (<>Browsing comedians that can travel to {zip}</>)
    }
    return (
        // Main centered content
        <div style = {{display: "flex", marginTop: "25vh", alignItems: "center", flexDirection: "column"}}>

            <div style = {{backgroundColor: "white",  border:"1px solid #e8e8e8", borderRadius: "8px", padding: "3px"}}>
                <p style = {{padding: "10px"}}>Almost there...</p>
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
                    {/* <input 
                        id="radius"
                        class="form-control"
                        type="number"
                        maxLength="3"
                        style={{ width: "150px", margin: "5px" }}
                        placeholder="Mile radius" 
                        onChange={handleRadiusChange}
                    /> */}

                    <button 
                        type="button" 
                        class="btn btn-outline-primary" 
                        style = {{margin:"5px", width: "50px"}}
                        disabled={buttonDisabled}
                        onClick={() => load(true)}
                    >Go</button>

                </div>

                

            </div>
           
        </div>
    )
 }

export default ComicSearch;
