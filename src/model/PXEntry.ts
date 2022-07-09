import SystemUseEntry from './SystemUseEntry'

export default class PXEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public mode(): number {
        return this._data.readUInt32LE(4)
    }
    public fileLinks(): number {
        return this._data.readUInt32LE(12)
    }
    public uid(): number {
        return this._data.readUInt32LE(20)
    }
    public gid(): number {
        return this._data.readUInt32LE(28)
    }
    public inode(): number {
        return this._data.readUInt32LE(36)
    }
}
