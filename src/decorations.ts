import * as vscode from 'vscode';
import { Annotation, storage } from './storage';

const annotationDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(0, 255, 0, 0.2)',
});

export function updateDecorations() {
  let activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    const text = activeEditor.document.getText();
    const foundAnnotations: vscode.DecorationOptions[] = [];
  
    storage.annotations?.forEach((annotation: Annotation) => {
      let match = annotation.lineRegex.exec(text);
  
      if (match) {
        const start = activeEditor!.document.positionAt(match.index);
        const end = activeEditor!.document.positionAt(match.index + match[0].length);
        
        foundAnnotations.push({
          range: new vscode.Range(start, end),
          hoverMessage: `Note: ${annotation.note}`,
        });
      }
    });
  
    activeEditor.setDecorations(annotationDecorationType, foundAnnotations);
  }
}