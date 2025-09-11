import { Reflector } from '@nestjs/core';
import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from "src/users/entities/user.entity";
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
// Guard to check if the user has the required roles to access a route 
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // This is the Reflector service used to access metadata
    @InjectRepository(User) 
    private userRepository: Repository<User>, 
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(), // this gets the method being called
        context.getClass(), // this gets the class (controller) being called
    ]);
    
    if (!requiredRoles) {
      return true; // If no roles are defined, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // If no user is found, deny access
    }

    // fetch user from the db 
    const verifiedUser = await this.userRepository.findOne({
        where: { user_id: user.user_id },
        select: ['user_id', 'email', 'role'], // Select only the necessary fields
        });

    // If the user is not found in the database, deny access
    if (!verifiedUser) {
      return false;
    }

    // Check if the user's role matches any of the required roles
    // console.log('Verified user:', verifiedUser);
    return requiredRoles.some((role) => verifiedUser.role === role); // Check if the user's role is in the list of required roles
  }
}
