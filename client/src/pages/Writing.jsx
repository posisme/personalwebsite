import Layout from "./Layout";
import Footer from "./Footer";
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import Markdown from 'react-markdown';
import { useRef, forwardRef } from "react";
import { useReactToPrint } from "react-to-print";




const Writing = ()=>{
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [doc, setDoc] = useState(searchParams.get('doc'));
    const [markdown, setMarkdown] = useState('');
    const componentRef = useRef();
    
    
    
    useEffect(()=>{
        if(doc){
        fetch("/writing_docs/"+searchParams.get('doc')+".md")
            .then(response => response.text())
            .then(text => setMarkdown(text))
        }
    },[]);

    const reactToPrintContent = () =>{
        return componentRef.current;
    }
    const handlePrint = useReactToPrint({
        documentTitle: "File Name",
    })

    
    return (
        <>
            <Layout />
            <main className="main">
                <div className="wrapper main__wrapper writing__wrapper">
                    
                <h2 className="main__heading">Writing</h2>
                <Doclist />
                
                <article className="writing">
                <button onClick={()=>handlePrint(reactToPrintContent)}>Print</button>
                <div className="writing__print" ref={componentRef}>
                    <div className="writing__content">
                        <Markdown>{markdown}</Markdown>
                    </div>
                </div>
                </article>
                </div>
                
            </main>
            <Footer />
        </>
    )
}



const Doclist = () =>{
    const [doceles, setDocEls] = useState('');
    useEffect(()=>{
        fetch("/api/getdocs").then(response => response.text()).then((text)=>{
            text = JSON.parse(text);
            console.log(text);
            var alleles = [];
            text.data.forEach(function(ele){
                var p = ele.link.split(/\.md/)[0]
                alleles.push(<li><a href={"/writing?doc=" + p}>{ele.title}</a></li>)
            });
            setDocEls(alleles)
        })
    },[]);
    return (
        <>
        <ul>
            {doceles}
        </ul>
        </>
    )
}

export default Writing;