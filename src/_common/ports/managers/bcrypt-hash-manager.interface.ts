export interface IHashManager {
  readonly hash: (plainString: string) => Promise<string>;

  readonly compare: (params: {
    plainString: string;
    hashedString: string;
  }) => Promise<boolean>;
}
