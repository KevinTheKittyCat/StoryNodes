




/*
"dialog-1": {
            id: 'dialog-1',
            type: 'dialog',
            label: '',
            position: { x: 0, y: 100 },
            outputs: {
                handles: {
                    'dialog-output-1': {
                        id: 'dialog-output-1',
                        dataType: NodeDataTypes.dialog,
                        label: 'Events',
                        output: ["character", "somethingElseExample"]
                    },
                }
            },
            data: {
                character: {
                    handle: { //input
                        id: 'character-output-6',
                        dataType: NodeDataTypes.character,
                    },
                    get character() {
*/


/*
@GameNode("Movement")
export class PlayerController {
    @Input() speed: number = 5;
    @Output() onJump: EventEmitter;

    update(delta: number) {
        // Custom logic here
    }
}*/

function randomUUID() {
    // Simple UUID generator for demonstration purposes
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
    );
}

export interface NodeInput {
    id: string;
    dataType: string;
    label?: string;
}

export interface NodeOutput {
    id: string;
    dataType: string;
    label?: string;
    output: string[]; //specifies what data is output, e.g. for character node it could be ["id", "name"]
}

export class NodeBase {
    constructor(
        public id: string = randomUUID(),
        public type: string,
        public data: any,
        public inputs: { [key: string]: NodeInput } = {},
        public outputs: { [key: string]: NodeOutput } = {},
        public getOutputData: (handleId: string) => any = (handleId: string) => {
            this.outputs[handleId]?.output.reduce((acc, key) => {
                const splitKey = key.split('.');
                const value = splitKey.reduce((obj, k) => obj?.[k], this.data);
                acc[key] = value;
                return acc;
            }, {} as any);
        }
    ) { }
}

/*
function Log(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyKey} with`, args);
        return originalMethod.apply(this, args);
    };
}
*/


/*
function Field(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    console.log(target, propertyKey, descriptor);
    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyKey} with`, args);
        return originalMethod.apply(this, args);
    };
}
    */

function Field(
    target: any,
    propertyKey: string,
    third: any
) {
    console.log(target, propertyKey, third, "field decorator");
    console.log("Initial value:", target[propertyKey]);
}

export class GameNode extends NodeBase {
    //@Field
    speed: number = 5;
    get speeds() {
        return this.speed;
    }

    constructor(
        id: string | undefined,
        type: string,
        data: any,
        inputs: { [key: string]: NodeInput } = {},
        outputs: { [key: string]: NodeOutput } = {}
    ) {
        // Pass arguments individually to match NodeBase constructor
        super(id, type, data, inputs, outputs);

        console.log("Creating GameNode with speed:", this.speed);
        this.speed = 10;
    }
}
