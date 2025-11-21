import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                // If data already has the correct structure, return it
                if (data && typeof data === 'object' && 'statusCode' in data) {
                    return data;
                }

                // Otherwise, wrap it in the standard format
                return {
                    statusCode,
                    message: data?.message || 'Success',
                    data: data?.data !== undefined ? data.data : data,
                };
            }),
        );
    }
}
