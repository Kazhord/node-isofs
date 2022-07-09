import SystemUseEntry from './SystemUseEntry'

export default class PDEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
}
