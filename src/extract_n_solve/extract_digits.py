import cv2
import numpy as np
import tensorflow as tf

from keras_preprocessing.image import ImageDataGenerator
from keras_preprocessing.image import img_to_array

from tensorflow.python.keras.models import load_model
from numpy import expand_dims
from settings import *
from src.solving_objects.Sudoku import Sudoku, verify_viable_grid


color = (0, 155, 255)

font = cv2.FONT_HERSHEY_SIMPLEX
font_scale = 0.7
thickness = 2


class DigitsExtractor:
    def __init__(self, model_path):
        model = tf.keras.layers.TFSMLayer(model_path, call_endpoint='serving_default')
        keras_model = tf.keras.Sequential([model])
        self.__tf_model = keras_model
        #self.__tf_model = load_model(model_path)

    def getModel(self):
        return self.__tf_model

    def process_imgs(self, list_im_grids):
        return [self.process_single_img1(im_grid) for im_grid in list_im_grids]

    def checkValue(self, gray):
        sample = img_to_array(gray)
        sample1 = expand_dims(sample, 0)
        datagen = ImageDataGenerator(
            featurewise_center=False,  # set input mean to 0 over the classifier
            samplewise_center=False,  # set each sample mean to 0
            featurewise_std_normalization=False,  # divide inputs by std of the classifier
            samplewise_std_normalization=False,  # divide each input by its std
            zca_whitening=False,  # apply ZCA whitening
            rotation_range=5,  # randomly rotate images_test in the range (degrees, 0 to 180)
            zoom_range=[0.9, 1.1],  # Randomly zoom image
            width_shift_range=0.1,  # randomly shift images_test horizontally (fraction of total width)
            height_shift_range=0.07,  # randomly shift images_test vertically (fraction of total height)
            horizontal_flip=False,  # randomly flip images_test
            vertical_flip=False)  # rand
        it = datagen.flow(sample1, batch_size=1)
        img_digits = []
        for i in range(100):
            batch = it.next()
            image = batch[0].astype('uint8')
            _, digit_thresh = cv2.threshold(image,
                                            0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            img_digits.append(
                cv2.resize(digit_thresh, (28, 28), interpolation=cv2.INTER_NEAREST).reshape(28, 28, 1))
        img_digits_np = np.array(img_digits) / 255.0
        # print(img_digits_np.shape)
        # print(self.__tf_model.summary())
        preds_proba = self.__tf_model.predict(img_digits_np)["dense_1"]
        for pred_proba in preds_proba:
            arg_max = np.argmax(pred_proba)
            if pred_proba[arg_max] > 0.98:
                return arg_max + 1
        return -1

    def process_single_img1(self, img):
        grid = None
        grid_number = 0
        for i in range(1, 4):
            temp_grid = self.process_single_img(img, i)
            if temp_grid is not None:
                temp_grid_number = np.count_nonzero(temp_grid)
                if temp_grid_number > grid_number:
                    grid = temp_grid
                    grid_number = temp_grid_number
        return grid

    def process_single_img(self, img1, num):
        img = img1.copy()
        h_im, w_im = img.shape[:2]
        im_prepro, gray_enhance = self.preprocessing_im_grid(img, num)
        true_position = []

        for y in range(9):
            for x in range(9):
                true_y, true_x = int((y + 0.5) * h_im / 9), int((x + 0.5) * w_im / 9)
                # cv2.circle(img, (true_x, true_y), radius=1, color=(0, 0, 255), thickness=-1)
                true_position.append([true_y, true_x])
        contours, _ = cv2.findContours(im_prepro, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        a = len(contours)
        img_digits = []
        img_cut = []
        loc_digits = []
        spacex = 0
        spacey = 0
        space_count_x = 0
        space_count_y = 0
        x_9 = [0] * 9
        y_9 = [0] * 9
        x_9_n = [0] * 9
        y_9_n = [0] * 9
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            for index in range(len(true_position)):
                c_y, c_x = true_position[index]
                if y < c_y < y + h and x < c_x < x + w and thresh_h_low < h < thresh_h_high and thresh_area_low < w * h < thresh_area_high:
                    M = cv2.moments(cnt)
                    if M['m00'] != 0:
                        cx = int(M['m10'] / M['m00'])
                        cy = int(M['m01'] / M['m00'])
                        y1 = int(index / 9)
                        x1 = int(index % 9)
                        y_9[y1] += cy
                        x_9[x1] += cx
                        x_9_n[x1] += 1
                        y_9_n[y1] += 1
                    break
        for index in range(9):
            if x_9_n[index] != 0:
                x_9[index] = x_9[index] / x_9_n[index]
            if y_9_n[index] != 0:
                y_9[index] = y_9[index] / y_9_n[index]
        for index in range(9):
            def find_offset(offsetArray):
                if index % 3 == 0:
                    a1 = offsetArray[index + 1]
                    a2 = offsetArray[index + 2]
                    if a1 == 0 or a2 == 0:
                        return 0
                    return a1 - (a2 - a1)

                if index % 3 == 1:
                    a1 = offsetArray[index - 1]
                    a2 = offsetArray[index + 1]
                    if a1 == 0 or a2 == 0:
                        return 0
                    return a1 + (a2 - a1) / 2

                if index % 3 == 2:
                    a1 = offsetArray[index - 2]
                    a2 = offsetArray[index - 1]
                    if a1 == 0 or a2 == 0:
                        return 0
                    return a2 + (a2 - a1)

                return 0

            if x_9[index] == 0:
                find_offset(x_9)
            if y_9[index] == 0:
                find_offset(y_9)
        x_a1 = 0
        x_a1_ind = 0
        x_space = 0

        for index in range(9):
            if x_9[index] != 0:
                if x_a1 == 0:
                    x_a1 = x_9[index]
                    x_a1_ind = index
                else:
                    x_space = (x_9[index] - x_a1) / (index - x_a1_ind)

        for index in range(9):
            if x_9[index] == 0:
                if x_space != 0:
                    x_9[index] = x_space * (index - x_a1_ind) + x_a1

        y_a1 = 0
        y_a1_ind = 0
        y_space = 0

        for index in range(9):
            if y_9[index] != 0:
                if y_a1 == 0:
                    y_a1 = y_9[index]
                    y_a1_ind = index
                else:
                    y_space = (y_9[index] - y_a1) / (index - y_a1_ind)

        for index in range(9):
            if y_9[index] == 0:
                if y_space != 0:
                    y_9[index] = y_space * (index - y_a1_ind) + y_a1

        for y in range(9):
            for x in range(9):
                y_old, x_old = true_position[y * 9 + x]
                if y_9[y] != 0:
                    y_old = y_9[y]
                if x_9[x] != 0:
                    x_old = x_9[x]
                true_position[y * 9 + x] = [y_old, x_old]
                cv2.circle(img, (int(x_old), int(y_old)), radius=1, color=(0, 0, 255), thickness=-1)

        # for cnt in contours:
        #     x, y, w, h = cv2.boundingRect(cnt)
        #     for index in range(len(true_position)):
        #         c_y, c_x = true_position[index]
        #         # for c_y, c_x in true_position:
        #         if y < c_y < y + h and x < c_x < x + w and thresh_h_low < h < thresh_h_high and thresh_area_low < w * h < thresh_area_high:
        #             M = cv2.moments(cnt)
        #             if M['m00'] != 0:
        #                 cx = int(M['m10'] / M['m00'])
        #                 cy = int(M['m01'] / M['m00'])
        #                 y1 = index / 9
        #                 x1 = index % 9
        #                 cv2.circle(img, (cx, cy), radius=1, color=(255, 0, 255), thickness=-1)
        #                 if y1 != 4:
        #                     spacey += (cy - c_y) / (8 / 9 - 2 / 9 * y1)
        #                     space_count_y += 1
        #                 if x1 != 4:
        #                     spacex += (cx - c_x) / (8 / 9 - 2 / 9 * x1)
        #                     space_count_x += 1
        #             break
        #
        # if space_count_x != 0:
        #     spacex = int(spacex / space_count_x)
        # if space_count_y != 0:
        #     spacey = int(spacey / space_count_y)
        # true_position = []
        # for y in range(9):
        #     for x in range(9):
        #         true_y, true_x = int(spacey + (y + 0.5) * (h_im - 2 * spacey) / 9), int(
        #             spacex + (x + 0.5) * (w_im - 2 * spacex) / 9)
        #         cv2.circle(img, (true_x, true_y), radius=1, color=(0, 255, 255), thickness=-1)
        #         true_position.append([true_y, true_x])
        # for cnt in contours:
        #     cv2.drawContours(img, [cnt], 0, (0, 255, 0), 3)
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            for c_y, c_x in true_position:
                if y < c_y < y + h and x < c_x < x + w and thresh_h_low < h < thresh_h_high and thresh_area_low < w * h < thresh_area_high:
                    y1, y2 = y - offset_y, y + h + offset_y
                    border_x = max(1, int((y2 - y1 - w) / 2))
                    x1, x2 = x - border_x, x + w + border_x
                    digit_cut = gray_enhance[max(y1, 0):min(y2, h_im), max(x1, 0):min(x2, w_im)]
                    img_cut.append(digit_cut)
                    _, digit_thresh = cv2.threshold(digit_cut,
                                                    0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                    # inverted_image = cv2.bitwise_not(digit_thresh)
                    # kernel = np.ones((3, 3), np.uint8)
                    # eroded_inverted = cv2.erode(inverted_image, kernel, iterations=1)
                    # digit_thresh = cv2.bitwise_not(eroded_inverted)
                    img_digits.append(
                        cv2.resize(digit_thresh, (28, 28), interpolation=cv2.INTER_NEAREST).reshape(28, 28, 1))
                    y_true, x_true = y + h / 2, x + w / 2
                    loc_digits.append([y_true, x_true])
                    cv2.drawContours(img, [cnt], 0, (0, 255, 0), 3)

                    break
                elif y < c_y < y + h and x < c_x < x + w and thresh_h_low < h < thresh_h_high:
                    print(h)
                    print(w * h)

            # y_true, x_true = y + h / 2, x + w / 2
            # if x_true < lim_bord or y_true < lim_bord or x_true > w_im - lim_bord or y_true > h_im - lim_bord:
            #     continue
            # if thresh_h_low < h < thresh_h_high and thresh_area_low < w * h < thresh_area_high:
            #     y1, y2 = y - offset_y, y + h + offset_y
            #     border_x = max(1, int((y2 - y1 - w) / 2))
            #     x1, x2 = x - border_x, x + w + border_x
            #     digit_cut = gray_enhance[max(y1, 0):min(y2, h_im), max(x1, 0):min(x2, w_im)]
            #     _, digit_thresh = cv2.threshold(digit_cut,
            #                                     0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            #     img_digits.append(
            #         cv2.resize(digit_thresh, (28, 28), interpolation=cv2.INTER_NEAREST).reshape(28, 28, 1))
            #     loc_digits.append([y_true, x_true])
        if not img_digits:
            return None
        img_digits_np = np.array(img_digits) / 255.0
        preds_proba = self.__tf_model.predict(img_digits_np)["dense_1"]

        preds = []
        nbr_digits_extracted = 0
        total_digits_extracted = -1
        adapted_thresh_conf_cnn = thresh_conf_cnn
        for pred_proba in preds_proba:
            total_digits_extracted += 1
            arg_max = np.argmax(pred_proba)
            if pred_proba[arg_max] > adapted_thresh_conf_cnn and arg_max < 9:
                preds.append(arg_max + 1)
                nbr_digits_extracted += 1
            elif 0.6 < pred_proba[arg_max] <= adapted_thresh_conf_cnn and arg_max < 9:
                temp = img_cut[total_digits_extracted]
                # preds.append(-1)
                preds.append(self.checkValue(temp))
            else:
                preds.append(-1)

        if nbr_digits_extracted < min_digits_extracted:
            return None
        grid = self.fill_numeric_grid(preds, loc_digits, h_im, w_im)

        if verify_viable_grid(grid):
            return grid
        else:
            return None

    @staticmethod
    def preprocessing_im_grid(img, num, is_gray=False):
        if is_gray:
            gray = img
        else:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        if gray.max() - gray.min() != 0:
            gray_enhance = (gray - gray.min()) * int(255 / (gray.max() - gray.min()))
        else:
            gray_enhance = gray
        blurred = cv2.GaussianBlur(gray_enhance, (11, 11), 0)
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
                                       cv2.THRESH_BINARY, block_size_grid, int(mean_sub_grid / num))

        return thresh, gray_enhance

    @staticmethod
    def fill_numeric_grid(preds, loc_digits, h_im, w_im):
        grid = np.zeros((9, 9), dtype=int)

        for pred, loc in zip(preds, loc_digits):
            if pred > 0:
                y, x = loc
                true_y = int(9 * y // h_im)
                true_x = int(9 * x // w_im)
                grid[true_y, true_x] = pred

        return grid


if __name__ == '__main__':
    im_path = "images_test/grid_cut_0.jpg"
    # im_path = "images_save/023_failed.jpg"
    # im_path = "images_test/izi.png"
    im = cv2.imread(im_path)
    cv2.imshow("im", im)
    extractor = DigitsExtractor(model_path='model/my_model.h5')
    res_grid = extractor.process_single_img(im)
    print(Sudoku(grid=res_grid))
    cv2.waitKey()
