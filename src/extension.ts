import * as vscode from 'vscode';
import * as net from 'net';

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
	} else if (!filePath.endsWith('_spec.rb')) {
		vscode.window.showErrorMessage(`${relativePath} is not a spec file`);
	} else {
		const client = net.connect(3002, 'localhost', () => {
			client.write(filePath);
			client.end();
		})
		client.on('data', (msg) => {
			client.destroy();
		})
		client.on('error', () => {
			vscode.window.showErrorMessage(`Failed to run spec: ${relativePath}`);
		})
	}
}

function invokeRSpecDaemon() {
	const terminal = vscode.window.createTerminal("rspec-daemon");
	terminal.show();
	terminal.sendText('bundle exec rspec-daemon', true)
}
