import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { BodyValidator } from './BodyValidator';

export const UseValidator = createParamDecorator(
  (validator: BodyValidator, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const result = validator.validate(req);

    // If validation failed, throw an http exception, nestjs will handle it
    if (result[0] === false) {
      throw new HttpException(
        result[1].toApiErrorResponse(),
        HttpStatus.BAD_REQUEST,
      );
    }

    return result[1];
  },
);
