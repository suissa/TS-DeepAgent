import { 
  WebshopEnvWrapper, 
  get_webshop_function_definitions 
} from '../../src/envs/webshop';

describe('WebShop Environment', () => {
  describe('get_webshop_function_definitions', () => {
    it('should return array of function definitions', () => {
      const functions = get_webshop_function_definitions();
      expect(Array.isArray(functions)).toBe(true);
      expect(functions.length).toBeGreaterThan(0);
    });

    it('should include search function', () => {
      const functions = get_webshop_function_definitions();
      const search = functions.find(f => f.name === 'search');
      expect(search).toBeDefined();
      expect(search?.parameters.required).toContain('query');
    });

    it('should include click function', () => {
      const functions = get_webshop_function_definitions();
      const click = functions.find(f => f.name === 'click');
      expect(click).toBeDefined();
      expect(click?.parameters.required).toContain('target');
    });

    it('should include buy function', () => {
      const functions = get_webshop_function_definitions();
      const buy = functions.find(f => f.name === 'buy');
      expect(buy).toBeDefined();
      expect(buy?.parameters.required).toContain('product_id');
    });
  });

  describe('WebshopEnvWrapper', () => {
    it('should initialize with default values', () => {
      const env = new WebshopEnvWrapper();
      expect(env.batch_size).toBe(500);
      expect(env.webshop_url).toBe('http://localhost:3000');
    });

    it('should initialize with custom values', () => {
      const env = new WebshopEnvWrapper(10, 'http://custom:4000');
      expect(env.batch_size).toBe(10);
      expect(env.webshop_url).toBe('http://custom:4000');
    });

    it('should reset and return initial observations', () => {
      const env = new WebshopEnvWrapper(3);
      const obs = env.reset();
      expect(obs).toHaveLength(3);
      expect(obs[0]).toContain('WebShop');
    });

    it('should step action and return observation', () => {
      const env = new WebshopEnvWrapper(1);
      env.reset();
      const [obs, reward, done] = env.step_action(0, 'search', { query: 'laptop' });
      expect(typeof obs).toBe('string');
      expect(typeof reward).toBe('number');
      expect(typeof done).toBe('boolean');
    });
  });
});
