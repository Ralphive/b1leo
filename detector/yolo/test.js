const shelljs = require('shelljs');
const fs = require('fs');
const path = require('path');
const request = require('request');
const Jimp = require('jimp');
//const DarknetProxy = require('./DarknetProxy');
const DarknetProxy = require('./DarknetProxy');

const threshold = process.env.DETECT_THRES || 0.80;
const tempDir = process.env.TEMP_DIR || './temp/';
const PORT = process.env.PORT || 58999;
let WEIGHTS = process.env.WEIGHTS || './yolov2_shoe.weights';
let WEIGHTS_URL = process.env.WEIGHTS_URL || 'https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit';
let CFG = process.env.CFG || './cfg/yolov2_shoe.cfg';
let NAMES = process.env.NAMES || './cfg/custom.names';

test();

function test() {

    //Test 1: DownlaodImage
    // DownloadImage('https://scontent.fmel5-1.fna.fbcdn.net/v/t1.15752-9/33805527_10155792489934164_6574058586014482432_n.jpg?_nc_cat=0&oh=5f6063ca98bf9d50b28d7b8bcca3d3e0&oe=5B8D6823',
    // GenerateFileName(), function(){
    //     console.log('image downloaded');
    //     checkFileExists('./test.jpg');
    // });    

    //Test#2: Detetc the shoes, the crop with its bouding box
    //testJimp('http://www.bloch.com.au/1530-thickbox_default/s0323-bloch-show-tapper-womens-tap-shoe.jpg');

    //Test#3: DarknetProxy
    testDarknet();
}

function testDarknet() {
    let proxy = new DarknetProxy(WEIGHTS, WEIGHTS_URL, CFG, NAMES);
    let setting = proxy.getSetting('shoe', 'yolo-v3');
    console.log(setting);
    //proxy.Test();

    // proxy.Detect('http://www.bloch.com.au/1530-thickbox_default/s0323-bloch-show-tapper-womens-tap-shoe.jpg', 0.5)
    //     .then(result => {
    //         console.log(JSON.stringify(result));
    //     })
    //     .catch(error => {
    //         console.error(JSON.stringify(error));
    //     });

    //darknetProxy.Initialize(WEIGHTS, WEIGHTS_URL, CFG, NAMES);
    // darknetProxy.Detect('http://www.bloch.com.au/1530-thickbox_default/s0323-bloch-show-tapper-womens-tap-shoe.jpg',0.5)
    //             .then(result =>{
    //                 console.log(JSON.stringify(result));
    //             })
    //             .catch(error => {
    //                 console.error(JSON.stringify(error));
    //             });
    //darknetProxy.Detect2('http://www.bloch.com.au/1530-thickbox_default/s0323-bloch-show-tapper-womens-tap-shoe.jpg',0.5);
}


function testJimp(imageUrl) {
    //http://www.bloch.com.au/1530-thickbox_default/s0323-bloch-show-tapper-womens-tap-shoe.jpg
    Jimp.read(imageUrl)
        .then(function (image) {
            let req = {};
            req.ImageUrl = imageUrl;
            request({
                    url: 'http://127.0.0.1:58999/Detect',
                    method: "POST",
                    json: req
                },
                function (error, response, body) {

                    console.log(body);
                    if (body && Array.isArray(body)) {
                        if (body.length === 0) {
                            console.log('No shoe detected.')
                        }
                        body.forEach(entry => {
                            let imgCopy = image.clone();
                            imgCopy.crop(entry.box.x, entry.box.y, entry.box.w, entry.box.h)
                                .write(GenerateFileName());
                            imgCopy = null;
                        });
                    }
                    image = null;
                })
        }).catch(function (err) {
            console.error(err);
        });
}

function testShell() {
    //check node version:
    const version = shelljs.exec('node --version', {
        silent: true
    }).stdout;
    console.log(`node version: ${version}`);

    //Option 1: Call the shell script in asyn mode
    // const child = shelljs.exec('./download_weights.sh', {async:true});
    // child.stdout.on('data', function(data) {
    //   /* ... do something with data ... */
    //   consolo.log(data);
    // });

    shelljs.exec('./download_weights.sh', (code, stdout, stderr) => {
        console.log('Exit code:', code);
        console.log('Program output:', stdout);
        console.log('Program stderr:', stderr);
    });
}

function checkFileExists(filePath) {
    fs.stat(filePath, (err, stat) => {
        if (err === null) {
            console.log(`File existes. ${filePath}`);
        } else if (err.code === 'ENOENT') {
            // file does not exist
            console.error(`File not found.${filePath}`);
        } else {
            console.log('An error has occurred when checking file status of weights: ', err.code);
        }
    });
}

//checkFileExists('./yolov3.cfg');

function DownloadImage(uri, filename, callback) {
    console.log("Downloading image from " + uri)
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(path.join(tempDir, filename))).on('close', callback);
    });
}



function GenerateFileName() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let ss = today.getSeconds();
    let ms = today.getMilliseconds();

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    if (ss < 10) {
        ss = '0' + ss;
    }

    let imageFileName = `${yyyy}_${mm}_${dd}_${ss}_${ms}.jpg`;
    console.log(imageFileName);
    return imageFileName;
}