import Layout from "./Layout";
import Footer from "./Footer";
import headshot from "../images/randyheadshot.jpg"
const Home = ()=>{
    return (
        <>
            <Layout />
            <main className="main">
                <div className="wrapper main__wrapper">
                    <img className="main__headshot" src={headshot} alt="Randy Pospisil" />
                    <div className="main_biowrapper">
                    <h2 className="main__heading">Welcome to Posis.me!</h2>
                    <p className="main__hometext">My name is Randy Pospisil. So Pos is...me! Here's you'll find links to my pictures, videos of past
                        sermons, my resume and Linked In profile, and any other fun things I want to share.
                    </p><p className="main__hometext">I'm learning React right now and honing my javascript and css skills, so this site may
                        undergo changes periodically.
                    </p>
                    </div>
                </div>
                
            </main>
            <Footer />
        </>
    )
}
export default Home;