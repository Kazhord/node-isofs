import IsoHelper, { TGetString } from '../helper/IsoHelper'
import Directory from './AbstractDirectory'
import DirectoryRecord from './AbstractDirectoryRecord'
import JolietDirectory from './JolietDirectory'
import fs from 'fs'

export default class JolietDirectoryRecord extends DirectoryRecord {
    constructor(data: Buffer, rockRidgeOffset: number) {
        super(data, rockRidgeOffset)
    }
    protected _getString(i: number, len: number): string {
        return IsoHelper.getJolietString(this._data, i, len)
    }
    protected _constructDirectory(isoData: fs.promises.FileHandle): Directory<DirectoryRecord> {
        return new JolietDirectory(this, isoData)
    }
    protected _getGetString(): TGetString {
        return IsoHelper.getJolietString
    }
}
