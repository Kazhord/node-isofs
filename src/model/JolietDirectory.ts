import Directory from './AbstractDirectory'
import JolietDirectoryRecord from './JolietDirectoryRecord'
import fs from 'fs'

export default class JolietDirectory extends Directory<JolietDirectoryRecord> {
    constructor(record: JolietDirectoryRecord, isoData: fs.promises.FileHandle) {
        super(record, isoData)
    }
    protected _constructDirectoryRecord(data: Buffer): JolietDirectoryRecord {
        return new JolietDirectoryRecord(data, this._record.getRockRidgeOffset())
    }
}
