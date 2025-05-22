import Layout from "./Layout";
import Footer from "./Footer";
import familypic from "../images/randykidsgreentree.jpg"
import uspic from "../images/randykimwaterfall.jpg"
const About = ()=>{
    const ocyear = new Date("09-01-2028");
    return (
        <>
            <Layout />
            <main className="main">
                <div className="main__wrapper wrapper about__wrapper">
                    <h2 className="main__heading">About Randy</h2>
                    <div className="main__headshot-group">
                    <img className="main__headshot" alt="Lauren, Atticus, and Randy Pospisil" src={familypic} />
                    <img className="main__headshot" alt="Randy and Kim Pospisil" src={uspic} />
                    </div>
                    <p className="main__hometext">I'm a father, a husband, a son, and a child of the King. When I was about 5 years
                         old I was baptized as a believer in Jesus Christ, but I didn't live my life that way most of my young life. 
                         I tried to be a "good kid", but I certainly didn't act like I believed that Jesus had control over my life. 
                         I lived the way I wanted, and just tried to do enough to keep him and my parents off my back.
                    </p>
                    <p className="main__hometext">Then when I was student teaching after attending the University of Iowa, I had a 
                        crisis of faith. It wasn't dramatic. I just realized that I was living a lie. I was saying I was a Christian, 
                        but I was doing everything I could to ignore it. I said ENOUGH! Either this faith is mine, or forget it! But, 
                        by God's grace, He convinced me that all of those stories from the Bible I heard as a kid were true, that Jesus 
                        was real, and that He loved me. I decided to truly follow Him.

                    </p>
                    <p className="main__hometext">From there, I decided to pour my life into following Him, but I knew I needed to know 
                        more, so I attended <a href='https://dts.edu'>Dallas Theological Seminary</a>. I earned a Masters of Theology (Th.M.) 
                        in Old Testament, and then I began working in ministry in various churches as a pastor.
                    </p>
                    <p className="main__hometext">I've always been a tech-geek, and after facing some challenges in ministry and wanting 
                        to stay closer to Iowa, I took at job at <a href='https://www.leepfrog.com'>Leepfrog Technologies</a>. I've been 
                        there {parseInt(Math.floor(new Date() - new Date("2013-06-10") )/1000/60/60/24/365)} years.
                    </p>
                    <p className="main__hometext">In {ocyear.getFullYear()}, which is 
                        just {parseInt(Math.floor(ocyear - new Date())/1000/60/60/24/7)} weeks 
                        away, we plan to move to Berlin, Germany to begin working as missionaries 
                        with <a href='https://onechallenge.org'>One Challenge</a>.
                    </p>
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