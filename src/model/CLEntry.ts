import SystemUseEntry from './SystemUseEntry'

export default class CLEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public childDirectoryLba(): number {
        return this._data.readUInt32LE(4)
    }
}
