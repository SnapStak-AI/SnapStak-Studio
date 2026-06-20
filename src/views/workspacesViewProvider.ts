/**
 * SnapStak Workspaces View Provider
 * Shows the file tree of the currently selected extracted project.
 * Clicking index.html always opens the shared browser webview panel,
 * regardless of which sidebar tab is active.
 */

import * as vscode from 'vscode';
import * as fs     from 'fs';
import * as path   from 'path';

// ─────────────────────────────────────────────────────────────
// TREE ITEMS
// ─────────────────────────────────────────────────────────────

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly filePath   : string,
    public readonly isDirectory: boolean
  ) {
    super(
      path.basename(filePath),
      isDirectory
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    this.resourceUri = vscode.Uri.file(filePath);
    this.iconPath    = isDirectory ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;

    const fileName = path.basename(filePath).toLowerCase();

    if (!isDirectory) {

      // index.html — always opens the shared browser webview
      if (fileName === 'index.html') {
        this.contextValue = 'indexFile';
        this.command = {
          command  : 'snapstak.runProject',
          title    : 'Run Project',
          arguments: [filePath]
        };
        this.iconPath = new vscode.ThemeIcon(
          'play-circle',
          new vscode.ThemeColor('terminal.ansiGreen')
        );

      // schema.layout.json — opens the database canvas
      } else if (fileName === 'schema.layout.json') {
        this.contextValue = 'schemaLayout';
        this.iconPath = new vscode.ThemeIcon('database');
        this.command = {
          command  : 'snapstak.openSchemaFile',
          title    : 'Open Schema Canvas',
          arguments: [vscode.Uri.file(filePath)]
        };

      // all other files — open in VS Code editor
      } else {
        this.contextValue = 'file';
        this.command = {
          command  : 'vscode.open',
          title    : 'Open File',
          arguments: [vscode.Uri.file(filePath)]
        };
      }

    } else {
      this.contextValue = 'folder';
    }
  }
}

export class WorkspaceMessageItem extends vscode.TreeItem {
  constructor(message: string, icon = 'info') {
    super(message, vscode.TreeItemCollapsibleState.None);
    this.iconPath     = new vscode.ThemeIcon(icon);
    this.contextValue = 'message';
  }
}

// ─────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────

const SKIP_FOLDERS = new Set([
  'node_modules', '.git', '.vscode', 'dist', 'out', 'build', '.next', '.cache'
]);

export class WorkspacesViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

  public static readonly viewId = 'snapstak.workspacesView';

  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData  = this._onDidChangeTreeData.event;

  private projectRoot: string | null = null;

  constructor() {}

  setProject(projectRoot: string | null): void {
    this.projectRoot = projectRoot;
    this._onDidChangeTreeData.fire();
  }

  getProjectRoot(): string | null {
    return this.projectRoot;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    if (!this.projectRoot) {
      return [new WorkspaceMessageItem('Click an extracted project in Local Projects', 'folder')];
    }

    if (!fs.existsSync(this.projectRoot)) {
      return [new WorkspaceMessageItem('Project folder not found', 'error')];
    }

    const dirToRead = element instanceof FileItem && element.isDirectory
      ? element.filePath
      : this.projectRoot;

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dirToRead, { withFileTypes: true });
    } catch {
      return [new WorkspaceMessageItem('Cannot read folder', 'error')];
    }

    const folders = entries
      .filter(e => e.isDirectory() && !SKIP_FOLDERS.has(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    const files = entries
      .filter(e => e.isFile())
      .sort((a, b) => {
        if (a.name.toLowerCase() === 'index.html') { return -1; }
        if (b.name.toLowerCase() === 'index.html') { return  1; }
        return a.name.localeCompare(b.name);
      });

    return [...folders, ...files].map(e =>
      new FileItem(path.join(dirToRead, e.name), e.isDirectory())
    );
  }
}
