import SystemUseEntry from './SystemUseEntry'

export default class PNEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public devTHigh(): number {
        return this._data.readUInt32LE(4)
    }
    public devTLow(): number {
        return this._data.readUInt32LE(12)
    }
}
