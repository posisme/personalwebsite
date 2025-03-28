import Layout from "./Layout";
import Footer from "./Footer";
const Videos = ()=>{
    return (
        <>
            <Layout />
            <main className="main">
                <div className="main__wrapper wrapper videos__wrapper">
                    <h2 className="main__heading">Videos</h2>
                    <iframe className="main__videoplayer" src="https://www.youtube.com/embed/videoseries?list=PLHckt1rS4PohmPeemjtXHW5vCIjrUtfIQ"
    title="YouTube video player" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen></iframe>
                    
                </div>
            </main>
            <Footer />
        </>
    )
}
export default Videos;