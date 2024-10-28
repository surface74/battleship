/**
 * Make GUID like 0e71e02d-bf7c-4a2b-b076-f50ac44b0581
 */
export default class Guid {
  static newGuid(): string {
    const parts: string[] = [];
    parts.push(this.getHexRandom(0x10000000, 0xffffffff));
    parts.push(Guid.getHexRandom(0x1000, 0xffff));
    parts.push(Guid.getHexRandom(0x1000, 0xffff));
    parts.push(Guid.getHexRandom(0x1000, 0xffff));
    parts.push(Guid.getHexRandom(0x100000000000, 0xffffffffffff));

    return parts.join('-');
  }

  private static getHexRandom(min: number, max: number): string {
    const random = Math.floor(min + Math.random() * (max + 1 - min));
    return random.toString(16);
  }
}
