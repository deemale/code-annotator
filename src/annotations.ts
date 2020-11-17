import * as vscode from 'vscode';
import { Annotation, storage } from './storage';

export function updateAnnotations(webview:vscode.Webview | undefined) {
  
  let activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    const text = activeEditor.document.getText();
    const foundAnnotations: vscode.DecorationOptions[] = [];

    let annotations:String[] = [];
    storage.annotations?.forEach((annotation: Annotation) => {
      let match = annotation.lineRegex.exec(text);
      
      if (match) {
        annotations.push(annotation.note);
      }

    });

    if(webview != null) {
      webview.postMessage({ type: 'addAnnotation', annotations: annotations });
     }
    }
  
}