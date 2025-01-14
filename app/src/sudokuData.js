import { getSudoku } from 'sudoku-gen';


// Get a sudoku of specific difficulty (easy, medium, hard, expert)
const difficulties = ['easy', 'medium', 'hard', 'expert'];
function toGrid(arr){
  const grid = [];
  const numberArr = arr.map((c) => Number(c))
  for(let i =0; i<9 ; i++){
    grid.push(numberArr.slice(i*9, (i+1)* 9));
  }
  return grid;
}
const GenerateSudoku = (Difficulty) =>{
  let difficulty = Difficulty.toLowerCase();
  if (difficulty === null || !difficulties.includes(difficulty)){
    difficulty = difficulties[0];
  }
  const sudoku = getSudoku(difficulty)
  const flatPuzzle = sudoku.puzzle.replaceAll('-','0').split("");
  const flatSolution = sudoku.solution.split("");
  const puzzle = toGrid(flatPuzzle);
  const solution = toGrid(flatSolution);
  return {puzzle:puzzle, solution: solution, difficulty: Difficulty}; 
}
export const defaultPuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
  
  export const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  export default GenerateSudoku;