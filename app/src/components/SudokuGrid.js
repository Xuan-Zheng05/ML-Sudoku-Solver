import {React, useState}  from 'react';
import SudokuCell from './SudokuCell';
import "./SudokuGrid.css"
import "./NoteCell.css"
import  NoteCell from "./NoteCell.js"
function SudokuGrid({grid, cellClick , selectedCell,solution }){
    
    const handleCellClick = (x, y) =>{
        cellClick(x,y)
      }
    return (
     <div className='sudoku-grid'>
        {grid.map((row, x) => (
            
            row.map((cell, y) =>{
                let isRelativeCell = false
                if(selectedCell){
                    if(selectedCell.x === x || selectedCell.y === y || (Math.floor(x/3) === Math.floor(selectedCell.x/3) && Math.floor(y/3) === Math.floor(selectedCell.y/3))){
                        isRelativeCell = true
                    }
                }
                if(Array.isArray(cell)){
                    var border = {borderLeft: "1px solid #bfc6d4", borderTop: "1px solid #bfc6d4",borderRight: "1px solid #bfc6d4",borderBottom: "1px solid #bfc6d4" };
                    if(x === 0 || x === 3 || x === 6){
                        border = {...border, borderTop: "2px solid #344861"}
                    }
                    if(x === 8){
                        border = {...border, borderBottom: "2px solid #344861"}
                    }
                    if(y === 0 || y === 3 || y === 6){
                        border = {...border, borderLeft: "2px solid #344861"}
                    }
                    if(y === 8){
                        border = {...border, borderRight: "2px solid #344861"}
                    }

                    return (
                        <div > <NoteCell cells = {cell} style={{ ...border }} /></div>
                       
                    );
                }
                return(
                <SudokuCell  key = {x+ " " + y} cell = {cell} handleCellClick = {()=>cellClick(x,y)} 
                    isSelected = { selectedCell && selectedCell.x === x && selectedCell.y === y}
                    isRelativeCell = {isRelativeCell}
                    isCorrect={solution[x]?.[y] === cell}
                    isSameNum = {selectedCell &&grid[selectedCell.x]?.[selectedCell.y] === cell && cell !== 0}
                    
                    />)
                }
                    
                )
          
    ))} 
    </div>
    )
}
export default SudokuGrid

