# SMB Marketplace
[![SAP](https://i.imgur.com/S8BS6PX.png)](https://sap.com)

*A SMB Shop Assistant to integrate SAP Business One, SAP Business ByDesign and SAP Leonardo on SAP Cloud Platform. [See how is works here](https://www.youtube.com/watch?v=M3puey2iw30) and get more details [in this blog](https://blogs.sap.com/2018/05/24/digital-transformation-for-smbs-the-intelligent-enterprise)*

## Table of Contents
* **[Pre Requisites](#pre-requisites)**
* **[Installation](#installation)**
* **[Digital Core preparation](#step-1---digital-core-preparation)**
* **[App Config and Deployment](#step-2----app-configuration-and-cloud-deployment)**
* **[License](#license)**

## Pre Requisites
* A free trial account on [SAP Cloud Platform]((https://cloudplatform.sap.com)) with Cloud Foundry Trial initialized;
* The [Cloud Foundry Command Line Interface (CLI)](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) on your machine;

## Installation
> First clone or download this repository. Then:


## STEP #1 - Digital Core preparation
### Setup the SAP ByD OData API services and Business Analytics
In order for this application to consume SAP ByD data, it needs to be exposed via webservices. Some data (such as Items) can be accessed via an standard OData API. Others (like inventory) are available via a reporting API called Business Analytics:
* Import the all the available [models](https://github.com/B1SA/smbmkt/tree/master/models/byd) in the [SAP Businesss ByDesign Odata Services](https://www.youtube.com/watch?v=z6mF_1hFths)
* Activate the models and take note of the service URL
* Upload the [report of prices](https://github.com/B1SA/smbmkt/tree/master/models/reports) on SAP Business ByDesign Business Analytics

 - Configure the ERP products with pictures
In order to find products that are similar to a given input the app needs an "image library" to be used as a comparision by the [SAP Leonardo Similarity Scoring API](https://api.sap.com/shell/discover/contentpackage/SAPLeonardoMLFunctionalServices/api/similarity_scoring_api). In this step we will assign image URL to the ERP items:
* Upload your pictures to an online storage service such as [imgur](imgur.com)  
* Fill the url for your products' images in SAP Business ByDesign (Product Data > Materials > General Information > Details text box)
* Fill the url for your products' images in SAP Business One (Item Master Data > Remarks > text box)

## STEP #2 -  App Configuration and Cloud Deployment
### Configure the Facebook Chatbot microservice
* Follow the [facebook developer manual](https://developers.facebook.com/docs/messenger-platform/getting-started) to create a messenger bot with message and user_location service 
* Update the VERIFY_TOKEN for your messenger bot in smbmkt/bot/messenger/config.js, which will be used on registered the web hook to fb messenger
* Update the PAGE_ACCESS_TOKEN for your messenger bot in smbmkt/bot/messenger/config.js

### Create the backing services
This app uses 2 [backing services](https://12factor.net/backing-services) from SAP Cloud Platform. [Redis](https://redis.io) for storing B1 Service Layer Sessions ID in cache and [PostgreSQL](https://www.postgresql.org/) to store [SAP Leonardo Feature Extraction Vectors](https://api.sap.com/api/img_feature_extraction_api/resource). Here are the steps to create them:

Using a command terminal, navigate to the smbmkt root directory, which you downloaded or cloned previously.
Log in the SAP Cloud Platform, Cloud Foundry with your credentials executing this command:
```
$ cf login
```
Create the Redis and PostgreSQL services
```
cf create-service redis v3.0-dev cachedb
cf create-service postgresql v9.6-dev smbmktdb
```

### Deploy the app's microservices
This app have 2 microservices that can be deployed at once or separately. Their specifications are detailed in the [manifest.yml](manifest.yml). From the same terminal of the previous step execute:
```
$ cf push --random-route
```
>*--random-route will avoids name colisions with others that deploy this same app on SCP. You can choose your own app name by changing the application names in the [manifest](manifest.yml)*

As result, you can find out the urls of your messenger bot and the SMB Marketplace backend. You can also check them with:
```
$ cf apps
```
Setup the web hook of the messenger bot (on facebook) with url above. You need to enter the VERIFY_TOKEN you have [setup in step 2 above](#configure-the-facebook-chatbot-microservice).

### Configure the SMB Mktplace backend

Set the following [Environment Variables](https://12factor.net/config) so the app can work properly
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
Restart your application (so it can read the new environment variables)
```
$ cf restart smbmkt
```

You will see your backend URL
For details about app deployment check [Deploying a NodeJS app to SAP Cloud PLatform in this guide](https://github.com/B1SA/B1_SCP_HandsOn/blob/master/HandsOn_SCP_Instructions_v3.pdf)

## License
SMB Marketplace Assistant prototype is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.
