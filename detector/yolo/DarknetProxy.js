/********************************************************************************
A generic object-oriented proxy class for Darknet, which implement the Detect for 
the object detection and ImagePreproess function for cropping the bounding box of 
the detected with highest detection score into a new image.

The source code is under MIT license. Please kindly check the LICENSE.
Here is to highlight that THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
ANY KIND, EXPRESS ORIMPLIED. Therefore no support available.

Created on: May 20 2018
Author: Yatsea Li

All rights reserved by SAP SE
*********************************************************************************/
'use strict';
const fs = require('fs');
const shell = require('shelljs');
const Darknet = require('darknet').Darknet;
const settings = require('./settings');
const util = require('./util');
const Jimp = require('jimp');
const sizeOf = require('image-size');

const threshold = process.env.DETECT_THRES || 0.70;
const IMAGE_BASE_URL =  process.env.IMAGE_BASE_URL || 'http://127.0.0.1:58999/Images/';

module.exports = class DarknetProxy {

    constructor(weights, weightsUrl, cfg, names, thres) {
        this.darknet = null;
        this.weights = weights;
        this.weightsUrl = weightsUrl;
        this.cfg = cfg;
        this.names = names;

        this.Initialize(weights, weightsUrl, cfg, names);
    }

    /**
     * Initialize the darknet
     * 1.Check if the weights exists or not
     * 2.Download the weights file if not existis.
     * 3.Load the weights file to initialize the darknet 
     */
    Initialize(weights, weightsUrl, cfg, names) {
        //sync mode
        //         if (fs.existsSync(weights)) {
        //             console.log('Weights existes.');
        //         } else {
        //             //Weights File does not exist.
        //             console.warn(`Weights not found. 
        // Downloading the weights automatically. It may take a whiles. Please check the progress with command (cf logs detector-yolov3)`);
        //             //download the weight in synchronous mode
        //             this.DownloadWeights(weights, false);
        //         }
        //         this.darknet = new Darknet({
        //             weights: weights,
        //             config: cfg,
        //             namefile: names
        //         });

        //async mode
        let self = this;
        fs.stat(weights, (err, stat) => {
            if (err === null) {
                console.log('Weights existes.');
            } else if (err.code === 'ENOENT') {
                //Weights File does not exist.
                console.warn(`Weights not found. 
        Downloading the weights automatically. It may take a whiles. Please check the progress with command (cf logs detector-yolov3)`);
                //download the weight in synchronous mode
                this.DownloadWeights(weights, false);
            }

            console.log('Loading the weights to initialise the darkenet');
            self.darknet = new Darknet({
                weights: weights,
                config: cfg,
                namefile: names
            });
        });
    }

    /**
     * Download the weights files by calling the shell script download_weights.sh
     * Usually, the weights files are quite large. It may take a while to download
     * It is recommended to download in asynchronous mode.
     * @param {*} weights : yolo weights file.
     * @param {*} async : true - asynchronous, false - synchronous
     */
    DownloadWeights(weights, async) {
        //self = this;
        try {
            let setting = this.getSettingByWeights(weights);

            let command = null;
            if (setting.weightsSource === 'darknet') {
                command = `wget -nc ${setting.weightsUrl}`;
            } else {
                command = `./gdown.pl ${setting.weightsUrl} ${setting.weights}`;
            }

            console.log(command);
            const child = shell.exec(command, {
                async: async
            });

            // child.stdout.on('data', function (data) {
            //     console.log(data);
            // });
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Test function.
     */
    Test() {
        let result = this.darknet.detect('./images/shoe.jpg');
        console.log(result);
        return result;
    }

    /**
     * Detect the object with give imageUrl and threshold of confidence.
     * The output of object bounding box has been formated as 
     * (x-top left, y-top right, w-width, h-height) in pixel
     * @param {*} imageUrl 
     * @param {*} thres 
     */
    Detect(imageUrl, thres) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                thres = thres || threshold;
                let config = {};
                config.thresh = thres;
                config.hier_thresh = thres;

                let imageFileName = util.GenerateImageFileName();

                util.DownloadImage(imageUrl, imageFileName, function () {
                    console.log(`image downloaded: ${imageFileName} `);
                    let result = self.darknet.detect(imageFileName, config);
                    let dimensions = sizeOf(imageFileName);
                    console.log(`image dimension: ${JSON.stringify(dimensions)}`);
                    //todo: delete the images?
                    //util.DeleteFile(imageFileName);
                    console.log(`result from darknet: ${JSON.stringify(result)}`);

                    result.forEach(entry => {
                        //cacluate the xmin and ymin.
                        //darknet return the centroid of the bouding box, the width and height
                        entry.imagePath = imageFileName;
                        entry.box.x = entry.box.x - entry.box.w / 2.0;
                        if (entry.box.x < 0) {
                            console.log('xmin < 0: xmin is reset as 0.0');
                            entry.box.x = 0;
                        }

                        if (entry.box.x + entry.box.w > dimensions.width) {
                            console.log('Bouding box xmax > image.width, reset the width of bouding box');
                            entry.box.w = dimensions.width - entry.box.x;
                        }

                        //cacluate ymin = yc - h/2.0
                        entry.box.y = entry.box.y - entry.box.h / 2.0;
                        if (entry.box.y < 0) {
                            console.log('xmin < 0: ymin is reset as 0.0');
                            entry.box.y = 0;
                        }

                        if (entry.box.y + entry.box.h > dimensions.height) {
                            console.log('Bouding box ymax > image.height, reset the height of bouding box');
                            entry.box.h = dimensions.height - entry.box.y;
                        }
                    });

                    console.log(`result after adjust: ${JSON.stringify(result)}`);
                    resolve(result);
                });
            } catch (error) {
                reject({
                    error: error
                });
            }
        });
    }

    /**
     * Crop the shoes with given image url.
     * @param {*} imageUrl 
     * @param {*} thres 
     */
    ImagePreprocess(imageUrl, thres) {
        let self = this;
        return new Promise((resolve, reject) => {
            this.Detect(imageUrl, thres)
                .then(result => {
                    if (result.length === 0) {
                        let imageRes = {};
                        imageRes.CroppedImageUrl = '';
                        imageRes.Message = 'No shoe detected';
                        imageRes.ReturnCode = -99;
                        //no shoes detected
                        resolve(imageRes);
                        return;
                    }

                    //only return the shoe with highest score.
                    let imagePath = result[0].imagePath;
                    Jimp.read(imagePath)
                        .then(function (image) {
                            image.crop(result[0].box.x, result[0].box.y, result[0].box.w, result[0].box.h)
                                .write(imagePath);
                            image = null;
                            let imageRes = {};
                            imageRes.CroppedImageUrl = IMAGE_BASE_URL + imagePath.split("/")[1];
                            imageRes.Confidence = result[0].prob;
                            imageRes.Object = result[0].name;
                            imageRes.ReturnCode = 0;
                            resolve(imageRes);
                        }).catch(function (err) {
                            console.error(err);
                            reject({
                                'error': 'error occurred on cropping the detected shoe image'
                            });
                        });
                })
        })
    }

    /**
     * Get the setting by dataset and algorithm
     */
    getSetting(dataset, algorithm) {
        const count = settings.length;
        for (let i = 0; i < count; i++) {
            if (settings[i].dataset === dataset && settings[i].algorithm === algorithm) {
                return settings[i];
            }
        }

        //default settings as shoe-yolov2
        return settings[2];
    }

    /**
     * Get the setting by weights file name
     */
    getSettingByWeights(weights) {
        const count = settings.length;
        for (let i = 0; i < count; i++) {
            if (settings[i].weights === weights) {
                return settings[i];
            }
        }

        //default settings as shoe-yolov2
        return settings[2];
    }
}