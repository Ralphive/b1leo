'use strict';
const fs = require('fs');
const shell = require('shelljs');
const Darknet = require('darknet').Darknet;
const settings = require('./settings');
const util = require('./util');

const threshold = process.env.DETECT_THRES || 0.50;
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
        let result = this.darknet.detect('./temp/shoe.jpg');
        console.log(result);
        return result;
    }

    /**
     * Detect the object with give imageUrl and threshold of confidence.
     * @param {*} imageUrl 
     * @param {*} thres 
     */
    Detect(imageUrl, thres) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                thres = thres || threshold;
                let imageFileName = util.GenerateImageFileName();

                util.DownloadImage(imageUrl, imageFileName, function () {
                    console.log(`image downloaded: ${imageFileName} `);
                    let result = self.darknet.detect(imageFileName);
                    //todo: delete the images?
                    util.DeleteFile(imageFileName);
                    //console.log(result);
                    result.forEach(entry => {
                        entry.box.x = entry.box.x - entry.box.w / 2.0;
                        entry.box.y = entry.box.y - entry.box.h / 2.0;
                    });

                    console.log(result);
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