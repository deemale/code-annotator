import * as vscode from 'vscode';
import { addAnnotation } from './command';
import { updateDecorations } from './decorations';
import { updateAnnotations } from './annotations';
import { storage, IStorageInterface, Annotation } from './storage';

/**
 * Implements storage of Annotations to workspace storage
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
	  updateDecorations();
	  updateAnnotations(annotationsViewProvider.getWebview());
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

  //Creat annotations list view and add it to the side bar
  const annotationsViewProvider = new AnnotationsViewProvider(context.extensionUri);
  
  context.subscriptions.push(
	vscode.window.registerWebviewViewProvider(AnnotationsViewProvider.viewType, annotationsViewProvider));
}

class AnnotationsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'codeAnnotator.annotationsView';
	private _webview?: vscode.Webview;
	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		this._webview = webviewView.webview;

	}

	public getWebview() {
		return this._webview;
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = this.getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Code Annotations</title>
			</head>
			<body>
			<div class="annotation-list">
			</div>

				<button class="add-annotation-button">Add Annotation</button>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private getNonce() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}

export function deactivate() {}
