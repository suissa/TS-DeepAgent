import { 
  reduceOpenapiSpec, 
  dereferenceRefs, 
  mergeAllOfProperties,
  OpenAPISpec,
  ReducedOpenAPISpec 
} from '../../src/utils/oas_utils';

describe('OAS Utils', () => {
  describe('reduceOpenapiSpec', () => {
    const createMockSpec = (): OpenAPISpec => ({
      info: {
        description: 'Test API',
        title: 'Test',
        version: '1.0.0'
      },
      servers: [{ url: 'https://api.test.com' }],
      paths: {
        '/users': {
          get: {
            description: 'Get users',
            parameters: [
              { name: 'limit', in: 'query', required: true, schema: { type: 'integer' } },
              { name: 'optional', in: 'query', required: false, schema: { type: 'string' } }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          },
          post: {
            description: 'Create user',
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' }
                }
              }
            },
            responses: {
              201: { description: 'Created' }
            }
          }
        },
        '/users/{id}': {
          get: {
            description: 'Get user by ID',
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      }
    });

    it('should extract endpoints from paths', () => {
      const result = reduceOpenapiSpec(createMockSpec());
      expect(result.servers).toHaveLength(1);
      expect(result.description).toBe('Test API');
      expect(result.endpoints).toHaveLength(3);
    });

    it('should only include GET, POST, PUT, PATCH, DELETE', () => {
      const result = reduceOpenapiSpec(createMockSpec());
      const methods = result.endpoints.map(ep => ep[0].split(' ')[0]);
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
    });

    it('should filter only required parameters when onlyRequired=true', () => {
      const result = reduceOpenapiSpec(createMockSpec(), true, true);
      const getEndpoint = result.endpoints.find(ep => ep[0].includes('GET /users'));
      expect(getEndpoint).toBeDefined();
      if (getEndpoint) {
        const params = getEndpoint[2].parameters;
        expect(params).toHaveLength(1);
        expect(params[0].name).toBe('limit');
      }
    });

    it('should include all parameters when onlyRequired=false', () => {
      const result = reduceOpenapiSpec(createMockSpec(), false, false);
      const getEndpoint = result.endpoints.find(ep => ep[0].includes('GET /users'));
      expect(getEndpoint).toBeDefined();
      if (getEndpoint) {
        const params = getEndpoint[2].parameters;
        expect(params).toHaveLength(2);
      }
    });

    it('should handle missing servers', () => {
      const spec: any = { ...createMockSpec(), servers: undefined };
      const result = reduceOpenapiSpec(spec);
      expect(result.servers).toEqual([]);
    });

    it('should handle missing info description', () => {
      const spec: any = { ...createMockSpec(), info: {} };
      const result = reduceOpenapiSpec(spec);
      expect(result.description).toBe('');
    });
  });

  describe('dereferenceRefs', () => {
    const createMinimalSpec = () => ({
      info: { description: '', title: '', version: '' },
      paths: {},
      servers: []
    });

    it('should handle simple objects', () => {
      const spec = {
        ...createMinimalSpec(),
        components: {
          schemas: {
            User: { type: 'object', properties: { name: { type: 'string' } } }
          }
        }
      };
      const obj = { $ref: '#/components/schemas/User' };
      const result = dereferenceRefs(obj, spec);
      expect((result as any).type).toBe('object');
    });

    it('should handle nested arrays', () => {
      const spec = {
        ...createMinimalSpec(),
        components: {
          schemas: {
            String: { type: 'string' }
          }
        }
      };
      const obj = [{ $ref: '#/components/schemas/String' }, { type: 'number' }];
      const result = dereferenceRefs(obj, spec);
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[])[0].type).toBe('string');
      expect((result as any[])[1].type).toBe('number');
    });

    it('should handle objects without refs', () => {
      const obj = { type: 'object', properties: { name: { type: 'string' } } };
      const result = dereferenceRefs(obj, createMinimalSpec());
      expect((result as any).type).toBe('object');
    });
  });

  describe('mergeAllOfProperties', () => {
    it('should merge allOf properties', () => {
      const obj = {
        allOf: [
          { properties: { a: { type: 'string' } }, required: ['a'] },
          { properties: { b: { type: 'number' } }, required: ['b'] }
        ]
      };
      const result = mergeAllOfProperties(obj);
      expect(result.properties.a).toBeDefined();
      expect(result.properties.b).toBeDefined();
      expect(result.required).toContain('a');
      expect(result.required).toContain('b');
    });

    it('should handle nested allOf', () => {
      const obj = {
        allOf: [
          {
            allOf: [
              { properties: { nested: { type: 'object' } } }
            ]
          }
        ]
      };
      const result = mergeAllOfProperties(obj);
      expect(result.properties.nested).toBeDefined();
    });

    it('should handle objects without allOf', () => {
      const obj = { type: 'object', properties: { name: { type: 'string' } } };
      const result = mergeAllOfProperties(obj);
      expect(result.type).toBe('object');
    });
  });
});
