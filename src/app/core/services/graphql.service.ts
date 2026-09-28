import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, throwError, catchError } from 'rxjs';
import { AuthSessionService } from './auth-session.service';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

@Injectable({
  providedIn: 'root',
})
export class GraphQLService {
  private http = inject(HttpClient);
  private authSession = inject(AuthSessionService);
  private endpoint ='http://localhost:3001/graphql';

  mutate<T>(mutation: string, variables: Record<string, any> = {}): Observable<T> {
    return this.execute<T>(mutation, variables);
  }

  query<T>(query: string, variables: Record<string, any> = {}): Observable<T> {
    return this.execute<T>(query, variables);
  }

  private execute<T>(operation: string, variables: Record<string, any> = {}): Observable<T> {
    const token = this.authSession.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .post<GraphQLResponse<T>>(
        this.endpoint,
        {
          query: operation,
          variables,
        },
        { headers },
      )
      .pipe(
        map((response) => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors[0].message || 'GraphQL operation failed');
          }
          return response.data as T;
        }),
        catchError((err) => {
          const message = err?.error?.errors?.[0]?.message || err.message || 'Server connection error';
          return throwError(() => new Error(message));
        }),
      );
  }
}
