import IsoHelper from '../helper/IsoHelper'
import DirectoryRecord from './AbstractDirectoryRecord'
import VolumeDescriptor from './VolumeDescriptor'
import fs from 'fs'

export default abstract class PrimaryOrSupplementaryVolumeDescriptor extends VolumeDescriptor {
    private _root: DirectoryRecord | null = null
    constructor(data: Buffer) {
        super(data)
    }
    public systemIdentifier(): string {
        return this._getString32(8)
    }
    public volumeIdentifier(): string {
        return this._getString32(40)
    }
    public volumeSpaceSize(): number {
        return this._data.readUInt32LE(80)
    }
    public volumeSetSize(): number {
        return this._data.readUInt16LE(120)
    }
    public volumeSequenceNumber(): number {
        return this._data.readUInt16LE(124)
    }
    public logicalBlockSize(): number {
        return this._data.readUInt16LE(128)
    }
    public pathTableSize(): number {
        return this._data.readUInt32LE(132)
    }
    public locationOfTypeLPathTable(): number {
        return this._data.readUInt32LE(140)
    }
    public locationOfOptionalTypeLPathTable(): number {
        return this._data.readUInt32LE(144)
    }
    public locationOfTypeMPathTable(): number {
        return this._data.readUInt32BE(148)
    }
    public locationOfOptionalTypeMPathTable(): number {
        return this._data.readUInt32BE(152)
    }
    public rootDirectoryEntry(isoData: fs.promises.FileHandle): DirectoryRecord {
        if (this._root === null) {
            this._root = this._constructRootDirectoryRecord(this._data.slice(156))
            this._root.rootCheckForRockRidge(isoData)
        }
        return this._root
    }
    public volumeSetIdentifier(): string {
        return this._getString(190, 128)
    }
    public publisherIdentifier(): string {
        return this._getString(318, 128)
    }
    public dataPreparerIdentifier(): string {
        return this._getString(446, 128)
    }
    public applicationIdentifier(): string {
        return this._getString(574, 128)
    }
    public copyrightFileIdentifier(): string {
        return this._getString(702, 38)
    }
    public abstractFileIdentifier(): string {
        return this._getString(740, 36)
    }
    public bibliographicFileIdentifier(): string {
        return this._getString(776, 37)
    }
    public volumeCreationDate(): Date {
        return IsoHelper.getDate(this._data, 813)
    }
    public volumeModificationDate(): Date {
        return IsoHelper.getDate(this._data, 830)
    }
    public volumeExpirationDate(): Date {
        return IsoHelper.getDate(this._data, 847)
    }
    public volumeEffectiveDate(): Date {
        return IsoHelper.getDate(this._data, 864)
    }
    public fileStructureVersion(): number {
        return this._data[881]
    }
    public applicationUsed(): Buffer {
        return this._data.slice(883, 883 + 512)
    }
    public reserved(): Buffer {
        return this._data.slice(1395, 1395 + 653)
    }
    public abstract name(): string
    protected abstract _constructRootDirectoryRecord(data: Buffer): DirectoryRecord
    protected abstract _getString(idx: number, len: number): string
    protected _getString32(idx: number): string {
        return this._getString(idx, 32)
    }
}
