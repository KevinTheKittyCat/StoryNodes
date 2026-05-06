

// TODO: Remove Settings. Make it into a class that can be injected where needed.
const errorOnMissing = (value: string | undefined, key: string, defaultValue: string | undefined): string => {
    //if (!value) throw new Error(`Missing required setting: ${key}`);
    if (!value) console.error(`Missing required setting: ${key}`);
    //if (!value && defaultValue === undefined) throw new Error(`Missing required setting: ${key}`);
    if (defaultValue === undefined) return value!;
    return value || defaultValue;
}

const SETTINGS =() => ({
    JWT: {
        SECRET: process.env.JWT_SECRET //errorOnMissing(process.env.JWT_SECRET, 'JWT_SECRET', 'default_jwt_secret'),
    },
});



export default SETTINGS;