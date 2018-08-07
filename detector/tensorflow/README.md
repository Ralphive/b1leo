# Turning Tensorflow Object Detection API into Web Services on SAP Cloud Platform, Cloud Foundry
## Overview
A generic RESTful API Wrapper of turning [TensorFlow Object API](https://github.com/tensorflow/models/tree/master/research/object_detection) into a web service for object detection with Flask, which can be deployed on SAP Cloud Platform, Cloud Foundry or on-premise environment. In addition, a generic object oriented object_detector is implemeted for general tensorflow frozen inference graph for object detection.

## API endpoints:
### POST /Initialize 
Reinitialize and load the given tensorflow frozen interence graph on the fly for object detection.

#### Request Sample:
```json
{
	"model": "ssdlite_mobilenet_v2_shoe"
}
```
#### Response sample:
```json
{
    "action": "sucess"
}
```

### GET /Test 
A Test API via GET method
#### Response sample:
```json
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
```

### POST /Detect 
Object detection with given image url and detection threshold

#### Request sample:
```json
{
	"ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE36LOJ6NzReh-W_o5QKkgTUH7qbFygG_J1A0PWoPBnaH9UW50",
	"Threshold": 0.80
}
```
#### Response sample:
```json
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
Note: x-top left x, y-top left y, w-width, h-height 
```
If no obect detected, it will return an empty array as 
```json
[]
```

### POST /ImagePreprocess 
Detect the objects and crop the bounding box for the detected object with highest detection score

#### Request Sample:
```json
{
	"ImageUrl": "https://scontent.fmel5-1.fna.fbcdn.net/v/t1.15752-9/36243216_10155857694464164_4134351217235066880_n.jpg?_nc_cat=0&oh=f19f8c642b056d43a927d0dd3037c7ea&oe=5BA7DF78",
	"Threshold": 0.80
}
```
#### Response Sample:
+ Object detected
```json
{
    "Confidence": 0.9108547568321228,
    "CroppedImageUrl": "http://shoe-detector-tf.cfapps.eu10.hana.ondemand.com/Images/23c6f8f4-913a-48ed-994f-e02d33a30881.jpg",
    "Object": "shoe",
    "ReturnCode": 0
}
```
+ No object detected
```json
{
    "CroppedImageUrl": "",
    "ReturnCode": -99,
    "Message": "No object detected"
}
```

### GET /Images/<image_file_name> 
Image provision for the image cropped by ImagePreprocess endpoint

## Demokit:
http://localhost:58888/Camera: Real-time object detectoin from your local streaming camera

http://localhost:58888/Video:  Object detction from video streaming.

## How to use:
### 1.Download:
Download the soure code from https://github.com/B1SA/smbmkt.git
```sh
$ git clone https://github.com/B1SA/smbmkt.git
$ cd detector/tensorflow
```

There are 3 importants files:

+ setting.json: The settings of tensorflow traned model list to be used for object detection.

+ object_detector.py: A generic object-oriented of object detector for any tensorflow model(frozen inference graph) 

+ server.py: A generic RESTful API wrapper of turning the tensorflow object detection into a web service with Flask.

### 2.Configuration:
1. [optional]Add your custom trained tensorflow model into setting.json. For example:
```json
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
```
#### Important fields:
- model: must match the downloaded tar.gz file. For example, 
the downloaded model file as ssdlite_mobilenet_v2_coco_2018_05_09.tar.gz, 
then its model must be ssdlite_mobilenet_v2_coco_2018_05_09, which is used to
identify its coresponding setting
- weightsUrl: The url to download the frozen inference graph. 
If the download type google drive, then it is the id of sharable google.
- fileType: only support "tar" as .tar or .tar.gz which will decide the extraction strategy

#### The default models including:
1).ssd_mobilenet_v2_coco_2018_03_29: official pretrained ms coco with ssd mobilenet v2 
from tensorflow
2).ssdlite_mobilenet_v2_coco_2018_05_09: official pretrained ms coco with ssd lite mobilenet v2 
from tensorflow 
3).ssdlite_mobilenet_v2_shoe: My custom trained tensorflow model for shoe detection
with ssd lite mobilenet v2

You can add your custom trained tensorflow model, or add more pretrained model from tensorflow:
https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/detection_model_zoo.md

2. [Optional] Configure the target model to be used. The default model is my customed trained model ssdlite_mobilenet_v2_shoe for shoe detection

1). In Cloud Foundry environment: Change the MODEL_NAME field in manifest.yml
```yml
"MODEL_NAME": "ssdlite_mobilenet_v2_shoe"
```
2). In local server environment:
```sh
bash: export MODEL_NAME <YOUR_TARGET_MODEL>
csh:  setenv MODEL_NAME <YOUR_TARGET_MODEL>
```
Or simply change the line 48 to specify 
```js
model = os.getenv('MODEL_NAME') or 'ssdlite_mobilenet_v2_shoe'
```

### 3.Deployment
#### 1). In Cloud Foundry environment:
under the directory detector/tensorflow, run the command with cf cli: 
```sh
$ cf push
```
#### 2). On local on-premise deployment
under the directory detector/tensorflow, run the command:
```sh
$ python setup.py install
```

or manual install the required packages in python: 
- tensorflow
- Pillow
- Flask
- six
- matplotlib
- requests

### 4.Run:
#### 1). In Cloud Foundry environment:
The app will automatically started on Cloud Foundry once deployed

#### 2). On local on-premise deployment
To run the app locally, please run the command:
```sh
$ python server.py
```

## Credits:
This is a fork from https://github.com/webrtcHacks/tfObjWebrtc by webrtcHacks,  Credits go to webrtcHacks for showing an example of how to turn the TensorFlow Object API into a web service. A Python Flask web server is used to interact with a JavaScript a client library. The example shows how you can extract frames from WebRTC's getUserMedia, upload them to the API, and then use the canvas to display them. This allows use of the TensorFlow Object API on any HTML <video> element.

### What I have done:
1. Implement a generic object-oriented object_dector class for tensorflow with reference to the original object_detection_api, which now could be instantiated and re-initialised based on configuration, and the output of object bounding box has been formated as (x, y, w, h) in pixel instead of ratio. 
2. Wrap the object_detector to the RESTful endpoints with Flask
```sh
/Initialize: Instantiate and Initialize the object detector with target model.
/Detect: Object detectoin endpoint.
/ImagePreprocess: Detecting the object and cropping with its bounding box.
```
3. Adding my custom tensorflow trained model for shoe detection in SMB Market Place. 
4. Make it compatible with Cloud Foundry.
5. Vendoring the minimal tensorflow object_detection source code required for object detection. Instead of installing and copying the whole /object_detection from tensorflow.