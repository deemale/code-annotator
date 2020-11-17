import * as vscode from 'vscode';
import { storage, Annotation } from './storage';

// Thanks stackoverflow
const uuidv4 = () : string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const escapeRegExp = (s: String) => {
  return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

export async function addAnnotation() {
  let note = await vscode.window.showInputBox({ prompt: 'Enter an annotation for this line' });
  let textEditor = vscode.window.activeTextEditor;

  if (note && textEditor) {
    const currentLine = textEditor.document.lineAt(textEditor.selection.start.line);
    const text = escapeRegExp(textEditor.document.getText(currentLine.range));
    const id = uuidv4();

    storage.addAnnotation(new Annotation(note, new RegExp(text), id));
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