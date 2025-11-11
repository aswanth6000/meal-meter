import { useState, useEffect } from 'react'

interface SpendData {
    site: string;
    total: number;
    count: number;
    avg: number;
    error?: string;
}

export default function Popup() {
    const [currentSite, setCurrentSite] = useState<'swiggy' | 'zomato' | null>(null);
    const [data, setData] = useState<SpendData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Detect current site when popup opens
    useEffect(() => {
        const detectSite = async () => {
            try {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tabs[0]?.url) {
                    const url = tabs[0].url;
                    if (url.includes('swiggy.com')) {
                        setCurrentSite('swiggy');
                    } else if (url.includes('zomato.com')) {
                        setCurrentSite('zomato');
                    } else {
                        setCurrentSite(null);
                        setError("Please open Swiggy or Zomato website to use this extension.");
                    }
                }
            } catch (err) {
                console.error("Error detecting site:", err);
                setError("Could not detect current website.");
            }
        };
        detectSite();
    }, []);

    const fetchData = async () => {
        if (!currentSite) {
            setError("Please open Swiggy or Zomato website to use this extension.");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        const fetchFromBackground = (site: string): Promise<SpendData> => {
            return new Promise((resolve) => {
                // Use a timeout to handle cases where the service worker doesn't respond
                const timeout = setTimeout(() => {
                    resolve({
                        site,
                        total: 0,
                        count: 0,
                        avg: 0,
                        error: "Request timed out. The service worker may have terminated. Please try again."
                    });
                }, 60000); // 60 second timeout

                try {
                    chrome.runtime.sendMessage(
                        { action: "fetchSpend", site },
                        (response: SpendData) => {
                            clearTimeout(timeout);

                            if (chrome.runtime.lastError) {
                                const errorMsg = chrome.runtime.lastError.message;
                                console.error(`Error for ${site}:`, errorMsg);
                                resolve({
                                    site,
                                    total: 0,
                                    count: 0,
                                    avg: 0,
                                    error: errorMsg || "Failed to communicate with background script"
                                });
                            } else if (response) {
                                resolve(response);
                            } else {
                                resolve({
                                    site,
                                    total: 0,
                                    count: 0,
                                    avg: 0,
                                    error: "No data received from background script"
                                });
                            }
                        }
                    );
                } catch (err) {
                    clearTimeout(timeout);
                    resolve({
                        site,
                        total: 0,
                        count: 0,
                        avg: 0,
                        error: err instanceof Error ? err.message : "Unknown error occurred"
                    });
                }
            });
        };

        try {
            const siteData = await fetchFromBackground(currentSite);
            setData(siteData);

            if (siteData.error) {
                setError(siteData.error);
            } else if (siteData.count === 0) {
                setError("No orders found. Make sure you have placed orders on this platform.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    const getSiteName = () => {
        if (currentSite === 'swiggy') return 'Swiggy';
        if (currentSite === 'zomato') return 'Zomato';
        return 'Food Delivery';
    };

    const getSiteColor = () => {
        if (currentSite === 'swiggy') return '#ff5200'; // Swiggy orange
        if (currentSite === 'zomato') return '#e43747'; // Zomato red
        return '#666';
    };

    return (
        <div style={{
            width: 320,
            padding: 16,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            backgroundColor: '#ffffff',
            color: '#333333',
            borderRadius: 10,
            margin: 0,
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box'
        }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>
                🍔 Meal Meter
            </h3>

            {currentSite ? (
                <>
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px 0' }}>
                        Currently on: <strong style={{ color: getSiteColor() }}>{getSiteName()}</strong>
                    </p>
                    <p style={{ fontSize: 11, color: '#888', margin: '0 0 12px 0' }}>
                        Make sure you're logged into {getSiteName()} in this browser.
                    </p>
                </>
            ) : (
                <p style={{ fontSize: 12, color: '#c33', margin: '0 0 12px 0', padding: 8, backgroundColor: '#fff5f5', borderRadius: 4 }}>
                    Please open Swiggy or Zomato website to use this extension.
                </p>
            )}

            <button
                onClick={fetchData}
                disabled={loading || !currentSite}
                style={{
                    padding: '10px 16px',
                    cursor: (loading || !currentSite) ? 'not-allowed' : 'pointer',
                    width: '100%',
                    backgroundColor: (loading || !currentSite) ? '#ccc' : getSiteColor(),
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'opacity 0.2s',
                    opacity: (loading || !currentSite) ? 0.6 : 1,
                    marginBottom: 12
                }}
            >
                {loading ? "Fetching..." : `Analyze ${getSiteName()} Spend`}
            </button>

            {error && (
                <div style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: '#fff5f5',
                    color: '#c33',
                    borderRadius: 6,
                    fontSize: 12,
                    whiteSpace: 'pre-line',
                    border: '1px solid #fecaca',
                    lineHeight: 1.5
                }}>
                    {error}
                </div>
            )}

            {data && !data.error && (
                <div style={{ marginTop: 12 }}>
                    <div style={{
                        padding: 16,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 8,
                        border: `2px solid ${getSiteColor()}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{
                            margin: '0 0 12px 0',
                            fontSize: 16,
                            fontWeight: 600,
                            color: getSiteColor()
                        }}>
                            {getSiteName()} Summary
                        </h4>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Total Spent:</span>
                                <span style={{ fontSize: 16, color: '#1a1a1a', fontWeight: 700 }}>
                                    ₹{data.total.toLocaleString()}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Total Orders:</span>
                                <span style={{ fontSize: 16, color: '#1a1a1a', fontWeight: 700 }}>
                                    {data.count}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0'
                            }}>
                                <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Average Order:</span>
                                <span style={{ fontSize: 16, color: '#1a1a1a', fontWeight: 700 }}>
                                    ₹{data.avg.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
