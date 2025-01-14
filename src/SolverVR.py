import cv2

from settings import model_default_path, param_resize_width, param_resize_height

from src.extract_n_solve.grid_detector import GridDetector
from src.extract_n_solve.extract_digits import DigitsExtractor
from src.extract_n_solve.grid_solver import GridSolver
from src.extract_n_solve.new_img_generator import ImageGenerator


def my_resize(image, width=None, height=None, inter=cv2.INTER_LINEAR):  # INTER_AREA
    # initialize the dimensions of the image to be resized and
    # grab the image size
    (h, w) = image.shape[:2]

    # if both the width and height are None, then return the
    # original image
    if width is None and height is None:
        return image

    # check to see if the width is None
    if width is None:
        # calculate the ratio of the height and construct the
        # dimensions
        r = height / float(h)
        dim = (int(w * r), height)

    # otherwise, the height is None
    else:
        if height is None:
            # calculate the ratio of the width and construct the
            # dimensions
            r = width / float(w)
            dim = (width, int(h * r))
        else:
            if w < h:
                r = width / float(w)
                dim = (width, int(h * r))
            else:
                r = height / float(h)
                dim = (int(w * r), height)
    # resize the image
    resized = cv2.resize(image, dim, interpolation=inter)

    # return the resized image
    return resized


def decorator_resize(func):
    def wrapper(*args, **kwargs):
        img = kwargs["img"]
        if img.shape[0] > 1000 or img.shape[0] < 800:
            old_shape = img.shape
            kwargs["img"] = my_resize(img, width=param_resize_width, height=param_resize_height)
        else:
            old_shape = None

        result = func(*args, **kwargs)
        # If the result is a tuple, resize only the last element (im_filled)
        if isinstance(result, tuple):
            *other_results, im_filled = result
            if old_shape is not None:
                im_filled = cv2.resize(im_filled, old_shape[:2][::-1])
            return *other_results, im_filled
        if old_shape is not None:
            result = cv2.resize(result, old_shape[:2][::-1])
        return result

    return wrapper


class SolverVR:
    def __init__(self, model_path=model_default_path):
        self.__grid_detector = GridDetector()
        self.__digits_extractor = DigitsExtractor(model_path=model_path)
        self.__grid_solver = GridSolver()
        self.__image_generator = ImageGenerator()

    @decorator_resize
    def solve_1_img(self, img, hint_mode=False):
        # Extracting grids

        unwraped_grid_list, points_grids, list_transform_matrix = self.__grid_detector.extract_grids(img)

        # Generate matrix representing digits in grids
        grids_matrix = self.__digits_extractor.process_imgs(unwraped_grid_list)
        if grids_matrix is None:
            return None, None, img

        # Solving grids
        grids_solved = self.__grid_solver.solve_grids(grids_matrix, hint_mode=hint_mode)
        # Creating image filled
        im_filled = self.__image_generator.create_image_filled(img,
                                                               unwraped_grid_list, grids_matrix, grids_solved,
                                                               points_grids, list_transform_matrix)

        #return im_filled
        return grids_matrix, grids_solved, im_filled
