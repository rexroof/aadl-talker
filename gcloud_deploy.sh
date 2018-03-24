#!/bin/bash

# this deploys our function to google cloud functions.
# you need to create the GCF_BUCKET before running this.

GCF_BUCKET="${GCF_BUCKET:-gcf-example}"

cd src && \
     gcloud beta functions deploy AADLTalker \
      --trigger-http --memory=128 --region=us-central1 \
      --timeout=60 --stage-bucket "gs://${GCF_BUCKET}/"

