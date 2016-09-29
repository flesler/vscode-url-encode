const vscode = require('vscode');
const Range = vscode.Range;
const pkg = require('./package.json');

const ACTIONS = {
	// TODO: Supporting encodeURI and decodeURI is trivial but seems pointless
	encodeURL: encodeURIComponent,
	decodeURL: decodeURIComponent
};

exports.activate = (context) => {
	pkg.contributes.commands.forEach((cmd) => {
		const disposable = vscode.commands.registerTextEditorCommand(cmd.command, (editor, editBuilder, args) => {
			const action = cmd.command.split('.')[1];
			const doc = editor.document;

			let ranges = editor.selections.map((s) => new Range(s.start, s.end));
			if (emptySelection(ranges)) {
				ranges = [selectAll(doc)];
			}

			ranges.forEach((range) => {
				const orig = doc.getText(range);
				editBuilder.replace(range, transform(orig, action));
			});
		});
		context.subscriptions.push(disposable);
	});
};

function emptySelection(ranges) {
	return ranges.length === 1 && ranges[0].isEmpty;
}

function selectAll(doc) {
	return doc.validateRange(new Range(0, 0, Infinity, Infinity));
}

function transform(str, action) {
	const cfg = vscode.workspace.getConfiguration(pkg.name);
	const transform = ACTIONS[action];
	if (cfg.encodeWhitespace) {
		return transform(str);
	}
	// Preserve new lines and tabs
	return str.replace(/([^\r\n\t]+)/g, transform);
}

// this method is called when your extension is deactivated
exports.deactivate = () => {
};
