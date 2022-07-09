import VolumeDescriptorTypeCode from '../enum/VolumeDescriptorTypeCode'
import IsoHelper from '../helper/IsoHelper'
import DirectoryRecord from './AbstractDirectoryRecord'
import JolietDirectoryRecord from './JolietDirectoryRecord'
import PrimaryOrSupplementaryVolumeDescriptor from './AbstractPrimaryOrSupplementaryVolumeDescriptor'

export default class SupplementaryVolumeDescriptor extends PrimaryOrSupplementaryVolumeDescriptor {
    constructor(data: Buffer) {
        super(data)
        if (this.type() !== VolumeDescriptorTypeCode.SupplementaryVolumeDescriptor) {
            throw new Error(`Invalid supplementary volume descriptor.`)
        }
        const escapeSequence = this.escapeSequence()
        const third = escapeSequence[2]
        // Third character identifies what 'level' of the UCS specification to follow.
        // We ignore it.
        if (
            escapeSequence[0] !== 0x25 ||
            escapeSequence[1] !== 0x2f ||
            (third !== 0x40 && third !== 0x43 && third !== 0x45)
        ) {
            throw new Error(
                `Unrecognized escape sequence for SupplementaryVolumeDescriptor: ${escapeSequence.toString()}`
            )
        }
    }
    public name(): string {
        return 'Joliet'
    }
    public escapeSequence(): Buffer {
        return this._data.slice(88, 120)
    }
    protected _constructRootDirectoryRecord(data: Buffer): DirectoryRecord {
        return new JolietDirectoryRecord(data, -1)
    }
    protected _getString(idx: number, len: number): string {
        return IsoHelper.getJolietString(this._data, idx, len)
    }
}
