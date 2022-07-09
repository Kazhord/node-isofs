import NMFlags from '../enum/NMFlags'
import { TGetString } from '../helper/IsoHelper'
import SystemUseEntry from './SystemUseEntry'

export default class NMEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public flags(): NMFlags {
        return this._data[4]
    }
    public name(getString: TGetString): string {
        return getString(this._data, 5, this.length() - 5)
    }
}
