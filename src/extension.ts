import * as vscode from 'vscode';
import * as net from 'net';
import * as fs from 'fs';
import { posix } from 'path';
import { start } from 'repl';

const fileWatchers = new Map<string, vscode.FileSystemWatcher>();
let rspecDaemonTask: vscode.TaskExecution | undefined;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('rspec-daemon.invokeRSpecDaemon', invokeRSpecDaemon));
	context.subscriptions.push(vscode.commands.registerCommand('rspec-daemon.startRSpecForCurrentFile', startRSpecForCurrentFile));
	context.subscriptions.push(vscode.commands.registerCommand('rspec-daemon.stopRSpecDaemon', stopRSpecDaemon));
	context.subscriptions.push(vscode.commands.registerCommand('rspec-daemon.stopWatchers', stopWatchers));
	context.subscriptions.push(vscode.commands.registerCommand('rspec-daemon.watchCurrentFile', watchCurrentFile));
}

export function deactivate() {
	stopWatchers();
}

function startRSpecForCurrentFile() {
	const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
	startRSpec(filePath);
}

function startRSpec(filePath: string | undefined) {
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

	vscode.tasks.executeTask(task).then((process) => {
		rspecDaemonTask = process;
	});
}

function stopRSpecDaemon() {
	if (rspecDaemonTask) {
		rspecDaemonTask.terminate();
		rspecDaemonTask = undefined;
	}
}

function watchCurrentFile() {
	const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
	if (filePath) {
		const relativePath = vscode.workspace.asRelativePath(filePath);
		if (fileWatchers.has(filePath)) {
			vscode.window.showInformationMessage(`${relativePath} has already been watched`);
		} else {
			const watcher = vscode.workspace.createFileSystemWatcher(filePath);
			watcher.onDidChange((uri) => {
				startRSpec(uri.path)
			})
			fileWatchers.set(filePath, watcher);

			vscode.window.showInformationMessage(`Start watching ${relativePath}`);
		}
	} else {
		vscode.window.showErrorMessage('No file opened');
	}
}

function stopWatchers() {
	for (const watcher of fileWatchers.values()) {
		watcher.dispose();
	}
	fileWatchers.clear();

	vscode.window.showInformationMessage('Stop all watchers');
}
