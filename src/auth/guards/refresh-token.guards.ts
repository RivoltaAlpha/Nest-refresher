// This specifically validates refresh token requests
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class RtGuard extends AuthGuard('refresh') {

    // Override getRequest to extract the request object from the context
  getRequest(context: ExecutionContext) {
    const request = super.getRequest(context);
    return request;
  }
}
