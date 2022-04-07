export class TweetDto {
  content: string;
  visibility?: TweetVisibility;
  toxicId: string;
}

export enum TweetVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  HIDDEN = 'HIDDEN',
}
