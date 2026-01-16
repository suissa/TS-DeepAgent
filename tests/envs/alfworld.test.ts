import { 
  ALFWorldEnvWrapper, 
  get_alfworld_function_definitions 
} from '../../src/envs/alfworld';

describe('ALFWorld Environment', () => {
  describe('get_alfworld_function_definitions', () => {
    it('should return array of function definitions', () => {
      const functions = get_alfworld_function_definitions();
      expect(Array.isArray(functions)).toBe(true);
      expect(functions.length).toBeGreaterThan(0);
    });

    it('should include goto function', () => {
      const functions = get_alfworld_function_definitions();
      const goto = functions.find(f => f.name === 'goto');
      expect(goto).toBeDefined();
      expect(goto?.parameters.required).toContain('location');
    });

    it('should include take function', () => {
      const functions = get_alfworld_function_definitions();
      const take = functions.find(f => f.name === 'take');
      expect(take).toBeDefined();
      expect(take?.parameters.required).toContain('object');
    });

    it('should include put function', () => {
      const functions = get_alfworld_function_definitions();
      const put = functions.find(f => f.name === 'put');
      expect(put).toBeDefined();
      expect(put?.parameters.required).toContain('object');
      expect(put?.parameters.required).toContain('location');
    });

    it('should include look function', () => {
      const functions = get_alfworld_function_definitions();
      const look = functions.find(f => f.name === 'look');
      expect(look).toBeDefined();
    });

    it('should include open function', () => {
      const functions = get_alfworld_function_definitions();
      const open = functions.find(f => f.name === 'open');
      expect(open).toBeDefined();
      expect(open?.parameters.required).toContain('container');
    });

    it('should include close function', () => {
      const functions = get_alfworld_function_definitions();
      const close = functions.find(f => f.name === 'close');
      expect(close).toBeDefined();
      expect(close?.parameters.required).toContain('container');
    });
  });

  describe('ALFWorldEnvWrapper', () => {
    it('should initialize with default batch size', () => {
      const env = new ALFWorldEnvWrapper();
      expect(env.batch_size).toBe(134);
    });

    it('should initialize with custom batch size', () => {
      const env = new ALFWorldEnvWrapper(10);
      expect(env.batch_size).toBe(10);
    });

    it('should reset and return initial observations', () => {
      const env = new ALFWorldEnvWrapper(5);
      const obs = env.reset();
      expect(obs).toHaveLength(5);
      expect(obs[0]).toContain('You are in a room');
    });

    it('should step action and return observation', () => {
      const env = new ALFWorldEnvWrapper(1);
      env.reset();
      const [obs, won, done] = env.step_action(0, 'goto', { location: 'kitchen' });
      expect(typeof obs).toBe('string');
      expect(typeof won).toBe('boolean');
      expect(typeof done).toBe('boolean');
    });
  });
});
