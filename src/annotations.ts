import * as vscode from 'vscode';
import { Annotation, storage } from './storage';

export function updateAnnotations(webview:vscode.Webview | undefined) {
  
  let activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    const text = activeEditor.document.getText();

    let annotations:{line: number, annotation: Annotation}[] = [];
    storage.annotations?.forEach((annotation: Annotation) => {
      const match = annotation.lineRegex.exec(text);

      if (match) {
        const position = activeEditor!.document.positionAt(match.index);
        annotations.push({ line: position.line + 1, annotation: annotation });
      }

    });

    if(webview) {
      webview.postMessage({
        type: 'addAnnotation',
        annotations: annotations.sort((a, b) => a.line - b.line)
      });
     }
    }
}

export function highlightAnnotation(webview:vscode.Webview | undefined, lineNumber:number) {
  if(webview) {
    webview.postMessage({
      type: 'highlightAnnotation',
      lineNumber: lineNumber
    });
   }
}