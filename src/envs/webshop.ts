export interface WebShopFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: { [key: string]: any };
    required?: string[];
  };
}

export function get_webshop_function_definitions(): WebShopFunction[] {
  return [
    {
      name: 'search',
      description: 'Search for products',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
    {
      name: 'click',
      description: 'Click on a product or link',
      parameters: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'The target to click on' },
        },
        required: ['target'],
      },
    },
    {
      name: 'buy',
      description: 'Buy the selected product',
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'The product ID to buy' },
        },
        required: ['product_id'],
      },
    },
  ];
}

export class WebshopEnvWrapper {
  batch_size: number;
  webshop_url: string;
  initial_obs_list: string[];

  constructor(batch_size: number = 500, webshop_url: string = 'http://localhost:3000') {
    this.batch_size = batch_size;
    this.webshop_url = webshop_url;
    this.initial_obs_list = [];
    this.reset();
  }

  reset(): string[] {
    this.initial_obs_list = Array(this.batch_size).fill('Welcome to WebShop. How can I help you?');
    return this.initial_obs_list;
  }

  step_action(env_index: number, action_name: string, arguments_: { [key: string]: any }): [string, number, boolean] {
    console.log(`WebShop[${env_index}]: ${action_name}`, arguments_);
    const observation = `You executed ${action_name}.`;
    const reward = 0;
    const done = false;
    return [observation, reward, done];
  }
}
