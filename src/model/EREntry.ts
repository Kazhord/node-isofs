import IsoHelper from '../helper/IsoHelper'
import SystemUseEntry from './SystemUseEntry'

export default class EREntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public identifierLength(): number {
        return this._data[4]
    }
    public descriptorLength(): number {
        return this._data[5]
    }
    public sourceLength(): number {
        return this._data[6]
    }
    public extensionVersion(): number {
        return this._data[7]
    }
    public extensionIdentifier(): string {
        return IsoHelper.getASCIIString(this._data, 8, this.identifierLength())
    }
    public extensionDescriptor(): string {
        return IsoHelper.getASCIIString(
            this._data,
            8 + this.identifierLength(),
            this.descriptorLength()
        )
    }
    public extensionSource(): string {
        return IsoHelper.getASCIIString(
            this._data,
            8 + this.identifierLength() + this.descriptorLength(),
            this.sourceLength()
        )
    }
}
