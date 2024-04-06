
function Home(props) {

    return (
        // Main centered content
        <div style = {{display: "flex", marginTop: "25vh", alignItems: "center", flexDirection: "column"}}>
            <img src = "/icon.png" alt="logo" width= "100px"/>
            <h1>Welcome to ByTheBook.</h1>
            <h2 style = {{fontWeight: "100", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)"}}>Let's find some comedians!</h2>
        </div>
    )
 }

export default Home;
