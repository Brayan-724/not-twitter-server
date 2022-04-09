import { TweetVisibility } from '../dto/tweet.dto';

export interface TweetFilters {
  quantity?: number;
  toxicId?: string;
  visibility?: TweetVisibility;
}
