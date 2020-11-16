import * as vscode from 'vscode';
import { addAnnotation } from './command';
import { updateDecorations } from './decorations';

export function activate(context: vscode.ExtensionContext) {
	let timeout: NodeJS.Timer | undefined = undefined;

	console.log('Extension now active.');

	// Context menu command to add a new annotation
	context.subscriptions.push(vscode.commands.registerCommand(
		'code-annotator.addAnnotation',
		addAnnotation
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
