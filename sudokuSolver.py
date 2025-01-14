import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

import cv2
import fitz
import base64
from src.SolverVR import SolverVR
import numpy as np
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Allow requests from frontend
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["TEMP_FOLDER"] = 'temps'
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB file size limit

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

# Ensure upload folder exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["TEMP_FOLDER"], exist_ok=True)
solver = SolverVR()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    # Process image or PDF
    if filename.lower().endswith(("png", "jpg", "jpeg")):
        return process_image(file, file_path)
    elif filename.lower().endswith("pdf"):
        return process_pdf(file, file_path)





def process_image(file, file_path):
    # Save or process the image as needed
    try:
        # file.save(file_path)
        # img = Image.open(file_path)
        # img.verify()  # Verify it's a valid image
        # img = cv2.imread(file_path)

        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        grids_matrix, grids_solved, main_ret = solver.solve_1_img(img=img)

        _, buffer = cv2.imencode('.jpg', main_ret)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        # Convert each np.ndarray inside grids_matrix to a Python list
        grids_matrix_serializable = [grid.tolist() for grid in grids_matrix if isinstance(grid, np.ndarray)]

        # If grids_solved also contains np.ndarray elements, do the same
        grids_solved_serializable = [solve.tolist() for solve in grids_solved if isinstance(solve, np.ndarray)]

        # Return the JSON response
        return jsonify({
            "message": "Image uploaded successfully!",
            "data": img_base64,
            "fileType": "image",
            "grids": grids_matrix_serializable,
            "solves": grids_solved_serializable
        })
    except Exception as e:
        return jsonify({"error": "Invalid image file"}), 400


def process_pdf(file, file_path):
    # Convert PDF to images
    try:
        # file.save(file_path)
        # pdf_document = fitz.open(file_path)
        pdf_document = fitz.open(stream=file.read(), filetype="pdf")
        page_numbers = len(pdf_document)
        processed_images = []
        for page_number in range(page_numbers):
            page = pdf_document[page_number]
            pix = page.get_pixmap()
            img_array = np.frombuffer(pix.samples, dtype=np.uint8)
            img_array = img_array.reshape((pix.height, pix.width, pix.n))

            # 5. Convert RGBA to RGB if needed
            if pix.n == 4:  # RGBA
                img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
            try:
                grids_matrix, grids_solved, main_ret = solver.solve_1_img(img=img_array)
            except Exception as e:
                main_ret = img_array

            _, png_buffer = cv2.imencode('.png', main_ret)
            processed_images.append(png_buffer)

            # output_file = f"{app.config['TEMP_FOLDER']}/page_{page_number + 1}.png"
            # pix.save(output_file)
            # print(f'Saved {output_file}')
        pdf_document.close()
        output_pdf = fitz.open()  # Create a new empty PDF
        for png_buffer in processed_images:
            img = fitz.Pixmap(png_buffer.tobytes())
            page = output_pdf.new_page(width=img.width, height=img.height)
            page.insert_image(page.rect, pixmap=img)

        # 9. Save the new PDF to a BytesIO buffer
        pdf_buffer = BytesIO()
        output_pdf.save(pdf_buffer)
        output_pdf.close()
        pdf_buffer.seek(0)
        pdf_base64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')

        # Return Base64 string in JSON response
        return jsonify({
            "message": "PDF generated successfully!",
            "data": pdf_base64,
            "fileType": "pdf"
        })

        # return jsonify({
        #     "message": "PDF uploaded and converted successfully!",
        #     "pages": saved_images
        # })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

    #app.run(debug=True)
