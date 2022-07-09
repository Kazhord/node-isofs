import Directory from './AbstractDirectory'
import DirectoryRecord from './AbstractDirectoryRecord'
import ISODirectory from './ISODirectory'
import fs from 'fs'
import IsoHelper, { TGetString } from '../helper/IsoHelper'

export default class ISODirectoryRecord extends DirectoryRecord {
    constructor(data: Buffer, rockRidgeOffset: number) {
        super(data, rockRidgeOffset)
    }
    protected _getString(i: number, len: number): string {
        return IsoHelper.getASCIIString(this._data, i, len)
    }
    protected _constructDirectory(isoData: fs.promises.FileHandle): Directory<DirectoryRecord> {
        return new ISODirectory(this, isoData)
    }
    protected _getGetString(): TGetString {
        return IsoHelper.getASCIIString
    }
}
