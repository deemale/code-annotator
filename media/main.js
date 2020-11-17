//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    const oldState = vscode.getState() || { annotations: [] };

    /** @type {Array<{ value: string }>} */
    let annotations = oldState.annotations;

    updateAnnotationList(annotations);

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'addAnnotation':
                {
                    addAnnotation(message.annotations);
                    break;
                }
            case 'highlightAnnotation':
                {
                    highlightAnnotation(message.lineNumber);
                    break;
                }
        }
    });

    function createElement(str) {
        const element = document.createElement('div');
        element.innerHTML = str;
        return element.firstChild;
    }

    function updateAnnotationList(annotations) {
        const div = document.querySelector('.annotation-list');
        div.textContent = '';
        for (const annotation of annotations) {
            const annotationPreview = document.createElement('div');
            annotationPreview.className = 'annotation';
            annotationPreview.id = "annotation-" + annotation.line;

            const lineNumber = createElement(`<div class="line-number"><label>Line:</label>${annotation.line}</div>`);
            const annotationText = createElement(`<div class="annotation-text">${annotation.annotation.note}</div>`);

            annotationPreview.appendChild(lineNumber);
            annotationPreview.appendChild(annotationText);
            div.appendChild(annotationPreview);
        }

        // Update the saved state
        vscode.setState({ annotations: annotations });
    }

    function addAnnotation(data) {
        annotations = data;
        updateAnnotationList(annotations);
    }

    function highlightAnnotation(lineNumber) {
        const annotationDivs = document.querySelector('.annotation-list').getElementsByTagName('div');
        let i = 0;
        for( i=0; i< annotationDivs.length; i++ )
        {
            if(annotationDivs[i].id === "annotation-" + (lineNumber + 1)) {
                annotationDivs[i].classList.add('annotation-selected');
                window.scroll(0, annotationDivs[i].offsetTop);
            } else {
                annotationDivs[i].classList.remove('annotation-selected');
            }
        }
    }
}());


