import * as vscode from 'vscode';
import { storage, Annotation } from './storage';

const escapeRegExp = (s: String) => {
  return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

export async function addAnnotation() {
  let note = await vscode.window.showInputBox({ prompt: 'Enter an annotation for this line' });
  let textEditor = vscode.window.activeTextEditor;

  if (note && textEditor) {
    const currentLine = textEditor.document.lineAt(textEditor.selection.start.line);
    const text = escapeRegExp(textEditor.document.getText(currentLine.range));

    storage.addAnnotation(new Annotation(note, new RegExp(text)));
    vscode.commands.executeCommand('code-annotator.updateDecorations');
  }
}

export function removeAnnotation() {
  const isEqual = (a: Annotation, b: Annotation) => {
    return a.note === b.note && a.lineRegex.source === b.lineRegex.source;
  };

  let textEditor = vscode.window.activeTextEditor;

  if (textEditor) {
    const currentLine = textEditor.document.lineAt(textEditor.selection.start.line);
    const text = textEditor.document.getText(currentLine.range);
    const foundAnnotations = storage.getAnnotationForString(text);
    const allAnnotations = storage.annotations;

    if (foundAnnotations && foundAnnotations.length > 0) {
      const newAnnotations = allAnnotations?.filter(annotation => {
        return foundAnnotations.findIndex(a => isEqual(a, annotation)) === -1;
      });

      storage.annotations = newAnnotations;

      vscode.commands.executeCommand('code-annotator.updateDecorations');
    }
  }
}