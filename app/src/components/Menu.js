import React from "react";
import "./Menu.css"
const difficulty  = ["Easy", "Medium","Hard"];
const titles  = ["Solver","Rule","Print"];
const Menu = () => {
    return(
        <div className="header">
            <div className="home-item">Sudo & Solver</div>
            <div className="menu right">
                {titles.map((title,index)=>
                    <button key = {index + ""} className="menu-item">{title}</button>
                ) }
            </div>
        </div>
    )
}

export default Menu;