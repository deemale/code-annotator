import * as vscode from 'vscode';
import { addAnnotation } from './command';
import { updateDecorations } from './decorations';
import { storage, IStorageInterface, Annotation } from './storage';

/**
 * Implements storage of Annotations to worspace storage
 */
class WorkspaceStorageInterface implements IStorageInterface {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private get currentFileName() : string | undefined {
    return vscode.window.activeTextEditor?.document.fileName;
  }

  getCurrentAnnotations() : Array<Annotation> {
    const documentName = this.currentFileName;

    if (documentName) {
      const stored: Array<Annotation> | undefined = this.context.workspaceState.get(documentName);

      if (stored) {
        return stored.map(item => new Annotation(item.note, new RegExp(item.lineRegex)));
      }
    }

    return [];
  }

  persistAnnotations(annotations: Array<Annotation>) {
    const documentName = this.currentFileName;

    if (documentName) {
      this.context.workspaceState.update(documentName, annotations.map(a => a.toSerializable()));
    }
  }

  resetStoredAnnotations() {
    const documentName = this.currentFileName;

    if (documentName) {
      this.context.workspaceState.update(documentName, []);
      console.log(`Reset annotations for ${documentName}`);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  let timeout: NodeJS.Timer | undefined = undefined;

  console.log('Extension now active.');

  const persistence = new WorkspaceStorageInterface(context);

  storage.storageInterface = persistence;

  // Context menu command to add a new annotation
  context.subscriptions.push(vscode.commands.registerCommand(
    'code-annotator.addAnnotation',
    addAnnotation
  ));

  // Clear annotations from storage
  context.subscriptions.push(vscode.commands.registerCommand(
    'code-annotator.clearAnnotations',
    () => persistence.resetStoredAnnotations(),
  ));

  // Command used to update the UI and re-render editor decorations
  // when annotations change
  context.subscriptions.push(vscode.commands.registerCommand(
    'code-annotator.updateDecorations',
    () => triggerUpdateAnnotations()
  ));

  const triggerUpdateAnnotations = () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      // TODO: Add other updates needed here (ex. re-rendering the sidebar UI)
      updateDecorations();
    }, 500);
  };

  if (vscode.window.activeTextEditor) {
    triggerUpdateAnnotations();
  }

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      triggerUpdateAnnotations();
    }
  });

  vscode.workspace.onDidChangeTextDocument(event => {
    if (vscode.window.activeTextEditor
        && event.document === vscode.window.activeTextEditor.document) {
      triggerUpdateAnnotations();
    }
  }, null, context.subscriptions);
}

export function deactivate() {}
