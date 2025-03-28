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
    const [offset, setOffset] = useState(searchParams.get('offset')||0);
    const [person, setPerson] = useState(searchParams.get('person')||null);
    
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
                pics= <img className="main__singlepicture" src={"/pics/"+result.data.data.filename} />;
                setPic(pics);
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
                    {picture}
                    
                </div>
            </main>
            <Footer />
        </>
    )
}

// const PicList = ()=>{
//     const [piclist,setPiclist] = useState(null);
//     const [offset,setOffset]= useState(0);
//     const [totalpics,setTotal] =useState(0);
//     let maxrows = Utils.isMobile()?10:15;
        

//     const handleOffsetChange = (newOffset) =>{
//         setOffset(newOffset); 
//     }
    
    
//     useEffect(()=>{
//         async function startFetch(){
            
//             axios.get(url+"?offset="+offset+"&max_rows="+maxrows).then((result)=>{
//                 var pics = [];
//                 if(result && result.data){
//                     setTotal(result.data.total-maxrows);
//                     result.data.files.forEach(function(p,index){
//                         const base64String = btoa(String.fromCharCode(...new Uint8Array(p.data.data)));
//                         pics.push(<img onClick={()=>{window.location = "/pics/"+p.filename}} className="main__picture" src={`data:image/png;base64,${base64String}`} />);
                        
//                     })
//                 }
//                 setPiclist(pics);
//             }).catch((err)=>{
//                 console.log(err);
//             });
//         }
    
//         let ignore = false;
//         startFetch();
//         return () => {
//             ignore = true;
//         }
//     }, [offset]);
    
//     return (
//         <>
//         <div className="main__picgroup">
//         {piclist}
//         </div>
//         <div className="main__buttongroup">
//             <button onClick={() => handleOffsetChange(0)}>First</button>
//             <button onClick={() => handleOffsetChange(offset - maxrows)}>Previous</button>
//             <button onClick={() => handleOffsetChange(offset + maxrows)}>Next</button>
//             <button onClick={() => handleOffsetChange(totalpics)}>Last</button>
//         </div>
       

//         </>
//     );
    
// }



export default SinglePic;