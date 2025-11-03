import { logger } from "./logger";
import { config } from "./setting";
import { sharedData } from "./shared";

/* fetch with Github auth */
export async function Fetch<T>(
    url: string,
    as: "text" | "json" = "text",
): Promise<T> {
    const token = config.get("githubToken");
    const headers: Record<string, string> = {};

    if (url.startsWith("https://raw.githubusercontent.com") && token) {
        logger.log("with token");
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        sharedData.spinner.text = `fetch ${url}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
            sharedData.spinner.fail("Fetch Error.");
            throw new Error(
                `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
            );
        }

        return await response[as]();
    } catch (error) {
        sharedData.spinner.fail();
        console.error("Error fetching file:", error);
        throw error;
    }
}

export async function getLatestVersion(packageName: string): Promise<string> {
	const response = await Fetch<{ version: string }>(
		`https://registry.npmjs.org/${packageName}/latest`,
		"json",
	);
	return response.version;
}
