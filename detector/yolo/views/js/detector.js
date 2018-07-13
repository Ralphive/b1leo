$(function () {
	/**
	 * TODO: Please update the BaseUrl for the target tensorflow detector
	 * which is deployed through code /smbmkt/detector/tensorflow
	 * It is "../" for yolo as the demokit is running from yolo detector
	 */
	const DETECTORS = [
		{
			"Detector": "yolo",
			"BaseUrl": "../"
		},
		{
			"Detector": "tensorflow",
			"BaseUrl": "https://shoe-detector-tf.cfapps.eu10.hana.ondemand.com/"
		}
	];
	const INITIALIZE_ENDPOINT = 'Initialize';
	const DETECT_ENDPOINT = 'Detect';

	//detetcor global variable:
	//By default, we use yolo detector for the demokit.
	let detector = 'yolo'; 

	/**
	 * Get the base url of the detector with the given detector name
	 * d: The input detector name, which could be "yolo" or "tensorflow"
	 */
	function getDetectorBaseUrl(d){
		let len = DETECTORS.length;
		for(let i = 0; i < len; i++)
		{
			if (DETECTORS[i].Detector === d)
				return DETECTORS[i].BaseUrl;
		}
		
		//by default, return the base url of yolo detector, 
		//as the demokit is running from yolo detector
		return DETECTORS[0].BaseUrl;
	}

	/**
	 * Button click handler for Initialize button.
	 * Invoking Initialize API with the given dataset and algorithm
	 */
	$('#btnInit').click(function () {
		let dataset = $("#dataset option:selected").val();
		let algorithm = $("#algorithm option:selected").val();	
		let body = {};
		
		if(algorithm.startsWith('tf')){
			//using tensforflow detector
			//TODO: [Optional]If you have add your custom dataset, please add the mapping
			//between dataset and model for the demokit, otherwise just ignore this todo.
			detector = 'tensorflow';
			let model = 'ssdlite_mobilenet_v2_shoe';
			if(dataset === 'coco')
				model = 'ssdlite_mobilenet_v2_coco_2018_05_09';
			body.model = model;
		} else {
			body.dataset = dataset;
			body.algorithm = algorithm;
		}

		let url = `${getDetectorBaseUrl(detector)}${INITIALIZE_ENDPOINT}`;
		$.ajax({
				url: url,
				method: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(body)
			}).done(function (data) {
				$('#operationSuccessModal').modal('show');
			})
			.fail(function (xhr, status, error) {
				$('#operationFailureModal').modal('show');
			});
	});
	
	/**
	 * Button click handler for Detect button.
	 * Invoking the Detect API, call displayResult if succeed 
	 * to draw the bounding box on the image and show the result in JSON.
	 */
	$('#btnDetect').click(function () {
		let imageUrl = $('#imageUrl').val();
		let request = {};
		request.ImageUrl = imageUrl;
		$('#resultContainer').empty();
		$('#srcImageContainer').empty();
		$('#srcImageContainer').append(`<img id="sourceImage" class="card-img-top" src="${imageUrl}" alt="Source Image">`);

		let url = `${getDetectorBaseUrl(detector)}${DETECT_ENDPOINT}`;
		let startTime = Date.now();
		console.log(`start on: ${startTime}`);
		$.ajax({
				url: url,
				//url: '../Detect'
				//url: 'https://shoe-detector-tf.cfapps.eu10.hana.ondemand.com/Detect',
				method: 'POST',
				data: JSON.stringify(request),
				contentType: 'application/json',
			}).done(function (data) {
				let processTimeinSec = (Date.now() - startTime) / 1000;
				displayResult(imageUrl, data, processTimeinSec);
			})
			.fail(function (xhr, status, error) {
				alert(error);
			});
	});

	/**
	 * Display the detection result. 
	 * Draw the bounding box on the image and show the result in JSON.
	 * @param {string} imageUrl: The source image url
	 * @param {JSON} data: the response of Detect API in JSON
	 * @param {decimal} processTimeinSec: The process time of the AJAX call for detection API in seconds.
	 */
	function displayResult(imageUrl, data, processTimeinSec) {
		$('#resultContainer').empty();
		$('#resultContainer').append(`
		<canvas id="resultCanvas">
		</canvas>
		<div id="jsonDiv" class="card-body">
			<h5 class="card-title">Detect Result
				<small class="text-muted">(Process time: ${processTimeinSec} seconds)</small>
			</h5>
			<div class="input-group">
				<div class="input-group-prepend">
					<span class="input-group-text">JSON</span>
				</div>
				<textarea id="jsonResult" class="form-control" rows=10 aria-label="JSON">${JSON.stringify(data, undefined, 4)}</textarea>
			</div>
		</div>`);

		let canvas = document.getElementById('resultCanvas');
		//let canvas = $('#resultCanvas')[0];
		let ctx = canvas.getContext("2d");

		let srcImage = document.getElementById('sourceImage');

		//or however you get a handle to the IMG
		let originalWidth = srcImage.naturalWidth;
		let originalHeight = srcImage.naturalHeight;
		let width = srcImage.clientWidth;
		let height = srcImage.clientHeight;
		console.log(`Orignal size: ${originalWidth} * ${originalHeight}`);
		console.log(`New size    : ${width} * ${height}`);
		canvas.width = width;
		canvas.height = originalHeight * width / originalWidth;
		console.log(`Canvas size : ${canvas.width} * ${canvas.height}`);
		//ctx.drawImage($resultImage[0],0,0);
		let imageObj = new Image();
		imageObj.width = canvas.width;
		imageObj.height = canvas.height;
		
		imageObj.onload = function () {
			ctx.drawImage(imageObj, 0, 0, canvas.width , canvas.height);
			ctx.font = "14px Arial";
			
			data.forEach(element => {
				let dw = width / originalWidth;
				let dh = height / originalHeight;
				console.log(`dw: ${dw}, dh: ${dh}`)
				let x = element.box.x * dw;
				let y = element.box.y * dh;
				let w = element.box.w * dw;
				let h = element.box.h * dh;

				x = x < 0? 0 : x;
				//x = x > width? width : x;
				if((x + w) > width)
					w = width - x;
				
				y = y < 0? 0 : y;
				y = y > height? height : y;
				if((y + h) > height)
					h = height - y;
				console.log(JSON.stringify(element.box));
				console.log(`x: ${x}, y: ${y}, w: ${w}, h: ${h}`);
				ctx.fillStyle = "red";
				ctx.fillText(`${element.name}: ${dec2Perc(element.prob)}`, x, y - 2);
				ctx.beginPath();
				ctx.rect(x, y, w, h);
				ctx.lineWidth = 2;
				ctx.strokeStyle = 'red';
				ctx.stroke();
			});
		};
		imageObj.src = imageUrl;
	}

	/**
	 * Convert decimal into percentage string
	 * @param {*} dec : decimal input
	 */
	function dec2Perc(dec)
	{
		return `${(dec * 100).toFixed(2)}%`;
	}
});