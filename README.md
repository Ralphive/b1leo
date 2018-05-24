# SMB Marketplace Assistant
An SMB Shop Assistant to integrate SAP Business One, SAP Business ByDesign and SAP Leonardo on SAP Cloud Platform

## Pre Requisites
* A free trial account on SAP Cloud Platform with Cloud Foundry Trial initialized;
* The Cloud Foundry Command Line Interface (CLI) on your machine;

## Installation
### STEP 1: Setup the SAP Business ByDesign OData API services and Business Analytics
* Import the all the available [models](https://github.com/B1SA/smbmkt/tree/master/models/byd) in the [SAP Businesss ByDesign Odata Services](https://www.youtube.com/watch?v=z6mF_1hFths)
* Activate the models and take note of the service URL
* Upload the [report of prices](https://github.com/B1SA/smbmkt/tree/master/models/reports) on SAP Business ByDesign Business Analytics

### STEP 2: Configure your products with pictures
* Upload your pictures to an online storage service such as [imgur](imgur.com)
* Fill the url for your products' images in SAP Business ByDesign (Product Data > Materials > General Information > Details text box)
* Fill the url for your products' images in SAP Business One (Item Master Data > Remarks > text box)

### STEP 3: Deploy the first microservice in SAP Cloud Platform: the Assistant Bot for Facebook Messenger
* Clone/Download this repository
* Follow the [facebook developer manual](https://developers.facebook.com/docs/messenger-platform/getting-started) to create a messenger bot with message and user_location service 
* Update the VERIFY_TOKEN for your messenger bot in smbmkt/bot/messenger/config.js, which will be used on registered the web hook to fb messenger
* Update the PAGE_ACCESS_TOKEN for your messenger bot in smbmkt/bot/messenger/config.js
* Browse to the /bot/messenger folder
* Deploy the messenger app to the SAP Cloud Platform, Cloud Foundry
* From the /bot/messenger directory, login SAP Cloud Platform, Cloud Foundry with your credentials
```
$ cf login
```
* push the messenger app to the SAP CP Cloud Foundry
```
$ cf push
```
* As result, you can find out the urls of your messenger bot, for example: https://sap-smbassistantbot.cfapps.eu10.hana.ondemand.com (Please add https:// at the beginning of url)
* Setup the web hook of the messenger bot with url above. You need to enter the VERIFY_TOKEN you have setup in step 2 above.

### STEP 4: Deploy the second microservice in SAP Cloud Platform: the Backend Orchestrator 
* Browse back to root directory
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
* Create the Redis and PostgreSQL services
```
cf create-service redis v3.0-dev redis -c '{"ram_gb":1}'
cf create-service postgresql v9.6-dev postgresql -c '{"ram_gb":1}'
```

* Bind the services above with your application
```
cf bind-service smbmkt3 redis
cf bind-service smbmkt3 postgresql
```
* Restart your application (so it can read the new environment variables)

```
$ cf restart mysmbmkt
```

You will see your backend URL
* For details about app deployment check [Deploying a NodeJS app to SAP Cloud PLatform in this guide](https://github.com/B1SA/B1_SCP_HandsOn/blob/master/HandsOn_SCP_Instructions_v2.pdf)

## License
SMB Marketplace Assistant prototype is released under the terms of the MIT license. See LICENSE for more information or see https://opensource.org/licenses/MIT.
