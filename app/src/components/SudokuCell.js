import React  from "react";
import './SudokuCell.css';

function SudokuCell({cell,handleCellClick, isSelected, isCorrect,isRelativeCell, isSameNum}){
    var className = "sudoku-cell"
    if(isRelativeCell) className =  "sudoku-cell relatived"
    if(isSameNum) className = "sudoku-cell samenum"
    if(isSelected) className =  "sudoku-cell selected"
    return(
    <div className = {className}  onClick={handleCellClick}>
        <span className={isCorrect?"":"error-cell"}> {cell === 0? "" :cell}</span>
       
    </div>)
} 

export default SudokuCell