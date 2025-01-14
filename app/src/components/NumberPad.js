import "./NumberPad.css"
const NumberPad = ({handleNumberClick}) => (
    <div className="number-pad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
        
        <button className="number-button" key={num} onClick={() => handleNumberClick(num)}>
          {num}
        </button>
       
        
      ))}
    </div>
  );

  export default NumberPad