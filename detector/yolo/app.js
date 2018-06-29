'use strict';
const express = require('express');
const body_parser = require('body-parser');
const app = express().use(body_parser.json());
const path = require('path');
const DarknetProxy = require('./DarknetProxy');
const Jimp = require('jimp');

const PORT = process.env.PORT || 58999;
let WEIGHTS = process.env.WEIGHTS || './yolov2_shoe.weights';
let WEIGHTS_URL = process.env.WEIGHTS_URL || 'https://drive.google.com/file/d/1UDwKu1OSr0XkDLlO3K8Fv4KOLrTeS-ym/edit';
let CFG = process.env.CFG || './cfg/yolov2_shoe.cfg';
let NAMES = process.env.NAMES || './cfg/custom.names';

//global instance of darknet proxy
let darknetProxy = new DarknetProxy(WEIGHTS, WEIGHTS_URL, CFG, NAMES);

app.use('/image', express.static(path.join(__dirname, './temp')));
app.use('/web', express.static(path.join(__dirname, './views')));
app.set('view engine', 'ejs');
app.listen(PORT, () => console.log(`YOLO image pre-processing service is listening at http://127.0.0.1:${PORT}/`));

/**
 * Endpoint to initialise the darknet
 */
app.get('/Initialize', (req, res) => {
    let dataset = req.query.dataset || 'shoe';
    let algorithm = req.query.algorithm || 'yolo-v2';
    console.log(`dataset: ${dataset}, algorithm: ${algorithm}`);

    let setting = darknetProxy.getSetting(dataset, algorithm);
    console.log(JSON.stringify(setting));

    darknetProxy.Initialize(setting.weights, setting.weightsUrl, setting.cfg, setting.names);
    res.status(200).json({
        message: `Loading ${setting.weights} and Initialising Darknet in asychronoous mode.`
    });
});

/**
 * Endpoint to download the weights file by calling the download_weights.sh
 * The weights are usually quite large to be deployed with the app,
 * hence required to be downloaded after deployment. 
 */
app.get('/Weights', (req, res) => {
    let weights = req.query.weights || 'yolov2_shoe.weights';
    darknetProxy.DownloadWeights(weights, true);

    res.status(200).json({
        message: `Doadloading ${weights} in asynchronous mode. It may take a while. Please check the progress with command (cf logs yolo-v3-test)`
    });
});

/**
 * Web Detector demo kit
 */
app.get('/web/Detector', (req, res) => {
    res.render(path.join(__dirname, './views/Detector'), {});
});

/**
 * Endpoint to test the dector api
 */
app.get('/Test', (req, res) => {
    let result = darknetProxy.Test();
    res.status(200).json(result);
});

/**
 * Endpoint of object detection
 * @param {JSON} req: { "ImageUrl": "https://..."}
 */
app.post('/Detect', (req, res) => {
    if (req.body && req.body.ImageUrl) {
        darknetProxy.Detect(req.body.ImageUrl, req.body.Threshold)
            .then(result => {
                console.log(result);
                res.status(200).json(result);
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({
                    error: error
                });
            });
    } else {
        res.status(500).json({
            error: "Missing ImageUrl in request body."
        });
    }
});

/**
 * Endpoint of object detection
 * @param {JSON} req: { "ImageUrl": "https://..."}
 */
app.post('/ImagePreprocess', (req, res) => {
    if (req.body && req.body.ImageUrl) {
        darknetProxy.ImagePreprocess(req.body.ImageUrl, req.body.Threshold)
            .then(result => {
                if (req.body.Id) {
                    result.Id = req.body.Id;
                    result.OrginalURL = req.body.ImageUrl;
                }
                res.status(200).json(result);
            })
            .catch(error => {
                res.status(500).json(error);
            });

        // darknetProxy.Detect(req.body.ImageUrl, req.body.Threshold)
        //     .then(result => {
        //         console.log(result);
        //         if(result.length === 0)
        //         {
        //             //no shoe detect
        //             let imageRes = {};
        //             imageRes.CroppedImageUrl = '';
        //             imageRes.Message = 'No shoe detected';
        //             imageRes.ReturnCode = -99;
        //             res.status(200).json(imageRes);
        //             return;
        //         }

        //         //let cropImageName = util.GenerateImageFileName();
        //         let cropImageName = result[0].imagePath;
        //         Jimp.read(req.body.ImageUrl)
        //             .then(function (image) {
        //                 image.crop(result[0].box.x, result[0].box.y, result[0].box.w, result[0].box.h)
        //                 .write(cropImageName);
        //                 let imageRes = {};
        //                 imageRes.CroppedImageUrl = IMAGE_BASE_URL + cropImageName.split("/")[1];
        //                 imageRes.Confidence = result[0].prob;
        //                 imageRes.Object = result[0].name;
        //                 imageRes.ReturnCode = 0;
        //                 res.status(200).json(imageRes);
        //             });
        //     })
        //     .catch(error => {
        //         console.error(error);
        //         res.status(500).json({
        //             error: error
        //         });
        //     });
    } else {
        res.status(500).json({
            error: "Missing ImageUrl in request body."
        });
    }
});

app.get('/image/:fileName', function (req, res) {
    res.sendFile('temp/' + req.params.fileName);
});