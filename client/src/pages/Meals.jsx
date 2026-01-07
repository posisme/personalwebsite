import Layout from "./Layout";
import Footer from "./Footer";
import groclist from "../jsonfiles/grocerylist.json";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Don't forget to import the CSS!


const Meals = () => {
    // Initialize state to track the checked status of each item
    const [checkedItems, setCheckedItems] = useState(groclist.list);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate()+7)));
    const [inventorytoggle,setInventory] = useState(true);
    const [additem,addItem] = useState(false);
    const [paused, pauseReload] = useState(false);

    const handleCheckBoxChange = async (e) => {
        pauseReload(true);
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
        pauseReload(false);
    };
    const fetchgrocerylist=async () =>{
        if(!paused){
            try {
                const res = await fetch("/api/meals/grocerylist");
                if (!res.ok) {
                    console.log("error")
                }
                const inic = await res.json();
                if (inic.list) {
                    setCheckedItems(inic.list);
                }
                setLoading(false);
            } catch (error) {
                console.log(error)
            }
        }
    }
    useEffect(()=>{
        const intervalId = setInterval(fetchgrocerylist,2000)
            return () => clearInterval(intervalId);
        
    },[])
    
   

    const ReloadWindow = () =>{
        fetchgrocerylist();
        Object.values(checkedItems.list).filter((j)=>{
            if(j){
                console.log(j);
            }
        })
    }
    const handleAddItem = (e) =>{
        pauseReload(true);
        const { name, value } = e.target;
        
        addItem(value);
        pauseReload(false);
    }
    const removeChecked = async (e) =>{
        pauseReload(true);
        const cleaned = Object.fromEntries(
            Object.entries(checkedItems).filter(([key, value]) => value !== true)
        );
        setCheckedItems(cleaned);
        await fetch("/api/meals/groceryupdate", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ st: startDate, et: endDate, list: cleaned }),
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
        pauseReload(false);
    }
    const handleAddItemClick = async (e) =>{
        pauseReload(true)
        const res = await fetch("/api/meals/groceryadd",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({values:additem.split(/[\n,]/).map(f=>f.trim())})});
        pauseReload(false)
        return res;
        
    }
    
    const gapikey = "AKfycbxGUBbyzkvwqkp1mC1UioW5eMjnmbLzhAJgPA5Hf4E0GaOuB5_9jfnmxydZbIihpsf38Q"
    return (
        <>
            <Layout />
            <main className="main meals">
                <div className="wrapper main__wrapper meals__wrapper">
                    <h2 className="main__heading">Grocery List for {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</h2>
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
                        <p><textarea className='meals__additems' onChange={handleAddItem}></textarea><br />
                            <button onClick={handleAddItemClick}>Add to List</button>
                            <button onClick={removeChecked}>Remove Checked Items</button>
                        </p>
                        <p>Start Date:<DatePicker 
                            selected={startDate} 
                            onChange={(date) => setStartDate(date)} 
                        />&nbsp;&nbsp;End Date:<DatePicker 
                            selected={endDate} 
                            onChange={(date) => setEndDate(date)} 
                        />
                        
                        </p>
                        <a 
                            href={"https://script.google.com/macros/s/"+gapikey+"/exec?st="+startDate+"&et="+endDate} 
                            target="_blank">Make new JSON</a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Meals;