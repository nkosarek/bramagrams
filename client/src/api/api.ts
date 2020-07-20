import axios, { AxiosInstance } from 'axios';

const SERVER_URL = 'http://localhost:4001';

class Api {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 1000,
    });
  }

  async createGame(): Promise<string> {
    const response = await this.client.post('/games');
    return response.data;
  }
};

const api = new Api(SERVER_URL);
export default api;
