import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface RestBenchArgs {
  dataset_name: string;
  tmdb_access_token?: string;
  spotify_client_id?: string;
  spotify_client_secret?: string;
  spotify_redirect_uri?: string;
  [key: string]: any;
}

export interface ToolDefinition {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: { [key: string]: any };
      required?: string[];
    };
  };
}

function getTMDBEndpoints(): ToolDefinition[] {
  return [
    {
      type: 'function',
      function: {
        name: 'tmdb_get_movie_details',
        description: 'Get details about a movie',
        parameters: {
          type: 'object',
          properties: {
            movie_id: { type: 'string', description: 'The movie ID' },
          },
          required: ['movie_id'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'tmdb_search_movies',
        description: 'Search for movies',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
          },
          required: ['query'],
        },
      },
    },
  ];
}

function getSpotifyEndpoints(): ToolDefinition[] {
  return [
    {
      type: 'function',
      function: {
        name: 'spotify_search_tracks',
        description: 'Search for tracks on Spotify',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'spotify_get_artist',
        description: 'Get artist information',
        parameters: {
          type: 'object',
          properties: {
            artist_id: { type: 'string', description: 'The artist ID' },
          },
          required: ['artist_id'],
        },
      },
    },
  ];
}

export function get_restbench_tools(dataset_name: string, args: RestBenchArgs): ToolDefinition[] {
  if (dataset_name === 'tmdb') {
    return getTMDBEndpoints();
  } else if (dataset_name === 'spotify') {
    return getSpotifyEndpoints();
  }
  return [];
}

export class RestBenchAPITools {
  private dataset_name: string;
  private args: RestBenchArgs;
  private access_token: string | null = null;
  private token_expires: number = 0;

  constructor(dataset_name: string, args: RestBenchArgs) {
    this.dataset_name = dataset_name;
    this.args = args;
  }

  private async getTMDBToken(): Promise<string> {
    return this.args.tmdb_access_token || '';
  }

  private async getSpotifyToken(): Promise<string> {
    if (this.access_token && Date.now() < this.token_expires) {
      return this.access_token;
    }
    console.log('Spotify token refresh not implemented');
    return this.args.spotify_client_id || '';
  }

  async execute_tool(tool_name: string, arguments_: { [key: string]: any }): Promise<any> {
    if (this.dataset_name === 'tmdb') {
      return this.executeTMDBTool(tool_name, arguments_);
    } else if (this.dataset_name === 'spotify') {
      return this.executeSpotifyTool(tool_name, arguments_);
    }
    return { error: `Unknown dataset: ${this.dataset_name}` };
  }

  private async executeTMDBTool(tool_name: string, arguments_: { [key: string]: any }): Promise<any> {
    const token = await this.getTMDBToken();
    const base_url = 'https://api.themoviedb.org/3';
    if (tool_name === 'tmdb_get_movie_details') {
      const movie_id = arguments_.movie_id;
      try {
        const response = await axios.get(`${base_url}/movie/${movie_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        return { error: `Failed to get movie details: ${error}` };
      }
    } else if (tool_name === 'tmdb_search_movies') {
      const query = arguments_.query;
      try {
        const response = await axios.get(`${base_url}/search/movie`, {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        return { error: `Failed to search movies: ${error}` };
      }
    }
    return { error: `Unknown TMDB tool: ${tool_name}` };
  }

  private async executeSpotifyTool(tool_name: string, arguments_: { [key: string]: any }): Promise<any> {
    const token = await this.getSpotifyToken();
    const base_url = 'https://api.spotify.com/v1';
    if (tool_name === 'spotify_search_tracks') {
      const query = arguments_.query;
      try {
        const response = await axios.get(`${base_url}/search`, {
          params: { q: query, type: 'track' },
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        return { error: `Failed to search tracks: ${error}` };
      }
    } else if (tool_name === 'spotify_get_artist') {
      const artist_id = arguments_.artist_id;
      try {
        const response = await axios.get(`${base_url}/artists/${artist_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        return { error: `Failed to get artist: ${error}` };
      }
    }
    return { error: `Unknown Spotify tool: ${tool_name}` };
  }

  get_all_endpoints_summary(): string[] {
    if (this.dataset_name === 'tmdb') {
      return [
        'tmdb_get_movie_details: Get details about a movie',
        'tmdb_search_movies: Search for movies',
      ];
    } else if (this.dataset_name === 'spotify') {
      return [
        'spotify_search_tracks: Search for tracks on Spotify',
        'spotify_get_artist: Get artist information',
      ];
    }
    return [];
  }
}

export async function execute_restbench_tool(tool_name: string, arguments_: { [key: string]: any }, dataset_name: string, args: RestBenchArgs): Promise<any> {
  const tools = new RestBenchAPITools(dataset_name, args);
  return tools.execute_tool(tool_name, arguments_);
}
