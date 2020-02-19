
export type MessageTypes =
    Refresh           |
    RunSearchCommand  |
    RunReplaceCommand |
    SetUseRegExp      |
    SetIgnoreCaseSearch

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

export interface SetUseRegExp {
    command: 'setUseRegExp'
    value  : boolean
}

export interface SetIgnoreCaseSearch {
    command: 'setIgnoreCaseSearch'
    value  : boolean
}
