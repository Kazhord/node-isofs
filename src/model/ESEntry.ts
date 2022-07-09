import SystemUseEntry from './SystemUseEntry'

export default class ESEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public extensionSequence(): number {
        return this._data[4]
    }
}
