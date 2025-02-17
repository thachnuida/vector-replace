
export type MessageTypes =
    Refresh               |
    RunSearchCommand      |
    RunReplaceCommand     |
    SetSelectionSearch    |
    SetUseRegExp          |
    SetCaptureWhole       |
    SetIgnoreCaseSearch   |
    SetIgnoreBangSearch   |
    SetIgnoreBangReplace  |
    SetIgnoreEmptyReplace |
    SetLoopSearch         |
    SetLoopReplace        |
    SetJustSearch         |
    SetMatrixSearch       |
    RequireInitData 

export interface Refresh {
    command: 'refresh'
}

export interface RunSearchCommand {
    command  : 'runSearch'
    searchStr: string
}

export interface RunReplaceCommand {
    command   : 'runReplace'
    searchStr : string
    replaceStr: string
}

export interface SetSelectionSearch {
    command: 'setSelectionSearch'
    value  : boolean
}

export interface SetUseRegExp {
    command: 'setUseRegExp'
    value  : boolean
}

export interface SetCaptureWhole {
    command: 'setCaptureWhole'
    value  : boolean
}

export interface SetIgnoreCaseSearch {
    command: 'setIgnoreCaseSearch'
    value  : boolean
}

export interface SetIgnoreBangSearch {
    command: 'setIgnoreBangSearch'
    value  : boolean
}

export interface SetIgnoreBangReplace {
    command: 'setIgnoreBangReplace'
    value  : boolean
}

export interface SetIgnoreEmptyReplace {
    command: 'setIgnoreEmptyReplace'
    value  : boolean
}

export interface SetLoopSearch {
    command: 'setLoopSearch'
    value  : boolean
}

export interface SetLoopReplace {
    command: 'setLoopReplace'
    value  : boolean
}

export interface SetJustSearch {
    command: 'setJustSearch'
    value  : boolean
}

export interface SetMatrixSearch {
    command: 'setMatrixSearch'
    value  : boolean
}

export interface RequireInitData {
    command: 'requireInitData'
}