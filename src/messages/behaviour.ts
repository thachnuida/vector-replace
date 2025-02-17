import * as vscode       from 'vscode'
import * as logic        from '../core/logic'
import * as coreTypes    from '../core/types'
import * as messageTypes from './types'
import * as state        from '../states/state'
import * as rangeUtil    from '../util/range'

export const execute = async (context: vscode.ExtensionContext, message: messageTypes.MessageTypes, st: state.State) => {
    switch (message.command) {
        case 'refresh':
            await refresh(st)
            return
        case 'runSearch':
            await runSearch(message, st)
            return
        case 'runReplace':
            if (context) {
                context.globalState.update('searchStr', message.searchStr);
                context.globalState.update('replaceStr', message.replaceStr);
            }
            await runReplace(message, st)
            return
        case 'setSelectionSearch':
            await setSelectionSearch(message, st)
            return
        case 'setUseRegExp':
            await setUseRegExp(message, st)
            return
        case 'setCaptureWhole':
            await setCaptureWhole(message, st)
            return
        case 'setIgnoreCaseSearch':
            await setIgnoreCaseSearch(message, st)
            return
        case 'setIgnoreBangSearch':
            await setIgnoreBangSearch(message, st)
            return
        case 'setIgnoreBangReplace':
            setIgnoreBangReplace(message, st)
            return
        case 'setIgnoreEmptyReplace':
            setIgnoreEmptyReplace(message, st)
            return
        case 'setLoopSearch':
            await setLoopSearch(message, st)
            return
        case 'setLoopReplace':
            setLoopReplace(message, st)
            return
        case 'setJustSearch':
            await setJustSearch(message, st)
            return
        case 'setMatrixSearch':
            await setMatrixSearch(message, st)
            return
        case 'requireInitData':
            state.initWebViewData(context, st);
            return;
    }
}

export const refresh = async (st: state.State) => {
    if (!st.editor) return

    logic.setInput     (st.vr, getInput(st.editor))
    logic.setSelections(st.vr, getSelections(st.editor))

    state.resetProcessObject(st)
    const po = st.processObject!
    await runSearchWithProgress (st, po)
    if (po.isCancelled) {
        state.clearProcessObject(st, po)
        return
    }
    state.clearProcessObject(st, po)
    
    decorate(st.editor, st.decoration, st.vr.matches)
}

const runSearch = async (message: messageTypes.RunSearchCommand, st: state.State) => {
    logic.setSearchStrings(st.vr, message.searchStr)
    
    if (!st.editor) return
    
    logic.setInput     (st.vr, getInput    (st.editor))
    logic.setSelections(st.vr, getSelections(st.editor))

    state.resetProcessObject(st)
    const po = st.processObject!
    await runSearchWithProgress (st, po)
    if (po.isCancelled) {
        state.clearProcessObject(st, po)
        return
    }
    state.clearProcessObject(st, po)

    decorate(st.editor, st.decoration, st.vr.matches)
}

const runReplace = async (message: messageTypes.RunReplaceCommand, st: state.State) => {
    logic.setSearchStrings (st.vr, message.searchStr)
    logic.setReplaceStrings(st.vr, message.replaceStr)

    if (!st.editor) return

    decorate(st.editor, st.decoration, [])
    logic.setInput     (st.vr, getInput(st.editor))
    logic.setSelections(st.vr, getSelections(st.editor))

    state.resetProcessObject(st)
    const po = st.processObject!
    await runSearchWithProgress (st, po)
    if (po.isCancelled) {
        state.clearProcessObject(st, po)
        return
    }
    await runReplaceWithProgress(st, po)
    if (po.isCancelled) {
        state.clearProcessObject(st, po)
        return
    }
    state.clearProcessObject(st, po)

    await setOutput(st.editor, st.vr.text)
}

const setSelectionSearch = async (message: messageTypes.SetSelectionSearch, st: state.State) => {
    logic.setSelectionSearch(st.vr, message.value)
    await updateSearchParam(st)
}

const setUseRegExp = async (message: messageTypes.SetUseRegExp, st: state.State) => {
    logic.setUseRegExp(st.vr, message.value)
    await updateSearchParam(st)
}

const setCaptureWhole = async (message: messageTypes.SetCaptureWhole, st: state.State) => {
    logic.setCaptureWhole(st.vr, message.value)
    await updateSearchParam(st)
}

const setIgnoreCaseSearch = async (message: messageTypes.SetIgnoreCaseSearch, st: state.State) => {
    logic.setIgnoreCaseSearch(st.vr, message.value)
    await updateSearchParam(st)
}

const setIgnoreBangSearch = async (message: messageTypes.SetIgnoreBangSearch, st: state.State) => {
    logic.setIgnoreBangSearch(st.vr, message.value)
    await updateSearchParam(st)
}

const setIgnoreBangReplace = (message: messageTypes.SetIgnoreBangReplace, st: state.State) => {
    logic.setIgnoreBangReplace(st.vr, message.value)
    updateReplaceParam(st)
}

const setIgnoreEmptyReplace = (message: messageTypes.SetIgnoreEmptyReplace, st: state.State) => {
    logic.setIgnoreEmptyReplace(st.vr, message.value)
    updateReplaceParam(st)
}

const setLoopSearch = async (message: messageTypes.SetLoopSearch, st: state.State) => {
    logic.setLoopSearch(st.vr, message.value)
    await updateSearchParam(st)
}

const setLoopReplace = (message: messageTypes.SetLoopReplace, st: state.State) => {
    logic.setLoopReplace(st.vr, message.value)
    updateReplaceParam(st)
}

const setJustSearch = async (message: messageTypes.SetJustSearch, st: state.State) => {
    logic.setJustSearch(st.vr, message.value)
    await updateSearchParam(st)
}

const setMatrixSearch = async (message: messageTypes.SetMatrixSearch, st: state.State) => {
    logic.setMatrixSearch(st.vr, message.value)
    await updateSearchParam(st)
}

const updateSearchParam = async (st: state.State) => {
    logic.setSearchFuncs(st.vr)

    state.resetProcessObject(st)
    const po = st.processObject!
    await runSearchWithProgress (st, po)
    if (po.isCancelled) {
        state.clearProcessObject(st, po)
        return
    }
    state.clearProcessObject(st, po)

    if (!st.editor) return

    decorate(st.editor, st.decoration, st.vr.matches)
}

const updateReplaceParam = (st: state.State) => {
    logic.setReplaceFuncs(st.vr)
}

const getInput = (editor: vscode.TextEditor) => {
    return editor.document.getText()
}

const getSelections = (editor: vscode.TextEditor) => {
    const positions = editor.selections
        .map(sel => [sel.start, sel.end])
        .flat()
    
    return rangeUtil.toIndicesFromPositions(editor.document.getText(), positions)
}

const decorate = (
    editor    : vscode.TextEditor,
    decoration: vscode.TextEditorDecorationType,
    matches   : coreTypes.MatchResult[]
) => {
    const ranges = rangeUtil.createRanges(matches)
    editor.setDecorations(decoration, ranges)
}

const setOutput = async (editor: vscode.TextEditor, text: string) => {
    await editor.edit(edit => {
        const range = new vscode.Range(0, 0, editor.document.lineCount, 0)
        edit.replace(range, text)
    })
}

const runSearchWithProgress = async (st: state.State, po: state.ProcessObject) => {
    await runWithProgressCore(st, logic.runSearch, po, 'Searching', st.vr.params.matrixSearch ? st.vr.text.length * st.vr.searchFuncs.length : st.vr.text.length)
}

const runReplaceWithProgress = async (st: state.State, po: state.ProcessObject) => {
    await runWithProgressCore(st, logic.runReplace, po, 'Replacing', st.vr.text.length)
}

const runWithProgressCore = async (
    st         : state.State,
    runLogic   : (vr: coreTypes.VectorReplace, po: state.ProcessObject) => Generator<number, void>,
    po         : state.ProcessObject,
    method     : string,
    maxProgress: number
) => {
    const gen = runLogic(st.vr, po)
    while (true) {
        let next = gen.next()

        for (let i = 0; i < 1000; i++) {
            if (next.done) return
            next = gen.next()
        }

        if (next.done) return
        state.reportProgress(st, po, method, next.value / maxProgress)

        await delay(1)
    }
}

const delay = (ms: number): Promise<void> => {
    return new Promise((res, rej) => setTimeout(() => res(), ms))
}
