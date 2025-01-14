import React from 'react'
import "./Menu.css"
const Difficulty =({difficulty,handleDifficultyClick}) =>{

    const difficulties = ["Easy", "Medium","Hard", "Expert"];
    return(
        <div className='difficulty'>
            <label style={{paddingRight:"10px"}}>Difficulty:</label>
            {difficulties.map((title, index)=> 
              
               <button key = {index + ""} className={`difficulty-item ${title.toLowerCase() === difficulty.toLowerCase()? 'selected':""}`} onClick={()=>handleDifficultyClick(title)} >{title}</button>
            
            
            )}
        </div>
        
    )
}

export default Difficulty