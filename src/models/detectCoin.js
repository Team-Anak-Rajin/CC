// src/models/detectCoin.js


const axios = require("axios");
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function performObjectDetection(imgPath, saveDir) {
    try {
        const image = fs.readFileSync(imgPath, { encoding: "base64" });

        const response = await axios({
            method: "POST",
            url: "https://detect.roboflow.com/coin-yxjpa/3",
            params: {
                api_key: "HYYmcqhYaX9KSsDefjeJ"
            },
            data: image,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        if (response.data.predictions) {
            // Load the image onto a canvas
            const img = await loadImage(imgPath);
            const canvas = createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const classCounts = {};

            response.data.predictions.forEach((object, index) => {
                const className = object.class;
                if (!classCounts[className]) {
                    classCounts[className] = 1;
                } else {
                    classCounts[className]++;
                }

                const x1 = object.x - object.width / 2;
                const y1 = object.y - object.height / 2;
                const x2 = object.x + object.width / 2;
                const y2 = object.y + object.height / 2;

                drawBoundingBox(ctx, x1, y1, x2, y2, object.class);
            });

            for (const className in classCounts) {
                console.log(`Number of ${className} objects: ${classCounts[className]}`);
            }

            const timestamp = new Date().getTime();
            const resultFileName = `detected_coin_${timestamp}${path.extname(imgPath)}`;
            const resultImagePath = path.join(saveDir, resultFileName);
            const resultImageStream = fs.createWriteStream(resultImagePath);
            canvas.createJPEGStream().pipe(resultImageStream);

            resultImageStream.on('finish', () => {
                console.log(`Result image saved at: ${resultImagePath}`);
            });

            return {
                resultFileName,
                totalDetections: response.data.predictions.length,
                classCounts
            };
        } else {
            console.log("Invalid response format. 'predictions' property not found.");
            return null;
        }
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

// Function to draw bounding boxes with class label
function drawBoundingBox(ctx, x1, y1, x2, y2, label) {
    // Draw bounding box
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'red';
    ctx.stroke();

    // Draw class label inside the box
    ctx.font = '12px Arial';
    ctx.fillStyle = 'red';
    ctx.fillRect(x1, y1, ctx.measureText(label).width + 8, 16);
    ctx.fillStyle = 'white';
    ctx.fillText(label, x1 + 4, y1 + 12);
}

module.exports = { performObjectDetection };