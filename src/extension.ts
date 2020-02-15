import * as vscode     from 'vscode'
import * as fs         from 'fs'
import * as path       from 'path'
import * as state      from './states/state'
import * as behaviour  from './messages/behaviour'

let panelIsVisible = false

export const activate = (context: vscode.ExtensionContext) => {
    const showView = vscode.commands.registerCommand('vectorreplace.showView', showViewCommand(context))
    context.subscriptions.push(showView)
}

const showViewCommand = (context: vscode.ExtensionContext) => () => {
    if (panelIsVisible) return
    panelIsVisible = true

    const editor = vscode.window.activeTextEditor
    const panel  = createPanel(context)
    const st     = state.create(editor)
    listenEvents(panel, st)
}

const createPanel = (context: vscode.ExtensionContext) => {
    const panel = vscode.window.createWebviewPanel('vectorreplace', 'Vector Replace', vscode.ViewColumn.Beside, { enableScripts: true })
    
    const htmlPath = path.join(context.extensionPath, 'media', 'views', 'vector-replace.html')
    readAndSetHtmlToWebview(panel.webview, htmlPath)

    return panel
}

const readAndSetHtmlToWebview = (webview: vscode.Webview, htmlPath: string) => {
    fs.readFile(htmlPath, 'utf8', (err, data) => {
        if (err) throw err
        webview.html = data
    })
}

const listenEvents = (panel: vscode.WebviewPanel, st: state.State) => {
    panel.webview.onDidReceiveMessage(mes => behaviour.execute(mes, st))

    let refreshTimeout: NodeJS.Timeout | undefined = undefined

    const events = [
        vscode.window.onDidChangeActiveTextEditor(editor => state.setEditor(st, editor)),
        vscode.workspace.onDidChangeTextDocument(() => {
            if (refreshTimeout) clearTimeout(refreshTimeout)
            refreshTimeout = setTimeout(() => behaviour.refresh(st), 500)
        })
    ]

    panel.onDidDispose(() => {
        state.dispose(st)
        events.forEach(d => d.dispose())
        panelIsVisible = false
    })
}

export const deactivate = () => {}
