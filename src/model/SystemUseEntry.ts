import SystemUseEntrySignatures from '../enum/SystemUseEntrySignatures'
import IsoHelper from '../helper/IsoHelper'

export default class SystemUseEntry {
    protected _data: Buffer
    constructor(data: Buffer) {
        this._data = data
    }
    public signatureWord(): SystemUseEntrySignatures {
        return this._data.readUInt16BE(0)
    }
    public signatureWordString(): string {
        return IsoHelper.getASCIIString(this._data, 0, 2)
    }
    public length(): number {
        return this._data[2]
    }
    public suVersion(): number {
        return this._data[3]
    }
}
