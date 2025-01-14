import {React, useState, useEffect}  from 'react';

import './App.css';
import './components/Popup.css'
import Menu from './components/Menu';
import SudokuGrid from './components/SudokuGrid';
import NumberPad from './components/NumberPad';
import ToolsPad from './components/ToolsPad';
import GenerateSudoku, { solution } from './sudokuData';
import Difficulty from './components/Difficulty';
import Popup from './components/Popup';
import checkWin from './components/Utils';
function App() { 
  const [grid, setGrid] = useState(Array(9).fill(Array(9).fill(null)))
  const [selectedCell, setSelectedCell] = useState(null)
  const [history, setHistory] = useState([])
  const [helpRemainder, sethelpRemainder] = useState(3)
  const [isOnNote, setIsOnNote] = useState(false)
  const [difficulty, setDifficulty] = useState('easy');
  const [nextDifficulty, setNextDifficulty] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [sudoku, setSudoku] = useState({puzzle:useState(Array(9).fill(Array(9).fill(null))), solution:useState(Array(9).fill(Array(9).fill(null)))});
  const [isPlay,setIsPlay] = useState(true);
  const [isWin, setIsWin] = useState(false);
  useEffect(() => {
    try {
      // Retrieve from localStorage
      const savedGrid = localStorage.getItem("grid");
      const savedSudoku = localStorage.getItem("sudoku");
      const savedDifficulty = localStorage.getItem("difficulty");
  
      // Parse and validate retrieved values
      const parsedSudoku = savedSudoku ? JSON.parse(savedSudoku) : null;
      const parsedGrid = savedGrid ? JSON.parse(savedGrid) : null;
  
      // If valid saved data exists, set the states
      if (parsedSudoku && parsedGrid && savedDifficulty) {
        setDifficulty(savedDifficulty);
        setSudoku(parsedSudoku);
        setGrid(parsedGrid);
        setIsWin(checkWin(parsedGrid,parsedSudoku.solution));
      } else {
        // Otherwise, generate a new game
        const sudoku = GenerateSudoku(savedDifficulty || "easy"); // Default to "easy" if difficulty is missing
        setDifficulty(savedDifficulty || "easy");
        setSudoku(sudoku);
        setGrid(sudoku.puzzle);
      }
    } catch (e) {
      console.error("Error loading data from localStorage:", e);
      // Fallback: Generate a new game
      const sudoku = GenerateSudoku("easy"); // Default to "easy"
      setDifficulty("easy");
      setSudoku(sudoku);
      setGrid(sudoku.puzzle);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const handleCellClick = (x, y) =>{
    setSelectedCell({ x, y });
  }
  function undo(){
    if(history.length >0){
      const oldHistory = [...history]
      const newGrid = oldHistory.pop()
      setHistory(oldHistory)
      setGrid(newGrid)  
    }
  }
  function startNewGame(difficulty){
    if(difficulty !== null)
      setNextDifficulty(difficulty);
    setShowPopup(()=> true);
  }
  function handlePopup(isOK){
    setShowPopup(()=> false);
    if(isOK === true){
      let newDifficulty = difficulty;
      if(nextDifficulty){
       newDifficulty = nextDifficulty.toLowerCase();
      }

      setDifficulty(newDifficulty);
      const sudoku = GenerateSudoku(newDifficulty);
      const puzzle = sudoku.puzzle;
      setSudoku(sudoku);
      setGrid(puzzle);
      setSelectedCell(null);
      setHistory([]);
      sethelpRemainder(3);
      setIsOnNote(false);
      setIsWin(false);

      localStorage.setItem("sudoku", JSON.stringify(sudoku));
      localStorage.setItem("grid", JSON.stringify(puzzle));
      localStorage.setItem("difficulty", newDifficulty);

    }else{
      setNextDifficulty(difficulty);
    }
  }
  function handleNumberClick(num){
    if (selectedCell === null) return
    if(sudoku.puzzle[selectedCell.x]?.[selectedCell.y] !== 0) 
      return
    history.push(grid)

    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) =>{
        if( rowIndex === selectedCell.x && colIndex === selectedCell.y){
          if(isOnNote){
            if(Array.isArray(cell)){
              let arr = [...cell];
              arr[num - 1] = cell[num - 1] === 0? num: 0;
              return arr
            }else{
              let arr = Array(9).fill(0);
              arr[num-1] = num;
              return arr;
            }
          }else{
            return num
          }
          
        }else{
          return cell
        }
      })
    )
    setGrid(newGrid)
    if(!isOnNote){
      setIsWin(checkWin(grid,sudoku.solution));
    }

  }

  function handleToolClick(index){
    switch(index){
      case 0:
        undo()
        break;
      case 1:
        {
          if(selectedCell == null) return
          const {x,y} = selectedCell
          if(sudoku.puzzle[x][y] !== 0) return
          history.push(grid)
          const newGrid = grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => 
            {if (rowIndex === x && colIndex === y) return 0 
              return cell
             }
          )
          
        )
        setGrid((grid)=>{return newGrid});
    
        }
        break;
      case 2:
        setIsOnNote((isOnNote) => !isOnNote)
        break;
      default:
        break
        
    }
  }
        
  // return(
  //   <div className="app-container">
  //     <div style={{maxWidth:"200px",width: "100%",backgroundColor:"red", flex:2}}>test1</div>
  //     <div style={{maxWidth:"500px",width: "100%",backgroundColor:"yellow",flex:5}}>test2</div>
  //     <div style={{maxWidth:"500px",width: "100%",backgroundColor:"green",flex:5}}>test3</div>
  //   </div>
  // )
  return (
    <>
    <Menu/>
    <Difficulty difficulty = {difficulty}  handleDifficultyClick = {startNewGame}/>
    
    <div className="app-container">
        <div className="sudoku-container">
            <SudokuGrid grid={grid} cellClick={handleCellClick} selectedCell={selectedCell} 
              solution = { sudoku.solution}
            />
            
        </div>
        <div className="numberpad-container">
            <ToolsPad handleToolClick = {handleToolClick} helpRemainder ={helpRemainder}
              isOnNote = {isOnNote}
            />
           
            <NumberPad handleNumberClick={handleNumberClick} />
            <button className='newGame-button' onClick={()=>startNewGame()}>New Game</button>
        </div>
        <div className='item-3'></div>
        {showPopup && <Popup title = "Start a New Game" 
          desc = "Are you sure you want to start a new game? Any unsaved progress will be lost."
          confirmText="OK"
          cancelText="Cancel"
          onConfirm = {()=>handlePopup(true)}
          onCancel =  {()=>handlePopup(false)}/>
         }
         {isWin && <Popup  title="Congratulations! You Win!"
          onConfirm={()=>handlePopup(true)}
          confirmText="Start New Game"
          />}
       
    </div>
    </>
);
}

export default App;