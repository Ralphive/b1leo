# Turning YOLO Real-time Object Detection into Web Services on SAP Cloud Platform, Cloud Foundry

A NodeJS Wrapper turning [YOLO-Real Time Object Detection](https://github.com/pjreddie/darknet/wiki/YOLO:-Real-Time-Object-Detection) into a web service for object detection on SAP Cloud Platform, Cloud Foundry or on-premise with NodeJS run-time, which is used for shoe detection in the SMB Market Place Solution.

## Demokit:
The web-based demokit is available, once the solution is deployed:
+ For local deployment:   http://127.0.0.1:58999/web/Detector
+ For SCP CF deployment:  https://<YOUR_SCP_CF_HOST>/web/Detector
![Web Demo Kit](https://i.imgur.com/JhBGtiD.png)

## API endpoints:
### POST /Initialize 
Reinitialize and load the given model on the fly. Only Used by the demokit to switch the model.
#### Request Sample:
```json
{
    "dataset": "coco",
    "algorithm": "yolo-v3"
}
```
#### Response sample:
```json
{
    "message": "Loading ${setting.weights} and Initialising Darknet in asychronoous mode."
}
```
### GET /Test 
A Test API with GET method.

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
```
If no obect detected, it will return an empty array as 
```json
[]
```

### POST /ImagePreprocess 
Detect the objects and crop the bounding box for the detected object with highest detection score.

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
## How to use:
### 1.Download:
Download the soure code from https://github.com/B1SA/smbmkt.git
```sh
git clone https://github.com/B1SA/smbmkt.git
cd detector/yolo
```
There are 3 importants files:
+ setting.js: The settings of tensorflow traned model list to be used for object detection.
+ DarknetProxy.py: A generic object-oriented proxy class for Darknet, which implement the Detect for the object detection and ImagePreproess function for cropping the bounding box of the detected with highest detection score into a new image.
+ app.js: A NodeJS RESTful API wrapper of turning the yolo object detection into a web service with Express.

### 2.Configuration:
1. [optional]Add your custom trained yolo model into setting.json. For example:
```json
    {
        "dataset": "coco",
        "algorithm": "yolo-v3",
        "cfg": "./cfg/yolov3.cfg",
        "names": "./cfg/coco.names",
        "weights": "./yolov3.weights",
        "weightsSource": "darknet",
        "weightsUrl": "https://pjreddie.com/media/files/yolov3.weights"
    }
```
+ For the cfg and names file, Please place under the ./cfg folder.
+ For weights file, please palce it under ./yolo folder or provision it on public internet. 
+ If the solution is to be deployed on SAP Cloud Platform, Cloud Foundry, then the weights must be provisioned on public internet for downloading on the fly when the service is started. As it is too large to be deployed on SCP CF.  

#### Important fields:
+ dataset: The target dataset. Only two datasets(coco and shoe) are included. You may add your own.
+ cfg: The cfg file described the design of the nerual network how the weights model has been trained in yolo.
+ names: The name list file for the obejct classes.
+ weightSource: The source of weights, which will inndicate the download strategy. 
If weightSource is google drive, then call gdown.pl to download
Otherwise, use shell command "wget" to donwload the weight.
+ weightsUrl: The url to download the weigths, where your custom weights model is provisioned.
If the download type google drive, then it is a sharable url with format like this:
https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit

#### The default included models:
+ ms coco dataset with yolo v2: The official pretrained ms coco with yolo v2 
from https://pjreddie.com/darknet/. Will be downloaded as yolov2.weights
+ ms coco dataset with yolo v3: The official pretrained ms coco with yolo v2 
from https://pjreddie.com/darknet/. Will be downloaded as yolov3.weights
+ my custom shoe dataset with yolo v2: My custom trained model with yolo v2 for shoe detection. Will be downloaded as yolov2_shoe.weights
+ my custom shoe dataset with yolo v3: My custom trained model with yolo v3 for shoe detection. Will be downloaded as yolov3_shoe.weights

You can add your custom trained yolo model, or add more pretrained model from:
https://pjreddie.com/darknet/

2. [Optional] Configure the target model to be used. The default model is my customed trained model yolov2_shoe.weights for shoe detection.

1). In Cloud Foundry environment: 

Change the environment variable below in manifest.yml
```yml
    "WEIGHTS_URL": "https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit"
    "WEIGHTS": "./yolov2_shoe.weights"
    "CFG": "./cfg/yolov2_shoe.cfg"
    "NAMES": "./cfg/custom.names"
    "DETECT_THRES": 0.70
    "TEMP_DIR": "./temp/"
    "IMAGE_BASE_URL": "https://shoe-detector-yolo.cfapps.eu10.hana.ondemand.com/image/"
```
2). In local server environment:
```sh
bash: export WEIGHTS <YOUR_TARGET_MODEL>
csh:  setenv WEIGHTS <YOUR_TARGET_MODEL>
```
Repeat for the other variables about WEIGHTS_URL, CFG and NAMES.

Or simply change the line 10~13 in app.js to specify the target weights, cfg and names.
```js
let WEIGHTS = process.env.WEIGHTS || './yolov2_shoe.weights';
let WEIGHTS_URL = process.env.WEIGHTS_URL || 'https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit';
let CFG = process.env.CFG || './cfg/yolov2_shoe.cfg';
let NAMES = process.env.NAMES || './cfg/custom.names';
```

### 3.Deployment
#### 1).Deploy to Cloud Foundry environment
Under the directory detector/tensorflow, 

i.Replace xxx with your company name space on the app name xxx-shoe-detector-yolo in manifest.yml

ii.Run the command with cf cli: 
```sh
$ cf push
```

#### 2).Deploy on on-premise server
Under the directory detector/yolo, run the command:
```sh
$ npm install
```

On MacOS environment, please do the extra manual step below:

Rename the file "libdarknet.so" under yolo/node_modules/darknet/ as "libdarknet.dylib" with shell command.
```sh
$ cd yolo
$ mv node_modules/darknet/libdarknet.so node_modules/darknet/libdarknet.dylib 
```

### 4.Run:
#### 1). In Cloud Foundry environment:
The service will be started automatically on Cloud Foundry once deployed

#### 2). On local on-premise deployment
To run the app locally, please run the command:
```sh
$ npm start
```

## Credits:
This yolo wrapper for SAP Cloud Platform, Cloud Foundry is based on the [Darknet-An Open Source Neural Networks in C](https://pjreddie.com/darknet/) by Joseph Redmon, and [Darkent.js-A NodeJS wrapper for Darknet](https://github.com/bennetthardwick/darknet.js) by bennetthardwick, Credits go to Joseph Redmon and bennetthardwick. 

### What I have done:
1. Implement a generic object-oriented DarknetProxy class in NodeJS, which could be instantiated and re-initialised based on configuration, and the output of object bounding box has been formated as (x, y, w, h) in pixel. 
2. Turn the object detection of yolo into RESTful services with Express.js. The endpoints list below:
```sh
/Initialize: Instantiate and Initialize the object detector with target model.
/Detect: Object detectoin endpoint.
/ImagePreprocess: Detecting the object and cropping with its bounding box.
```
3. Adding a custom yolo v2/v3 trained model of shoe detection for SMB Market Place solution.
4. Make the yolo detector compatible with SAP Cloud Platform, Cloud Foundry.
5. Create a visual web demokit for the object detection with endpoint: /web/Detector
