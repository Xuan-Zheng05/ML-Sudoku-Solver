import React from "react";

const checkWin = (grid, solution) =>{
    
    const isWin = grid.every((row, rowIndex) =>
        row.every((cell, colIndex) => 
           { 
            if(Array.isArray(cell)) return false;
            return solution[rowIndex][colIndex] === cell})
     )
     return isWin;
}

export default checkWin;