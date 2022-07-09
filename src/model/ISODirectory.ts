import Directory from './AbstractDirectory'
import ISODirectoryRecord from './ISODirectoryRecord'
import fs from 'fs'

export default class ISODirectory extends Directory<ISODirectoryRecord> {
    constructor(record: ISODirectoryRecord, isoData: fs.promises.FileHandle) {
        super(record, isoData)
    }
    protected _constructDirectoryRecord(data: Buffer): ISODirectoryRecord {
        return new ISODirectoryRecord(data, this._record.getRockRidgeOffset())
    }
}
