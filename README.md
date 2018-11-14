# Serverless Tesseract plugin

A Serverless plugin to easily add Tesseract OCR engine to your deployment. Builds tesseract for you in a docker container.


## Installation and Configuration

```
npm install --save serverless-tesseract
```

Add the plugin to your `serverless.yml` file and configure:

```yaml
plugins:
  - serverless-tesseract

custom:
  # This section is optional, as well as all of its keys.
  # Defaults are shown in the example.
  tesseract:
    version: 4.0.0
    leptonica_version: 1.76.0
    tessdata: "osd eng" # Add any other languages rus, deu, ...
    tessdata_url: https://github.com/tesseract-ocr/tessdata/raw/master/
    # Other obvious choices are:
    #   https://github.com/tesseract-ocr/tessdata_fast/raw/master/
    #   https://github.com/tesseract-ocr/tessdata_best/raw/master/
    # The fast ones are used by Ubuntu and Debian by default
```

Then run `sls deploy` or `sls package` as usual.


## Usage

This plugins adds `tesseract-standalone` directory to your build with its executable, libs and tessdata and convenience script `tesseract` to the root of your project. You may call it directly or add it to path:

```python
LAMBDA_TASK_ROOT = os.environ.get('LAMBDA_TASK_ROOT', os.path.dirname(__file__))
os.environ["PATH"] = LAMBDA_TASK_ROOT + os.pathsep + os.environ['PATH']
```


## Extra commands

This plugin defines commands to manufacture and clean artifacts without packaging them:

```bash
sls tesseract create
sls tesseract clean
```
