import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.POSTHOG_HOST || 'https://app.posthog.com';

export const initPostHog = () => {
    if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            person_profiles: 'identified_only',
        });
    } else {
        console.warn('PostHog key not found. Analytics disabled.');
    }
};

export default posthog;
