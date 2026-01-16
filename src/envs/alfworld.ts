export interface ALFWorldFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: { [key: string]: any };
    required?: string[];
  };
}

export function get_alfworld_function_definitions(): ALFWorldFunction[] {
  return [
    {
      name: 'goto',
      description: 'Go to a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'The location to go to' },
        },
        required: ['location'],
      },
    },
    {
      name: 'take',
      description: 'Take an object',
      parameters: {
        type: 'object',
        properties: {
          object: { type: 'string', description: 'The object to take' },
        },
        required: ['object'],
      },
    },
    {
      name: 'put',
      description: 'Put an object in a location',
      parameters: {
        type: 'object',
        properties: {
          object: { type: 'string', description: 'The object to put' },
          location: { type: 'string', description: 'The location to put the object' },
        },
        required: ['object', 'location'],
      },
    },
    {
      name: 'look',
      description: 'Look around the current location',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'open',
      description: 'Open a container',
      parameters: {
        type: 'object',
        properties: {
          container: { type: 'string', description: 'The container to open' },
        },
        required: ['container'],
      },
    },
    {
      name: 'close',
      description: 'Close a container',
      parameters: {
        type: 'object',
        properties: {
          container: { type: 'string', description: 'The container to close' },
        },
        required: ['container'],
      },
    },
  ];
}

export class ALFWorldEnvWrapper {
  batch_size: number;
  initial_obs_list: string[];

  constructor(batch_size: number = 134) {
    this.batch_size = batch_size;
    this.initial_obs_list = [];
    this.reset();
  }

  reset(): string[] {
    this.initial_obs_list = Array(this.batch_size).fill('You are in a room. Your task is to...');
    return this.initial_obs_list;
  }

  step_action(env_index: number, action_name: string, arguments_: { [key: string]: any }): [string, boolean, boolean] {
    console.log(`ALFWorld[${env_index}]: ${action_name}`, arguments_);
    const observation = `You executed ${action_name}.`;
    const done = false;
    const won = false;
    return [observation, won, done];
  }
}
