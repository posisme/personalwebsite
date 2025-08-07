import Layout from "./Layout";
import Footer from "./Footer";
import ocilogo from "../images/oci-stamp-white-350x350.png"
import ocialtlogo from "../images/OCI-alt-logo-in-color-1500px.png"
import ocqrcode from "../images/giving-qrcode.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {useRef, useEffect,useState} from 'react';
import Utils from "../utils/Utils";

const OneChallenge = ()=>{
    const [campaigns, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrclick,setQrClick]=useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/mailchimp'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // The empty array ensures this effect runs only once after the initial render

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
        <>
            <Layout />
            
            <main className="onechallenge">
                <div className="wrapper onechallenge__wrapper">
                    <header className="onechallenge__header">
                        <a href="https://onechallenge.org">
                            <img className="onechallenge__altlogo" width="6099" height="1193" alt="One Challenge Logo" src={ocialtlogo} />
                        </a>
                        <menu className="onechallenge__menu">
                            <ul>
                                <li><a href="https://onechallenge.org">One Challenge Home</a></li>
                                <li><a href="https://onechallenge.org/who-we-are">Who We Are</a></li>
                                <li><a href="https://onechallenge.org/what-we-do">What We Do</a></li>
                                <li><a href="https://onechallenge.org/get-involved">Get Involved</a></li>
                                <li><a href="https://onechallenge.org/news-stories">News &amp; Stories</a></li>
                            </ul>
                        </menu>
                    </header>
                  <article><h2>Countdown to Berlin</h2><p>Randy and Kim plan to move to Germany to build relationships, help the local church, and coordinate short-term mission trips in <strong>{Utils.yMD(new Date("09-01-2028"))}</strong>!</p></article>
                    <article>
                        <h2 className="onechallenge__newsletterheader">Latest Newsletters from the Pospisil's</h2>
                        <ul className="onechallenge__newsletterlist">
                        {campaigns.campaigns.map((f)=>{return (
                            <li className="onechallenge__newsletter">
                                <a target="_blank" href={f.archive_url}>{f.settings.subject_line}</a> - {new Date(f.send_time).toLocaleDateString()}</li>
                            )})}
                        </ul>
                    </article>
                    <article>
                        <h2 className="onechallenge__giveheader">Give to the Pospisil's Ministry with One Challenge</h2>
                        <div className="onechallenge__qrcode">
                        <img 
                            className={"onechallenge__qr"+(qrclick?"large":"small")}
                            src={ocqrcode} 
                            onClick={()=>{setQrClick(!qrclick)}}
                        />
                        {qrclick?"":<p>Click to enlarge</p>}
                        </div>
                        <iframe
                            src="https://giving.myamplify.io/App/Form/d7b54a70-67ea-4a6d-a130-8f0f24030af6"
                            className="onechallenge__giveform"
                            title="Giving Form"
                           
                            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                            referrerPolicy="no-referrer-when-downgrade"
                        >
                            <p>Your browser doesn't support iframes. Please go to 
                                <a href="https://giving.myamplify.io/App/Form/d7b54a70-67ea-4a6d-a130-8f0f24030af6">
                                    https://giving.myamplify.io/App/Form/d7b54a70-67ea-4a6d-a130-8f0f24030af6
                                </a> to give.
                            </p>
                        </iframe>
                    </article>
                </div>
                <div className="onechallenge__footerwrapper">
                    <div className="wrapper onechallenge__footer">
                        <img className="onechallenge__logo" alt="One Challenge Logo" src={ocilogo} />
                        <div className="onechallenge__contact">
                            <div className="onechallenge__textwidget">
                                <p><strong>Address</strong><br />
                                5801 N Union Blvd, Colorado Springs, CO 80918</p>
                                <p><strong>Phone</strong><br />
                                <a href="tel:7195929292">719-592-9292</a> | 800-676-7837</p>
                                <p><strong>Email</strong><br />
                                info@oci.org</p>
                            </div>
                            <div class="onechallenge__social">
                                <a href="https://www.facebook.com/OneChallengeInt">
                                    <FontAwesomeIcon icon="fa-brands fa-facebook" />
                                </a> 
                                <a href="https://www.instagram.com/onechallengeint/">
                                    <FontAwesomeIcon icon="fa-brands fa-instagram" />
                                </a> 
                                <a href="https://vimeo.com/onechallenge">
                                    <FontAwesomeIcon icon="fa-brands fa-vimeo" />
                                </a> 
                                <a href="https://twitter.com/OneChallengeInt">
                                    <FontAwesomeIcon icon="fa-brands fa-twitter" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}



export default OneChallenge;