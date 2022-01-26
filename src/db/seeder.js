import bcrypt from 'bcryptjs';
import 'colors';
import 'dotenv/config';
import sequelize from '../config/sequelize.js';
import User from '../models/User.js';
import { mockedUsers } from './data.js';

const seedDatabaseWithMockedData = async () => {
  try {
    const users = await Promise.all(
      mockedUsers.map(async (mockedUser) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mockedUser.password, salt);
        return { ...mockedUser, password: hashedPassword };
      })
    );
    sequelize.sync();
    // Create many users
    await User.bulkCreate(users, { validate: true });

    /**
     * FIXME:
     * Figure out, how to make friendships unique,
     * so that there is only one row representing
     * given friendship.
     */

    // Create friendships:
    // Get users...
    const johnDoe = await User.findOne({
      where: { firstName: 'john', lastName: 'doe' },
    });
    const janeDoe = await User.findOne({
      where: { firstName: 'jane', lastName: 'doe' },
    });
    const maxMustermann = await User.findOne({
      where: { firstName: 'max', lastName: 'mustermann' },
    });

    // ... and make friend requests
    await johnDoe.addFriends([janeDoe, 10 /* Snoop Dogg's id */]);
    await janeDoe.addFriend(maxMustermann);

    // REMOVE LATER
    console.log(
      "John Doe's friends:".cyan,
      await johnDoe.getFriends({ raw: true })
    );
    console.log(
      "Jane Doe's friends:".magenta,
      await janeDoe.getFriends({ raw: true })
    );

    console.log('Database seeding successed'.green);
  } catch (error) {
    console.error(
      `Database seeding failed: ${
        error.message ? error.message : 'no error message'
      }`.red
    );
  }
};

const destroyDatabaseMockedData = async () => {
  try {
    await sequelize.drop();
    console.log('Database dropping successed'.green);
  } catch (error) {
    console.log(
      `Database dropping failed: ${
        error.message ? error.message : 'no error message'
      }`.red
    );
  }
};

if (process.argv[2] === '-d') {
  await destroyDatabaseMockedData();
} else {
  await seedDatabaseWithMockedData();
}
process.exit(1);
