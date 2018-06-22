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