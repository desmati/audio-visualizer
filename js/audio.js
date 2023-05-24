
// Function to fetch and decode the audio file
async function loadAudio(url, progressCallback) {
    if (isPlaying) {
        return;
    }

    const response = await fetch(url);
    const contentLength = response.headers.get('content-length');
    const totalBytes = parseInt(contentLength, 10);
    let loadedBytes = 0;

    const reader = response.body.getReader();

    const chunks = [];
    let receivedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedBytes += value.length;

        // Calculate the loading progress
        const progress = Math.min(100, Math.ceil(receivedBytes / totalBytes * 100));

        // Invoke the progress callback with the current progress value
        if (progressCallback) {
            progressCallback(progress);
        }
    }

    const allChunks = new Uint8Array(receivedBytes);
    let position = 0;

    for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
    }

    const audioBuffer = await audioContext.decodeAudioData(allChunks.buffer);
    return audioBuffer;
}
