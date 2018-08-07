'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
A generic RESTful API Wrapper for tensorflow object detction with Flask and 
object_detector in object_detector.py, which could be used for any tensorflow 
frozen inference graph and deployed on either Cloud Foundry or on-premise server.

Endpoints including:
/Initialize: Reinitialize the model when switch the model
/Test: A Test API
/Detect: Object detection with given image url and detection threshold
/ImagePreprocess: Detect the object and crop its bounding box for the highest
detection score.
/Images/<image_file_name>: Image provision for the image cropped by ImagePreprocess

Demokit:
http://localhost:58888/Camera: Real-time object detectoin from your local streaming camera
http://localhost:58888/Video:  Object detction from video streaming.

How to use:
1.Instation:
1).Download the sourcode from https://github.com/B1SA/smbmkt.git

2.Configure the target model to be used. Please check the description about
the model setting in object_detector.py
1).In Cloud Foundry environment: Change the MODEL_NAME field in manifest.yml
2).In local server environment:
bash: export MODEL_NAME <YOUR_TARGET_MODEL>
csh:  setenv MODEL_NAME <YOUR_TARGET_MODEL>
Or simply change the line 48 to specify 
model = os.getenv('MODEL_NAME') or 'ssdlite_mobilenet_v2_shoe'

3.Deployment
In Cloud Foundry environment:
under the directory detector/tensorflow, run the command with cf cli: 
cf push

On local on-premise deployment,
under the directory detector/tensorflow, run the command:
python setup.py

4.Run:
The app will automatically started on Cloud Foundry once deployed
To run the app locally, please run the command:
python server.py

The source code is under MIT license. Please kindly check the LICENSE.
Here is to highlight that THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED. Therefore no support available.

Created on: July 02 2018
Author: Yatsea Li

All rights reserved by SAP SE
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

import os
import json
import uuid
import six.moves.urllib as urllib
from object_detector import object_detector

from PIL import Image
from flask import Flask, request, Response, jsonify, send_file

app = Flask(__name__)
port = int(os.getenv('PORT', 58888))
model = os.getenv('MODEL_NAME') or 'ssdlite_mobilenet_v2_shoe'
detector = object_detector(model)
DETECT_THRESHOLD = os.getenv('DETECT_THRES') 
if DETECT_THRESHOLD is None:
    DETECT_THRESHOLD = 0.70
else:
    DETECT_THRESHOLD = float(DETECT_THRESHOLD)
    
# for CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST') # Put any other methods you need here
    return response

@app.route('/')
def index():
    return Response('Tensor Flow object detection')

'''
Generic Exception JSON wrapper
{
    "status_code": 500
    message: "No image url found in the request body."
}
'''
class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

#Registre the Exception handling for API
@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

'''
Re-initialise the tensorflow object detector endpoint
request: 
{
    "model": "ssdlite_mobilenet_v2_shoe"
}
'''
@app.route('/Initialize', methods=['POST'])
def initialize():
    req_body = request.get_json(force=True)
    model_name = req_body.get('model')
    if model_name is None:
        raise InvalidUsage('No ImageUrl found in the request body', status_code=500)

    print('Initialise() with {}'.format(model_name))

    global detector
    if detector is not None and detector.model != model_name:
        #release the detector
        print('destroy the current detector instance')
        del detector

        #recreate the detector instance with the new model.
        detector = object_detector(model_name)
    else:
        print('The given model is already loaded in the current session. No action taken.')
    
    return jsonify(action='sucess')

#Endpoint of Local camera streaming with object dedection.
@app.route('/Camera')
def local():
    return Response(open('./static/camera.html').read(), mimetype="text/html")

#Endpoint of video streaming with object dedection.
@app.route('/Video')
def remote():
    return Response(open('./static/video.html').read(), mimetype="text/html")

#Test endpoint
@app.route('/Test')
def test():
    PATH_TO_TEST_IMAGES_DIR = 'images'  # cwh
    TEST_IMAGE_PATHS = [os.path.join(PATH_TO_TEST_IMAGES_DIR, 'image{}.jpg'.format(i)) for i in range(1, 3)]

    global detector
    objects = detector.detect_wt_local_image(TEST_IMAGE_PATHS[0])
    return Response(objects, mimetype='application/json')

'''
Detect endpoint
request sample
{
	"ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE36LOJ6NzReh-W_o5QKkgTUH7qbFygG_J1A0PWoPBnaH9UW50",
	"Threshold": 0.70
}

response sample
[
    {
        "name": "shoe",
        "prob": 0.915211021900177,
        "box": {
            "x": 16.332637786865234,
            "y": 96.1408519744873,
            "w": 69.38565063476562,
            "h": 51.65224075317383
        }
    }
]
'''
@app.route('/Detect', methods=['POST'])
def detect():
    req_body = request.get_json(force=True)

    imageUrl = req_body.get('ImageUrl')
    if imageUrl is None:
        raise InvalidUsage('No ImageUrl found in the request body', status_code=500)

    threshold = req_body.get('Threshold')
    if threshold is None:
        threshold = 0.5
    else:
        threshold = float(threshold)

    global detector
    objects = detector.detect_wt_image_url(imageUrl, threshold)
    #image = None
    return Response(objects, mimetype='application/json')

'''
Detect endpoint
request sample
{
	"ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE36LOJ6NzReh-W_o5QKkgTUH7qbFygG_J1A0PWoPBnaH9UW50",
	"Threshold": 0.70
    "Id": "14343"
}

response sample
{
    "CroppedImageUrl": "https://shoe-detector-yolo.cfapps.eu10.hana.ondemand.com/image/2018_07_02_28_239.jpg",
    "Confidence": 0.8590173721313477,
    "Object": "shoe",
    "ReturnCode": 0,
    "Id": "12345",
    "OrginalURL": "https://scontent.fmel5-1.fna.fbcdn.net/v/t1.15752-9/36243216_10155857694464164_4134351217235066880_n.jpg?_nc_cat=0&oh=f19f8c642b056d43a927d0dd3037c7ea&oe=5BA7DF78"
}
'''
@app.route('/ImagePreprocess', methods=['POST'])
def image_preprocess():
    req_body = request.get_json(force=True)

    imageUrl = req_body.get('ImageUrl')
    if imageUrl is None:
        raise InvalidUsage('No ImageUrl found in the request body', status_code=500)

    threshold = req_body.get('Threshold')
    if threshold is None:
        threshold = DETECT_THRESHOLD
    else:
        threshold = float(threshold)

    target_obj = req_body.get('Object') or 'shoe'

    Id = req_body.get('Id')
    if Id is None:
        Id = ''

    global detector
    image_file_name = '{}.jpg'.format(str(uuid.uuid4()))
    image_path = os.path.join(detector.images_dir, image_file_name)
    print(image_path)
    opener = urllib.request.URLopener()
    opener.retrieve(imageUrl, image_path)
        
    image = Image.open(image_path)
    objects = json.loads(detector.detect(image, threshold))
    #No object detected
    if(0 == len(objects)):
        return jsonify(CroppedImageUrl='',
        ReturnCode=-99,
        Message='No object detected',
        Id=Id,
        OrginalURL=imageUrl
        )

    box = objects[0].get('box')
    x = box.get('x')
    y = box.get('y')
    w = box.get('w')
    h = box.get('h')

    image.crop((x,y, x+w, y+h)).save(image_path,'JPEG')
    base_url = request.base_url.split('/ImagePreprocess')[0]
    cropped_image_url = '{}/Images/{}'.format(base_url, image_file_name)
    return jsonify(CroppedImageUrl=cropped_image_url,
                    ReturnCode=0,
                    Confidence=objects[0].get('prob'),
                    Object=objects[0].get('name'),
                    Id=Id,
                    OrginalURL=imageUrl
                    )
    #return Response(objects, mimetype='application/json')

@app.route('/Images/<image_file_name>', methods=['GET'])
def get_image(image_file_name):
    #return Response(open(os.path.join('images', image_file_name)).read(), mimetype="image/jpg")
    return send_file(os.path.join('images', image_file_name), mimetype='image/jpg')

@app.route('/image', methods=['POST'])
def image():
    try:
        image_file = request.files['image']  # get the image

        # Set an image confidence threshold value to limit returned data
        threshold = request.form.get('threshold')
        if threshold is None:
            threshold = 0.5
        else:
            threshold = float(threshold)

        # finally run the image through tensor flow object detection`
        #image = Image.open(image_file)
        #objects = object_detection_api.get_objects(image, threshold)
        #objects = detector.detect(image, threshold)
        global detector
        objects = detector.detect_wt_local_image(image_file, threshold)
        #image = None
        return Response(objects, mimetype='application/json')
    except Exception as e:
        #print('POST /image error: %e' % e)
        print('POST /image error:{}'.format(e))
        return jsonify(error=e)

if __name__ == '__main__':
	# without SSL
    app.run(debug=False, host='0.0.0.0', port=port)

	# with SSL
    #app.run(debug=True, host='0.0.0.0', ssl_context=('ssl/server.crt', 'ssl/server.key'))
