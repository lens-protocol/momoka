// import { curly } from 'node-libcurl';
// import { FetchProvider } from './fetch-with-timeout';

// export class LibCurlProvider implements FetchProvider {
//   async get<TResponse>(url: string, { timeout }: { timeout: number }): Promise<TResponse> {
//     const { statusCode, data } = await curly.get(url, {
//       httpHeader: ['Content-Type: application/json'],
//       curlyResponseBodyParser: false,
//       followLocation: true,
//       timeout,
//     });

//     if (statusCode !== 200) {
//       throw new Error(`Failed to fetch ${url}`);
//     }

//     return JSON.parse(data.toString()) as TResponse;
//   }
// }
