import VolumeDescriptorTypeCode from '../enum/VolumeDescriptorTypeCode'
import DirectoryRecord from './AbstractDirectoryRecord'
import ISODirectoryRecord from './ISODirectoryRecord'
import PrimaryOrSupplementaryVolumeDescriptor from './AbstractPrimaryOrSupplementaryVolumeDescriptor'

export default class PrimaryVolumeDescriptor extends PrimaryOrSupplementaryVolumeDescriptor {
    constructor(data: Buffer) {
        super(data)
        if (this.type() !== VolumeDescriptorTypeCode.PrimaryVolumeDescriptor) {
            throw new Error(`Invalid primary volume descriptor.`)
        }
    }
    public name(): string {
        return 'ISO9660'
    }
    protected _constructRootDirectoryRecord(data: Buffer): DirectoryRecord {
        return new ISODirectoryRecord(data, -1)
    }
    protected _getString(idx: number, len: number): string {
        return this._getString(idx, len)
    }
}
