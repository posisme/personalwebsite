import Layout from "./Layout";
import Footer from "./Footer";
import { useState, useEffect } from "react";



const Reading = ()=>{
    const [readingdoc, setReadingDoc] = useState('');
    useEffect(()=>{
        
        fetch("/api/reading/?moby-dick")
            .then((t)=>{console.log(t);})
            .then(text => setReadingDoc(text))
        
    },[]);
    return (
        <>
            <Layout />
            <main className="main">
                <div className="wrapper main__wrapper reading__wrapper">
                    
                <h2 className="main__heading">Reading</h2>
                
                
                <article className="reading">
                
                    <div className="reading__content">
                                {
                                    JSON.stringify(readingdoc)
                                }
                    </div>
                
                </article>
                </div>
                
            </main>
            <Footer />
        </>
    )
}

export default Reading;