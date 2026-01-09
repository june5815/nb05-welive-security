export class ApartmentEntity {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _address: string;
  private readonly _description?: string;
  private readonly _officeNumber?: string;
  private readonly _buildings: number[];
  private readonly _units: number[];

  constructor(attrs: {
    id: string;
    name: string;
    address: string;
    description?: string;
    officeNumber?: string;
    buildings: number[];
    units: number[];
  }) {
    this._id = attrs.id;
    this._name = attrs.name;
    this._address = attrs.address;
    this._description = attrs.description;
    this._officeNumber = attrs.officeNumber;
    this._buildings = attrs.buildings;
    this._units = attrs.units;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get address(): string {
    return this._address;
  }

  get description(): string | undefined {
    return this._description;
  }

  get officeNumber(): string | undefined {
    return this._officeNumber;
  }

  get buildings(): number[] {
    return this._buildings;
  }

  get units(): number[] {
    return this._units;
  }
}
