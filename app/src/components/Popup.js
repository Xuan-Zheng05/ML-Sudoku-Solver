import React from "react";
import './Popup.css'
const Popup = ({title, desc, onConfirm, onCancel,confirmText}) =>{
    return(<div className="popup-overlay " onClick={onCancel}>
        <div className="popup-content">
            <h2>{title}</h2>
            <p>{desc}</p>
            {onCancel !== undefined && <button className="cancel" onClick={onCancel}>Cancel</button>}
            <button className="ok" onClick={onConfirm}>{confirmText}</button>
        </div>
        
    </div>)
}

export default Popup;