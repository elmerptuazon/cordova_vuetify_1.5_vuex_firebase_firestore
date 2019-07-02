export function imageToDataUri (img, width=null, height=null) {
	return new Promise((resolve) => {
		// We create an image to receive the Data URI
		const fakeImg = document.createElement('img');
		fakeImg.onload = function () {
			// create an off-screen canvas
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			// set its dimension to target size
			if (width && height) {
				canvas.width = width;
				canvas.height = height;
				// draw source image into the off-screen canvas
				ctx.drawImage(this, 0, 0, width, height);
			} else {
				canvas.width = this.width;
				canvas.height = this.height;
				// draw source image into the off-screen canvas
				ctx.drawImage(this, 0, 0, this.width, this.height);
			}
			// encode image to data-uri with base64 version of compressed image
			resolve(canvas.toDataURL());
		}
		fakeImg.crossOrigin = 'anonymous';
		fakeImg.src = img;
	});
}

export function generateThumbnailReso(srcWidth, srcHeight, maxWidth=120, maxHeight=120) {
	const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
	return { width: srcWidth*ratio, height: srcHeight*ratio };
}

export function getImageDimensions(src) {
	return new Promise((resolve) => {
		const i = new Image();
		i.onload = function() {
			resolve({
				width: this.width,
				height: this.height
			});
		}
		i.src = src;
	});
}


// Take an image URL, downscale it to the given width, and return a new image URL.
export const downScaleImage = (dataUrl, newWidth = 350, imageType = 'image/jpeg', imageArguments = 0.7) => new Promise((resolve, reject) => {

    let image;
    let oldWidth;
    let oldHeight;
    let newHeight;
    let canvas;
    let ctx;
    let newDataUrl;

    // Create a temporary image so that we can compute the height of the downscaled image.
    image = new Image();
    image.src = dataUrl;
    
    // Wait for image to be loaded
    image.onload = function () {
        console.log('loaded')
        oldWidth = image.width;
        oldHeight = image.height;
        newHeight = Math.floor(oldHeight / oldWidth * newWidth)

        // Create a temporary canvas to draw the downscaled image on.
        canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the downscaled image on the canvas and return the new data URL.
        ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        newDataUrl = canvas.toDataURL(imageType, imageArguments);

        resolve(newDataUrl);
    }   

});

export function saveToSQLite(field, value, cb) {
	var db = window.sqlitePlugin.openDatabase({
		name: ''
	});
}