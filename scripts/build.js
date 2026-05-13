#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const args = new Set(process.argv.slice(2));
const mode = args.has('--mode')
	? process.argv[process.argv.indexOf('--mode') + 1]
	: (args.has('--production') ? 'production' : 'development');

function log(message) {
	process.stdout.write(`[build] ${message}\n`);
}

function copyFile(from, to) {
	if (!fs.existsSync(from)) {
		log(`skip missing file ${path.relative(root, from)}`);
		return;
	}

	fs.mkdirSync(path.dirname(to), { recursive: true });
	fs.copyFileSync(from, to);
	log(`copy ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}

function copyDirectory(from, to) {
	if (!fs.existsSync(from)) {
		log(`skip missing directory ${path.relative(root, from)}`);
		return;
	}

	for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
		const source = path.join(from, entry.name);
		const target = path.join(to, entry.name);

		if (entry.isDirectory()) {
			copyDirectory(source, target);
		} else if (entry.isFile()) {
			copyFile(source, target);
		}
	}
}

function runWebpack() {
	const configPath = mode === 'production' ? '../webpack.prod.js' : '../webpack.dev.js';
	const config = require(configPath);

	return new Promise((resolve, reject) => {
		webpack(config, (err, stats) => {
			if (err) {
				reject(err);
				return;
			}

			const info = stats.toJson();
			if (stats.hasErrors()) {
				reject(new Error(info.errors.join('\n')));
				return;
			}

			if (stats.hasWarnings()) {
				info.warnings.forEach((warning) => log(`webpack warning: ${warning}`));
			}

			log(stats.toString({ colors: true, chunks: false, modules: false }));
			resolve();
		});
	});
}

async function main() {
	const preservedAssets = path.join(root, '.build-assets.tmp');
	if (fs.existsSync(preservedAssets)) fs.rmSync(preservedAssets, { recursive: true, force: true });
	if (fs.existsSync(path.join(dist, 'assets'))) {
		fs.renameSync(path.join(dist, 'assets'), preservedAssets);
	}

	fs.rmSync(dist, { recursive: true, force: true });
	fs.mkdirSync(dist, { recursive: true });
	if (fs.existsSync(preservedAssets)) {
		fs.renameSync(preservedAssets, path.join(dist, 'assets'));
		log('preserve dist/assets');
	}

	copyFile(path.join(root, 'src/index.html'), path.join(dist, 'index.html'));
	copyFile(path.join(root, 'loading.png'), path.join(dist, 'loading.png'));
	copyDirectory(path.join(root, 'data'), path.join(dist, 'data'));
	copyDirectory(path.join(root, 'assets'), path.join(dist, 'assets'));
	copyDirectory(path.join(root, 'ui'), path.join(dist, 'ui'));
	copyDirectory(path.join(root, 'topography'), path.join(dist, 'assets/topography'));
	copyDirectory(path.join(root, 'progress'), path.join(dist, 'progress'));
	copyDirectory(path.join(root, 'info'), path.join(dist, 'info'));
	copyDirectory(path.join(root, 'demo'), path.join(dist, 'demo'));

	copyFile(path.join(root, 'src/style.css'), path.join(dist, 'style.css'));

	copyFile(
		path.join(root, 'node_modules/phaser-ce/build/phaser.min.js'),
		path.join(dist, 'phaser.min.js')
	);

	await runWebpack();
	log(`${mode} build complete`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
