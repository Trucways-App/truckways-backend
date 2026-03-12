import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StandardResponse } from '../services/response.service';
// Adjust the import path as needed

@Injectable()
export class ResponseSyncInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: StandardResponse<any>) => {
        const response = context.switchToHttp().getResponse();
        
        // Synchronize the HTTP status code with the one in StandardResponse
        if (data && typeof data.status === 'number') {
          response.status(data.status);
        }
        
        return data;
      }),
    );
  }
}