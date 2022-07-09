import SLComponentFlags from '../enum/SLComponentFlags'
import { TGetString } from '../helper/IsoHelper'

export default class SLComponentRecord {
    private _data: Buffer
    constructor(data: Buffer) {
        this._data = data
    }
    public flags(): SLComponentFlags {
        return this._data[0]
    }
    public length(): number {
        return 2 + this.componentLength()
    }
    public componentLength(): number {
        return this._data[1]
    }
    public content(getString: TGetString): string {
        return getString(this._data, 2, this.componentLength())
    }
}
