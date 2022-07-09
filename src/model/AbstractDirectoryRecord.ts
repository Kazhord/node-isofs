import fs from 'fs'
import { Readable } from 'stream'
import FileFlags from '../enum/FileFlags'
import NMFlags from '../enum/NMFlags'
import SLComponentFlags from '../enum/SLComponentFlags'
import IsoHelper, { TGetString } from '../helper/IsoHelper'
import CLEntry from './CLEntry'
import Directory from './AbstractDirectory'
import EREntry from './EREntry'
import NMEntry from './NMEntry'
import RREntry from './RREntry'
import SLEntry from './SLEntry'
import SPEntry from './SPEntry'
import SystemUseEntry from './SystemUseEntry'

export default abstract class DirectoryRecord {
    protected _data: Buffer
    // Offset at which system use entries begin. Set to -1 if not enabled.
    protected _rockRidgeOffset: number
    protected _suEntries: SystemUseEntry[] | null = null
    private _fileOrDir: Buffer | Directory<DirectoryRecord> | null = null
    constructor(data: Buffer, rockRidgeOffset: number) {
        this._data = data
        this._rockRidgeOffset = rockRidgeOffset
    }
    public hasRockRidge(): boolean {
        return this._rockRidgeOffset > -1
    }
    public getRockRidgeOffset(): number {
        return this._rockRidgeOffset
    }
    /**
     * !!ONLY VALID ON ROOT NODE!!
     * Checks if Rock Ridge is enabled, and sets the offset.
     */
    public rootCheckForRockRidge(isoData: fs.promises.FileHandle): void {
        const dir = this.getDirectory(isoData)
        this._rockRidgeOffset = dir.getDotEntry(isoData)._getRockRidgeOffset(isoData)
        if (this._rockRidgeOffset > -1) {
            // Wipe out directory. Start over with RR knowledge.
            this._fileOrDir = null
        }
    }
    public length(): number {
        return this._data[0]
    }
    public extendedAttributeRecordLength(): number {
        return this._data[1]
    }
    public lba(): number {
        return this._data.readUInt32LE(2) * 2048
    }
    public dataLength(): number {
        return this._data.readUInt32LE(10)
    }
    public recordingDate(): Date {
        return IsoHelper.getShortFormDate(this._data, 18)
    }
    public fileFlags(): number {
        return this._data[25]
    }
    public fileUnitSize(): number {
        return this._data[26]
    }
    public interleaveGapSize(): number {
        return this._data[27]
    }
    public volumeSequenceNumber(): number {
        return this._data.readUInt16LE(28)
    }
    public identifier(): string {
        return this._getString(33, this._data[32])
    }
    public fileName(isoData: fs.promises.FileHandle): string {
        if (this.hasRockRidge()) {
            const fn = this._rockRidgeFilename(isoData)
            if (fn !== null) {
                return fn
            }
        }
        const ident = this.identifier()
        if (this.isDirectory(isoData)) {
            return ident
        }
        // Files:
        // - MUST have 0x2E (.) separating the name from the extension
        // - MUST have 0x3B (;) separating the file name and extension from the version
        // Gets expanded to two-byte char in Unicode directory records.
        const versionSeparator = ident.indexOf(';')
        if (versionSeparator === -1) {
            // Some Joliet filenames lack the version separator, despite the standard
            // specifying that it should be there.
            return ident
        } else if (ident[versionSeparator - 1] === '.') {
            // Empty extension. Do not include '.' in the filename.
            return ident.slice(0, versionSeparator - 1)
        } else {
            // Include up to version separator.
            return ident.slice(0, versionSeparator)
        }
    }
    public isDirectory(isoData: fs.promises.FileHandle): boolean {
        let rv = !!(this.fileFlags() & FileFlags.Directory)
        // If it lacks the Directory flag, it may still be a directory if we've exceeded the directory
        // depth limit. Rock Ridge marks these as files and adds a special attribute.
        if (!rv && this.hasRockRidge()) {
            rv = this.getSUEntries(isoData).filter((e) => e instanceof CLEntry).length > 0
        }
        return rv
    }
    public isSymlink(isoData: fs.promises.FileHandle): boolean {
        return (
            this.hasRockRidge() &&
            this.getSUEntries(isoData).filter((e) => e instanceof SLEntry).length > 0
        )
    }
    public getSymlinkPath(isoData: fs.promises.FileHandle): string {
        let p = ''
        const entries = this.getSUEntries(isoData)
        const getStr = this._getGetString()
        for (const entry of entries) {
            if (entry instanceof SLEntry) {
                const components = entry.componentRecords()
                for (const component of components) {
                    const flags = component.flags()
                    if (flags & SLComponentFlags.CURRENT) {
                        p += './'
                    } else if (flags & SLComponentFlags.PARENT) {
                        p += '../'
                    } else if (flags & SLComponentFlags.ROOT) {
                        p += '/'
                    } else {
                        p += component.content(getStr)
                        if (!(flags & SLComponentFlags.CONTINUE)) {
                            p += '/'
                        }
                    }
                }
                if (!entry.continueFlag()) {
                    // We are done with this link.
                    break
                }
            }
        }
        if (p.length > 1 && p[p.length - 1] === '/') {
            // Trim trailing '/'.
            return p.slice(0, p.length - 1)
        } else {
            return p
        }
    }
    public getFile(isoData: fs.promises.FileHandle): Readable | undefined {
        if (this.isDirectory(isoData)) {
            throw new Error(`Tried to get a File from a directory.`)
        }
        if (this._fileOrDir === null) {
            const lba = this.lba()
            const dataLength = this.dataLength()
            let readBytes = 0
            const readable = new Readable({
                read(toReadBytes) {
                    if (readBytes < dataLength) {
                        if (dataLength - readBytes < toReadBytes) {
                            toReadBytes = dataLength - readBytes
                        }
                        const buffer = Buffer.alloc(toReadBytes)
                        fs.readSync(isoData.fd, buffer, 0, toReadBytes, lba + readBytes)
                        this.push(buffer)
                        readBytes += toReadBytes
                        if (dataLength - readBytes < 4096) {
                            toReadBytes = dataLength - readBytes
                        }
                    } else {
                        this.push(null)
                    }
                },
            })
            return readable
        }
        return undefined
    }
    public getDirectory(isoData: fs.promises.FileHandle): Directory<DirectoryRecord> {
        if (!this.isDirectory(isoData)) {
            throw new Error(`Tried to get a Directory from a file.`)
        }
        if (this._fileOrDir === null) {
            this._fileOrDir = this._constructDirectory(isoData)
        }
        return <Directory<this>>this._fileOrDir
    }
    public getSUEntries(isoData: fs.promises.FileHandle): SystemUseEntry[] {
        if (!this._suEntries) {
            this._constructSUEntries(isoData)
        }
        return this._suEntries
    }
    protected abstract _getString(i: number, len: number): string
    protected abstract _getGetString(): TGetString
    protected abstract _constructDirectory(
        isoData: fs.promises.FileHandle
    ): Directory<DirectoryRecord>
    protected _rockRidgeFilename(isoData: fs.promises.FileHandle): string | null {
        const nmEntries = <NMEntry[]>this.getSUEntries(isoData).filter((e) => e instanceof NMEntry)
        if (nmEntries.length === 0 || nmEntries[0].flags() & (NMFlags.CURRENT | NMFlags.PARENT)) {
            return null
        }
        let str = ''
        const getString = this._getGetString()
        for (const e of nmEntries) {
            str += e.name(getString)
            if (!(e.flags() & NMFlags.CONTINUE)) {
                break
            }
        }
        return str
    }
    private _constructSUEntries(isoData: fs.promises.FileHandle): void {
        let i = 33 + this._data[32]
        if (i % 2 === 1) {
            // Skip padding field.
            i++
        }
        i += this._rockRidgeOffset
        this._suEntries = IsoHelper.constructSystemUseEntries(this._data, i, this.length(), isoData)
    }
    /**
     * !!ONLY VALID ON FIRST ENTRY OF ROOT DIRECTORY!!
     * Returns -1 if rock ridge is not enabled. Otherwise, returns the offset
     * at which system use fields begin.
     */
    private _getRockRidgeOffset(isoData: fs.promises.FileHandle): number {
        // In the worst case, we get some garbage SU entries.
        // Fudge offset to 0 before proceeding.
        this._rockRidgeOffset = 0
        const suEntries = this.getSUEntries(isoData)
        if (suEntries.length > 0) {
            const spEntry = suEntries[0]
            if (spEntry instanceof SPEntry && spEntry.checkBytesPass()) {
                // SUSP is in use.
                for (let i = 1; i < suEntries.length; i++) {
                    const entry = suEntries[i]
                    if (
                        entry instanceof RREntry ||
                        (entry instanceof EREntry &&
                            entry.extensionIdentifier() === IsoHelper.rockRidgeIdentifier)
                    ) {
                        // Rock Ridge is in use!
                        return spEntry.bytesSkipped()
                    }
                }
            }
        }
        // Failed.
        this._rockRidgeOffset = -1
        return -1
    }
}
