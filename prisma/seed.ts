import { JwtService } from '@nestjs/jwt';
import { AuthStrategy } from '../src/modules/auth/strategies/auth.strategy';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { ToxicSeeder } from './seed/ToxicSeeder';
import { TweetSeeder } from './seed/TweetSeeder';

const toxicSeederPrefix = '\x1b[32m[ToxicSeeder]\x1b[0m ';
const tweetSeederPrefix = '\x1b[34m[TweetSeeder]\x1b[0m ';
const infoPrefix = '\x1b[36m[INFO]\x1b[0m ';

export async function main(toxicsCount: number, maxTweetsPerToxic: number) {
  console.log(infoPrefix + 'Initializing services...');
  const prismaService = new PrismaService();
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET as string,
  });

  console.log(infoPrefix + 'Connecting with database...');
  await prismaService.onModuleInit();

  const authStrategy = new AuthStrategy(prismaService, jwtService);
  const toxicSeeder = new ToxicSeeder(prismaService, authStrategy);
  const tweetSeeder = new TweetSeeder(prismaService, authStrategy);

  console.log(toxicSeederPrefix + 'Deleting all toxics...');
  await toxicSeeder.clearTable();

  console.log(tweetSeederPrefix + 'Deleting all tweets...');
  await tweetSeeder.clearTable();

  console.log(
    toxicSeederPrefix + `Seeding \x1b[4m${toxicsCount}\x1b[0m toxics...`,
  );
  const toxics = await toxicSeeder.seedMany(toxicsCount);

  let totalTweets = 0;

  console.log(
    toxicSeederPrefix +
      `Seeding \x1b[4m${toxicsCount}\x1b[0m toxics with max \x1b[4m${maxTweetsPerToxic}\x1b[0m tweets each...`,
  );
  for (const toxic of toxics) {
    const tweetsCount = (Math.random() * maxTweetsPerToxic + 1) | 0;
    console.log(
      tweetSeederPrefix +
        `\x1b[37mSeeding \x1b[4m${tweetsCount}\x1b[0;37m tweets for toxic \x1b[4m${toxic.id}\x1b[0;37m...` +
        '\x1b[0m',
    );
    tweetSeeder.target = toxic;

    await tweetSeeder.seedMany(tweetsCount);
    totalTweets += tweetsCount;
  }

  console.log(toxicSeederPrefix + `Seeded \x1b[4m${toxicsCount}\x1b[0m toxics`);
  console.log(tweetSeederPrefix + `Seeded \x1b[4m${totalTweets}\x1b[0m tweets`);

  await prismaService.getPrisma().$disconnect();

  console.log(infoPrefix + 'Seeding done');
}

if (require.main === module) {
  const toxicsCount = parseInt(process.argv[2]) || 10;
  const maxTweetsPerToxic = parseInt(process.argv[3]) || 10;

  main(toxicsCount, maxTweetsPerToxic);
}
