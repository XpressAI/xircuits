import { requestAPI } from "../server/handler";

let libraryConfigCache = {
    data: null
};

export async function fetchComponentLibraryConfig() {
    try {
        const response = await requestAPI < any > ('library/get_config');
        return response.libraries;
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

export async function ComponentLibraryConfig() {

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
            console.log(`Library not found for: ${libName}`);
            return null;
        }

        return libraryConfig;
    } catch (error) {
        console.log(`Failed to fetch library configuration: ${error}`);
        return null;
    }
};

export const buildLocalFilePath = async (libName, fileKey) => {
    const libraryConfig = await fetchLibraryConfig(libName);

    if (libraryConfig && libraryConfig[fileKey]) {
        return `${libraryConfig.local_path}/${libraryConfig[fileKey]}`;
    } else if (libraryConfig) {
        console.log(`File not found for: ${libName} (Key: ${fileKey})`);
    }

    return null;
};
