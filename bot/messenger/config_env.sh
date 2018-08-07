#!/usr/bin/env bash
#Configure the environment variable for Cloud Foundry env.
#1.Please update the app name XXX_SMBAssistantBot as manifest.yml
#2.Please replace the value of enironment variable <YOUR_OWN...>
cf set-env XXX_SMBAssistantBot PAGE_ACCESS_TOKEN <YOUR_OWN_PAGE_ACCESS_TOKEN>
cf set-env XXX_SMBAssistantBot VERIFY_TOKEN <YOUR_OWN_VERIFY_TOKEN>
cf set-env XXX_SMBAssistantBot SMBMKT_BACKEND_URL <YOUR_OWN_SMBMKT_BACKEND_URL>
cf set-env XXX_SMBAssistantBot ENABLE_DETECTOR <true or false>
cf set-env XXX_SMBAssistantBot DETECTOR_URL <YOUR_OWN_DETECTOR_URL>