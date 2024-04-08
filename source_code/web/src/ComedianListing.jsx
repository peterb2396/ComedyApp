function ComedianListing({comic})
{   
    return(
        <div style = {{
            display: "grid",
            gridTemplateColumns: '27% 17% 20% 12% 13% 10%',
            alignContent: "center",

            backgroundColor: "white",  
            border:"1px solid #e8e8e8", 
            borderRadius: "8px", 
            marginLeft: "10px",
            marginBottom: "5px",
            padding: "10px",
            height: "65px",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center"}}>

            <p style = {{textAlign: 'left', margin: 0}}>{comic.name}</p>
            <p style = {{textAlign: 'left', margin: 0}}>{comic.rating}</p>
            <p style = {{textAlign: 'left', margin: 0}}>{comic.town}</p>
            <p style = {{textAlign: 'left', margin: 0}}>{comic.distance}mi</p>
            <img src = {comic.nearby? "/check.png" : "/x.png"} alt = "icon" style = {{justifySelf: "center", margin: 0, width: "20px", height: "20px"}}/>
            <div style = {{display: "flex", justifyContent: "center"}}>
                <button onClick={() => {alert("hi vito")}} style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                    <img src = "/not-booked.png" alt = "icon" style = {{justifySelf: "center", margin: 0, width: "20px", height: "20px"}}/>
                </button>
            </div>
            {/* https://www.iconsdb.com/custom-color/outline-star-icon.html */}
        </div>
    )
}
export default ComedianListing