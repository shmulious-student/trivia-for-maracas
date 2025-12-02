import { PostHog } from 'posthog-node';

const POSTHOG_KEY = process.env.POSTHOG_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com';

let client: PostHog | null = null;

if (POSTHOG_KEY) {
    client = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST });
} else {
    console.warn('PostHog key not found. Server-side analytics disabled.');
}

export const trackEvent = (userId: string, event: string, properties?: Record<string, any>) => {
    if (client) {
        client.capture({
            distinctId: userId,
            event,
            properties
        });
    }
};

export const shutdownAnalytics = async () => {
    if (client) {
        await client.shutdown();
    }
};
