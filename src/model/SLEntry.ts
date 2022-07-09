import SLComponentRecord from './SLComponentRecord'
import SystemUseEntry from './SystemUseEntry'

export default class SLEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public flags(): number {
        return this._data[4]
    }
    public continueFlag(): number {
        return this.flags() & 0x1
    }
    public componentRecords(): SLComponentRecord[] {
        // eslint-disable-next-line no-array-constructor
        const records = new Array<SLComponentRecord>()
        let i = 5
        while (i < this.length()) {
            const record = new SLComponentRecord(this._data.slice(i))
            records.push(record)
            i += record.length()
        }
        return records
    }
}
