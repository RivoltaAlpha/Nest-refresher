// This validates regular API requests
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AtGuard extends AuthGuard('access') {
  constructor(
    private reflector: Reflector, // Inject Reflector to access metadata set by decorators
  ) {
    super();
  }

  // returns Value indicating whether or not the current request is allowed to proceed.
  canActivate(
    context: ExecutionContext, // Override canActivate to add custom logic if needed
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // If the route is marked as public, allow access without authentication
    }

    return super.canActivate(context);
  }

  // Override getRequest to extract the request object from the context 
  getRequest(context: ExecutionContext) {
      const request = super.getRequest(context);
      return request;
  }
}
