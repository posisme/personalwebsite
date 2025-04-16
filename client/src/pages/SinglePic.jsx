import Utils from "../utils/Utils";
import Layout from "./Layout";
import Footer from "./Footer";
import axios from 'axios';
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';


const url = 'https://posis.me/api/picture';


const SinglePic = () =>{
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [picture, setPic] = useState(searchParams.get('picture'));
    const [deets, setDeets] = useState(null);
    const [offset, setOffset] = useState(searchParams.get('offset')||0);
    const [person, setPerson] = useState(searchParams.get('person')||null);
    const [filename, setFilename] = useState(searchParams.get('picture'));
    const [people, setPeople] = useState("");
    
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
                var deets = []
                pics= <img className="main__singlepicture" src={"/pics/"+result.data.data.filename} />;
                // if(result.data.data.data.gps.Latitude && result.data.data.data.gps.Longitude){
                //     deets.push("Location: "+result.data.data.data.gps.Latitude +" "+ result.data.data.data.gps.Longitude)
                // }
                setPic(pics);
                // setDeets(deets);
                try{
                    if(Array.isArray(result.data.data.data.iptc.Keywords)){
                        var p = result.data.data.data.iptc.Keywords.map((f)=>{return f.description});
                    }
                    else{
                        var p = result.data.data.data.iptc.Keywords.description;
                    }
                    console.log("IM HERE",p)
                    setPeople(p);
                }
                catch(err){
                    console.log("ImGone",err)
                    setPeople("");
                }
                //
            }).catch((err)=>{
                console.log(err);
            });
        }
    
        let ignore = false;
        startFetch();
        return () => {
            ignore = true;
        }
    }, []);
    let buttonparams = [];
    if(offset){
        buttonparams.push("offset="+offset)
    }
    if(person){
        buttonparams.push("person="+person)
    }
    let buttonreturn = "/pictures/?"+buttonparams.join("&")
    return (
        <>
            <Layout />
            <main className="main">
                <div className="main__wrapper wrapper pictures__wrapper">
                    <h2 className="main__heading">Picture</h2>
                    <button onClick={()=>{window.location = buttonreturn}}>Back</button>
                    <PeopleForm filename={filename} people={people} />
                    {picture}
                    {/* {deets} */}
                    
                </div>
            </main>
            <Footer />
        </>
    )
}

const PeopleForm = (props) => {
    const [people, setPeople] = useState(Array.isArray(props.people) ? props.people.join('\n') : props.people);

    useEffect(() => {
      setPeople(Array.isArray(props.people) ? props.people.join('\n') : props.people);
    }, [props.people]);

    const handleChange = (e) => {
        setPeople(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let formData = Object.fromEntries(new FormData(e.target));
        formData.filename = props.filename;
        console.log(formData);
        axios.post("/api/updatepics", formData).then((response) => {
            console.log(response);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="whoBox">Who is in this photo?</label>
            <textarea id="whoBox" name="whoBox" onChange={handleChange} value={people}></textarea>
            <button id="submit">Update</button>
        </form>
    );
};


export default SinglePic;