import { requestAPI } from "../server/handler";

interface Author {
    name: string;
    email: string;
}

export interface LibraryConfig {
    name: string;
    library_id: string;
    repository: string;
    local_path: string;
    status: string;
    version?: string;
    description?: string;
    authors?: Author[];
    license?: string;
    readme?: string;
    keywords?: string[];
    requirements?: string[];
    default_example_path?: string;
}

let libraryConfigCache = {
    data: null
};

export async function fetchComponentLibraryConfig() {
    try {
        const response = await requestAPI<any>('library/get_config');
        if (response.status === 'OK' && response.config) {
            return response.config.libraries;
        } else {
            console.error('Failed to fetch remote libraries due to unexpected response:', response);
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch remote libraries:', error);
        return [];
    }
}

export async function reloadComponentLibraryConfig() {

    try {
        await requestAPI('library/reload_config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Failed to reload config: ', error);
    }
}

export async function ComponentLibraryConfig(): Promise<LibraryConfig[]> {
    if (!libraryConfigCache.data) {
        libraryConfigCache.data = await fetchComponentLibraryConfig();
    }
    return libraryConfigCache.data;
}

export async function refreshComponentLibraryConfigCache() {
    await reloadComponentLibraryConfig();
    libraryConfigCache.data = await fetchComponentLibraryConfig();
}

export const fetchLibraryConfig = async (libName) => {
    try {
        let config = await ComponentLibraryConfig();
        const libraryConfig = config.find(library => library.library_id === libName.toUpperCase());

        if (!libraryConfig) {
            // console.log(`Library not found for: ${libName}`);
            return null;
        }

        return libraryConfig;
    } catch (error) {
        // console.log(`Failed to fetch library configuration: ${error}`);
        return null;
    }
};

export const buildLocalFilePath = async (libName, fileKey) => {
    const libraryConfig = await fetchLibraryConfig(libName);

    if (libraryConfig && libraryConfig[fileKey]) {
        return `${libraryConfig.local_path}/${libraryConfig[fileKey]}`;
    } else if (libraryConfig) {
        // console.log(`File not found for: ${libName} (Key: ${fileKey})`);
    }

    return null;
};
