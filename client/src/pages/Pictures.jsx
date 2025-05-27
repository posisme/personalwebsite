import Utils from "../utils/Utils";
import Layout from "./Layout";
import Footer from "./Footer";
import axios from 'axios';
import { useState, useEffect } from "react";
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const url = '/api/pictures/';


const Pictures = ({authtf}) =>{
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [offset, setOffset] = useState(searchParams.get('offset')||0);
    const [person, setPerson] = useState(searchParams.get('person')||null);
    const [auth, setAuth] = useState(authtf);
    console.log("AUTH",authtf)
    return (
        <>
            <Layout />
            <main className="main">
                <div className="main__wrapper wrapper pictures__wrapper">
                    <h2 className="main__heading">Pictures</h2>
                    <PicList offset={offset} person={person} authtf={authtf}/>
                    
                </div>
            </main>
            <Footer />
        </>
    )
}



const PicList = (props)=>{
    const [piclist,setPiclist] = useState(null);
    const [offset,setOffset]= useState(parseInt(props.offset));
    const [person,setPerson]= useState(props.person);
    const [totalpics,setTotal] = useState(0);
    const [authtf,setAuthtf] = useState(props.authtf)
    
    
    let maxrows = Utils.isMobile()?10:15;
        

    const handleOffsetChange = (newOffset) =>{
        setOffset(newOffset); 
    }
    
    
    
    useEffect((props)=>{
        
        async function startFetch(){
            
            var urlparams = ["authtf="+authtf,"offset="+offset,"max_rows="+maxrows];
            console.log(person)
            if(person){
                urlparams.push("person="+encodeURIComponent(person));
            }
            axios.get(url+"?"+urlparams.join("&")).then((result)=>{
                var pics = [];
                if(result && result.data){
                    setTotal(result.data.total-maxrows);
                    result.data.files.forEach(function(p,index){
                        var src="/pics/"+p.filename;
                        pics.push(<div className="pics__picturegroup" 
                                        onClick={()=>{window.location = "/pic?picture="+p.filename+"&"+urlparams.join("&")}}>
                                    <img className="pics__picture"  
                                    alt={"picture of " + p.data.people}
                                    src={src}/>
                                    <div className="pics__pictureoverlay">
                                        <div className="pics__people">{p.data.people}</div>
                                        <div className="pics__favorite">{p.data.fav=="true"?<FontAwesomeIcon icon="fa-star" />:""}</div>
                                    </div>
                                  </div>
                        );
                    })
                }
                setPiclist(pics);
                
                
            }).catch((err)=>{
                console.log(err);
            });
        }
    
        let ignore = false;
        startFetch();
        return () => {
            ignore = true;
        }
    }, [offset]);

    
    
    return (
        <>
        
        <div className="pics__picgroup">
        {piclist}
        </div>
        <div className="pics__buttongroup">
            <button onClick={() => handleOffsetChange(0)}>&lt;&lt;</button>
            <button onClick={() => handleOffsetChange(offset - maxrows)}>&lt;</button>
            <button onClick={() => handleOffsetChange(offset + maxrows)}>&gt;</button>
            <button onClick={() => handleOffsetChange(totalpics)}>&gt;&gt;</button>
        </div>
       <input type="hidden" id="currlist" value={"{offset:"+offset+",person:"+person+"}"}/>
       <div>{props.authtf=="true"?<LoadLink />:<a href='/login'>Log in to see all pictures</a>}</div>
       
        </>
    );
    
}

const LoadLink = () =>{
    const [loading, setLoading] = useState(false);
    const rebuildpics = async (props)=>{
        setLoading(true);
        if(loading){
            return false;
        }
        const response = await fetch("/api/rebuildpics");
        if(response.ok){
            setLoading(false);
        }
    }
    return (
        <Link loading={loading} id="rebuildpicslink" disabled={loading} onClick={() => rebuildpics()}>{loading ? 'Rebuilding, please wait...': 'Rebuild pics'}</Link>
    )
}




export default Pictures;