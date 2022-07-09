const enum TFFlags {
    CREATION = 1,
    MODIFY = 1 << 1,
    ACCESS = 1 << 2,
    ATTRIBUTES = 1 << 3,
    BACKUP = 1 << 4,
    EXPIRATION = 1 << 5,
    EFFECTIVE = 1 << 6,
    LONG_FORM = 1 << 7,
}
export default TFFlags
