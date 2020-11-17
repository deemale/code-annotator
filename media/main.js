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
        }
    });
   
    function updateAnnotationList(annotations) {
        const div = document.querySelector('.annotation-list');
        div.textContent = '';
        for (const annotation of annotations) {
            const annotationPreview = document.createElement('div');
            annotationPreview.textContent = " Line: " + `${annotation.line}` + "  " + `${annotation.annotation.note}`;
            div.appendChild(annotationPreview);
        }

        // Update the saved state
        vscode.setState({ annotations: annotations });
    }

    function addAnnotation(data) {
        annotations = data;
        updateAnnotationList(annotations);
    }
}());


