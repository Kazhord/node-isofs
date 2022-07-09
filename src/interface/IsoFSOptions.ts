export default interface IsoFSOptions {
    // The ISO file in a buffer.
    data: Buffer
    // The name of the ISO (optional; used for debug messages / identification via getName()).
    name?: string
}
