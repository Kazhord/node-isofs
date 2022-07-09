import SystemUseEntry from './SystemUseEntry'

export default class SFEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public virtualSizeHigh(): number {
        return this._data.readUInt32LE(4)
    }
    public virtualSizeLow(): number {
        return this._data.readUInt32LE(12)
    }
    public tableDepth(): number {
        return this._data[20]
    }
}
