# API Media Processor

**API Media Processor** is a Node.js RESTful application designed to handle image processing tasks: rotating images, extracting text via OCR, and translating that text into any supported language. It supports both direct HTTP requests and asynchronous task handling via Azure Service Bus.

## 📦 Features

- 📤 Upload and process images via HTTP or Azure Service Bus queue
- 🔄 Rotate images using `sharp`
- 🧠 Extract text from images with Azure Cognitive Services (OCR)
- 🌐 Translate text using Google Cloud Translate or Azure Translator
- ☁️ Store and retrieve images using Amazon S3
- ⚙️ Easy configuration via environment variables

## 🛠️ Technologies Used

- **Node.js** with `Express`
- `Multer` for handling file uploads
- `Sharp` for image rotation and transformation
- `Axios` for sending HTTP requests to external APIs or callbacks
- `@azure/cognitiveservices-computervision` for OCR
- `@google-cloud/translate` for text translation
- `@aws-sdk/client-s3` for Amazon S3 integration
- `@azure/service-bus` for message queue handling

## 🚀 Getting Started

### 1. Clone the Repository

```bash
  git clone https://github.com/dlcastra/api_media_processor.git
  cd api_media_processor
```

### 2. Install Dependencies

```bash
  npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
 AWS_ACCESS_KEY_ID=
 AWS_SECRET_ACCESS_KEY=
 AWS_S3_BUCKET_NAME=
 AWS_S3_REGION=

 # OCR
 AZURE_OCR_ENDPOINT=
 AZURE_OCR_SECRET_KEY=

 # Translator
 AZURE_TRANSLATOR_ENDPOINT=
 AZURE_TRANSLATOR_SECRET_KEY=
 AZURE_TRANSLATOR_LOCATION=

 # Task Queue
 AZURE_SERVICE_BUS_CONNECTION_STRING=
 AZURE_SERVICE_BUS_QUEUE_NAME=

 # Google Cloud Translate
 GOOGLE_PROJECT_ID=
 GOOGLE_APPLICATION_CREDENTIALS="/usr/server/env/your_credentials.json"
```

### 4. Start the Server

```bash
  npm run dev
```
OR
```bash
  docker compose up --build
```

## API Usage
### POST `api/flip`
Flips the image depending on the specified flag: `vertical` or `v`; `horizontal` or `h`; `vert-horiz` or `vh`; 
`horiz-vert` or `hv`

### Request parameters:
- `s3Key` (required **string**) or `file` in form-data (required file format: **PNG, JPG**)
- `flipType` (required **string**)
- `callbackUrl` (required **string**)

### Example request:
```bash
    curl -X POST http://localhost:3000/api/flip \
      -H "Content-Type: application/json" \
      -d '{
        "s3Key": "image.png",
        "flipType": "h",
        "callbackUrl": "https://webhook.site/"
      }'
```

### Examples of application responses:

#### If all operations were successful
```json
{
  "status": "success"
}
```
#### Callback response data:
```json
{
  "success": true,
  "key": "processed/image.png",
  "url": "https://some-bucket-name.s3.eu-north-1.amazonaws.com/processed/data-id=GetObject",
  "status": "success"
}
```

#### If an error occurs during processing
```json
{
  "status": "error"
}
```

#### Callback response data:
```json
{
  "success": false,
  "data": "An internal error occurred processing the image",
  "status": "error"
}
```

### POST `api/extract-text`
Extract text from an image. Available option to translate the extracted text.

### Request parameters:
- `s3Key` (required **string**) or `file` in form-data (required file format: **PNG, JPG**)
- `callbackUrl` (required **string**)
- `translator` (required **string**) - optional filed
- `lang_to` (required **string**) - optional filed, but required if `translator` in request body
- `lang_from` (required **string**) - optional filed

### Example request:
```bash
    curl -X POST http://localhost:3000/api/translate \
      -H "Content-Type: application/json" \
      -d '{
        "s3Key": "image.png",
        "callbackUrl": "https://webhook.site/",
        "translator": "google",
        "lang_to": "uk"
      }'
```

### Examples of application responses:
#### If all operations were successful
```json
{
  "status": "success"
}
```
#### Callback response data:
```json
{
  "extractedText": "Hello world",
  "status": "success"
}
```

#### If an error occurs during processing
```json
{
  "status": "error"
}
```

#### Callback response data:
```json
{
  "success": false,
  "data": "An internal error occurred processing the image",
  "status": "error"
}
```