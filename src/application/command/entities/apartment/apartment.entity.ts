export type ApartmentEntity = {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly description?: string;
  readonly officeNumber?: string;
  readonly managerId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export const ApartmentEntity = {
  create: (attrs: {
    id: string;
    name: string;
    address: string;
    description?: string;
    officeNumber?: string;
    managerId?: string;
  }): ApartmentEntity => ({
    id: attrs.id,
    name: attrs.name,
    address: attrs.address,
    description: attrs.description,
    officeNumber: attrs.officeNumber,
    managerId: attrs.managerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  }),

  updateName: (
    apartment: ApartmentEntity,
    newName: string,
  ): ApartmentEntity => ({
    ...apartment,
    name: newName,
    updatedAt: new Date(),
    version: apartment.version + 1,
  }),

  updateAddress: (
    apartment: ApartmentEntity,
    newAddress: string,
  ): ApartmentEntity => ({
    ...apartment,
    address: newAddress,
    updatedAt: new Date(),
    version: apartment.version + 1,
  }),

  updateDescription: (
    apartment: ApartmentEntity,
    newDescription: string | undefined,
  ): ApartmentEntity => ({
    ...apartment,
    description: newDescription,
    updatedAt: new Date(),
    version: apartment.version + 1,
  }),

  updateOfficeNumber: (
    apartment: ApartmentEntity,
    newOfficeNumber: string | undefined,
  ): ApartmentEntity => ({
    ...apartment,
    officeNumber: newOfficeNumber,
    updatedAt: new Date(),
    version: apartment.version + 1,
  }),

  updateManager: (
    apartment: ApartmentEntity,
    managerId: string | undefined,
  ): ApartmentEntity => ({
    ...apartment,
    managerId,
    updatedAt: new Date(),
    version: apartment.version + 1,
  }),

  getId: (apartment: ApartmentEntity): string => apartment.id,

  getName: (apartment: ApartmentEntity): string => apartment.name,

  getAddress: (apartment: ApartmentEntity): string => apartment.address,

  getDescription: (apartment: ApartmentEntity): string | undefined =>
    apartment.description,

  getOfficeNumber: (apartment: ApartmentEntity): string | undefined =>
    apartment.officeNumber,

  getManagerId: (apartment: ApartmentEntity): string | undefined =>
    apartment.managerId,

  getCreatedAt: (apartment: ApartmentEntity): Date => apartment.createdAt,

  getUpdatedAt: (apartment: ApartmentEntity): Date => apartment.updatedAt,

  getVersion: (apartment: ApartmentEntity): number => apartment.version,
};
