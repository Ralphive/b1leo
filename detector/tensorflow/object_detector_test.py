import os
import json
from PIL import Image
from object_detector import object_detector

detector = object_detector('ssdlite_mobilenet_v2_shoe')
PATH_TO_TEST_IMAGES_DIR = 'images' #cwh
TEST_IMAGE_PATHS = [ os.path.join(PATH_TO_TEST_IMAGES_DIR, 'shoe{}.jpg'.format(i)) for i in range(1, 3) ]

for image_path in TEST_IMAGE_PATHS:
    image = Image.open(image_path)
    response = detector.detect_wt_local_image(image_path)
    print("returned JSON: \n%s" % response)
    response = json.loads(response)
    box = response[0].get('box')

    x = box.get('x')
    y = box.get('y')
    w = box.get('w')
    h = box.get('h')
    print(image_path.split('.')[0])
    image.crop((x,y, x+w, y+h)).save(image_path.split('.')[0]+'_cropped.jpg','JPEG')
    
    
