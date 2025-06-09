import {useLocation} from 'react-router-dom';
import { useState,useEffect } from "react";

const Layout = (props)=>{
    var size = props.size?props.size:"large"
    return (
        
        <header className="header">
            <div className="header__wrapper wrapper">
            {size == "small"?"":<h1 className="header__title">Randy Pospisil</h1>}
            <Nav size={size} />
            </div>
        </header>
        
    );
}

const Nav = (props)=>{
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    const closeMenu = () => {
        setIsOpen(false);
    };
    
    return (
        <nav className="navbar">
            {isMobile?<Hamburger toggleMenu={toggleMenu}/>:""}
            <ul className={"header__nav-"+props.size}>
                {isOpen?<NavPieces />:""}
                {!isMobile?<NavPieces />:""}
            </ul>
        </nav>
    )
}
const Hamburger = ({toggleMenu}) =>{
    return (<button class="hamburger" aria-label="Toggle menu" onClick={toggleMenu}>
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>)
}
const NavPieces = ()=>{
    var location = useLocation();
    console.log(location);
    var items = [];
    [
        {title:"Home",    link:"/"},
        {title:"About",   link:"/about"},
        {title:"One Challenge",   link:"/onechallenge"},
        {title:"Pictures",link:"/pictures"},
        {title:"Videos",  link:"/videos"},
        {title:"Writing",  link:"/writing"},
        {title:"Menu",   link:"/meals"},
        {title:"MDViewer", link:"/mdviewer"}
    ].forEach((item)=>{
        var classes = ["header__navitem"]
        if(location.pathname === item.link){
            classes.push("selected");
        }
        items.push(<li className={classes.join(" ")}><a href={item.link}>{item.title}</a></li>)
    })
    return items;
}
export default Layout;