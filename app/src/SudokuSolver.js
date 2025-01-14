import React, { useState ,useRef, useEffect} from "react";
import axios from "axios";
import './SudokuSolver.css'

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading]= useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  const fileRef = useRef(null);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);
  const validateFileType = (file) => {
      if (file && allowedTypes.includes(file.type)) {
          return true;
      }
      return false;
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(null)
    if(!validateFileType(selectedFile)){
        e.target.value = "";
        alert('Only image and PDF files are allowed.');

    }
    
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
        setImage(null)
        setPdfUrl(null)
        setFile(selectedFile);
        setFileName(selectedFile.name);
    } else {
        e.target.value = "";
        alert("File size exceeds 10MB or unsupported format.");
    }
  };



const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(null)
    setFileName("");
    fileRef.current.value = '';
    if(!validateFileType(droppedFile)){
        event.target.value = "";
        alert('Only image and PDF files are allowed.');
        return;
    }

    if (droppedFile.size > 10 * 1024 * 1024) {
        event.target.value = "";
        alert("File size exceeds 10MB or unsupported format.");
        return
    }
    if(droppedFile){
        setFile(droppedFile);
        setFileName(droppedFile.name);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileRef.current.files = dataTransfer.files;
    }

    
};

const handleDragOver = (event) => {
    event.preventDefault();
};

  const handleSubmit = async (e) => {
    console.log("jh");
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true); 
    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }, 
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            if(percentCompleted > 90)
                setUploadProgress(50);
          },
      });
      setUploadProgress(100);
      const { fileType, data, message, grids, solves } = response.data;
      if(fileType === 'pdf'){
        const pdfBlob = new Blob([Uint8Array.from(atob(data), c => c.charCodeAt(0))], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);

       

        if (isMobile) {
            // Open PDF in a new tab or initiate download
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.target = "_blank"; // Open in a new tab
            link.download = "processed_document.pdf"; // Optional: Set a download name
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            // Update the page to display the PDF
            setPdfUrl(pdfUrl);
        }

      }else{
        if(data){
            setImage(`data:image/jpeg;base64,${data}`);
          }
      }
      //alert(message);
    } catch (error) {
      alert("Failed to upload file.");
    } finally{
        setIsUploading(false); 
        setUploadProgress(0)
    }
  };

  return (
    <div className="sudoku-solver-app" style={{ pointerEvents: isUploading ? "none" : "auto" }}>
        <form onSubmit={handleSubmit}>
        <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
        </form>
        {!isMobile &&<div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    border: '2px dashed #ccc',
                    padding: '20px',
                    marginTop: '20px',
                    textAlign: 'center',
                }}
            >
                {fileName ? (
                    <p>File ready to upload: {fileName}</p>
                ) : (
                    <p>Drag and drop a file here, or use the file input above</p>
                )}
            </div>}

        {image && <img width="100%" height="auto" src={image} alt="Processed Image" />}
        {pdfUrl && (
            <div className="sudoku-solver-pdf">
                <object
                data={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                aria-label="PDF Viewer"
                >
                <p>Your browser does not support PDFs. Please download the PDF to view it: <a href={pdfUrl}>Download PDF</a></p>
                </object>
            </div>
        )}
         {isUploading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <p>Uploading... {uploadProgress}%</p>
            <div
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "#e0e0e0",
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  backgroundColor: "#76c7c0",
                  transition: "width 0.2s",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
     </div>
  );
};

export default FileUploader;
