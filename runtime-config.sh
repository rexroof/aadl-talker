#!/bin/sh

# this sets up a runtime config for google cloud functions.

# (ignore that we're crossing clouds)

gcloud beta runtime-config configs create aadl-talker
gcloud beta runtime-config configs variables \
    set region "us-east-1" \
    --config-name aadl-talker

gcloud beta runtime-config configs variables \
    set aws_access_key_id "${AWS_ACCESS_KEY_ID}" \
    --config-name aadl-talker

gcloud beta runtime-config configs variables \
    set aws_secret_access_key "${AWS_SECRET_ACCESS_KEY}" \
    --config-name aadl-talker

