document.addEventListener('DOMContentLoaded', function() {
    const pica = window.pica();
    const imageElements = document.querySelectorAll('img.resizable');

    imageElements.forEach(img => {
        const canvas = document.createElement('canvas');
        const maxWidth = 200; // Set your desired width
        const maxHeight = 300; // Set your desired height

        img.onload = async function() {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);

            try {
                await pica.resize(tempCanvas, canvas, { quality: 3 });
                const resizedImageUrl = canvas.toDataURL('image/jpeg');
                img.src = resizedImageUrl;
            } catch (err) {
                console.error('Error resizing image:', err);
            }
        };
        img.src = img.src; // Trigger loading
    });
});