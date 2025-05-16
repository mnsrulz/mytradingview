import ky from 'ky';
const logtail_token = process.env.LOGTAIL_SOURCE_TOKEN;

const _logger = () => {
    if (!logtail_token) {
        return {
            info: (message: string, data: any) => console.info(message, data),
            error: (message: string, data: any) => console.error(message, data),
            warn: (message: string, data: any) => console.warn(message, data),
            debug: (message: string, data: any) => console.debug(message, data)
        };
    }

    const kyInstance = ky.extend({
        prefixUrl: 'https://in.logs.betterstack.com/',
        headers: {
            Authorization: `Bearer ${logtail_token}`,
        }        
    });

    return {
        info: (message: string, data: any) => kyInstance.post('', { json: { message, ...data } }),
        error: (message: string, data: any) => kyInstance.post('', { json: { message, ...data } }),
        warn: (message: string, data: any) => kyInstance.post('', { json: { message, ...data } }),
        debug: (message: string, data: any) => kyInstance.post('', { json: { message, ...data } }),
    };
};



export const logger = _logger();