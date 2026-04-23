#!/bin/bash
set -e

# Clean previous builds
rm -rf build lambda.zip

# Create build directory
mkdir -p build

# Install dependencies using the Lambda Python 3.12 Docker image
# --entrypoint "" overrides the default Lambda runtime entrypoint so we can run pip
# --platform linux/amd64 ensures native extensions are built for x86_64 lambdas
docker run --rm \
  --entrypoint "" \
  --platform linux/amd64 \
  -v "$PWD":/var/task \
  public.ecr.aws/lambda/python:3.12 \
  pip install -r /var/task/requirements.txt -t /var/task/build/

# Copy your app code into the build
cp -r app build/

# (Optional) Copy .env or alembic if your lambda function requires them:
# cp .env build/
# cp alembic.ini build/
# cp -r alembic build/

# Zip everything from inside build/ securely ignoring messy cache files
cd build
python -c "import os, zipfile
with zipfile.ZipFile('../lambda.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        if '__pycache__' in dirs: dirs.remove('__pycache__')
        for f in files:
            if not f.endswith('.pyc'): zf.write(os.path.join(root, f))
"
cd ..

echo "✅ Built lambda.zip ($(du -h lambda.zip | cut -f1))"
