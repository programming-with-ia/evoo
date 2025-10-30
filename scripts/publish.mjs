import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execa } from 'execa';

const __dirname = new URL('.', import.meta.url).pathname;
const rootDir = resolve(__dirname, '..');

async function getPackages(dir) {
    const packagesDir = join(rootDir, dir);
    const packageDirs = await readdir(packagesDir, { withFileTypes: true });
    const packagePaths = [];
    for (const dirent of packageDirs) {
        if (dirent.isDirectory()) {
            const packageJsonPath = join(packagesDir, dirent.name, 'package.json');
            try {
                const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
                const packageJson = JSON.parse(packageJsonContent);
                if (!packageJson.private) {
                    packagePaths.push({
                        name: packageJson.name,
                        version: packageJson.version,
                        path: join(packagesDir, dirent.name),
                    });
                }
            } catch (error) {
                // Ignore directories without package.json
            }
        }
    }
    return packagePaths;
}

import { writeFile } from 'node:fs/promises';

function getTagFromVersion(version) {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    const preReleaseRegex = /^\d+\.\d+\.\d+-([a-zA-Z]+)(?:\.\d+)?$/;

    if (semverRegex.test(version)) {
        return 'latest';
    }

    const preReleaseMatch = version.match(preReleaseRegex);
    if (preReleaseMatch) {
        return preReleaseMatch[1];
    }

    throw new Error(`Invalid version format: ${version}. Cannot determine npm tag.`);
}

async function publishPackage(pkg, isCli = false) {
    console.log(`\nChecking package: ${pkg.name}@${pkg.version}`);
    let shouldPublish = false;

    try {
        const { stdout } = await execa('npm', ['view', pkg.name, 'versions', '--json']);
        const publishedVersions = JSON.parse(stdout);

        if (!publishedVersions.includes(pkg.version)) {
            shouldPublish = true;
            console.log(`Version ${pkg.version} not found on npm. Preparing to publish...`);
        } else {
            console.log(`Version ${pkg.version} already exists on npm. Skipping.`);
        }
    } catch (error) {
        if (error.stderr.includes('E404')) {
            console.log(`Package ${pkg.name} not found on npm. Preparing to publish...`);
            shouldPublish = true;
        } else {
            console.error(`Error checking npm versions for ${pkg.name}:`, error);
            process.exit(1);
        }
    }

    if (shouldPublish) {
        const tag = getTagFromVersion(pkg.version);
        console.log(`Publishing ${pkg.name}@${pkg.version} with tag "${tag}"...`);
        await execa('npm', ['publish', '--access', 'public', '--tag', tag], { cwd: pkg.path, stdio: 'inherit' });
        console.log(`Successfully published ${pkg.name}@${pkg.version}`);

        if (isCli) {
            await publishCliAlias(pkg);
        }
    }
}

async function publishCliAlias(cliPkg) {
    console.log('\nPublishing evoo alias...');
    const aliasPkgName = 'evoo';
    const cliBuildPath = join(cliPkg.path, 'dist');
    const packageJsonPath = join(cliBuildPath, 'package.json');
    let originalPackageJsonContent = null;

    try {
        originalPackageJsonContent = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(originalPackageJsonContent);
        packageJson.name = aliasPkgName;

        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

        console.log(`Temporarily changed package name to "${aliasPkgName}"`);

        const tag = getTagFromVersion(cliPkg.version);
        console.log(`Publishing ${aliasPkgName}@${cliPkg.version} with tag "${tag}"...`);
        await execa('npm', ['publish', '--access', 'public', '--tag', tag], { cwd: cliBuildPath, stdio: 'inherit' });
        console.log(`Successfully published ${aliasPkgName}@${cliPkg.version}`);

    } catch (error) {
        console.error('Error publishing CLI alias:', error);
        process.exit(1);
    } finally {
        if (originalPackageJsonContent) {
            await writeFile(packageJsonPath, originalPackageJsonContent);
            console.log('Restored original package.json in dist.');
        }
    }
}

async function synchronizeVersions() {
    console.log('Synchronizing package versions...');

    const corePackageJsonPath = join(rootDir, 'packages', 'core', 'package.json');
    const corePackageJsonContent = await readFile(corePackageJsonPath, 'utf-8');
    const corePackageJson = JSON.parse(corePackageJsonContent);
    const coreVersion = corePackageJson.version;
    console.log(`Source version from @evoo/core is ${coreVersion}`);

    const packages = await getPackages('packages');
    const plugins = await getPackages('plugins');
    const allPackages = [...packages, ...plugins];

    for (const pkg of allPackages) {
        const packageJsonPath = join(pkg.path, 'package.json');
        const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);

        let changed = false;

        if (packageJson.name === '@evoo/cli') {
            if (packageJson.version !== coreVersion) {
                console.log(`Updating @evoo/cli version from ${packageJson.version} to ${coreVersion}`);
                packageJson.version = coreVersion;
                changed = true;
            }
        }

        const isCli = packageJson.name === '@evoo/cli';
        const newCoreDepVersion = isCli ? coreVersion : `^${coreVersion}`;

        if (packageJson.dependencies && packageJson.dependencies['@evoo/core']) {
            if (packageJson.dependencies['@evoo/core'] !== newCoreDepVersion) {
                console.log(`Updating @evoo/core dependency in ${packageJson.name}`);
                packageJson.dependencies['@evoo/core'] = newCoreDepVersion;
                changed = true;
            }
        }

        if (packageJson.peerDependencies && packageJson.peerDependencies['@evoo/core']) {
            if (packageJson.peerDependencies['@evoo/core'] !== newCoreDepVersion) {
                console.log(`Updating @evoo/core peerDependency in ${packageJson.name}`);
                packageJson.peerDependencies['@evoo/core'] = newCoreDepVersion;
                changed = true;
            }
        }

        if (changed) {
            await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`- Wrote changes to ${packageJsonPath}`);
        }
    }
    console.log('Version synchronization complete.');
}

async function main() {
    await synchronizeVersions();

    const packages = await getPackages('packages');
    const plugins = await getPackages('plugins');

    const allPackages = [...packages, ...plugins];

    const publishOrder = ['@evoo/core', '@evoo/cli'];
    const sortedPackages = allPackages.sort((a, b) => {
        const aIndex = publishOrder.indexOf(a.name);
        const bIndex = publishOrder.indexOf(b.name);

        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        if (aIndex !== -1) {
            return -1;
        }
        if (bIndex !== -1) {
            return 1;
        }
        return a.name.localeCompare(b.name);
    });

    console.log('Packages to publish (in order):', sortedPackages.map(p => p.name));

    for (const pkg of sortedPackages) {
        await publishPackage(pkg, pkg.name === '@evoo/cli');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
