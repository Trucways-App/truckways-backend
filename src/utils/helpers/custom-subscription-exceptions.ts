// src/exceptions/subscription.exceptions.ts

import { HttpException, HttpStatus } from '@nestjs/common';

export class SubscriptionRequiredException extends HttpException {
  constructor(message: string = 'This feature requires a subscription upgrade') {
    super(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'Subscription Required',
        message,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class EventLimitExceededException extends HttpException {
  constructor(currentPlan: string, limit: number) {
    super(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'Event Limit Exceeded',
        message: `You have reached the ${limit} events limit for your ${currentPlan} plan. Please upgrade your subscription to create more events.`,
        currentPlan,
        limit,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ExpiredSubscriptionException extends HttpException {
  constructor() {
    super(
      {
        status: HttpStatus.FORBIDDEN,
        error: 'Subscription Expired',
        message: 'Your subscription has expired. Please renew your subscription to continue using this feature.',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}