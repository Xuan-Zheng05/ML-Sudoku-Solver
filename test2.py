import base64
import numpy as np
import cv2
from src.SolverVR import SolverVR


def passImage(data):
    solver = SolverVR()
    decodeData = base64.b64decode(data)
    np_data = np.fromstring(decodeData, np.uint8)
    img = cv2.imdecode(np_data, cv2.IMREAD_UNCHANGED)
    main_ret = solver.solve_1_img(img=img)
    retval, buffer = cv2.imencode('.jpg', main_ret)
    jpg_as_text = base64.b64encode(buffer)
    return jpg_as_text


if __name__ == '__main__':

    solver = SolverVR()
    # Test prediction

    _, _, main_ret = solver.solve_1_img(img=cv2.imread("./images_test/001.jpg"))

    cv2.imshow("Res", main_ret)
    cv2.waitKey(0)
