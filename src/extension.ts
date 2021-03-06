'use strict';

export const extensionId = 'remotehub';
export const extensionOutputChannelName = 'RemoteHub';
export const qualifiedExtensionId = `eamodio.${extensionId}`;

import { ExtensionContext } from 'vscode';
import { Commands } from './commands';
import { configuration, IConfig } from './configuration';
import { GitHubApi } from './gitHubApi';
import { GitHubFileSystemProvider } from './githubFileSystemProvider';
import { Logger } from './logger';
import { RemoteLanguageProvider } from './remoteLanguageProvider';
import { SourcegraphApi } from './sourcegraphApi';

export async function activate(context: ExtensionContext) {
    Logger.configure(context);

    const github = new GitHubApi();
    const commands = new Commands(github);

    const cfg = configuration.get<IConfig>();
    if (!cfg.githubToken) {
        await commands.ensureTokens();
    }

    const sourcegraph = new SourcegraphApi(github);
    context.subscriptions.push(
        github,
        sourcegraph,
        commands,
        new RemoteLanguageProvider(sourcegraph),
        new GitHubFileSystemProvider(github)
    );
}

export function deactivate() { }
