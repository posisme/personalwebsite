import Layout from "./Layout";
import Footer from "./Footer";
const About = ()=>{
    return (
        <>
            <Layout />
            <main className="main">
                <div className="main_wrapper wrapper">
                    <h2 className="main__heading">About Randy</h2>
                    <p className="main__hometext">I'm not much of a social media person, but here are my links:</p>
                    <ul>
                        <li><a href="https://www.linkedin.com/in/randypospisil/" target="_blank">Randy's Linked In Profile</a></li>
                        <li><a href="https://bsky.app/profile/posisme.bsky.social" target="_blank">Randy's Blue Sky Profile</a></li>
                        <li><a href="https://github.com/posisme" target="_blank">Randy's Github</a></li>
                    </ul>
                </div>
            </main>
            <Footer />
        </>
    )
}
export default About;