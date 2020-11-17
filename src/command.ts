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
  let textEditor = vscode.window.activeTextEditor;

  if (textEditor) {
    // TODO: Implement removal

    vscode.commands.executeCommand('code-annotator.updateDecorations');
  }
}