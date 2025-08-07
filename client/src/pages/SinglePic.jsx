import Utils from "../utils/Utils";
import Layout from "./Layout";
import Footer from "./Footer";
import axios, { all } from 'axios';
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const url = 'https://posis.me/api/pictures/picture';


const SinglePic = ({authtf}) =>{
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [picture, setPic] = useState(searchParams.get('picture'));
    const [deets, setDeets] = useState(null);
    const [offset, setOffset] = useState(searchParams.get('offset')||0);
    const [person, setPerson] = useState(searchParams.get('person')||null);
    const [filename, setFilename] = useState(searchParams.get('picture'));
    const [people, setPeople] = useState("");
    const [tags, setTags] = useState("");
    const [editPeople, setEditPeople] =useState(false);
    const [editFavorite, setFavorite] =useState(false);
    const [allpeople,setAllPeople]=useState([]);
    const [alltags,setAllTags]=useState([]);
    const [auth, setAuth] = useState(authtf=="true"?true:false);
    console.log("AUTH", auth)
    
    useEffect(()=>{
        async function startFetch(){
            var params = ["picture="+picture]
            if(Utils.isMobile()){
                params.push("height=250")
                params.push("width=250")
            }
            else{
                params.push("height=250")
                params.push("width=250")
            }
            axios.get(url+"?"+params.join("&")).then((result)=>{
                var pics = "";
                var deets = [];
                
                
                pics= <img className="pics__singlepicture" src={"/pics/lowres/"+result.data.data.filename} />;
                // if(result.data.data.data.gps.Latitude && result.data.data.data.gps.Longitude){
                //     deets.push("Location: "+result.data.data.data.gps.Latitude +" "+ result.data.data.data.gps.Longitude)
                // }
                setPic(pics);
                // setDeets(deets);
                var p = [];
                try{
                    if(JSON.stringify(result).match(/"Keywords"/)){
                        if(Array.isArray(result.data.data.data.iptc.Keywords)){
                                p = result.data.data.data.iptc.Keywords.map((f)=>{return f.description.trim()});
                            }
                        else{
                            p = result.data.data.data.iptc.Keywords.description.trim();
                        }
                    }
                    
                    
                    setPeople(p);
                    setCheckedPeople(p);
                    setFavorite(result.data.attrs.fav=="true"?true:false);
                    var a = [
                        ...new Set(
                            result.data.allpeople.map(
                                (f)=>{
                                    return f.personid.trim()
                                }
                            )
                        )
        
                    ].sort((a,b)=>{return p.indexOf(b) - p.indexOf(a)});
                    console.log(a);
                    setAllPeople(a);
                    
                    
                }
                catch(err){
                    setPeople("");
                }


                var p = [];
                try {
                    setTags(result.data.attrs.tag?result.data.attrs.tag:[]);
                    setCheckedTag(result.data.attrs.tag?result.data.attrs.tag:[]);
                    var a = [
                        ...new Set(
                            result.data.alltags.map(
                                (f) => {
                                    return f.val.trim()
                                }
                            )
                        )

                    ].sort((a, b) => { return p.indexOf(b) - p.indexOf(a) });
                    console.log(a);
                    setAllTags(a);


                }
                catch (err) {
                    setTags("");
                }
                
                //
                
            }).catch((err)=>{
                console.log("ERROR",err);
            });
            
        }
    
        let ignore = false;
        startFetch();
        return () => {
            ignore = true;
        }
    }, []);
    let buttonparams = [...window.location.search.substring(1).split("&").filter((f) => !f.match(/^picture/))];
    
    if(person){
        buttonparams.push("person="+person)
    }
    console.log(buttonparams);
    let buttonreturn = "/pictures/?"+buttonparams.join("&")

    
    const [checkedPeople, setCheckedPeople] = useState(people ? [...people] : []); // Initialize as an array
    
    const checkhandleChange = (e) => {
        const personId = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
            setCheckedPeople([...checkedPeople, personId]); // Add the person ID to the array
        } else {
            setCheckedPeople(checkedPeople.filter((id) => id !== personId)); // Remove the person ID from the array
        }
    };
    const [checkedTag, setCheckedTag] = useState(tags ? [...tags] : []); // Initialize as an array

    const checkTagChange = (e) => {
        const tag = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
            setCheckedTag([...checkedTag, tag]); // Add the person ID to the array
        } else {
            setCheckedTag(checkedTag.filter((id) => id !== tag)); // Remove the person ID from the array
        }
    };
    const [otherpeople, setOtherPeople] = useState(null);
    
    const whoboxhandleChange = (e) => {
        setOtherPeople(e.target.value);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        let formData = Object.fromEntries(new FormData(e.target));
        formData.filename = filename;
        console.log("FORMDATA",formData);
        axios.post("/api/pictures/updatepics", formData).then((response) => {
            console.log("FORMRESPO",response);
        });
    };
    const handletagSubmit = (e) =>{
        e.preventDefault();
        let formData = Object.fromEntries(new FormData(e.target));
        formData.filename = filename;
        axios.post("/api/pictures/updatetags", formData).then((response) => {
            console.log("tagsFORMRESPO", response);
        });
    }
    const toggleFavorite = () =>{
        
        
        fetch("/api/pictures/picfav?filename="+filename+"&fav="+!editFavorite)
            .then((res)=>{
                console.log(res);
            })
        setFavorite(!editFavorite);
    }
    
    return (
        <>
            <Layout />
            <main className="main">
                <div className="main__wrapper wrapper pictures__wrapper">
                    <h2 className="pictures__heading">Picture</h2>
                    <button onClick={()=>{window.location = buttonreturn}}>Back</button>
                    {/* <PeopleForm filename={filename} people={people} allpeople={allpeople} /> */}
                    
                
                {(editPeople && auth) ? (
                    <>
                    <form className="pictures__peopleform" onSubmit={handleSubmit}>
                    <div>Who is in this photo?</div>
                <ul className="pictures__peoplelist">
                    
                    {
                    
                    allpeople.map((o,index)=>{
                        console.log(allpeople)
                        return(<li key={index}>
                            <input 
                                type="checkbox"
                                id={`taggedPeople-${index}`}
                                name={`taggedPeople-${index}`}
                                value={o}
                                onChange={checkhandleChange} 
                                checked={checkedPeople.includes(o)}
                            /> 
                            <label htmlFor={`taggedPeople-${index}`}>{o}</label>
                        </li>)
                    })
                    }
                
                </ul>
            
            <label htmlFor="whoBox">Who else is in this photo?</label>
            <textarea id="whoBox" name="whoBox" onChange={whoboxhandleChange} value={otherpeople}></textarea>
            <button id="submit">Update</button>
        </form>
        <form className="pictures__tagform" onSubmit={handletagSubmit}>
                    <div>Tags</div>
                    <ul>
                    {

                                        alltags.map((o, index) => {
                                            return (<li key={index}>
                                                <input
                                                    type="checkbox"
                                                    id={`tags-${index}`}
                                                    name={`tags-${index}`}
                                                    value={o}
                                                    onChange={checkTagChange}
                                                    checked={checkedTag.includes(o)}
                                                />
                                                <label htmlFor={`tags-${index}`}>{o}</label>
                                            </li>)
                                        })
                                    }
                    </ul>
        </form>
                        </>
    
    ):null}
        
                <div className="pictures__container">
                    {auth?(
                    <div className="pictures__buttons">
                    <button 
                        onClick={()=>setEditPeople(!editPeople)}
                        className="pictures__editbutton"
                    >{editPeople?<FontAwesomeIcon icon="fas fa-times-circle" />:<FontAwesomeIcon icon="fas fa-edit" />}</button>
                    <button 
                        onClick={()=>toggleFavorite(!editFavorite)}
                        className={editFavorite?"pictures__favbutton favorite":"pictures__favbutton"} 
                    ><FontAwesomeIcon icon="fas fa-star" /></button>
                    </div>
                    ):null}
                    {picture}
                    {/* {deets} */}
                </div>
                </div>
            </main>
            <Footer />
        </>
    )
}




export default SinglePic;