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

  // payments
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

  //  registrations
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
