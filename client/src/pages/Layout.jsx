import {useLocation} from 'react-router-dom';

const Layout = (props)=>{
    
    return (
        
        <header className="header">
            <div className="header__wrapper wrapper">
            <h1 className="header__title">Randy Pospisil</h1>
            <Nav />
            </div>
        </header>
        
    );
}

const Nav = ()=>{
    return (
        <>
            <ul className="header__nav">
                <NavPieces />
            </ul>
        </>
    )
}
const NavPieces = ()=>{
    var location = useLocation();
    var items = [];
    [
        {title:"Home",    link:"/"},
        {title:"About",   link:"/about"},
        {title:"Pictures",link:"/pictures"},
        {title:"Videos",  link:"/videos"},
        {title:"Writing",  link:"/writing"}
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