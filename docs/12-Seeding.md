# Seeding Databases with TypeORM, Nest.js and Faker.js

TypeORM uses database Seeding to populate your tables with initial data during development. Seeding will create and insert records into the database tables directly while using code within your app.

Dive into this step-by-step guide and learn seeding a database using TypeORM in Nest.js. You will learn:

* How to create a dedicated seeder module in your Nest.js application
* Using TypeORM to seed the database with Faker.js generated data
* How to seed TypeORM relationships (OneToMany, ManyToOne, etc.)
* Implementing proper seeding patterns that work across different database providers

### Why Seed a Database with TypeORM?

* During development, you need sample data mimicking how your app works.
* Testing phase to write tests against a consistent dataset.
* Initial state setup to ensure the database starts with the required data

### When should you use Database Seeding?

Make sure you run the TypeORM database seeding:

* On application bootstrap for development environments
* Before running tests, to ensure consistent test results
* When setting up a new environment for the first time

### Setting Up a Dedicated Seeder Module

Instead of mixing seeding logic with your service classes, let's create a dedicated module for seeding. This keeps our application structure clean and modular.

First, create a seeder module:

```bash
nest g module seed
nest g service seed
nest g controller seed

pnpm install @faker-js/faker
```

Then structure your seeder module to handle various entity seeding operations:

```TypeScript
// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { BookReview } from '../book-reviews/entities/book-review.entity';
import { Category } from '../categories/entities/category.entity';
import { Profile } from '../profiles/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Book,
      Author,
      BookReview,
      Category,
      Profile
    ]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule { }
```

### Creating a Comprehensive Seed Service

Here we'll create a seed service with methods for each entity type. Let's start with the basic structure:

```TypeScript
// src/seed/seed.service.ts (basic structure)
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Payment, paymentStatus } from '../payments/entities/payment.entity';
import { Registration, paymentStatus as RegistrationStatus } from '../registrations/entities/registration.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
  ) {}
```

### The Main Seeding Method

Let's first look at the main method that orchestrates the entire seeding process:

```TypeScript
 // This method calls all other seeding methods in the correct order, ensuring that parent entities are seeded before their dependent entities. The sequence is crucial:
  async seedDatabase(): Promise<void> {
    this.logger.log('Seeding database...');
    await this.seedUsers(); // independent
    await this.seedEvents(); // dependent on users
    await this.seedFeedbacks(); // dependent on users and events
    await this.seedRegistrations(); // dependent on events and users
    await this.seedPayments(); // dependent on registrations
    this.logger.log('Database seeding completed.');
  }
```

This method calls all other seeding methods in the correct order, ensuring that parent entities are seeded before their dependent entities. The sequence is crucial:

1. First, we seed independent entities (users, authors, categories) that don't depend on other entities
2. Then we seed profiles which depend on users
3. Next, we seed books which depend on authors and categories
4. Finally, we seed book reviews which depend on both books and users

### Seeding Independent Entities

#### 1. Seeding Users

```TypeScript
  async seedUsers(): Promise<void> {
    this.logger.log('Seeding users...');
    // Implementation for seeding users
    try {
      const users: User[] = [];
      const userCount = 10;

      for (let i = 0; i < userCount; i++) {
        const user = new User();
        user.name = faker.person.fullName();
        user.email = faker.internet.email();
        user.password = faker.internet.password();
        user.phone = faker.phone.number();
        user.role = UserRole.User;
        user.hashedRefreshToken = '';
        users.push(user);
      }

      await this.userRepository.save(users);
      this.logger.log(`${userCount} users seeded successfully`);
    } catch (error) {
      this.logger.error(`Error seeding users: ${error.message}`, error.stack);
      throw error;
    }
  }

```

**Explanation**:

- We create an array of 10 user objects
- For each user, we generate random data using Faker.js:
  - Full name with `faker.person.fullName()`
  - Email with `faker.internet.email()`
  - Password with `faker.internet.password()`
- We use TypeORM's repository pattern to save all users in a single database operation
- Error handling captures any failures with descriptive error messages

### Seeding Dependent Entities

#### 2. Seeding Events

```TypeScript
  // seed events
async seedEvents(): Promise<void> {
    this.logger.log('Seeding events...');
    try {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        throw new Error('No users found');
      }

      const events: Event[] = [];
      const eventCount = 10;

      for (let i = 0; i < eventCount; i++) {
        const ev = new Event();
        ev.created_by = faker.helpers.arrayElement(users);
        ev.event_name = faker.lorem.sentence(3); // Shorter to fit length limit
        ev.event_description = faker.lorem.paragraph(2); // Shorter paragraph
        ev.event_date = faker.date.future(); // Use Date object instead of string
        ev.event_location = faker.location.city().substring(0, 100); // Ensure it fits length
        events.push(ev);
      }

      await this.eventRepository.save(events);
      this.logger.log(`${eventCount} events seeded successfully`);
    } catch (error) {
      this.logger.error(`Error seeding events: ${error.message}`, error.stack);
      throw error;
    }
  }
```

#### 3. Seeding Feedback

```TypeScript
  async seedFeedbacks(): Promise<void> {
    this.logger.log('Seeding feedbacks...');
    try {
      const users = await this.userRepository.find();
      const events = await this.eventRepository.find();

      if (users.length === 0 || events.length === 0) {
        throw new Error('No users or events found');
      }

      const feedbacks: Feedback[] = [];
      const feedbackCount = 10;

      for (let i = 0; i < feedbackCount; i++) {
        const feedback = new Feedback();
        feedback.user = faker.helpers.arrayElement(users);
        feedback.event = faker.helpers.arrayElement(events);
        feedback.comments = faker.lorem.sentence();
        feedback.rating = faker.number.int({ min: 1, max: 5 });
        feedbacks.push(feedback);
      }

      await this.feedbackRepository.save(feedbacks);
      this.logger.log(`${feedbackCount} feedbacks seeded successfully`);
    } catch (error) {
      this.logger.error(`Error seeding feedbacks: ${error.message}`, error.stack);
      throw error;
    }
  }
```

#### 4. Seeding Registrations (depends on Users and Events)

```TypeScript
  async seedRegistrations(): Promise<void> {
    this.logger.log('Seeding registrations...');
    try {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        throw new Error('No users found');
      }

      const events = await this.eventRepository.find();
      if (events.length === 0) {
        throw new Error('No events found');
      }

      const registrations: Registration[] = [];
      const registrationCount = 15;

      for (let i = 0; i < registrationCount; i++) {
        const registration = new Registration();
        registration.user = faker.helpers.arrayElement(users);
        registration.event = faker.helpers.arrayElement(events);
        registration.payment_amount = faker.number.float({ min: 10, max: 500});
        registration.payment_status = RegistrationStatus.Pending;
        registrations.push(registration);
      }

      await this.registrationRepository.save(registrations);
      this.logger.log(`${registrationCount} registrations seeded successfully`);
    } catch (error) {
      this.logger.error(`Error seeding registrations: ${error.message}`, error.stack);
      throw error;
    }
  }
```

#### 5. Seeding Payments (Registrations)

```TypeScript
async seedPayments(): Promise<void> {
    this.logger.log('Seeding payments...');
    try {
      // Find registrations that don't have payments yet
      const registrationsWithoutPayments = await this.registrationRepository
        .createQueryBuilder('registration')
        .leftJoinAndSelect('registration.payment', 'payment')
        .where('payment.payment_id IS NULL')
        .getMany();

      if (registrationsWithoutPayments.length === 0) {
        this.logger.log('All registrations already have payments');
        return;
      }

      const payments: Payment[] = [];
      const paymentCount = Math.min(registrationsWithoutPayments.length, 10);

      // Use a subset of registrations without payments
      const selectedRegistrations = faker.helpers.arrayElements(
        registrationsWithoutPayments, 
        paymentCount
      );

      for (const registration of selectedRegistrations) {
        const payment = new Payment();
        payment.registration = registration;
        payment.amount = faker.number.float({ min: 10, max: 500 });
        payment.payment_date = faker.date.recent();
        payment.payment_status = paymentStatus.Pending;
        payment.payment_method = 'Mpesa';
        payments.push(payment);
      }

      if (payments.length > 0) {
        await this.paymentRepository.save(payments);
      }
      this.logger.log(`${payments.length} payments seeded successfully`);
    } catch (error) {
      this.logger.error(`Error seeding payments: ${error.message}`, error.stack);
      throw error;
    }
  }
```


### Database Cleanup

For a complete seeder implementation, you'll want a method to clear existing data:

```TypeScript
// clearDatabase() method
async clearDatabase(): Promise<void> {
    try {
      await this.paymentRepository.delete({});
      await this.registrationRepository.delete({});
      await this.feedbackRepository.delete({});
      await this.eventRepository.delete({});
      await this.userRepository.delete({});
      this.logger.log('Database cleared successfully');
    } catch (error) {
      this.logger.error(
        `Error clearing database: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
```

### Creating a Seeder Controller

For easy access to seeding operations, create a controller with endpoints:

```TypeScript
// src/seed/seed.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) { }

  @Get('all')
  async seedAll() {
    await this.seedService.seedDatabase();
    return { message: 'All data seeded successfully' };
  }

  @Get('users')
  async seedUsers() {
    await this.seedService.seedUsers();
    return { message: 'Users seeded successfully' };
  }

  @Post('clear')
  async clearDatabase() {
    await this.seedService.clearDatabase();
    return { message: 'Database cleared successfully' };
  }
}
```

**Explanation**:

- We create a dedicated controller for seeding operations
- Each seeder method gets its own endpoint for granular control
- The HTTP methods are chosen appropriately:
  - `GET` for read-only operations (seeding adds data but doesn't modify existing data)
  - `POST` for the clear operation which modifies existing data
- This approach provides a convenient way to trigger seeders for development and testing

### Best Practices for TypeORM Seeding

1. **Order Matters**: Always seed parent entities before child entities

   ```TypeScript
  async seedDatabase(): Promise<void> {
    this.logger.log('Seeding database...');
    await this.seedUsers(); // independent
    await this.seedEvents(); // dependent on users
    await this.seedFeedbacks(); // dependent on users and events
    await this.seedRegistrations(); // dependent on events and users
    await this.seedPayments(); // dependent on registrations
    this.logger.log('Database seeding completed.');
  }
   ```
2. **Validation First**: Always check for prerequisites before seeding dependent entities

   ```TypeScript
   // Check for existence of users before seeding profiles
   const users = await this.userRepository.find();
   if (users.length === 0) {
       throw new Error('No users found. Seed users first.');
   }
   ```
3. **Error Handling**: Wrap seeding operations in try-catch blocks for proper error reporting

   ```TypeScript
   try {
       // Seeding operations
   } catch (error) {
       this.logger.error(`Error seeding: ${error.message}`, error.stack);
       throw error;
   }
   ```
4. **Bulk Operations**: Use array-based bulk inserts for better performance

   ```TypeScript
   // Create an array of entities first
   const users: User[] = [];
   // ... populate the array
   // Then save all at once for performance
   await this.userRepository.save(users);
   ```
5. **Idempotent Operations**: Check if data exists before seeding to avoid duplicates

   ```TypeScript
   // Check if data already exists
   const userCount = await this.userRepository.count();
   if (userCount > 0) {
       this.logger.log('Users already exist, skipping seed');
       return;
   }
   ```
6. **Relationship Handling**: Pay special attention to how TypeORM handles relationships

### Using the Seed API

With our seed controller, we can use these endpoints:

- `GET /seed/all` - Seeds all entities
- `GET /seed/users` - Seeds only users
- `POST /seed/clear` - Clears all data from the database

### Conclusion

Using this approach to seed your database with TypeORM and Nest.js provides a clean, maintainable pattern that separates concerns and allows flexible seeding strategies. The dedicated seeder module pattern makes it easy to expand your seeding logic as your application grows.

With properly structured seeders, you can:

- Generate consistent test data
- Quickly populate your development database
- Handle complex entity relationships
- Clear and repopulate your database as needed

This modular approach to database seeding gives you the flexibility to seed specific entities as needed or the entire database at once, making your development workflow more efficient.

Changed varchar to nvarchar - Better for SQL Server Unicode support
Added explicit length specifications - Prevents TDS protocol errors
Changed string dates to Date objects - Proper data type mapping
Used decimal for monetary values - Better precision for amounts
Used ntext for long descriptions - Handles larger text content
Shortened generated text - Ensures it fits within column limits


### creating a new login
```sql
USE [seeding]
GO

CREATE USER [Tiff] FOR LOGIN [Tiff]
GO

ALTER ROLE db_owner ADD MEMBER [Tiff]
GO
```