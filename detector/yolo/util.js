/********************************************************************************
Utility module: 
-DownloadImage(imageUrl)
-DeleteFile(filePath)
-GenerateImageFileName()

The source code is under MIT license. Please kindly check the LICENSE.
Here is to highlight that THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
ANY KIND, EXPRESS ORIMPLIED. Therefore no support available.

Created on: May 20 2018
Author: Yatsea Li

All rights reserved by SAP SE
*********************************************************************************/
'use strict';
const fs = require('fs');
const path = require('path');
const request = require('request');

const imagesDir = './images/';

/**
 * Download image file with the given uri, and save to the given FilePath
 * @param {*} uri : Source iamge uri.
 * @param {*} newFilePath : Target new file path to save the image
 * @param {*} callback : Callback function once download completed
 */
exports.DownloadImage = function (uri, newFilePath, callback) {
    console.log(`Downloading image from ${uri} `);
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(newFilePath)).on('close', callback);
    });
}

/**
 * Delete the given file. Used to delete to the downloaded image file after detection
 * @param {*} filePath : Target file path to be deleted
 */
exports.DeleteFile = function(filePath) {
    fs.unlink(filePath, function (err) {
        if (err) {
            console.error(`Failed to delete ${filePath}. ${err}`);
            return;
        }
        // if no error, file has been deleted successfully
        console.log(`${filePath} deleted.`);
    });
}

/**
 * Generate the Image file name as the format: yyyy_mm_dd_ss_mmm.jpg
 * Used to download the image file by DownloadImage
 * Since the image file will be deleted once detection completed
 * It is enough at the present moment.
 * You could improve it more dynically by introducing random aphabet
 * or simply use uuid module instead.
 */
exports.GenerateImageFileName = function() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
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
    //return  
    let imageFileName = path.join(imagesDir, `${yyyy}_${mm}_${dd}_${ss}_${ms}.jpg`);
    console.log(imageFileName);
    return imageFileName;
}