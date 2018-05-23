# SMB Marketplace Assistant
An SMB Shop Assistant to integrate SAP Business One, SAP Business ByDesign and SAP Leonardo on SAP Cloud Platform

## Pre Requisites
* A free trial account on SAP Cloud Platform with Cloud Foundry Trial initialized;
* The Cloud Foundry Command Line Interface (CLI) on your machine;

## Installation
### STEP 1: ByD OData API and Business Analytics
* Import the all the available [models](https://github.com/B1SA/smbmkt/tree/master/models/byd) in the [SAP Businesss ByDesign Odata Services](https://www.youtube.com/watch?v=z6mF_1hFths)
* Activate the models and take note of the service URL
* Upload the [report of prices](https://github.com/B1SA/smbmkt/tree/master/models/reports) on SAP Business ByDesign Business Analytics

### STEP 2: Fill in the product data in ByD and B1
* Fill the url for the product image in ByD (Product Data > Materials > General Information > Details text box) and B1 (Item Master Data > Remarks > text box)

### STEP 3: Deployment of the SMB Marketplace Assistant Backend in the SAP Cloud Platform
* Clone/Download this repository
* Update the application name in the manifest.yml
* From the root directory, using the Cloud Foundry CLI, push your app to the SAP CP Cloud Foundry
```
$ cf push
```
* Then set the Environment Variables accordingly
```
B1_COMP_ENV: <SAP Business One Company Name>
B1_DEFAULT_BP: <A Business Partner Code for the B1 Sales Order>
B1_USER_ENV: <B1 User to login the Service Layer>
B1_PASS_ENV: <Password for the B1 User>
B1_SERVER_ENV: <SAP Business One server URL>
B1_SLPATH_ENV: /b1s/v1
B1_SLPORT_ENV: <SAP Business One Service Layer Server Port>
BYD_AUTH: <[Base64 Encoded] user:password>
BYD_DEFAULT_BP: <A Business Partner Code for the ByD Sales Order>
BYD_PATH: /sap/byd/odata/cust/v1
BYD_PORT: ""
BYD_SERVER: <SAP Business ByDesign server URL>
FILE_SEP: -_-_
LEO_API_KEY: <SAP Leonardo API Key> 
TEMP_DIR: files/tmp
VECTOR_DIR: files/vectors
```

For Example:

```
$ cf set-env mysmbmkt B1_COMP_ENV SBODEMOUS
```

* Restart your application (so it can read the new environment variables)

```
$ cf restart mysmbmkt
```

You will see your backend URL
* For details about app deployment check [Deploying a NodeJS app to SAP Cloud PLatform in this guide](https://github.com/B1SA/B1_SCP_HandsOn/blob/master/HandsOn_SCP_Instructions_v2.pdf)

## License
SMB Marketplace Assistant prototype is released under the terms of the MIT license. See LICENSE for more information or see https://opensource.org/licenses/MIT.
