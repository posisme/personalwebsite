import Layout from "./Layout";
import Footer from "./Footer";
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import Markdown from 'react-markdown';
import { useRef, forwardRef } from "react";
import { useReactToPrint } from "react-to-print";
import rehypeRaw from 'rehype-raw';
import rehypeSanitize ,{ defaultSchema } from 'rehype-sanitize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const MDViewer = ()=>{
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [doc, setDoc] = useState(searchParams.get('doc'));
    const [markdown, setMarkdown] = useState('');
    const [plaintext, setPlainText] = useState('');
    const [doclist, setDocList] = useState('');
    const [filepath, setFilePath]=useState(searchParams.get('filepath'));
    const componentRef = useRef();
    
    
    
    useEffect(()=>{
        console.log(doc);
        if(doc){
            fetch("/api/mdviewer?doc="+doc)
                .then(response => response.json())
                .then(text => {
                    setMarkdown(text.file);
                    return text;
                })
                .then(text => setPlainText(text.file))
        }
        else{
            fetch("/api/mdviewer?filepath="+filepath)
                .then(response => response.json())
                .then(text => setDocList(text))
        }
    },[]);

    const reactToPrintContent = () =>{
        return componentRef.current;
    }
    const handlePrint = useReactToPrint({
        documentTitle: "File Name",
    })
    const handleMDEdits = (e) => {
        setPlainText(e.target.value); // Update plaintext state
        setMarkdown(e.target.value);
    // Now, send the updated content to the API
        fetch("/api/mdpost", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ filename:doc,content: e.target.value }) // Send the updated content
        })
        .then(response => {
            if (!response.ok) {
                console.error("Failed to save Markdown:", response.statusText);
            }
            return response.json(); // Or handle response as needed
        })
        .catch(error => {
            console.error("Error saving Markdown:", error);
        });
};
    const customSchema = {
        ...defaultSchema,
        attributes: {
            ...defaultSchema.attributes, 
            '*': [...(defaultSchema.attributes['*'] || []), 'style'], 
        },
    };

    
    
    return (
        <>
            <Layout size="small" />
            {doclist? <Doclist doclist={doclist} filepath={filepath} />: ""}
            <main className="mdviewer">
                <div className="wrapper mdviewer__wrapper">
                
                <article className={doc?"mdviewer__article":"hidden"}>
                <button className="mdviewer__printbutton" onClick={()=>handlePrint(reactToPrintContent)}>Print</button>
                <div className="mdviewer__edit">
                    <textarea 
                        className="mdviewer__editor"
                        value={plaintext} 
                        onChange={handleMDEdits}
                    />
                       
                    </div>
                <div className="mdviewer__print" ref={componentRef}>
                    <div className="mdviewer__preview">
                        <Markdown rehypePlugins={[rehypeRaw,rehypeSanitize(customSchema)]}>{markdown}</Markdown>
                    </div>
                </div>
                </article>
                </div>
                
            </main>
            <Footer />
        </>
    )
}



const Doclist = ({ doclist,filepath }) => {
    filepath=filepath?filepath+"/":"";
    return (
        <>
            <ul>
                {doclist.filelist.map((file) => {
                    if (file.match(/\.md$/)) {
                        return (
                            <li key={file}>
                                <a href={`/mdviewer?doc=${filepath?filepath:""}${file}`}>
                                    <FontAwesomeIcon icon="file" style={{ marginRight: '8px' }} />
                                    {file}
                                </a>
                            </li>
                        );
                    }
                    
                    return (
                            <li key={file}>
                                <a href={`/mdviewer?filepath=${file}`}>
                                    <FontAwesomeIcon icon="folder" style={{ marginRight: '8px' }} />
                                    {file}
                                </a>
                            </li>
                        );
                })}
            </ul>
        </>
    );
}

export default MDViewer;