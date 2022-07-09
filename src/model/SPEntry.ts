import SystemUseEntry from './SystemUseEntry'

export default class SPEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public checkBytesPass(): boolean {
        return this._data[4] === 0xbe && this._data[5] === 0xef
    }
    public bytesSkipped(): number {
        return this._data[6]
    }
}
