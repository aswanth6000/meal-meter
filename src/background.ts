// background.ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "fetchSpend") {
        // Handle async operation properly
        (async () => {
            const { site } = message;
            try {
                const cookieString = await getCookies(site);
                let data = null;

                if (site === "swiggy") {
                    data = await getSwiggyData(cookieString);
                } else if (site === "zomato") {
                    data = await getZomatoData(cookieString);
                }

                sendResponse(data);
            } catch (error) {
                console.error("Error fetching spend data:", error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                sendResponse({
                    site: site || "unknown",
                    total: 0,
                    count: 0,
                    avg: 0,
                    error: errorMessage
                });
            }
        })();

        // Must return true to use async sendResponse
        return true;
    }

    return false;
});

// === HELPERS ===

async function getCookies(site: string): Promise<string> {
    return new Promise((resolve) => {
        // Try multiple domain formats to catch all cookies
        const domains = site === "swiggy"
            ? [".swiggy.com", "swiggy.com", "www.swiggy.com"]
            : [".zomato.com", "zomato.com", "www.zomato.com"];

        const allCookies: chrome.cookies.Cookie[] = [];
        let completed = 0;

        domains.forEach((domain) => {
            chrome.cookies.getAll({ domain }, (cookies) => {
                if (cookies) {
                    allCookies.push(...cookies);
                }
                completed++;

                // When all domain queries are done, combine cookies
                if (completed === domains.length) {
                    // Remove duplicates by name
                    const uniqueCookies = new Map<string, chrome.cookies.Cookie>();
                    allCookies.forEach(cookie => {
                        uniqueCookies.set(cookie.name, cookie);
                    });

                    const cookieString = Array.from(uniqueCookies.values())
                        .map(c => `${c.name}=${c.value}`)
                        .join("; ");

                    console.log(`Found ${uniqueCookies.size} cookies for ${site}`);
                    resolve(cookieString);
                }
            });
        });
    });
}

// === API LOGIC ===
async function getSwiggyData(cookieString: string) {
    // Check if we have cookies
    if (!cookieString || cookieString.trim() === "") {
        throw new Error("No cookies found. Please log in to Swiggy first.");
    }

    let spent = 0, numOrders = 0, lastOrderId = "";

    try {
        while (true) {
            const url = `https://www.swiggy.com/dapi/order/all?order_id=${lastOrderId}`;
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Content-Type": "application/json",
                    "Cookie": cookieString,
                    "Accept": "application/json",
                    "Referer": "https://www.swiggy.com/my-account/orders"
                },
            });

            if (res.status === 401 || res.status === 403) {
                throw new Error("Authentication failed. Please log in to Swiggy and try again.");
            }

            if (!res.ok) {
                throw new Error(`Swiggy API error: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();

            // Check for authentication errors in response
            if (data.statusCode === 1 || data.statusCode === "UNAUTHORIZED") {
                throw new Error("Not logged in to Swiggy. Please log in and try again.");
            }

            if (!data.data?.orders || data.data.orders.length === 0) {
                break;
            }

            for (const order of data.data.orders) {
                const orderTotal = parseFloat(order.order_total) || 0;
                spent += orderTotal;
                numOrders++;
            }

            lastOrderId = data.data.orders[data.data.orders.length - 1].order_id;

            // Safety check to prevent infinite loops
            if (!lastOrderId || numOrders > 10000) {
                break;
            }
        }
    } catch (error) {
        console.error("Error fetching Swiggy data:", error);
        throw error;
    }

    return {
        site: "swiggy",
        total: spent,
        count: numOrders,
        avg: numOrders > 0 ? Math.round(spent / numOrders) : 0
    };
}

async function getZomatoData(cookieString: string) {
    // Check if we have cookies
    if (!cookieString || cookieString.trim() === "") {
        throw new Error("No cookies found. Please log in to Zomato first.");
    }

    let spent = 0, numOrders = 0, page = 1;

    try {
        while (true) {
            const url = `https://www.zomato.com/webroutes/user/orders?page=${page}`;
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Content-Type": "application/json",
                    "Cookie": cookieString,
                    "Accept": "application/json",
                    "Referer": "https://www.zomato.com/order-history"
                },
            });

            if (res.status === 401 || res.status === 403) {
                throw new Error("Authentication failed. Please log in to Zomato and try again.");
            }

            if (!res.ok) {
                throw new Error(`Zomato API error: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();

            // Check for authentication errors
            if (data.status === "error" || data.message === "Unauthorized") {
                throw new Error("Not logged in to Zomato. Please log in and try again.");
            }

            const totalPages = data.sections?.SECTION_USER_ORDER_HISTORY?.totalPages ?? 1;

            // Extract orders from entities
            if (data.entities?.ORDER) {
                for (const orderId in data.entities.ORDER) {
                    const order = data.entities.ORDER[orderId];
                    // totalCost is a string like "₹172.45", need to extract numeric value
                    const costString = order.totalCost || order.total || "0";
                    // Remove currency symbols, commas, and whitespace, then parse
                    const total = parseFloat(costString.replace(/[₹,\s]/g, "")) || 0;
                    spent += total;
                    numOrders++;
                }
            }

            if (page >= totalPages || totalPages === 0) break;
            page++;

            // Safety check to prevent infinite loops
            if (page > 1000 || numOrders > 10000) {
                break;
            }
        }
    } catch (error) {
        console.error("Error fetching Zomato data:", error);
        throw error;
    }

    return {
        site: "zomato",
        total: spent,
        count: numOrders,
        avg: numOrders > 0 ? Math.round(spent / numOrders) : 0
    };
}
