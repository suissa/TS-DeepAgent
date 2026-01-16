export interface OpenAPISpec {
  servers?: Array<{ url: string }>;
  info: {
    description?: string;
    title?: string;
    version?: string;
  };
  paths: {
    [route: string]: {
      get?: Operation;
      post?: Operation;
      put?: Operation;
      delete?: Operation;
      patch?: Operation;
    };
  };
  [key: string]: any;
}

export interface Operation {
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: {
    [statusCode: string]: Response;
  };
  [key: string]: any;
}

export interface Parameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: any;
  [key: string]: any;
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content?: {
    [contentType: string]: {
      schema?: any;
    };
  };
  [key: string]: any;
}

export interface Response {
  description?: string;
  content?: {
    [contentType: string]: {
      schema?: any;
    };
  };
  [key: string]: any;
}

export interface ReducedOpenAPISpec {
  servers: Array<{ url: string }>;
  description: string;
  endpoints: Array<[string, string | null, any]>;
}

function retrieveRefPath(refPath: string, fullSpec: OpenAPISpec): any {
  const components = refPath.split('/');
  if (components[0] !== '#') {
    throw new Error('All $refs must be URI fragments (start with hash).');
  }
  let result: any = fullSpec;
  for (let i = 1; i < components.length; i++) {
    result = result[components[i]];
  }
  return result;
}

function dereferenceRefsInternal(
  obj: any,
  fullSpec: OpenAPISpec,
  stop: boolean = false
): any {
  if (stop) {
    return obj;
  }
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map((el) => dereferenceRefsInternal(el, fullSpec, stop));
    }
    const objOut: { [key: string]: any } = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$ref') {
        return dereferenceRefsInternal(
          retrieveRefPath(v as string, fullSpec),
          fullSpec,
          false
        );
      } else if (typeof v === 'object' && v !== null) {
        objOut[k] = dereferenceRefsInternal(v, fullSpec, false);
      } else {
        objOut[k] = v;
      }
    }
    return objOut;
  }
  return obj;
}

export function dereferenceRefs(specObj: any, fullSpec: OpenAPISpec): any {
  return dereferenceRefsInternal(specObj, fullSpec, false);
}

function mergeAllOf(toMerge: any[]): any {
  const merged: any = {
    properties: {},
    required: [] as string[],
    type: 'object',
  };
  for (const partialSchema of toMerge) {
    if ('allOf' in partialSchema) {
      const tmp = mergeAllOf(partialSchema.allOf);
      Object.assign(merged.properties, tmp.properties);
      if (tmp.required) {
        merged.required.push(...tmp.required);
      }
      continue;
    }
    if ('properties' in partialSchema) {
      Object.assign(merged.properties, partialSchema.properties);
    }
    if ('required' in partialSchema) {
      merged.required.push(...partialSchema.required);
    }
  }
  return merged;
}

function mergeAllOfInternal(obj: any): any {
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map((el) => mergeAllOfInternal(el));
    }
    const objOut: { [key: string]: any } = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'allOf') {
        return mergeAllOfInternal(mergeAllOf(v as any[]));
      } else if (typeof v === 'object' && v !== null) {
        objOut[k] = mergeAllOfInternal(v);
      } else {
        objOut[k] = v;
      }
    }
    return objOut;
  }
  return obj;
}

export function mergeAllOfProperties(obj: any): any {
  return mergeAllOfInternal(obj);
}

function reduceEndpointDocs(docs: any, onlyRequired: boolean = true): any {
  const out: { [key: string]: any } = {};
  if (docs.get && docs.get('description')) {
    out['description'] = docs.get('description');
  } else if (docs.description) {
    out['description'] = docs.description;
  }
  if (docs.parameters) {
    if (onlyRequired) {
      out['parameters'] = docs.parameters.filter(
        (param: any) => param.required
      );
    } else {
      out['parameters'] = [...docs.parameters];
    }
  }
  if (docs.requestBody) {
    out['requestBody'] = docs.requestBody;
  }
  if (docs.responses) {
    if ('200' in docs.responses) {
      out['responses'] = docs.responses['200'];
    } else if (200 in docs.responses) {
      out['responses'] = docs.responses[200];
    }
  }
  return out;
}

export function reduceOpenapiSpec(
  spec: OpenAPISpec,
  dereference: boolean = true,
  onlyRequired: boolean = true,
  mergeAllof: boolean = false
): ReducedOpenAPISpec {
  const endpoints: Array<[string, string | null, any]> = [];
  for (const [route, operation] of Object.entries(spec.paths)) {
    for (const [operationName, docs] of Object.entries(operation as any)) {
      if (
        ['get', 'post', 'patch', 'delete', 'put'].includes(operationName) &&
        docs
      ) {
        const name = `${operationName.toUpperCase()} ${route}`;
        const description = (docs as any).description || null;
        let processedDocs = docs;
        if (dereference) {
          processedDocs = dereferenceRefs(docs, spec);
        }
        if (mergeAllof) {
          processedDocs = mergeAllOfProperties(processedDocs);
        }
        processedDocs = reduceEndpointDocs(processedDocs, onlyRequired);
        endpoints.push([name, description, processedDocs]);
      }
    }
  }
  return {
    servers: spec.servers || [],
    description: spec.info?.description || '',
    endpoints,
  };
}
