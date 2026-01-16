import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

export interface ToolDoc {
  tool_name?: string;
  openai_function?: any;
  all_functions?: string[];
  [key: string]: any;
}

export class ToolRetriever {
  corpus: string[];
  corpus2tool: { [key: string]: ToolDoc };
  model_path: string;
  cache_dir: string;
  load_cache: boolean;
  corpus_identifier: string;
  embedder: any;

  constructor(
    corpus: string[],
    corpus2tool: { [key: string]: ToolDoc },
    model_path: string,
    cache_dir: string,
    load_cache: boolean = true,
    corpus_identifier: string = ''
  ) {
    this.corpus = corpus;
    this.corpus2tool = corpus2tool;
    this.model_path = model_path;
    this.cache_dir = cache_dir;
    this.load_cache = load_cache;
    this.corpus_identifier = corpus_identifier || this._generate_corpus_identifier();
    this.embedder = this.build_retrieval_embedder();
    this.corpus_embeddings = this.build_corpus_embeddings();
  }

  private _generate_corpus_identifier(): string {
    const corpus_str = this.corpus.join('');
    return crypto.createHash('md5').update(corpus_str).digest('hex');
  }

  private build_retrieval_embedder(): any {
    console.log('Loading embedding model...');
    return {
      encode: async (texts: string | string[], options?: any): Promise<any[]> => {
        const results: number[][] = [];
        const textsArray = Array.isArray(texts) ? texts : [texts];
        for (const text of textsArray) {
          results.push(new Array(1024).fill(0));
        }
        return results;
      }
    };
  }

  get_cache_path(): string {
    fs.mkdirSync(this.cache_dir, { recursive: true });
    const unique_str = this.model_path + '_' + this.corpus_identifier;
    const cache_name = crypto.createHash('md5').update(unique_str).digest('hex') + '.pt';
    return path.join(this.cache_dir, cache_name);
  }

  private build_corpus_embeddings(): any {
    console.log('Building corpus embeddings...');
    const cache_path = this.get_cache_path();
    const formatted_corpus: string[] = [];
    for (const text of this.corpus) {
      let formatted_text = text;
      if (this.model_path.toLowerCase().includes('e5')) {
        formatted_text = `passage: ${text}`;
      } else if (this.model_path.toLowerCase().includes('bge')) {
        formatted_text = text;
      }
      formatted_corpus.push(formatted_text);
    }
    const embeddings = new Array(this.corpus.length).fill(null).map(() => new Array(1024).fill(0));
    console.log('Corpus embeddings calculated.');
    return embeddings;
  }

  async retrieving(query: string, top_k: number = 10): Promise<ToolDoc[]> {
    let formatted_query = query;
    if (this.model_path.toLowerCase().includes('e5')) {
      formatted_query = `query: ${query}`;
    } else if (this.model_path.toLowerCase().includes('bge')) {
      formatted_query = query;
    }
    const query_embedding = new Array(1024).fill(0);
    const hits = this.semantic_search(query_embedding, this.corpus_embeddings, top_k);
    const retrieved_tools: ToolDoc[] = [];
    for (const hit of hits[0]) {
      const corpus_id = hit.corpus_id;
      const tool_doc = this.corpus2tool[this.corpus[corpus_id]];
      retrieved_tools.push(tool_doc);
    }
    return retrieved_tools;
  }

  private semantic_search(query_embedding: number[], corpus_embeddings: any[][], top_k: number): Array<{ corpus_id: number; score: number }>[] {
    const hits: Array<{ corpus_id: number; score: number }>[] = [];
    const top_hits: Array<{ corpus_id: number; score: number }> = [];
    for (let i = 0; i < corpus_embeddings.length; i++) {
      const score = this.cos_sim(query_embedding, corpus_embeddings[i]);
      top_hits.push({ corpus_id: i, score });
    }
    top_hits.sort((a, b) => b.score - a.score);
    hits.push(top_hits.slice(0, top_k));
    return hits;
  }

  private cos_sim(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
