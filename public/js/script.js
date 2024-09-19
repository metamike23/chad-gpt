document.addEventListener('DOMContentLoaded', function () {
    const promptForm = document.getElementById('prompt-form');
    const promptInput = document.getElementById('prompt-input');
    const submitButton = promptForm.querySelector('button[type="submit"]');
    const stopButton = document.getElementById('stop-button');

    let isProcessing = false;
    let abortController = null;

    promptForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (isProcessing) {
            return;
        }

        abortController = new AbortController();
        const signal = abortController.signal;

        isProcessing = true;

        promptInput.disabled = true;
        submitButton.disabled = true;
        stopButton.disabled = false;

        const prompt = promptInput.value;

        const responseContainer = document.createElement('div');
        responseContainer.className = 'response-container';
        const outputElement = document.getElementById('output');
        outputElement.appendChild(responseContainer);

        const promptElement = document.createElement('div');
        promptElement.textContent = `${prompt}`;
        promptElement.style.fontWeight = 'bold';
        promptElement.style.color = 'red';
        responseContainer.appendChild(promptElement);

        const scrollToBottom = () => {
            outputElement.scrollTop = outputElement.scrollHeight;
        };

        try {
            const response = await fetch("/completion", {
                method: 'POST',
                body: JSON.stringify({ prompt, n_predict: 512, stream: true }),
                headers: { 'Content-Type': 'application/json' },
                signal: signal
            });
        
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
        
            const responseText = document.createElement('div');
            responseText.className = 'ai-response'; // Add a class to the response text element
            responseContainer.appendChild(responseText);
        
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                responseText.textContent += chunk;
                scrollToBottom();
            }
        
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                console.error('Error:', error);
            }
        }
         finally {
            const interactionContainer = document.createElement('div');
            interactionContainer.className = 'interaction-container';

            const likeButton = document.createElement('button');
            likeButton.textContent = '👍 Like';
            likeButton.className = 'btn btn-success btn-sm me-2';
            likeButton.onclick = () => alert('You liked this response.');

            const dislikeButton = document.createElement('button');
            dislikeButton.textContent = '👎 Dislike';
            dislikeButton.className = 'btn btn-danger btn-sm me-2';
            dislikeButton.onclick = () => alert('You disliked this response.');

            const copyButton = document.createElement('button');
copyButton.textContent = '📋 Copy';
copyButton.className = 'btn btn-secondary btn-sm me-2';
copyButton.addEventListener('click', handleCopyClick);
copyButton.addEventListener('touchend', handleCopyClick, { passive: true }); // Add touch event handler

function handleCopyClick(e) {
    // Prevent default action for touch events
    e.preventDefault();

    const responseTextElement = responseContainer.querySelector('.ai-response'); // Refer to the element by class
    const textToCopy = responseTextElement.textContent.trim();
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Response copied to clipboard.');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    } else {
        alert('Nothing to copy.');
    }
}

            const deleteButton = document.createElement('button');
deleteButton.textContent = '🗑️ Delete';
deleteButton.className = 'btn btn-danger btn-sm';
deleteButton.onclick = () => {
    const confirmDeletion = confirm('Are you sure you want to delete this response?');
    if (confirmDeletion) {
        responseContainer.remove();
    }
};


            interactionContainer.appendChild(likeButton);
            interactionContainer.appendChild(dislikeButton);
            interactionContainer.appendChild(copyButton);
            interactionContainer.appendChild(deleteButton);

            responseContainer.appendChild(interactionContainer);

            const blankLine = document.createElement('div');
            blankLine.innerHTML = '&nbsp;';
            responseContainer.appendChild(blankLine);

            const divider = document.createElement('hr');
            divider.className = 'divider';
            responseContainer.appendChild(divider);

            scrollToBottom();

            promptInput.disabled = false;
            submitButton.disabled = false;
            stopButton.disabled = true;
            isProcessing = false;
            abortController = null;

            promptInput.value = '';
        }
    });

    stopButton.addEventListener('click', function() {
        if (abortController) {
            abortController.abort();
        }
    });
});
