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
    const [person, setPerson] = useState(searchParams.get('person')?searchParams.get('person').split(","):null);
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
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [piclist,setPiclist] = useState(null);
    const [offset,setOffset]= useState(parseInt(props.offset));
    const [person,setPerson]= useState(props.person);
    const [totalpics,setTotal] = useState(0);
    const [allpeeps,setAllPeeps] = useState([]);
    const [searchpeeps, setSearchpeeps] = useState(searchParams.get('person')?searchParams.get('person').split(","):[]);
    const [expandsearch, setExpandsearch] = useState(false);
    const [authtf,setAuthtf] = useState(props.authtf)
    const [andorbool,setAndOrBool] = useState(searchParams.get('andorbool'));
    
    
    let maxrows = Utils.isMobile()?10:15;
        

    const handleOffsetChange = (newOffset) =>{
        setOffset(newOffset); 
    }
    const handleSelect = (e) =>{
        if(e.target.checked == true)
            setSearchpeeps([...searchpeeps,e.target.value]);
        else
            setSearchpeeps(searchpeeps.filter(item => item !== e.target.value))
        
        return e.target.value;
    }
    
    
    useEffect((props)=>{
        
        async function startFetch(){
            
            var urlparams = ["authtf="+authtf,"offset="+offset,"max_rows="+maxrows,"andorbool="+andorbool];
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
                    setAllPeeps(result.data.allpeeps);
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

    const handleSearchClick = () =>{
        window.location = window.location.origin + window.location.pathname + "?person="+searchpeeps.join(",")+"&andorbool="+andorbool
        return true;
    }
    
    const handleSearchShow = (e) =>{
        setExpandsearch(prevExpandSearch => !prevExpandSearch);
        console.log(!expandsearch); // Log the new state after toggling
    }
    const allpeepsmap = expandsearch ? allpeeps : allpeeps.slice(0, 10);
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
       <div><button 
        onClick = {()=>setAndOrBool(andorbool == "or" ? "and" : (andorbool == "and"? "or": "or"))}
        className = {`toggle-button ${andorbool == "or" ? 'or': 'and'}`}
       >
        {andorbool == "or" ? (
            <span className="label label--or">Or</span>
        ) : (
            <span className="label label--and">And</span>
        )}
       </button>
       </div>
       <div className="pics__selectpics">
        
                        {
                        allpeepsmap.map((p)=>(
                                <><label className="pics__selectorlabel" htmlFor={"pics__selector-"+p.personid}>{p.personid}

                                <input 
                                    type="checkbox" 
                                    className="pics__selector" 
                                    onChange={handleSelect}
                                    value={p.personid}
                                    checked={searchpeeps.includes(p.personid)}
                                    id={"pics__selector-"+p.personid}
                                /></label></>
                            )
                        )}
        </div>
        {allpeeps.length > 10?<div><a onClick={handleSearchShow}>Show {expandsearch? "less...":"more..."}</a></div>:""}
        
        <button 
            onClick={handleSearchClick}
        >Search Pics</button>
                    
       
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