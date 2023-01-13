import wretch from 'wretch'

function get_api_url() {
    // Check if PUBLIC_SCHEDULE_API_URL is set, if not default to the current host
    if (import.meta.env.PUBLIC_SCHEDULE_API_URL) {
        return import.meta.env.PUBLIC_SCHEDULE_API_URL
    }

    return ""

}
export const api = wretch(get_api_url())
