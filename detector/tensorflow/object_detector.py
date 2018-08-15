'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
A generic object-oriented object detector class for tensorflow objection detection
in python, which could be used for any frozen inference graph of tensorflow
for object detection.

How to use:
1.Add your custom tensorflow model into setting.json. For example:
    {
        "dataset": "coco",
        "algorithm": "ssdlite_mobilenet_v2",
        "model": "ssdlite_mobilenet_v2_coco_2018_05_09",
        "cfg": "",
        "names": "mscoco_label_map.pbtxt",
        "weights": "frozen_inference_graph.pb",
        "classNumber": 90,
        "downloadType": "direct",
        "fileType": "tar",
        "weightsUrl": "http://download.tensorflow.org/models/object_detection/ssdlite_mobilenet_v2_coco_2018_05_09.tar.gz"
    }
Important fields:
-model: must match the downloaded tar.gz file. For example, 
the downloaded model file as ssdlite_mobilenet_v2_coco_2018_05_09.tar.gz, 
then its model must be ssdlite_mobilenet_v2_coco_2018_05_09, which is used to
identify its coresponding setting
-weightsUrl: The url to download the frozen inference graph. 
If the download type google drive, then it is the id of sharable google.

The default models including:
1).ssd_mobilenet_v2_coco_2018_03_29: official pretrained ms coco with ssd mobilenet v2 
from tensorflow
2).ssdlite_mobilenet_v2_coco_2018_05_09: official pretrained ms coco with ssd lite mobilenet v2 
from tensorflow 
3).ssdlite_mobilenet_v2_shoe: My custom trained tensorflow model for shoe detection
with ssd lite mobilenet v2

You can add your custom trained tensorflow model, or add more pretrained from tensorflow:
https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/detection_model_zoo.md

2.Initiate an instance of object_detector
example: detector = object_detect('<YOUR_TARGET_MODEL>')

3.Object Detction API
1).detect_wt_image_url(imageUrl, threshold=0.50):
detect the objects on the image from url
2).detect_wt_local_image(image_path, threshold=0.50):
detect the objects from a local image file

The source code is under MIT license. Please kindly check the LICENSE.
Here is to highlight that THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED. Therefore no support available.

Created on: July 02 2018
Author: Yatsea Li

All rights reserved by SAP SE
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
# IMPORTS
import os
import os.path
import numpy as np
import six.moves.urllib as urllib
import tarfile
import tensorflow as tf
import json
import uuid
import googledrive_donwload_helper
from PIL import Image

<<<<<<< HEAD
if tf.__version__ < '1.4.0':
    raise ImportError('Please upgrade your tensorflow installation to v1.4.0 or higher!')
=======
# if tf.__version__ < '1.4.0':
#     raise ImportError('Please upgrade your tensorflow installation to v1.4.0 or higher!')
>>>>>>> a51d156d2cee2ac9309f97db28b9cc9dcf9cf709

# ENV SETUP  ### CWH: remove matplot display and manually add paths to references

# Object detection imports
from object_detection.utils import label_map_util  # CWH: Add object_detection path

class object_detector:
    def __init__(self, model):
        #the model is defined setting.json
        #it could be any tensorflow model(frozen_inference_graph.pb)
        #1.ssd_mobilenet_v2_coco_2018_03_29: pretrained ms coco model from official tensforflow
        #2.ssdlite_mobilenet_v2_coco_2018_05_09: pretrained ms coco model from official tensforflow 
        #3.ssdlite_mobilenet_v2_shoe: our custom trained model of shoe detection for SMB Market Place 
        self.model = model or 'ssdlite_mobilenet_v2_shoe'

        #Loading the setting with the given model.
        self.setting = self.get_setting_by_model(model)
        # Path to frozen detection graph. This is the actual model that is used for the object detection.
        # example: 'models/ssd_mobilenet_v1_coco_2017_11_17/frozen_inference_graph.pb'
        self.path_to_ckpt = os.path.join('models', self.model, 'frozen_inference_graph.pb')

        # List of the strings that is used to add correct label for each box.
        # example: data/mscoco_label_map.pbtxt
        self.path_to_labels = os.path.join('data', self.setting['names'])
        # number of classes has been trained in the model
        self.num_classes = self.setting['classNumber']

        #working directory for downloading and provision the iamges
        #The input of the detction could be image url.
        #so the input image from internet will be downloaded and persisted in ./images directory
        #so is the cropped image with shoe.
        self.images_dir = 'images'

        #download and extract the target model
        self.download_model()

        #load the frozen inference graph for obect detection
        self.load_model()

    def __del__(self):
        print('releasing object_detector instance')
        self.category_index = None
        self.detection_boxes = None
        self.detection_classes = None
        self.detection_scores = None
        self.image_tensor = None
        #reset the default graph to empty
        tf.reset_default_graph()
        #close tensorflow session
        self.sess.close()

    #Get the setting from setting.json with given model
    def get_setting_by_model(self, model):
        with open('settings.json', 'r') as f:
            settings = json.load(f)
        for i in range(len(settings)):
            if settings[i].get('model') == model:
                return settings[i]
        return settings[1]

    '''
    Check if the targe frozen_inference_graph.pb is already in place.
    if not, then download and extract either from tensorflow official url
    or my google drive for the custom shoe model.
    2 download strategey by downloadType in setting
    1).direct: direct http download with urllib.
    2).google drive: use googledrive_download_helper to download

    only one extract strategy in place
    1).tar: tar_file.extract
    '''
    def download_model(self):
        if os.path.isfile(self.path_to_ckpt) == True:
            print('model {} already exists'.format(self.model))
            return

        # Download and extract Model if not exist
        print('model {} already not found. Start to download.'.format(self.model))
        model_file = self.model + '.tar.gz'

        #download strategy
        if self.setting['downloadType'] == 'direct':
            print('Downloading {} with urllib from {}'.format(model_file, self.setting['weightsUrl']))
            opener = urllib.request.URLopener()
            opener.retrieve(self.setting['weightsUrl'], model_file)
        elif self.setting['downloadType'] == 'google drive':
            print('Downloading {} from google drive {}'.format(model_file, self.setting['weightsUrl']))
            googledrive_donwload_helper.download_file_from_google_drive(self.setting['weightsUrl'], model_file)
        
        #extract the frozen_inference_graph.pb from tar file to models/<model>/
        if self.setting['fileType'] == 'tar':
            tar_file = tarfile.open(model_file)
            for file in tar_file.getmembers():
                file_name = os.path.basename(file.name)
                if 'frozen_inference_graph.pb' in file_name:
                    directory = 'models'
                    if self.setting['downloadType'] == 'google drive':
                        directory = os.path.join('models', self.model)                        
                    if not os.path.exists(directory):
                        os.makedirs(directory)
                    print('Extracting model {} to {}'.format(model_file, directory))
                    tar_file.extract(file, directory)

        if os.path.exists(model_file):
            os.remove(model_file)

    '''
    Loading the frozen inference graph into memory for object detection.
    '''
    def load_model(self):
        # Load a (frozen) Tensorflow model into memory.
        self.detection_graph = tf.Graph()
        with self.detection_graph.as_default():
            od_graph_def = tf.GraphDef()
            with tf.gfile.GFile(self.path_to_ckpt, 'rb') as fid:
                serialized_graph = fid.read()
                od_graph_def.ParseFromString(serialized_graph)
                tf.import_graph_def(od_graph_def, name='')

        # Loading label map
        label_map = label_map_util.load_labelmap(self.path_to_labels)
        categories = label_map_util.convert_label_map_to_categories(
            label_map, max_num_classes=self.num_classes, use_display_name=True)
        self.category_index = label_map_util.create_category_index(categories)
    
        self.sess = tf.Session(graph=self.detection_graph)
        self.image_tensor = self.detection_graph.get_tensor_by_name('image_tensor:0')
        # Each box represents a part of the image where a particular object was detected.
        self.detection_boxes = self.detection_graph.get_tensor_by_name('detection_boxes:0')
        # Each score represent how level of confidence for each of the objects.
        # Score is shown on the result image, together with the class label.
        self.detection_scores = self.detection_graph.get_tensor_by_name('detection_scores:0')
        self.detection_classes = self.detection_graph.get_tensor_by_name(
            'detection_classes:0')
        self.num_detections = self.detection_graph.get_tensor_by_name('num_detections:0')

    #helper funciton to load image into numpy array
    def load_image_into_numpy_array(self, image):
        (im_width, im_height) = image.size
        return np.array(image.getdata()).reshape(
            (im_height, im_width, 3)).astype(np.uint8)

    '''
    The real object detection with given image and confidence threshold 
    param image: the image object to be detected
    param threshold: the confidence threshold, all the detection with 
    confidence lower than the threshold will be discarded.

    return: json string of the detected object array.
    box: x,y - top left, w-width, h-height
    name: detected class name
    prob: confidence score of the detection
    example:
    [
        {
            "box": {
                "y": 97.06493854522705,
                "x": 87.51638531684875,
                "w": 122.85414934158325,
                "h": 62.75526809692383
            },
            "name": "shoe",
            "prob": 0.9999971389770508
        }
    ]
    
    If no object detected, it returns an empty array - []
    '''
    def detect(self, image, threshold=0.5):
        image_np = self.load_image_into_numpy_array(image)
        # Expand dimensions since the model expects images to have shape: [1, None, None, 3]
        image_np_expanded = np.expand_dims(image_np, axis=0)
        # Actual detection.
        (boxes, scores, classes, num) = self.sess.run(
            [self.detection_boxes, self.detection_scores, self.detection_classes, self.num_detections],
            feed_dict={self.image_tensor: image_np_expanded})

        classes = np.squeeze(classes).astype(np.int32)
        scores = np.squeeze(scores)
        boxes = np.squeeze(boxes)

        obj_above_thresh = sum(n >= threshold for n in scores)
        print("detected %s objects in image above a %s score" %
            (obj_above_thresh, threshold))

        output = []

        image_width, image_height = image.size

        for c in range(0, len(classes)):
            class_name = self.category_index[classes[c]]['name']
            # only return confidences equal or greater than the threshold
            if scores[c] >= threshold:
                print(" object %s - score: %s, coordinates: %s" %
                    (class_name, scores[c], boxes[c]))

                item = Object()
                #item.name = 'Object'
                item.name = class_name
                # item.class_name = class_name
                # item.score = float(scores[c])
                item.prob = float(scores[c])
                item.box = json.loads(json.dumps({
                "y": float(boxes[c][0]) * image_height,
                "x": float(boxes[c][1]) * image_width, 
                "h": (float(boxes[c][2]) - float(boxes[c][0])) * image_height,
                "w": (float(boxes[c][3]) - float(boxes[c][1])) * image_width
                }))

                output.append(item)

        outputJson = json.dumps([ob.__dict__ for ob in output])
        return outputJson

    '''
    High level api to detect object with the image url
    1).Download the image from url
    2).Load the image
    3).Invoke detect() to object detection
    '''
    def detect_wt_image_url(self, imageUrl, threshold=0.50):
        imagePath = os.path.join(self.images_dir, '{}.jpg'.format(str(uuid.uuid4())))
        print(imagePath)
        opener = urllib.request.URLopener()
        opener.retrieve(imageUrl, imagePath)
        
        image = Image.open(imagePath)
        return self.detect(image)

    '''
    High level api to detect object with the local image file
    1).Load the image with the local image file path
    2).Invoke detect() to object detection
    '''
    def detect_wt_local_image(self, image_path, threshold=0.50):
        image = Image.open(image_path)
        return self.detect(image)

'''
Helper object class for the result of detection converting from dict into json.
'''
class Object(object):
    def __init__(self):
        self.name = "TensorFlow Object Detection REST API"

    def toJSON(self):
        return json.dumps(self.__dict__)