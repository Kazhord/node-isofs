import SystemUseEntry from './SystemUseEntry'
import fs from 'fs'
import IsoHelper from '../helper/IsoHelper'

export default class CEEntry extends SystemUseEntry {
    private _entries: SystemUseEntry[] | null = null
    constructor(data: Buffer) {
        super(data)
    }
    /**
     * Logical block address of the continuation area.
     */
    public continuationLba(): number {
        return this._data.readUInt32LE(4)
    }
    /**
     * Offset into the logical block.
     */
    public continuationLbaOffset(): number {
        return this._data.readUInt32LE(12)
    }
    /**
     * Length of the continuation area.
     */
    public continuationLength(): number {
        return this._data.readUInt32LE(20)
    }
    public getEntries(isoData: fs.promises.FileHandle): SystemUseEntry[] {
        if (!this._entries) {
            const start = this.continuationLba() * 2048 + this.continuationLbaOffset()
            this._entries = IsoHelper.constructSystemUseEntries(
                isoData,
                start,
                this.continuationLength(),
                isoData
            )
        }
        return this._entries
    }
}
