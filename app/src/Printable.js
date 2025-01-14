import React from "react";
import GenerateSudoku from './sudokuData'
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import "./Printable.css"
import {qrCode1} from './components/Qrcode'
//const difficulties = ['easy', 'medium', 'hard', 'expert'];
const generateMultipleSudokus = (arr, generator) => {
    const sudokus = [];
    arr.forEach((dict)=>{
        for (let j = 0; j < dict.count; j++) {
            sudokus.push(generator(dict.difficulty)); // Use your Sudoku generator function
        }
    })  
    return sudokus;
  };


  const exportToPDF = (sudokus, pageStyle,isSolution, doc) =>{
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let gridMargin = 20; // Margin around the grid
    let cellSize = (pageWidth - 2 * gridMargin) / 9; // Size of each cell in the Sudoku grid
    
    if(pageStyle === 1 ){
        let cellSize2 = (pageWidth / 2  -  1.5 * gridMargin) / 9;
        let cellSize3 = (pageHeight   -  3.5 * gridMargin) / 9 /3; 
        cellSize = Math.min(cellSize2, cellSize3); 
    }

    if(isSolution){
        let cellSize2 = (pageWidth   -  3 * gridMargin) / 9 / 3;
        let cellSize3 = (pageHeight   -  3.5 * gridMargin) / 9 / 4; 
        cellSize = Math.min(cellSize2, cellSize3); 
    }
   
    let xOffset = gridMargin;
    let yOffset = gridMargin;
    if(!isSolution){
        if(pageStyle == 1 ){
            doc.addImage(qrCode1, "PNG", pageWidth -  (9 * cellSize + gridMargin),18 * cellSize +  3 * gridMargin,9 * cellSize, 9 * cellSize);
          }else{
            let imageH = pageHeight - 3 *  gridMargin - 9 * cellSize;
            imageH = Math.min(imageH, 70);
            doc.addImage(qrCode1, "PNG", pageWidth -  gridMargin - imageH, pageHeight - gridMargin - imageH,imageH, imageH);  
          }
    }
    
    sudokus.forEach((sudoku, index) => {
      const puzzle = sudoku.puzzle;
      const solution = sudoku.solution;
      const difficulty = sudoku.difficulty;
      // Draw Sudoku grid
      doc.setFont("helvetica", "bold");
     
      
      doc.setTextColor(0, 0, 0);

    // Add the difficulty label at the top-left corner
    if(isSolution){
        doc.setFontSize(12);
        doc.text(difficulty + " " + (index + 1), xOffset, yOffset - 2);
    }else{
        doc.setFontSize(16);
        doc.text(difficulty + " " + (index + 1), xOffset, yOffset - 5);
    }
     
    //   if(pageStyle !== 0){
    //     doc.setFontSize(12);
    //   } else{
    //     doc.setFontSize(20);
    //   }
        
    //   if(isSolution){
    //     doc.setFontSize(10);
    //   }
    doc.setFontSize(cellSize*2)
      
      

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const x = xOffset + col * cellSize;
          const y = yOffset + row * cellSize;
  
          // Draw cell outline
         // doc.rect(x, y, cellSize, cellSize);
  
          // Add number if present
          let offset = 1.5;
          if(!isSolution){
            if(pageStyle == 0){
                offset += 3;
            }else{
                offset += 0.5;
            }
          }
          if (puzzle[row][col] !== null && puzzle[row][col] !== 0) {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(
              String(puzzle[row][col]),
              x + cellSize / 2,
              y + cellSize / 2 + offset,
              { align: "center" }
            );
          }else{
            if(isSolution){
                doc.setFont("helvetica", "italic");
                doc.setTextColor(100, 100, 100);
                doc.text(
                    String(solution[row][col]),
                    x + cellSize / 2,
                    y + cellSize / 2 + offset,
                    { align: "center" }
                  );

            }
          }
          
        }
      }
    
  
      //Add thicker borders for 3x3 subgrids
      for (let i = 0; i <= 9; i++) {
        const isSubgridLine = i % 3 === 0;
        const lineWidth = isSubgridLine ? 0.6 : 0.2;
        const lineColor = isSubgridLine ? [50, 50, 50] : [200, 200, 200]; // Dark gray and light gray
        doc.setLineWidth(lineWidth);
        //doc.setDrawColor(...lineColor);
        doc.line(xOffset, yOffset + i * cellSize, xOffset + 9 * cellSize, yOffset + i * cellSize);
        doc.line(xOffset + i * cellSize, yOffset, xOffset + i * cellSize, yOffset + 9 * cellSize);
      }
      doc.rect(xOffset, yOffset, 9*cellSize, 9*cellSize);
      if(isSolution){
        if( index % 3 === 2){
            // Update offsets for next puzzle
            yOffset += 9 * cellSize + 0.5 * gridMargin;
            xOffset = gridMargin;
            // If the next puzzle doesn't fit, add a new page
            if (yOffset + 9 * cellSize > pageHeight && index !==  (sudokus.length -1)) {
                doc.addPage();
                xOffset = gridMargin;
                yOffset = gridMargin;
            }
          }else{
            xOffset +=  9 * cellSize + (pageWidth - 27 * cellSize - 2* gridMargin) /2 ;
          }

      }else{
        let n = index % 5;
        if(pageStyle ===  0 || n % 2 === 1 || n ===4 ){
            // Update offsets for next puzzle
            yOffset += 9 * cellSize + gridMargin;
            xOffset = gridMargin;
            // If the next puzzle doesn't fit, add a new page
            if (yOffset + 9 * cellSize > pageHeight && index !==  (sudokus.length -1)) {
                doc.addPage();
                if(pageStyle === 1){
                    doc.addImage(qrCode1, "PNG", pageWidth -  (9 * cellSize + gridMargin),18 * cellSize +  3 * gridMargin,9 * cellSize, 9 * cellSize);
                }else{
                    let imageH = pageHeight - 3 *  gridMargin - 9 * cellSize;
                    imageH = Math.min(imageH, 70);
                    doc.addImage(qrCode1, "PNG", pageWidth -  gridMargin - imageH, pageHeight - gridMargin - imageH,imageH, imageH);  
                }
                
                xOffset = gridMargin;
                yOffset = gridMargin;
            }
          }else{
            xOffset =  pageWidth -  (9 * cellSize + gridMargin);
           
          }
      }
      
  
      
    });
    


  }
  //exportSudokuToPDF(puzzles,pageSize,pageStyle,includeSolution);
  const exportSudokuToPDF = (sudokus,pageSize, pageStyle, needSolution) => {
    const doc = new jsPDF({
        orientation: "portrait", // or "landscape"
        unit: "mm", // Points, other options: "mm", "cm", "in"
        format:  pageSize.toLowerCase() === 'A4'?"a4" : "letter", // Specify A4 size  //letter, a4
      });
      
      exportToPDF(sudokus,pageStyle,false, doc);
      if(needSolution){
        doc.addPage();
        exportToPDF(sudokus,pageStyle,true, doc);
      }
      
      const pdfBlob = doc.output("blob");

    // Create a URL for the Blob
    const pdfURL = URL.createObjectURL(pdfBlob);

    // Open the PDF in a new browser tab
    window.open(pdfURL, "_blank");
    
    // Save the PDF
    //doc.save("sudoku.pdf");
  };

  const SudokuPDFExport = () => {
    const [pageSize, setPageSize] = useState("A4");
    const [difficulty, setDifficulty] = useState(['Easy']);
    const [numPuzzles, setNumPuzzles] = useState(1);
    const [pageStyle, setPageStyle] = useState('0');
    const [includeSolution, setIncludeSolution] = useState(false);
    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
    const handleDifficultyChange = (event) => {
        const { value, checked } = event.target;
        setDifficulty((prev) => {
            let updated = [];
            if (checked) {
                // Add the new value and maintain order
                updated = [...prev, value];
            } else {
                // Remove the value
                if (prev.length <= 1) return prev; // Prevent removing the last difficulty
                updated = prev.filter((diff) => diff !== value);
            }
            // Sort the updated array based on the difficulties order
            return updated.sort((a, b) => difficulties.indexOf(a) - difficulties.indexOf(b));
        });
      };

    useEffect(() => {
        const minPuzzles = calculateMinPuzzles();
        if (numPuzzles < minPuzzles) {
            setNumPuzzles(minPuzzles);
        }
    }, [difficulty]);


    const validateNumPuzzles = () => {
        if (numPuzzles > 100) {
          setNumPuzzles(100); // Reset to 100 if value exceeds the maximum
        } else if (numPuzzles < calculateMinPuzzles()) {
          setNumPuzzles(calculateMinPuzzles()); // Reset to 1 if value is below the minimum
        }
      };
    const calculateMinPuzzles = () => difficulty.length || 1;
    
    
    const handleSubmit = () => {
      //const puzzles = generateMultipleSudokus([{count:7, difficulty:'Easy'},{count:7, difficulty:'Medium'},{count:5, difficulty:'hard'},{count:7, difficulty:'Expert'}], GenerateSudoku); // Generate 5 puzzles
      const num =  Math.floor(numPuzzles / calculateMinPuzzles())
      let arr = [];
      if(difficulty.length == 0){
        arr.push({count:numPuzzles, difficulty:'Easy'});
      }else{
        for(let i =0; i< difficulty.length; i++){
            if(i == 0){
                arr.push({count:numPuzzles - num * (difficulty.length -1), difficulty:difficulty[i]});
            }else{
                arr.push({count: num , difficulty:difficulty[i]});
            }
        }
      }
      
      const puzzles = generateMultipleSudokus(arr, GenerateSudoku); // Generate 5 puzzles
      exportSudokuToPDF(puzzles,pageSize,parseInt(pageStyle),includeSolution);
    };
  
    return (
        <div className="sudoku-pdf-page">
          {/* Left: PDF Preview */}
          <div className="pdf-preview">
            <img
              src={pageStyle !== '0' ? "six-sudoku-sample.jpg" : "single-sudoku-sample.jpg"}
              alt="PDF Preview"
              className="pdf-image"
            />
          </div>
    
          {/* Right: Options Form */}
          <div className="options-form">
            <h2>Generate Sudoku PDF</h2>
    
            {/* Page Size */}

            <div className="form-group">
              <label>Sudoku Pdf Style:</label>
              <select value={pageStyle} onChange={(e) => setPageStyle(e.target.value)}>
                <option value="0">Single Sudoku</option>
                <option value="1">Six Sudoku</option>
              </select>
            </div>

            <div className="form-group">
              <label>Page Size:</label>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
    
            {/* Difficulty */}
            <div className="form-group">
              <label>Difficulty:</label>
              <div className="checkbox-group">
                {difficulties.map((level) => (
                  <label key={level}>
                    <input
                      type="checkbox"
                      value={level}
                      checked = {difficulty.includes(level)}
                      onChange={handleDifficultyChange}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>
    
            {/* Number of Puzzles */}
            <div className="form-group">
          <label htmlFor="numPuzzles">Number of Puzzles:</label>
          <input
            id="numPuzzles"
            type="number"
            min={difficulty.length}
            max={100}
            value={numPuzzles}
            onChange={(e) => setNumPuzzles(parseInt(e.target.value, 10))}
            onBlur={validateNumPuzzles} // Validate when the input loses focus
            onMouseLeave={validateNumPuzzles}

          />
        </div>
    
            {/* Include Solution */}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeSolution}
                  onChange={(e) => setIncludeSolution(e.target.checked)}
                />
                Include Solution
              </label>
              {/* Submit Button */}
            <button className="submit-button" onClick={handleSubmit}>
              Generate PDF
            </button>
            </div>
    
            
          </div>
        </div>
      );
  };
  
  export default SudokuPDFExport;
  

