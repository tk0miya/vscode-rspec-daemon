import * as vscode from 'vscode';
import * as net from 'net';
import * as fs from 'fs';
import { posix } from 'path';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('rspec-daemon.invokeRSpecDaemon', invokeRSpecDaemon));
	context.subscriptions.push(vscode.commands.registerCommand('rspec-daemon.startRSpecForCurrentFile', startRSpecForCurrentFile));
}

export function deactivate() { }

function startRSpecForCurrentFile() {
	const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
	const relativePath = filePath ? vscode.workspace.asRelativePath(filePath) : '';
	if (!filePath) {
		vscode.window.showErrorMessage('Please open .spec file to run spec');
	} else if (filePath.endsWith('_spec.rb')) {
		runSpec(relativePath);
	} else if (filePath.endsWith('.rb')) {
		const path = guessSpecFilePath(vscode.workspace.rootPath, relativePath);
		if (path) {
			runSpec(path);
		} else {
			vscode.window.showErrorMessage(`Failed to find a spec file for ${relativePath}`);
		}
	} else {
		vscode.window.showErrorMessage(`${relativePath} is not a spec file`);
	}
}

function runSpec(filePath: string) {
	const client = net.connect(3002, 'localhost', () => {
		client.write(filePath);
		client.end();
	})
	client.on('error', () => {
		vscode.window.showErrorMessage(`Failed to run spec: ${filePath}`);
	})
}

function guessSpecFilePath(rootPath: string | undefined, filePath: string): string | undefined {
	if (rootPath === undefined) {
		return undefined;
	}

	if (filePath.startsWith('app/controllers/')) {
		const path = filePath.replace('app/controllers/', 'spec/requests/').replace('_controller.rb', '_spec.rb');
		const absolutePath = posix.join(rootPath, path);
		if (fs.existsSync(absolutePath)) {
			return path;
		} else {
			vscode.window.showInformationMessage(`Searching for ${path} ...`);
		}
	}

	if (filePath.startsWith('app/')) {
		const path = filePath.replace('app/', 'spec/').replace('.rb', '_spec.rb');
		const absolutePath = posix.join(rootPath, path);
		if (fs.existsSync(absolutePath)) {
			return path;
		} else {
			vscode.window.showInformationMessage(`Searching for ${path} ...`);
		}
	}

	return undefined;
}

function invokeRSpecDaemon() {
	const execution = new vscode.ShellExecution("bundle exec rspec-daemon");
	const task = new vscode.Task({ type: '' }, vscode.TaskScope.Workspace, "rspec-daemon", "rspec-daemon", execution);

	vscode.tasks.executeTask(task);
}
