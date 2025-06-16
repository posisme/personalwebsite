import Layout from "./Layout";
import Footer from "./Footer";
//import groclist from "../jsonfiles/grocerylist.json";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Don't forget to import the CSS!


const Meals = () => {
    // Initialize state to track the checked status of each item
    const [checkedItems, setCheckedItems] = useState({});
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate()+7)));
    const [inventorytoggle,setInventory] = useState(true);

    const handleCheckBoxChange = async (e) => {
        const { name, checked } = e.target;
        setCheckedItems(prevCheckedItems => ({
            ...prevCheckedItems,
            [name]: checked,
        }));
        var senditems = {...checkedItems,[name]: checked};
        fetch("/api/meals/groceryupdate", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({st:startDate,et:endDate,list:senditems}),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Grocery update response:", data);
            })
            .catch((err) => {
                console.error("Error updating grocery list:", err);
            })
            .finally(() => {
                 setLoading(false);
            });
    };
    const fetchgrocerylist=async () =>{
            const res = await fetch("/api/meals/grocerylist");
            if(!res.ok){
                throw new Error('OOPS');
            }
            const inic = await res.json();
            console.log(inic);
            if(inic.list){
                setCheckedItems(inic.list);
                setStartDate(inic.st);
                setEndDate(inic.et)
            }
            setLoading(false);
        }
    useEffect(()=>{
        
        fetchgrocerylist();
        //const intervalId = setInterval(fetchgrocerylist,5000)
        return () => clearInterval(intervalId);
    },[])
    
    // useEffect(() => {
    //     setLoading(true);
        

    //     fetch("/api/groceryupdate", {
    //         method: "POST",
    //         headers: {
    //             "Content-type": "application/json",
    //         },
    //         body: JSON.stringify(checkedItems),
    //     })
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log("Grocery update response:", data);
    //         })
    //         .catch((err) => {
    //             console.error("Error updating grocery list:", err);
    //         })
    //         .finally(() => {
    //              setLoading(false);
    //         });
    //  }, [checkedItems]); // Only re-run when checkedItems state changes

    const ReloadWindow = () =>{
        fetchgrocerylist();
    }
    
    const gapikey = "AKfycbxoQno60e5TyKp0gcZUnBVubW1a0BcN_NOSmQBWDjALBZEoAl9Y3eKJfzOAtjs3Zw_THA"
    return (
        <>
            <Layout />
            <main className="main meals">
                <div className="wrapper main__wrapper meals__wrapper">
                    <h2 className="main__heading">Grocery List</h2>
                    <button className="meals__reload" onClick={ReloadWindow}>Reload</button>
                    <div className="meals__content">
                        <ul className="meals__list">
                            {Object.entries(checkedItems)
                                .sort(([,aVal],[,bVal]) => {if(aVal == "false" || aVal == false){return -1}else{return 1};return 0;})
                                .map(([key,value]) => (
                                <li className="meals__listitem" key={key}>
                                    <input
                                        type="checkbox"
                                        checked={value==true?true:false}
                                        onChange={handleCheckBoxChange}
                                        name={key}
                                        id={key}
                                    />
                                    <label htmlFor={key}>{key}</label>
                                </li>
                            ))}
                        </ul>
                        {loading && <p>Updating grocery list...</p>}
                        <p>Start Date:<DatePicker 
                            selected={startDate} 
                            onChange={(date) => setStartDate(date)} 
                        />&nbsp;&nbsp;End Date:<DatePicker 
                            selected={endDate} 
                            onChange={(date) => setEndDate(date)} 
                        />
                        <button 
                            onClick={()=>setInventory(!inventorytoggle)}
                        >{inventorytoggle?"Use Inventory":"Don't Use Inventory"}</button>
                        </p>
                        <a 
                            href={"https://script.google.com/macros/s/"+gapikey+"/exec?st="+startDate+"&et="+endDate+"&inventory="+(inventorytoggle?"inv":"noinv")} 
                            target="_blank">Make new JSON</a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Meals;