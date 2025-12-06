document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.querySelector('#textInput');
    const copyBtn = document.querySelector('#copyBtn');
    const pasteBtn = document.querySelector('#pasteBtn');
    const statusMessage = document.querySelector('#statusMessage');
    const clearBtn = document.querySelector('#clearBtn');
    const historyList = document.querySelector('#historyList');

    const showStatus = (message, isError = false) => {
        statusMessage.textContent = message;
        statusMessage.style.backgroundColor = isError ? '#ef4444' : '#10b981';
        statusMessage.classList.remove('hidden');

        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 2000);
    };

    let clipboardHistory = [];

    const loadHistory = () => {
        const stored = localStorage.getItem('clipboardHistory');
        if (stored) {
            try {
                clipboardHistory = JSON.parse(stored);
                renderHistory();
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    };

    const saveHistory = () => {
        localStorage.setItem('clipboardHistory', JSON.stringify(clipboardHistory));
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        clipboardHistory.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.textContent = item;
            li.title = "Click to append";

            li.addEventListener('click', () => {
                textInput.value += item;
                showStatus('Appended from history!');
                li.style.borderColor = '#10b981';
                setTimeout(() => li.style.borderColor = 'transparent', 300);
            });

            historyList.appendChild(li);
        });
    };

    const addToHistory = (text) => {
        if (!text || !text.trim()) return;
        clipboardHistory = clipboardHistory.filter(item => item !== text);
        clipboardHistory.unshift(text);
        if (clipboardHistory.length > 5) {
            clipboardHistory.pop();
        }
        saveHistory();
        renderHistory();
    };

    loadHistory();

    copyBtn.addEventListener('click', async () => {
        const content = textInput.value;
        if (!content) {
            showStatus('Nothing to copy!', true);
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            addToHistory(content);
            showStatus('Copied!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            showStatus('Failed to copy', true);
        }
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            addToHistory(text);
            textInput.value += text;
            textInput.focus();
            showStatus('Pasted!');
            textInput.style.transition = 'background-color 0.2s';
            textInput.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            setTimeout(() => {
                textInput.style.backgroundColor = '';
            }, 200);

        } catch (err) {
            console.error('Failed to paste: ', err);
            showStatus('Failed to paste (Allow permissions)', true);
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            textInput.focus();
            showStatus('Cleared!');
        });
    }
});
