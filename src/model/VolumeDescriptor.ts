import VolumeDescriptorTypeCode from '../enum/VolumeDescriptorTypeCode'
import IsoHelper from '../helper/IsoHelper'

export default class VolumeDescriptor {
    protected _data: Buffer
    constructor(data: Buffer) {
        this._data = data
    }
    public type(): VolumeDescriptorTypeCode {
        return this._data[0]
    }
    public standardIdentifier(): string {
        return IsoHelper.getASCIIString(this._data, 1, 5)
    }
    public version(): number {
        return this._data[6]
    }
    public data(): Buffer {
        return this._data.slice(7, 2048)
    }
}
