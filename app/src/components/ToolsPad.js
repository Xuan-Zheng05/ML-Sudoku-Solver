import React from "react";
import "./NumberPad.css"
import { GrUndo,GrEdit ,GrErase,GrHelp} from "react-icons/gr";

const ToolsPad = ({handleToolClick,  isOnNote, helpRemainder}) =>{
       
    const titles =["Undo","Erase","Notes", "Hint"];
    const icons = [GrUndo,GrErase,GrEdit,GrHelp];
    function renderButton(index){
        if (index === 2){ 
            return <div className= {`oval ${isOnNote?'selected':''}`}>{isOnNote?"ON":"OFF"}</div> 
        }
        if (index === 3){
            return <div className="circle-number">{helpRemainder?helpRemainder:0}</div> 
        }
        return null;
    }
    return(
       
    <div className="tools-pad">
        {icons.map((IconComponent,index) =>
            {return(<div key = {index + ""} className="tool-item"><button  className = {`tools-button ${index === 2 && isOnNote && 'selected'} `}
                onClick={()=>handleToolClick(index)}> <IconComponent />         
                 { renderButton(index)}
                </button   ><label  className="tools-label">{titles[index]}</label></div>)}
        )
        }

        
    </div>
    
    )
}

export default ToolsPad