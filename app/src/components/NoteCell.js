import React from "react";
import "./NoteCell.css"

const NoteCell = ({cells,style})=>{
    
    return (
    <div className="note-cells" style={style}>
        { cells.map((cell, index) =>
              <div className="note-cell" >{cell === 0 ? "" : cell}</div>
            
        )
        }

    </div>)
}

export default NoteCell