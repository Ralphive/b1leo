/********************************************************************************
The settings of tensorflow traned model list to be used for object detection.
For the cfg and names file, Please place under the ./cfg folder.
For weights file, please palce it under ./yolo folder or provision it on public internet. 
If the solution is to be deployed on SAP Cloud Platform, Cloud Foundry, then the 
weights must be provisioned. As it is too large to be deployed on SCP CF.  

Important fields:
-dataset: The target dataset. Only two datasets(coco and shoe) are included. You may add your own.
-cfg: The cfg file described the design of the nerual network how the weights model has been 
trained in yolo.
-names: The name list file for the obejct classes.
-weightSource: The source of weights, which will inndicate the download strategy. 
If weightSource is google drive, then call gdown.pl to download
Otherwise, use shell command "wget" to donwload the weight.
-weightsUrl: The url to download the weigths, where your custom weights model is provisioned.
If the download type google drive, then it is a sharable url with format like this:
https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit

The source code is under MIT license. Please kindly check the LICENSE.
Here is to highlight that THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
ANY KIND, EXPRESS ORIMPLIED. Therefore no support available.

Created on: Jun 20 2018
Author: Yatsea Li

All rights reserved by SAP SE
*********************************************************************************/
module.exports = [
    {
        "dataset": "coco",
        "algorithm": "yolo-v2",
        "cfg": "./cfg/yolov2.cfg",
        "names": "./cfg/coco.names",
        "weights": "./yolov2.weights",
        "weightsSource": "darknet",
        "weightsUrl": "https://pjreddie.com/media/files/yolov2.weights"
    },
    {
        "dataset": "coco",
        "algorithm": "yolo-v3",
        "cfg": "./cfg/yolov3.cfg",
        "names": "./cfg/coco.names",
        "weights": "./yolov3.weights",
        "weightsSource": "darknet",
        "weightsUrl": "https://pjreddie.com/media/files/yolov3.weights"
    },
    {
        "dataset": "shoe",
        "algorithm": "yolo-v2",
        "cfg": "./cfg/yolov2_shoe.cfg",
        "names": "./cfg/custom.names",
        "weights": "./yolov2_shoe.weights",
        "weightsSource": "google drive",
        "weightsUrl": "https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit"
    },
    {
        "dataset": "shoe",
        "algorithm": "yolo-v3",
        "cfg": "./cfg/yolov3_shoe.cfg",
        "names": "./cfg/custom.names",
        "weights": "./yolov3_shoe.weights",
        "weightsSource": "google drive",
        "weightsUrl": "https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit"
    }
];