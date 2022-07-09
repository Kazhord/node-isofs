import SystemUseEntry from './SystemUseEntry'

export default class PLEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public parentDirectoryLba(): number {
        return this._data.readUInt32LE(4)
    }
}
