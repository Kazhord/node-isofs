import FileFlags from '../enum/FileFlags'
import CLEntry from './CLEntry'
import DirectoryRecord from './AbstractDirectoryRecord'
import fs from 'fs'
import REEntry from './REEntry'

export default abstract class Directory<T extends DirectoryRecord> {
    protected _record: T
    private _fileList: string[] = []
    private _fileMap: { [name: string]: T } = {}
    constructor(record: T, isoData: fs.promises.FileHandle) {
        this._record = record
        let i = record.lba()
        let iLimit = i + record.dataLength()
        if (!(record.fileFlags() & FileFlags.Directory)) {
            // Must have a CL entry.
            const cl = <CLEntry>record.getSUEntries(isoData).filter((e) => e instanceof CLEntry)[0]
            i = cl.childDirectoryLba() * 2048
            iLimit = Infinity
        }

        while (i < iLimit) {
            const buffer = Buffer.alloc(1)
            fs.readSync(isoData.fd, buffer, 0, 1, i)
            const len = buffer[0]
            // Zero-padding between sectors.
            // TODO: Could optimize this to seek to nearest-sector upon
            // seeing a 0.
            if (len === 0) {
                i++
                continue
            }

            const buffer2 = Buffer.alloc(64738)
            fs.readSync(isoData.fd, buffer2, 0, 64738, i)
            const r = this._constructDirectoryRecord(buffer2)
            const fname = r.fileName(isoData)
            // Skip '.' and '..' entries.
            if (fname !== '\u0000' && fname !== '\u0001') {
                // Skip relocated entries.
                if (
                    !r.hasRockRidge() ||
                    r.getSUEntries(isoData).filter((e) => e instanceof REEntry).length === 0
                ) {
                    this._fileMap[fname] = r
                    this._fileList.push(fname)
                }
            } else if (iLimit === Infinity) {
                // First entry contains needed data.
                iLimit = i + r.dataLength()
            }
            i += r.length()
        }
    }
    /**
     * Get the record with the given name.
     * Returns undefined if not present.
     */
    public getRecord(name: string): DirectoryRecord {
        return this._fileMap[name]
    }
    public getFileList(): string[] {
        return this._fileList
    }
    public getDotEntry(isoData: fs.promises.FileHandle): T {
        const buffer = Buffer.alloc(this._record.dataLength())
        fs.readSync(isoData.fd, buffer, 0, this._record.dataLength(), this._record.lba())

        return this._constructDirectoryRecord(buffer)
    }
    protected abstract _constructDirectoryRecord(data: Buffer): T
}
